import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// PUT /api/agent/notes/[id]/read - Mark note as read for current agent
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const noteId = parseInt(params.id)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)

    // Find the note
    const note = await prisma.sentNote.findUnique({
      where: { id: noteId }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check if agent is a recipient
    const recipientIds = JSON.parse(note.recipientIds || '[]')
    const isRecipient = recipientIds.includes(userId) || 
                       note.recipientType === 'all' || 
                       note.recipientType === 'agents'

    if (!isRecipient) {
      return NextResponse.json({ error: 'You are not a recipient of this note' }, { status: 403 })
    }

    // Update read status
    const readStatus = JSON.parse(note.readStatus || '{}')
    readStatus[userId.toString()] = new Date().toISOString()

    await prisma.sentNote.update({
      where: { id: noteId },
      data: {
        readStatus: JSON.stringify(readStatus)
      }
    })

    return NextResponse.json({ message: 'Note marked as read' })
  } catch (error) {
    console.error('Error marking note as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark note as read' },
      { status: 500 }
    )
  }
}
