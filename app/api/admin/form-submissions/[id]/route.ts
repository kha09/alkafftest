import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

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
