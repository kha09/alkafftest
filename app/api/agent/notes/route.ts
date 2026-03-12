import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/agent/notes - Get notes for the current agent
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'agent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    // Get all notes and filter for this agent
    const allNotes = await prisma.sentNote.findMany({
      include: {
        template: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        sentAt: 'desc'
      }
    })

    // Filter notes that are sent to this agent
    const agentNotes = allNotes.filter((note: any) => {
      try {
        const recipientIds = JSON.parse(note.recipientIds || '[]')
        return recipientIds.includes(userId) || 
               note.recipientType === 'all' || 
               note.recipientType === 'agents'
      } catch (e) {
        return false
      }
    })

    // Format the notes for the agent
    const formattedNotes = agentNotes.map((note: any) => {
      let readStatus: any = {}
      try {
        readStatus = JSON.parse(note.readStatus || '{}')
      } catch (e) {
        readStatus = {}
      }

      const userReadStatus = readStatus[userId.toString()]
      
      return {
        id: note.id,
        content: note.content,
        priority: note.priority,
        sentAt: note.sentAt,
        expiresAt: note.expiresAt,
        isRead: !!userReadStatus,
        readAt: userReadStatus || null,
        template: note.template,
        sender: note.sender
      }
    })

    return NextResponse.json({ notes: formattedNotes })
  } catch (error) {
    console.error('Error fetching agent notes:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الملاحظات' },
      { status: 500 }
    )
  }
}
