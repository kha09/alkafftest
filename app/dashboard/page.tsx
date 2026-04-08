"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DollarSign, FileText, Users, TrendingUp, Search, Plus, Download, GraduationCap, BookOpen } from "lucide-react"
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable"
import { OrdersChart } from "@/components/dashboard/OrdersChart"
import { AgentPerformanceChart } from "@/components/dashboard/AgentPerformanceChart"
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart"
import { DailySubmissionsChart } from "@/components/dashboard/DailySubmissionsChart"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import Link from "next/link"

interface DashboardStats {
  earnings: {
    total: number
    monthly: number
    lastMonth: number
    growth: number
  }
  orders: {
    total: number
    processing: number
    completed: number
    recent: any[]
  }
  partners: {
    total: number
    active: number
    topPerformers: {
      id: number
      name: string
      email: string
      phone: string | null
      orderCount: number
      totalEarnings: number
    }[]
  }
  universities: {
    total: number
    programs: number
  }
  invoices: {
    recent: any[]
    pending: number
  }
  students: {
    total: number
    submissions: number
  }
}

interface ChartData {
  monthlyOrders: {
    month: string
    count: number
    revenue: number
  }[]
  agentPerformance: {
    name: string
    orders: number
    earnings: number
  }[]
  statusDistribution: {
    name: string
    value: number
    color: string
  }[]
  dailySubmissions: {
    date: string
    count: number
  }[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/dashboard/charts')
        ])

        if (!statsRes.ok || !chartsRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const statsData = await statsRes.json()
        const chartsData = await chartsRes.json()

        setStats(statsData)
        setChartData(chartsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !stats || !chartData) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 mb-4">حدث خطأ أثناء تحميل البيانات</p>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`

  return (
    <div className="min-h-screen bg-[#f9fafb]" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">لوحة تحكم الكاف</h1>
          <div className="flex items-center gap-4">
            <Select defaultValue="ar">
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563] mb-1">إجمالي الأرباح</p>
                  <p className="text-2xl font-bold text-[#111827]">{formatCurrency(stats.earnings.total)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.earnings.growth > 0 ? '+' : ''}{stats.earnings.growth.toFixed(1)}% من الشهر الماضي
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Orders */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563] mb-1">طلبات قيد المعالجة</p>
                  <p className="text-2xl font-bold text-[#111827]">{stats.orders.processing}</p>
                  <p className="text-xs text-gray-500 mt-1">من أصل {stats.orders.total} طلب</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partners (Agents) */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563] mb-1">عدد الشركاء</p>
                  <p className="text-2xl font-bold text-[#111827]">{stats.partners.total}</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.partners.active} نشط هذا الشهر</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products (Universities & Programs) */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563] mb-1">الجامعات والبرامج</p>
                  <p className="text-2xl font-bold text-[#111827]">{stats.universities.total}</p>
                  <p className="text-xs text-purple-600 mt-1">{stats.universities.programs} برنامج</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="bg-white mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#111827]">إدارة الطلبات</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير البيانات
                </Button>
                <Link href="/dashboard/students">
                  <Button size="sm" className="bg-[#111827] hover:bg-[#374151]">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة طلب
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b5563] w-4 h-4" />
                <Input placeholder="البحث في الطلبات..." className="pr-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="كل الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="pending">قيد المعالجة</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                تحديث
              </Button>
            </div>

            <RecentOrdersTable orders={stats.orders.recent} />
          </CardContent>
        </Card>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Commissions (Invoices) */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#111827]">إدارة الفواتير والمعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.invoices.recent.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد فواتير حالياً</p>
                ) : (
                  stats.invoices.recent.slice(0, 3).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#111827]">
                          {commission.agent?.name || commission.order?.user?.fullName || 'غير معروف'}
                        </p>
                        <p className="text-xs text-[#4b5563]">
                          رقم العمولة: COM-{commission.id.toString().padStart(4, '0')}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#111827]">{formatCurrency(commission.amount)}</p>
                        <p className="text-xs text-[#4b5563]">
                          {new Date(commission.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Link href="/dashboard/commissions">
                        <Button variant="outline" size="sm">
                          عرض
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
                {stats.invoices.pending > 0 && (
                  <p className="text-xs text-amber-600 text-center">
                    {stats.invoices.pending} عمولة قيد الانتظار
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Agents */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#111827]">إدارة الوكلاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.partners.topPerformers.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا يوجد وكلاء حالياً</p>
                ) : (
                  stats.partners.topPerformers.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#111827]">{agent.name}</p>
                        <p className="text-xs text-[#4b5563]">{agent.email}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#111827]">{agent.orderCount}</p>
                        <p className="text-xs text-[#4b5563]">عدد المعاملات</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#111827]">{formatCurrency(agent.totalEarnings)}</p>
                        <p className="text-xs text-[#4b5563]">العمولات</p>
                      </div>
                      <Link href="/dashboard/agents">
                        <Button variant="outline" size="sm">
                          عرض
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Orders Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#111827]">التقارير والمعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-[#4b5563]">التقرير الشهري - الطلبات والإيرادات</p>
              </div>
              <OrdersChart data={chartData.monthlyOrders} />
            </CardContent>
          </Card>

          {/* Agent Performance Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#111827]">أداء الوكلاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-[#4b5563]">أعلى 5 وكلاء حسب عدد الطلبات</p>
              </div>
              <AgentPerformanceChart data={chartData.agentPerformance} />
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Status Distribution */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#111827]">توزيع حالات الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <StatusDistributionChart data={chartData.statusDistribution} />
                </div>
                <div className="space-y-2">
                  {chartData.statusDistribution.map((status) => (
                    <div key={status.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-gray-600">{status.name}: {status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Submissions */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-[#111827]">طلبات التقديم اليومية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-[#4b5563]">آخر 7 أيام</p>
              </div>
              <DailySubmissionsChart data={chartData.dailySubmissions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
