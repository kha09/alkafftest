import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { createNotification } from '@/lib/notificationService'

// GET /api/support/tickets - List tickets with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit
    const whereClause: any = {}

    // Role-based filtering
    if (session.user.role === 'student') {
      whereClause.createdById = parseInt(session.user.id)
    } else if (session.user.role === 'agent') {
      // Agents can see tickets they created or are assigned to
      whereClause.OR = [
        { createdById: parseInt(session.user.id) },
        { assignedToId: parseInt(session.user.id) }
      ]
    }
    // Admins can see all tickets (no additional filtering)

    // Apply filters
    if (status && status !== 'all') {
      whereClause.status = status
    }
    if (priority && priority !== 'all') {
      whereClause.priority = priority
    }
    if (category && category !== 'all') {
      whereClause.category = category
    }
    if (search) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  fullName: true,
                  role: true
                }
              }
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        }
      }),
      prisma.supportTicket.count({ where: whereClause })
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التذاكر' },
      { status: 500 }
    )
  }
}

// POST /api/support/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, category } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'العنوان والوصف مطلوبان' },
        { status: 400 }
      )
    }

    // Create the ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        priority: priority || 'medium',
        category: category || 'general',
        createdById: parseInt(session.user.id),
        status: 'open'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    // Create initial message with the description
    await prisma.supportTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: parseInt(session.user.id),
        message: description,
        isInternal: false
      }
    })

    // Notify admins about the new support ticket (non-blocking)
    try {
      const priorityMap: Record<string, 'low' | 'normal' | 'high' | 'urgent'> = {
        low: 'low',
        medium: 'normal',
        high: 'high',
        urgent: 'urgent'
      }
      const notificationPriority = priorityMap[ticket.priority] || 'normal'
      const notificationType = ['high', 'urgent'].includes(ticket.priority) ? 'warning' : 'info'
      const creatorName = ticket.createdBy?.fullName || session.user.name || 'طالب'

      await createNotification({
        title: 'تذكرة دعم جديدة',
        message: `أنشأ ${creatorName} تذكرة دعم جديدة: "${ticket.title}"`,
        type: notificationType,
        priority: notificationPriority,
        entityId: ticket.id,
        entityType: 'support_ticket',
        actionUrl: '/dashboard/support',
        metadata: {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          category: ticket.category,
          createdById: ticket.createdById
        }
      })
    } catch (notifError) {
      console.error('Support ticket notification error:', notifError)
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء التذكرة' },
      { status: 500 }
    )
  }
}
