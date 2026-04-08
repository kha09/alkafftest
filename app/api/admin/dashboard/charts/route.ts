import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/admin/dashboard/charts - Get chart data for dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    
    // Generate last 6 months data
    const months: string[] = []
    const monthlyData: { month: string; count: number; revenue: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1)
      const monthName = date.toLocaleString('ar-SA', { month: 'short' })
      months.push(monthName)
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      // Get orders count for this month
      const orderCount = await prisma.order.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })
      
      // Get revenue for this month
      const revenue = await prisma.commission.aggregate({
        where: {
          status: 'paid',
          paidAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { amount: true }
      })
      
      monthlyData.push({
        month: monthName,
        count: orderCount,
        revenue: revenue._sum.amount || 0
      })
    }

    // Agent performance data (top 5 agents by order count)
    const agentPerformance = await prisma.agent.findMany({
      take: 5,
      orderBy: {
        orders: {
          _count: 'desc'
        }
      },
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

    const agentChartData = agentPerformance.map(agent => ({
      name: agent.name,
      orders: agent._count.orders,
      earnings: agent.commissions.reduce((sum, c) => sum + c.amount, 0)
    }))

    // Order status distribution
    const [pendingCount, approvedCount, rejectedCount, inProgressCount] = await Promise.all([
      prisma.order.count({ where: { adminStatus: 'Pending' } }),
      prisma.order.count({ where: { adminStatus: 'Approved' } }),
      prisma.order.count({ where: { adminStatus: 'Rejected' } }),
      prisma.order.count({ where: { agentStatus: 'In Progress' } })
    ])

    const statusDistribution = [
      { name: 'قيد الانتظار', value: pendingCount, color: '#f59e0b' },
      { name: 'مكتمل', value: approvedCount, color: '#10b981' },
      { name: 'مرفوض', value: rejectedCount, color: '#ef4444' },
      { name: 'قيد المعالجة', value: inProgressCount, color: '#3b82f6' }
    ].filter(item => item.value > 0)

    // Recent submissions trend (last 7 days)
    const dailySubmissions: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const count = await prisma.formSubmission.count({
        where: {
          submittedAt: {
            gte: date,
            lt: nextDate
          }
        }
      })
      
      dailySubmissions.push({
        date: date.toLocaleString('ar-SA', { weekday: 'short' }),
        count
      })
    }

    return NextResponse.json({
      monthlyOrders: monthlyData,
      agentPerformance: agentChartData,
      statusDistribution,
      dailySubmissions
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الرسوم البيانية' },
      { status: 500 }
    )
  }
}
