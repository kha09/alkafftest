import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/admin/dashboard/stats - Get comprehensive dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // 1. Earnings Stats (from paid commissions)
    const [totalEarnings, monthlyEarnings, lastMonthEarnings] = await Promise.all([
      prisma.commission.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true }
      }),
      prisma.commission.aggregate({
        where: {
          status: 'paid',
          paidAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      prisma.commission.aggregate({
        where: {
          status: 'paid',
          paidAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { amount: true }
      })
    ])

    const totalEarningsAmount = totalEarnings._sum.amount || 0
    const monthlyEarningsAmount = monthlyEarnings._sum.amount || 0
    const lastMonthEarningsAmount = lastMonthEarnings._sum.amount || 0
    const earningsGrowth = lastMonthEarningsAmount > 0
      ? ((monthlyEarningsAmount - lastMonthEarningsAmount) / lastMonthEarningsAmount) * 100
      : 0

    // 2. Orders Stats
    const [totalOrders, processingOrders, completedOrders, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          OR: [
            { adminStatus: 'Pending' },
            { agentStatus: 'In Progress' }
          ]
        }
      }),
      prisma.order.count({
        where: { adminStatus: 'Approved' }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true, email: true }
          },
          agent: {
            select: { name: true }
          },
          formSubmission: {
            select: { fullName: true, preferredProgram: true }
          },
          commissions: {
            select: { amount: true, status: true }
          }
        }
      })
    ])

    // 3. Partners (Agents) Stats
    const [totalAgents, activeAgents, topAgents] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }
        }
      }),
      prisma.agent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true }
          },
          commissions: {
            where: { status: 'paid' },
            select: { amount: true }
          }
        }
      })
    ])

    // Process top agents to calculate totals
    const topPerformers = topAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      orderCount: agent._count.orders,
      totalEarnings: agent.commissions.reduce((sum, c) => sum + c.amount, 0)
    }))

    // 4. Universities and Programs Stats
    const [totalUniversities, totalPrograms] = await Promise.all([
      prisma.university.count(),
      prisma.program.count()
    ])

    // 5. Recent Commissions (Invoices)
    const [recentCommissions, pendingCommissions] = await Promise.all([
      prisma.commission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: { name: true, email: true }
          },
          order: {
            include: {
              user: {
                select: { fullName: true }
              }
            }
          }
        }
      }),
      prisma.commission.count({
        where: { status: 'pending' }
      })
    ])

    // 6. Additional Stats
    const [totalStudents, totalSubmissions] = await Promise.all([
      prisma.user.count({
        where: { role: 'student' }
      }),
      prisma.formSubmission.count()
    ])

    return NextResponse.json({
      earnings: {
        total: totalEarningsAmount,
        monthly: monthlyEarningsAmount,
        lastMonth: lastMonthEarningsAmount,
        growth: Math.round(earningsGrowth * 100) / 100
      },
      orders: {
        total: totalOrders,
        processing: processingOrders,
        completed: completedOrders,
        recent: recentOrders
      },
      partners: {
        total: totalAgents,
        active: activeAgents,
        topPerformers
      },
      universities: {
        total: totalUniversities,
        programs: totalPrograms
      },
      invoices: {
        recent: recentCommissions,
        pending: pendingCommissions
      },
      students: {
        total: totalStudents,
        submissions: totalSubmissions
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب إحصائيات لوحة التحكم' },
      { status: 500 }
    )
  }
}
