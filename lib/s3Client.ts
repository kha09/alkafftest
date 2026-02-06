import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for some S3-compatible services
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export interface S3UploadResult {
  key: string
  url: string
  bucket: string
}

/**
 * Upload a file to S3
 */
export async function uploadFileToS3(
  file: File,
  category: string,
  identifier: string | number
): Promise<S3UploadResult> {
  try {
    // Generate unique key
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const key = `${category}/${category}_${identifier}_${timestamp}.${fileExtension}`
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          category: category,
          identifier: identifier.toString(),
          uploadedAt: new Date().toISOString(),
        },
      },
    })
    
    const result = await upload.done()
    
    return {
      key,
      url: `${process.env.AWS_ENDPOINT_URL}/${BUCKET_NAME}/${key}`,
      bucket: BUCKET_NAME,
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error)
    throw new Error('Failed to upload file to object storage')
  }
}

/**
 * Generate a presigned URL for file access
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw new Error('Failed to generate file access URL')
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    await s3Client.send(command)
  } catch (error) {
    console.error('Error deleting file from S3:', error)
    throw new Error('Failed to delete file from object storage')
  }
}

/**
 * Get file stream from S3
 */
export async function getFileFromS3(key: string): Promise<ReadableStream | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    const response = await s3Client.send(command)
    return response.Body as ReadableStream
  } catch (error) {
    console.error('Error getting file from S3:', error)
    return null
  }
}

/**
 * Validate S3 configuration
 */
export function validateS3Config(): { isValid: boolean; error?: string } {
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET_NAME',
    'AWS_ENDPOINT_URL',
  ]
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      return {
        isValid: false,
        error: `Missing required environment variable: ${envVar}`,
      }
    }
  }
  
  return { isValid: true }
}

/**
 * Test S3 connection
 */
export async function testS3Connection(): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = validateS3Config()
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }
    
    // Try to list objects in the bucket (this will test connectivity)
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'test-connection', // This key likely doesn't exist, but that's ok
    })
    
    try {
      await s3Client.send(command)
    } catch (error: any) {
      // If we get a "NoSuchKey" error, it means we connected successfully
      if (error.name === 'NoSuchKey') {
        return { success: true }
      }
      throw error
    }
    
    return { success: true }
  } catch (error: any) {
    return { 
      success: false, 
      error: `S3 connection failed: ${error.message}` 
    }
  }
}