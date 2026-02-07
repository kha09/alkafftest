import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToS3, validateS3Config, testS3Connection } from '@/lib/s3Client'
import { saveFile } from '@/lib/fileStorage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const identifier = formData.get('identifier') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!category || !identifier) {
      return NextResponse.json(
        { error: 'Category and identifier are required' },
        { status: 400 }
      )
    }

    // Try S3 first, fallback to local storage if S3 fails
    const s3Validation = validateS3Config()
    let useS3 = false
    
    if (s3Validation.isValid) {
      try {
        const connectionTest = await testS3Connection()
        useS3 = connectionTest.success
      } catch (error) {
        console.log('S3 connection test failed, falling back to local storage:', error)
        useS3 = false
      }
    }

    if (useS3) {
      try {
        // Upload the file to S3/Object Storage
        const result = await uploadFileToS3(file, category, identifier)

        return NextResponse.json({
          success: true,
          filePath: `/api/files/${result.key}`,
          fileName: result.key.split('/').pop(),
          s3Key: result.key,
          s3Url: result.url,
          storage: 's3'
        })
      } catch (s3Error) {
        console.error('S3 upload failed, falling back to local storage:', s3Error)
        // Fall through to local storage
      }
    }

    // Fallback to local file storage
    console.log('Using local file storage for upload')
    const result = await saveFile(file, category, identifier)

    return NextResponse.json({
      success: true,
      filePath: result.relativePath,
      fileName: result.fileName,
      storage: 'local'
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
