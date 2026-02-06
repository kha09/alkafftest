import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { uploadFileToS3, validateS3Config } from '@/lib/s3Client'
import { createNotification } from '@/lib/notificationService'

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
    const agentId = formData.get('agentId') as string | null
    
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
        agentId: agentId ? parseInt(agentId) : null,
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
    
    return NextResponse.json(completeFormSubmission, { status: 201 })
  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    )
  }
}
