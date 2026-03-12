import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { sendEmail } from '@/lib/emailService'
import { createNotification } from '@/lib/notificationService'

// GET /api/support/tickets/[id]/messages - Get messages for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ticketId = parseInt(id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 })
    }

    // Check if ticket exists and user has access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        createdById: true,
        assignedToId: true
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check permissions
    const userId = parseInt(session.user.id)
    const canAccess = 
      session.user.role === 'admin' ||
      ticket.createdById === userId ||
      ticket.assignedToId === userId

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages
    let messages = await prisma.supportTicketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Filter internal messages for non-admin users
    if (session.user.role !== 'admin') {
      messages = messages.filter((msg: any) => !msg.isInternal)
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الرسائل' },
      { status: 500 }
    )
  }
}

// POST /api/support/tickets/[id]/messages - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ticketId = parseInt(id)
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 })
    }

    const body = await request.json()
    const { message, isInternal, attachments } = body

    // Validate required fields
    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة' },
        { status: 400 }
      )
    }

    // Check if ticket exists and user has access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check permissions
    const userId = parseInt(session.user.id)
    const canMessage = 
      session.user.role === 'admin' ||
      ticket.createdById === userId ||
      ticket.assignedToId === userId

    if (!canMessage) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only admins and agents can send internal messages
    const finalIsInternal = (isInternal && (session.user.role === 'admin' || session.user.role === 'agent')) || false

    // Create the message
    const newMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        senderId: userId,
        message: message.trim(),
        isInternal: finalIsInternal,
        attachments: attachments ? JSON.stringify(attachments) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Update ticket status if it was closed and a new message is added
    if (ticket.status === 'closed') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'open' }
      })
    }

    // Notify the student when admin/agent replies (non-blocking, non-internal messages only)
    const senderRole = session.user.role
    const ticketOwner = ticket.createdBy
    const isAdminOrAgentReply = (senderRole === 'admin' || senderRole === 'agent')
    const isStudentOwner = ticketOwner.role === 'student'
    const isAgentOwner = ticketOwner.role === 'agent'
    const isPublicMessage = !finalIsInternal

    // Notify admin when student replies (non-blocking)
    if (senderRole === 'student' && isPublicMessage) {
      try {
        const priorityMap: Record<string, 'low' | 'normal' | 'high' | 'urgent'> = {
          low: 'low',
          medium: 'normal',
          high: 'high',
          urgent: 'urgent'
        }
        const notifPriority = priorityMap[ticket.priority] || 'normal'
        const notifType = ['high', 'urgent'].includes(ticket.priority) ? 'warning' : 'info'
        const studentName = ticketOwner.fullName || 'الطالب'

        await createNotification({
          title: 'رد جديد من الطالب على تذكرة الدعم',
          message: `أرسل ${studentName} رداً على تذكرة الدعم رقم #${ticketId}: "${message.trim().slice(0, 150)}${message.trim().length > 150 ? '...' : ''}"`,
          type: notifType,
          priority: notifPriority,
          entityId: ticketId,
          entityType: 'support_ticket',
          actionUrl: '/dashboard/support',
          metadata: {
            ticketId,
            studentId: ticketOwner.id,
            studentName
          }
        })
      } catch (adminNotifError) {
        console.error('Student reply admin notification error:', adminNotifError)
      }
    }

    if (isAdminOrAgentReply && isStudentOwner && isPublicMessage) {
      // In-app notification via SentNote (non-blocking)
      try {
        const senderUserId = userId
        await prisma.sentNote.create({
          data: {
            content: `تم الرد على تذكرة الدعم الخاصة بك رقم #${ticketId}. الرسالة: "${message.trim().slice(0, 200)}${message.trim().length > 200 ? '...' : ''}"`,
            senderId: senderUserId,
            recipientType: 'individual',
            recipientIds: JSON.stringify([ticketOwner.id]),
            priority: 'normal',
            readStatus: JSON.stringify({})
          }
        })
      } catch (sentNoteError) {
        console.error('Ticket reply SentNote error:', sentNoteError)
      }

      // Email notification to student (non-blocking)
      try {
        if (ticketOwner.email) {
          const senderName = newMessage.sender.fullName || 'فريق الدعم'
          await sendEmail({
            to: ticketOwner.email,
            subject: `رد جديد على تذكرة الدعم #${ticketId}`,
            text: `مرحباً ${ticketOwner.fullName}،\n\nتم الرد على تذكرة الدعم الخاصة بك رقم #${ticketId}.\n\nالرد:\n${message.trim()}\n\nمن: ${senderName}\n\nيمكنك الاطلاع على التذكرة كاملة من خلال لوحة التحكم الخاصة بك.\n\nشكراً،\nفريق SM Alkaff`,
            html: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #111827;">رد جديد على تذكرة الدعم #${ticketId}</h2>
              <p>مرحباً ${ticketOwner.fullName}،</p>
              <p>تم الرد على تذكرة الدعم الخاصة بك.</p>
              <div style="background: #f9fafb; border-right: 4px solid #374151; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; color: #111827;">${message.trim().replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">من: <strong>${senderName}</strong></p>
              <p style="color: #6b7280; font-size: 14px;">يمكنك الاطلاع على التذكرة كاملة من خلال لوحة التحكم الخاصة بك.</p>
              <p style="color: #6b7280; font-size: 14px;">شكراً،<br/>فريق SM Alkaff</p>
            </div>`
          })
        }
      } catch (emailError) {
        console.error('Ticket reply email error:', emailError)
      }
    }

    if (isAdminOrAgentReply && isAgentOwner && isPublicMessage) {
      // In-app notification via SentNote for agent (non-blocking)
      try {
        await prisma.sentNote.create({
          data: {
            content: `تم الرد على تذكرة الدعم الخاصة بك رقم #${ticketId}. الرسالة: "${message.trim().slice(0, 200)}${message.trim().length > 200 ? '...' : ''}"`,
            senderId: userId,
            recipientType: 'individual',
            recipientIds: JSON.stringify([ticketOwner.id]),
            priority: 'normal',
            readStatus: JSON.stringify({})
          }
        })
      } catch (agentSentNoteError) {
        console.error('Ticket reply agent SentNote error:', agentSentNoteError)
      }

      // Email notification to agent (non-blocking)
      try {
        if (ticketOwner.email) {
          const senderName = newMessage.sender.fullName || 'فريق الدعم'
          await sendEmail({
            to: ticketOwner.email,
            subject: `رد جديد على تذكرة الدعم #${ticketId}`,
            text: `مرحباً ${ticketOwner.fullName}،\n\nتم الرد على تذكرة الدعم الخاصة بك رقم #${ticketId}.\n\nالرد:\n${message.trim()}\n\nمن: ${senderName}\n\nيمكنك الاطلاع على التذكرة كاملة من خلال لوحة التحكم الخاصة بك.\n\nشكراً،\nفريق SM Alkaff`,
            html: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #111827;">رد جديد على تذكرة الدعم #${ticketId}</h2>
              <p>مرحباً ${ticketOwner.fullName}،</p>
              <p>تم الرد على تذكرة الدعم الخاصة بك.</p>
              <div style="background: #f9fafb; border-right: 4px solid #374151; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0; color: #111827;">${message.trim().replace(/\n/g, '<br>')}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">من: <strong>${senderName}</strong></p>
              <p style="color: #6b7280; font-size: 14px;">يمكنك الاطلاع على التذكرة كاملة من خلال لوحة التحكم الخاصة بك.</p>
              <p style="color: #6b7280; font-size: 14px;">شكراً،<br/>فريق SM Alkaff</p>
            </div>`
          })
        }
      } catch (agentEmailError) {
        console.error('Ticket reply agent email error:', agentEmailError)
      }
    }

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الرسالة' },
      { status: 500 }
    )
  }
}
