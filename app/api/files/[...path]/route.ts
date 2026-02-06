import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { getAbsoluteFilePath, getFileStorageConfig } from '@/lib/fileStorage'
import { getFileFromS3, getPresignedUrl } from '@/lib/s3Client'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = pathSegments.join('/')
    
    // Check if this is an S3 key (contains category folders like 'highSchoolCertificate/', 'personalPhoto/', etc.)
    const isS3Key = filePath.includes('/') && (
      filePath.startsWith('highSchoolCertificate/') ||
      filePath.startsWith('personalPhoto/') ||
      filePath.startsWith('passport/') ||
      filePath.startsWith('additionalDocuments/') ||
      filePath.startsWith('payment-receipts/') ||
      filePath.startsWith('visa-documents/') ||
      filePath.startsWith('commission-receipts/') ||
      filePath.startsWith('university-logos/')
    )
    
    if (isS3Key) {
      // Handle S3 file serving
      try {
        // Generate presigned URL and redirect to it
        const presignedUrl = await getPresignedUrl(filePath, 3600) // 1 hour expiry
        return NextResponse.redirect(presignedUrl)
      } catch (s3Error) {
        console.error('Error getting S3 file:', s3Error)
        return NextResponse.json({ error: 'الملف غير موجود في التخزين السحابي' }, { status: 404 })
      }
    } else {
      // Handle local file serving (backward compatibility)
      const relativePath = `/api/files/${filePath}`
      const absolutePath = getAbsoluteFilePath(relativePath)
      
      // Security check: ensure the path is within the allowed storage directory
      const config = getFileStorageConfig()
      const normalizedStoragePath = path.resolve(config.basePath)
      const normalizedFilePath = path.resolve(absolutePath)
      
      if (!normalizedFilePath.startsWith(normalizedStoragePath)) {
        return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 403 })
      }
      
      // Read the file
      const fileBuffer = await readFile(absolutePath)
      
      // Determine content type based on file extension
      const fileExtension = path.extname(absolutePath).toLowerCase()
      let contentType = 'application/octet-stream'
      
      switch (fileExtension) {
        case '.pdf':
          contentType = 'application/pdf'
          break
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg'
          break
        case '.png':
          contentType = 'image/png'
          break
      }
      
      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      })
    }
    
  } catch (error) {
    console.error('Error serving file:', error)
    
    // Check if it's a file not found error
    if ((error as any).code === 'ENOENT') {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'حدث خطأ أثناء تحميل الملف' }, { status: 500 })
  }
}
