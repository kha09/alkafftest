import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

// GET /api/admin/sent-notes/recipients
// Returns a list of users who have received manual notes, with their info and note stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role') // 'student', 'agent', or null for all
    const search = searchParams.get('search') // search by name/email

    // Fetch all manual notes
    const manualNotes = await db.sentNote.findMany({
      where: { noteType: 'manual' },
      select: {
        id: true,
        recipientIds: true,
        readStatus: true,
        sentAt: true,
        priority: true,
        content: true
      },
      orderBy: { sentAt: 'desc' }
    })

    // Build a map: userId -> { noteIds, unreadNoteIds, latestSentAt, notes[] }
    const userNoteMap: Record<number, {
      noteIds: number[]
      unreadNoteIds: number[]
      latestSentAt: Date
      recentNotes: { id: number; content: string; sentAt: Date; priority: string; isRead: boolean }[]
    }> = {}

    for (const note of manualNotes) {
      let recipientIds: number[] = []
      let readStatus: Record<string, string> = {}

      try {
        recipientIds = JSON.parse(note.recipientIds)
      } catch { continue }

      try {
        readStatus = JSON.parse(note.readStatus)
      } catch { readStatus = {} }

      for (const userId of recipientIds) {
        const isRead = Object.prototype.hasOwnProperty.call(readStatus, String(userId))

        if (!userNoteMap[userId]) {
          userNoteMap[userId] = {
            noteIds: [],
            unreadNoteIds: [],
            latestSentAt: note.sentAt,
            recentNotes: []
          }
        }

        userNoteMap[userId].noteIds.push(note.id)
        if (!isRead) userNoteMap[userId].unreadNoteIds.push(note.id)
        if (note.sentAt > userNoteMap[userId].latestSentAt) {
          userNoteMap[userId].latestSentAt = note.sentAt
        }

        // Keep up to 3 most recent notes per user
        if (userNoteMap[userId].recentNotes.length < 3) {
          userNoteMap[userId].recentNotes.push({
            id: note.id,
            content: note.content,
            sentAt: note.sentAt,
            priority: note.priority,
            isRead
          })
        }
      }
    }

    const userIds = Object.keys(userNoteMap).map(Number)

    if (userIds.length === 0) {
      return NextResponse.json({ recipients: [] })
    }

    // Fetch user info for all recipient user IDs
    const whereClause: any = {
      id: { in: userIds }
    }
    if (roleFilter && roleFilter !== 'all') {
      whereClause.role = roleFilter
    }
    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        formSubmission: {
          select: {
            id: true,
            nationality: true,
            contactNumber: true,
            preferredProgram: true,
            submissionStatus: true,
            countryOfResidence: true
          }
        }
      }
    })

    // Build final recipient list
    const recipients = users.map((user: any) => {
      const stats = userNoteMap[user.id]
      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          // Extra info from form submission if available
          nationality: user.formSubmission?.nationality || null,
          contactNumber: user.formSubmission?.contactNumber || null,
          preferredProgram: user.formSubmission?.preferredProgram || null,
          submissionStatus: user.formSubmission?.submissionStatus || null,
          countryOfResidence: user.formSubmission?.countryOfResidence || null
        },
        totalNotes: stats.noteIds.length,
        unreadNotes: stats.unreadNoteIds.length,
        latestNoteAt: stats.latestSentAt,
        recentNotes: stats.recentNotes
      }
    })

    // Sort by latest note date descending
    recipients.sort((a: any, b: any) =>
      new Date(b.latestNoteAt).getTime() - new Date(a.latestNoteAt).getTime()
    )

    return NextResponse.json({ recipients })
  } catch (error) {
    console.error('Error fetching note recipients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note recipients' },
      { status: 500 }
    )
  }
}