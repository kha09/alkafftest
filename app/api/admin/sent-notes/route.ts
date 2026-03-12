import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'
import { sendEmail } from '@/lib/emailService'

// GET - List sent notes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const recipientType = searchParams.get('recipientType')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    const noteType = searchParams.get('noteType')

    const skip = (page - 1) * limit
    const whereClause: any = {}
    
    if (recipientType && recipientType !== 'all') {
      whereClause.recipientType = recipientType
    }
    
    if (priority && priority !== 'all') {
      whereClause.priority = priority
    }

    if (noteType && noteType !== 'all') {
      whereClause.noteType = noteType
    }

    if (search) {
      whereClause.content = {
        contains: search
      }
    }

    const [sentNotes, total] = await Promise.all([
      db.sentNote.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          template: {
            select: {
              id: true,
              title: true,
              category: true
            }
          }
        }
      }),
      db.sentNote.count({ where: whereClause })
    ])

    // Parse recipient IDs and read status for each note
    const notesWithStats = sentNotes.map((note: any) => {
      const recipientIds = JSON.parse(note.recipientIds)
      const readStatus = JSON.parse(note.readStatus)
      const readCount = Object.keys(readStatus).length
      const totalRecipients = recipientIds.length

      return {
        ...note,
        recipientCount: totalRecipients,
        readCount,
        unreadCount: totalRecipients - readCount,
        readPercentage: totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0
      }
    })

    return NextResponse.json({
      sentNotes: notesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching sent notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sent notes' },
      { status: 500 }
    )
  }
}

// POST - Send new note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      templateId, 
      customContent, 
      recipientType, 
      recipientIds, 
      priority, 
      expiresAt 
    } = body

    // Validate required fields
    if (!recipientType || !recipientIds || recipientIds.length === 0) {
      return NextResponse.json(
        { error: 'Recipient type and recipient IDs are required' },
        { status: 400 }
      )
    }

    let finalContent = ''
    let finalTemplateId = null

    if (templateId) {
      // Using template
      const template = await db.noteTemplate.findUnique({
        where: { id: templateId }
      })

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        )
      }

      if (!template.isActive) {
        return NextResponse.json(
          { error: 'Template is not active' },
          { status: 400 }
        )
      }

      finalContent = template.content
      finalTemplateId = templateId
    } else {
      // Using custom content
      if (!customContent) {
        return NextResponse.json(
          { error: 'Custom content is required when not using a template' },
          { status: 400 }
        )
      }
      finalContent = customContent
    }

    // Validate recipient IDs exist
    let validRecipients: { id: number }[] = []
    
    if (recipientType === 'agents') {
      // For agents, check the Agent table
      validRecipients = await db.agent.findMany({
        where: {
          id: { in: recipientIds }
        },
        select: { id: true }
      })
    } else {
      // For students and other roles, check the User table
      validRecipients = await db.user.findMany({
        where: {
          id: { in: recipientIds },
          role: recipientType === 'students' ? 'student' : undefined
        },
        select: { id: true }
      })
    }

    if (validRecipients.length !== recipientIds.length) {
      return NextResponse.json(
        { error: 'Some recipient IDs are invalid' },
        { status: 400 }
      )
    }

    const sentNote = await db.sentNote.create({
      data: {
        templateId: finalTemplateId,
        content: finalContent,
        senderId: parseInt(session.user.id),
        recipientType,
        recipientIds: JSON.stringify(recipientIds),
        priority: priority || 'normal',
        noteType: 'manual',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        readStatus: JSON.stringify({}) // Empty object initially
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        template: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    })

    // Send email notifications to student recipients (non-blocking)
    try {
      let studentEmails: { email: string; fullName: string }[] = []

      if (recipientType === 'students') {
        // All students in the recipient list
        const users = await db.user.findMany({
          where: { id: { in: recipientIds }, role: 'student' },
          select: { email: true, fullName: true }
        })
        studentEmails = users
      } else if (recipientType === 'individual') {
        // Individual recipients — only include those who are students
        const users = await db.user.findMany({
          where: { id: { in: recipientIds }, role: 'student' },
          select: { email: true, fullName: true }
        })
        studentEmails = users
      }
      // 'agents' and 'all' types: skip email for now (agents use a different flow)

      const priorityLabels: Record<string, string> = {
        low: 'منخفض',
        normal: 'عادي',
        high: 'عالي',
        urgent: 'عاجل'
      }
      const priorityLabel = priorityLabels[sentNote.priority] || sentNote.priority

      for (const recipient of studentEmails) {
        try {
          await sendEmail({
            to: recipient.email,
            subject: 'إشعار جديد من فريق SM Alkaff',
            text: `مرحباً ${recipient.fullName}،\n\nلديك إشعار جديد:\n\n${finalContent}\n\nالأولوية: ${priorityLabel}\n\nشكراً،\nفريق SM Alkaff`,
            html: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #111827;">إشعار جديد</h2>
              <p>مرحباً ${recipient.fullName}،</p>
              <p>لديك إشعار جديد من فريق SM Alkaff:</p>
              <div style="background: #f9fafb; border-right: 4px solid #374151; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; color: #111827;">${finalContent.replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">الأولوية: <strong>${priorityLabel}</strong></p>
              <p style="color: #6b7280; font-size: 14px;">يمكنك الاطلاع على جميع إشعاراتك من خلال لوحة التحكم الخاصة بك.</p>
              <p style="color: #6b7280; font-size: 14px;">شكراً،<br/>فريق SM Alkaff</p>
            </div>`
          })
        } catch (singleEmailError) {
          console.error(`Failed to send note email to ${recipient.email}:`, singleEmailError)
        }
      }
    } catch (emailError) {
      console.error('Note email notification error:', emailError)
    }

    return NextResponse.json({
      ...sentNote,
      recipientCount: recipientIds.length,
      readCount: 0,
      unreadCount: recipientIds.length,
      readPercentage: 0
    }, { status: 201 })
  } catch (error) {
    console.error('Error sending note:', error)
    return NextResponse.json(
      { error: 'Failed to send note' },
      { status: 500 }
    )
  }
}
