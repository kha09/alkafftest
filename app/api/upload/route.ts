import { NextRequest, NextResponse } from 'next/server'
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

    // Save the file using the server-side file storage
    const result = await saveFile(file, category, identifier)

    return NextResponse.json({
      success: true,
      filePath: result.relativePath,
      fileName: result.fileName
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}