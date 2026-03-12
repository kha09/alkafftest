import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { uploadFileToS3, validateS3Config } from '@/lib/s3Client'
import { createNotification } from '@/lib/notificationService'
import { sendEmail } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    
    // Extract form fields
    const fullName = formData.get('fullName') as string
    const nationality = formData.get('nationality') as string
    const email = formData.get('email') as string
    const countryOfResidence = formData.get('countryOfResidence') as string
    const contactNumber = formData.get('contactNumber') as string
    const cityOfResidence = formData.get('cityOfResidence') as string
    const preferredProgram = formData.get('preferredProgram') as string
    const universityId = formData.get('universityId') as string | null
    const programId = formData.get('programId') as string | null
    const agentIdFromForm = formData.get('agentId') as string | null
    
    // Validate required fields
    if (!fullName || !nationality || !email || !countryOfResidence || 
        !contactNumber || !cityOfResidence || !preferredProgram) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }
    
    // Validate S3 configuration
    const s3Validation = validateS3Config()
    if (!s3Validation.isValid) {
      return NextResponse.json(
        { error: 'خطأ في إعدادات التخزين السحابي' },
        { status: 500 }
      )
    }

    // Resolve agentId: if the request comes from an agent session, look up the Agent record
    // by email to get the correct Agent.id (FK to Agent table, not User table).
    // Never trust the form-provided agentId when a session is present — it may be stale/wrong.
    let resolvedAgentId: number | null = null
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.role === 'agent' && session.user.email) {
        // Agent session: resolve Agent.id from Agent table by email
        const agentRecord = await prisma.agent.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        })
        resolvedAgentId = agentRecord ? agentRecord.id : null
      } else if (!session || session.user.role === 'admin') {
        // Public submission or admin-created: use form-provided agentId as-is
        resolvedAgentId = agentIdFromForm ? parseInt(agentIdFromForm) : null
      }
    } catch (sessionError) {
      // If session lookup fails entirely, fall back to form-provided agentId
      console.error('Agent session lookup error:', sessionError)
      resolvedAgentId = agentIdFromForm ? parseInt(agentIdFromForm) : null
    }
    
    // Create form submission record first
    const formSubmission = await prisma.formSubmission.create({
      data: {
        fullName,
        nationality,
        email,
        countryOfResidence,
        contactNumber,
        cityOfResidence,
        preferredProgram,
        universityId: universityId ? parseInt(universityId) : null,
        programId: programId ? parseInt(programId) : null,
        agentId: resolvedAgentId,
      }
    })
    
    // Process uploaded files using S3
    const uploadedFiles = []
    const fileFields = ['highSchoolCertificate', 'personalPhoto', 'passport', 'additionalDocuments']
    
    for (const fieldName of fileFields) {
      const file = formData.get(fieldName) as File | null
      
      if (file && file.size > 0) {
        try {
          // Upload file to S3
          const s3Result = await uploadFileToS3(file, fieldName, formSubmission.id)
          
          // Save file metadata to database with form submission ID
          const fileRecord = await prisma.uploadedFile.create({
            data: {
              filename: s3Result.key.split('/').pop() || s3Result.key,
              originalName: file.name,
              path: s3Result.key, // Store S3 key instead of local path
              size: file.size,
              type: file.type,
              formSubmission: {
                connect: { id: formSubmission.id }
              }
            }
          })
          
          uploadedFiles.push(fileRecord)
        } catch (uploadError) {
          console.error(`Error uploading ${fieldName}:`, uploadError)
          // Continue with other files even if one fails
        }
      }
    }
    
    // Fetch the complete form submission with uploaded files
    const completeFormSubmission = await prisma.formSubmission.findUnique({
      where: { id: formSubmission.id },
      include: { uploadedFiles: true }
    })
    
    // Create notification for admin
    try {
      await createNotification({
        title: 'طلب جديد مقدم',
        message: `تم تقديم طلب جديد من ${fullName} (${email})`,
        type: 'info',
        priority: 'normal',
        entityId: formSubmission.id,
        entityType: 'FormSubmission',
        actionUrl: `/dashboard/students?submissionId=${formSubmission.id}`
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
      // Don't fail the whole request if notification creation fails
    }

    // Send email notification to all admin users
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true, fullName: true }
      })

      if (adminUsers.length > 0) {
        const submissionDate = new Date().toLocaleString('ar-SA', {
          timeZone: 'Asia/Riyadh',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        const emailSubject = `طلب جديد مقدم - ${fullName}`
        const emailText = `تم استلام طلب تسجيل جديد

تفاصيل الطالب:
- الاسم الكامل: ${fullName}
- البريد الإلكتروني: ${email}
- الجنسية: ${nationality}
- بلد الإقامة: ${countryOfResidence}
- مدينة الإقامة: ${cityOfResidence}
- رقم الاتصال: ${contactNumber}
- التخصص المفضل: ${preferredProgram}
- تاريخ التقديم: ${submissionDate}

يمكنك مراجعة الطلب من خلال لوحة التحكم.`

        const emailHtml = `
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <h2 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">طلب جديد مقدم</h2>
  <p style="color: #4b5563;">تم استلام طلب تسجيل جديد بالتفاصيل التالية:</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr style="background-color: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">الاسم الكامل</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${fullName}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">البريد الإلكتروني</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${email}</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">الجنسية</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${nationality}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">بلد الإقامة</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${countryOfResidence}</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">مدينة الإقامة</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${cityOfResidence}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">رقم الاتصال</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${contactNumber}</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">التخصص المفضل</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${preferredProgram}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">تاريخ التقديم</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${submissionDate}</td>
    </tr>
  </table>
  <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">يمكنك مراجعة الطلب من خلال لوحة التحكم.</p>
</div>`

        for (const admin of adminUsers) {
          try {
            await sendEmail({
              to: admin.email,
              subject: emailSubject,
              text: emailText,
              html: emailHtml
            })
          } catch (adminEmailError) {
            console.error(`Failed to send email to admin ${admin.email}:`, adminEmailError)
          }
        }
      }
    } catch (emailError) {
      console.error('Failed to send admin email notifications:', emailError)
      // Don't fail the whole request if email sending fails
    }
    
    return NextResponse.json(completeFormSubmission, { status: 201 })
  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    )
  }
}
