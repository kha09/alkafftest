import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendEmail } from '@/lib/emailService'

// Arabic labels for submission status values
const statusLabels: Record<string, string> = {
  submitted: 'تم التقديم',
  approved_by_admin: 'تمت الموافقة من الإدارة',
  sent_to_university: 'تم الإرسال للجامعة',
  accepted_by_university: 'تم القبول من الجامعة',
  rejected_by_university: 'تم الرفض من الجامعة',
  submitted_visa_info: 'تم تقديم معلومات التأشيرة',
  submitted_payment: 'تم تقديم الدفع',
  completed: 'مكتمل',
  New: 'جديد',
}

// PUT /api/admin/form-submissions/:id - Update a form submission
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin (would need to implement auth)
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '')
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const data = await request.json()

    // Fetch current submission BEFORE update for change detection
    const currentSubmission = await prisma.formSubmission.findUnique({
      where: { id },
      select: {
        submissionStatus: true,
        agentId: true,
        fullName: true,
        agent: { select: { id: true, email: true, name: true } },
        user: { select: { id: true, email: true, fullName: true } }
      }
    })
    
    // Prepare update data
    const updateData: any = {}
    
    if (data.agentId !== undefined) {
      updateData.agentId = data.agentId === 'unassigned' ? null : parseInt(data.agentId)
    }
    
    if (data.orderStage !== undefined) {
      updateData.orderStage = data.orderStage
      // Also update submissionStatus to match orderStage for consistency
      updateData.submissionStatus = data.orderStage
      
      // Also update the related Order's submissionStatus to keep them in sync
      // Find orders related to this form submission
      const relatedOrders = await prisma.order.findMany({
        where: { formSubmissionId: id }
      })
      
      // Update each related order's submissionStatus
      for (const order of relatedOrders) {
        await prisma.order.update({
          where: { id: order.id },
          data: { submissionStatus: data.orderStage }
        })
      }
    }
    
    if (data.submissionStatus !== undefined) {
      updateData.submissionStatus = data.submissionStatus
      // Also update orderStage to match submissionStatus for consistency
      updateData.orderStage = data.submissionStatus
      
      // Enable payment receipt upload when status is "accepted_by_university"
      if (data.submissionStatus === 'accepted_by_university') {
        updateData.canUploadReceipt = true
        updateData.canUploadVisaDocuments = true
      } else {
        // Disable upload for other statuses (except if already uploaded)
        const currentSubmission = await prisma.formSubmission.findUnique({
          where: { id },
          select: { paymentReceiptPath: true, visaDocumentsPath: true }
        })
        
        // Only disable if no receipt has been uploaded yet
        if (!currentSubmission?.paymentReceiptPath) {
          updateData.canUploadReceipt = false
        }
        
        // Only disable visa documents if none have been uploaded yet
        if (!currentSubmission?.visaDocumentsPath) {
          updateData.canUploadVisaDocuments = false
        }
      }
      
      // Also update the related Order's submissionStatus to keep them in sync
      // Find orders related to this form submission
      const relatedOrders = await prisma.order.findMany({
        where: { formSubmissionId: id }
      })
      
      // Update each related order's submissionStatus
      for (const order of relatedOrders) {
        await prisma.order.update({
          where: { id: order.id },
          data: { submissionStatus: data.submissionStatus }
        })
      }
    }
    
    // Add other fields that can be updated as needed
    if (data.fullName !== undefined) updateData.fullName = data.fullName
    if (data.nationality !== undefined) updateData.nationality = data.nationality
    if (data.email !== undefined) updateData.email = data.email
    if (data.countryOfResidence !== undefined) updateData.countryOfResidence = data.countryOfResidence
    if (data.contactNumber !== undefined) updateData.contactNumber = data.contactNumber
    if (data.cityOfResidence !== undefined) updateData.cityOfResidence = data.cityOfResidence
    if (data.preferredProgram !== undefined) updateData.preferredProgram = data.preferredProgram
    if (data.universityId !== undefined) updateData.universityId = data.universityId
    if (data.programId !== undefined) updateData.programId = data.programId
    
    // Update the form submission
    const updatedSubmission = await prisma.formSubmission.update({
      where: { id },
      data: updateData,
      include: {
        uploadedFiles: true,
        agent: true,
        user: true
      }
    })

    // Notify agent and student when submissionStatus changes (non-blocking)
    const newStatus = updatedSubmission.submissionStatus
    const oldStatus = currentSubmission?.submissionStatus
    const statusChanged = data.submissionStatus !== undefined && newStatus !== oldStatus

    if (statusChanged) {
      const studentName = currentSubmission?.fullName || 'الطالب'
      const oldLabel = statusLabels[oldStatus || ''] || oldStatus || ''
      const newLabel = statusLabels[newStatus || ''] || newStatus || ''

      // Look up admin user once (used as SentNote sender)
      let adminUserId: number | null = null
      try {
        const adminUser = await prisma.user.findFirst({
          where: { role: 'admin' },
          select: { id: true }
        })
        adminUserId = adminUser?.id ?? null
      } catch (e) {
        console.error('Admin user lookup error:', e)
      }

      // --- Notify agent ---
      const agentRecord = currentSubmission?.agent
      if (agentRecord?.email) {
        try {
          const agentUser = await prisma.user.findFirst({
            where: { email: agentRecord.email, role: 'agent' },
            select: { id: true }
          })

          if (agentUser && adminUserId) {
            try {
              await prisma.sentNote.create({
                data: {
                  content: `تم تغيير حالة تقدم الطالب "${studentName}" من "${oldLabel}" إلى "${newLabel}".`,
                  senderId: adminUserId,
                  recipientType: 'individual',
                  recipientIds: JSON.stringify([agentUser.id]),
                  priority: 'normal',
                  readStatus: JSON.stringify({})
                }
              })
            } catch (sentNoteError) {
              console.error('Agent status-change SentNote error:', sentNoteError)
            }
          }

          try {
            await sendEmail({
              to: agentRecord.email,
              subject: `تحديث حالة تقدم الطالب - ${studentName}`,
              text: `مرحباً،\n\nتم تغيير حالة تقدم الطالب "${studentName}" من "${oldLabel}" إلى "${newLabel}".\n\nيمكنك متابعة التفاصيل من خلال لوحة التحكم الخاصة بك.\n\nشكراً،\nفريق SM Alkaff`,
              html: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #111827;">تحديث حالة تقدم الطالب</h2>
                <p>مرحباً،</p>
                <p>تم تغيير حالة تقدم الطالب <strong>${studentName}</strong>:</p>
                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:10px; border:1px solid #e5e7eb; font-weight:bold; width:40%;">الحالة السابقة</td>
                    <td style="padding:10px; border:1px solid #e5e7eb;">${oldLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px; border:1px solid #e5e7eb; font-weight:bold;">الحالة الجديدة</td>
                    <td style="padding:10px; border:1px solid #e5e7eb; color:#059669; font-weight:bold;">${newLabel}</td>
                  </tr>
                </table>
                <p style="color:#6b7280; font-size:14px;">يمكنك متابعة التفاصيل من خلال لوحة التحكم الخاصة بك.</p>
                <p style="color:#6b7280; font-size:14px;">شكراً،<br/>فريق SM Alkaff</p>
              </div>`
            })
          } catch (emailError) {
            console.error('Agent status-change email error:', emailError)
          }
        } catch (agentLookupError) {
          console.error('Agent user lookup error:', agentLookupError)
        }
      }

      // --- Notify student ---
      const studentUser = currentSubmission?.user
      if (studentUser?.id && adminUserId) {
        // In-app notification via SentNote
        try {
          await prisma.sentNote.create({
            data: {
              content: `تم تحديث حالة تقدمك إلى "${newLabel}".`,
              senderId: adminUserId,
              recipientType: 'individual',
              recipientIds: JSON.stringify([studentUser.id]),
              priority: 'normal',
              readStatus: JSON.stringify({})
            }
          })
        } catch (studentSentNoteError) {
          console.error('Student status-change SentNote error:', studentSentNoteError)
        }

        // Email to student
        if (studentUser.email) {
          try {
            const studentDisplayName = studentUser.fullName || studentName
            await sendEmail({
              to: studentUser.email,
              subject: `تحديث حالة تقدمك - ${newLabel}`,
              text: `مرحباً ${studentDisplayName}،\n\nتم تحديث حالة تقدمك من "${oldLabel}" إلى "${newLabel}".\n\nيمكنك متابعة تفاصيل تقدمك من خلال لوحة التحكم الخاصة بك.\n\nشكراً،\nفريق SM Alkaff`,
              html: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #111827;">تحديث حالة تقدمك</h2>
                <p>مرحباً ${studentDisplayName}،</p>
                <p>تم تحديث حالة تقدمك:</p>
                <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
                  <tr style="background:#f9fafb;">
                    <td style="padding:10px; border:1px solid #e5e7eb; font-weight:bold; width:40%;">الحالة السابقة</td>
                    <td style="padding:10px; border:1px solid #e5e7eb;">${oldLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px; border:1px solid #e5e7eb; font-weight:bold;">الحالة الجديدة</td>
                    <td style="padding:10px; border:1px solid #e5e7eb; color:#059669; font-weight:bold;">${newLabel}</td>
                  </tr>
                </table>
                <p style="color:#6b7280; font-size:14px;">يمكنك متابعة تفاصيل تقدمك من خلال لوحة التحكم الخاصة بك.</p>
                <p style="color:#6b7280; font-size:14px;">شكراً،<br/>فريق SM Alkaff</p>
              </div>`
            })
          } catch (studentEmailError) {
            console.error('Student status-change email error:', studentEmailError)
          }
        }
      }
    }

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Error updating form submission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الطلب' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/form-submissions/:id - Delete a form submission
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin (would need to implement auth)
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const id = parseInt(request.nextUrl.pathname.split('/').pop() || '')
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Check if the form submission exists
    const existingSubmission = await prisma.formSubmission.findUnique({
      where: { id },
      include: {
        user: true,
        uploadedFiles: true
      }
    })

    if (!existingSubmission) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Delete related records first (due to foreign key constraints)
    
    // Delete related orders
    await prisma.order.deleteMany({
      where: { formSubmissionId: id }
    })

    // Delete related uploaded files
    await prisma.uploadedFile.deleteMany({
      where: { formSubmissionId: id }
    })

    // Delete related user if exists
    if (existingSubmission.user) {
      await prisma.user.delete({
        where: { id: existingSubmission.user.id }
      })
    }

    // Finally delete the form submission
    await prisma.formSubmission.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف الطلب بنجاح' })
  } catch (error) {
    console.error('Error deleting form submission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الطلب' },
      { status: 500 }
    )
  }
}
