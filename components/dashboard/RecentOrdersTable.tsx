"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Order {
  id: number
  createdAt: string
  adminStatus: string
  agentStatus: string
  submissionStatus: string
  user: {
    fullName: string
    email: string
  } | null
  formSubmission: {
    fullName: string
    preferredProgram: string
  } | null
  commissions: {
    amount: number
    status: string
  }[]
}

interface RecentOrdersTableProps {
  orders: Order[]
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    'Pending': { label: 'قيد الانتظار', variant: 'secondary' },
    'Approved': { label: 'مكتمل', variant: 'default' },
    'Rejected': { label: 'مرفوض', variant: 'destructive' },
    'In Progress': { label: 'قيد المعالجة', variant: 'outline' },
    'submitted': { label: 'مُقدم', variant: 'secondary' },
    'approved_by_admin': { label: 'معتمد من الأدمن', variant: 'default' },
    'sent_to_university': { label: 'مرسل للجامعة', variant: 'outline' },
    'accepted_by_university': { label: 'مقبول من الجامعة', variant: 'default' },
    'rejected_by_university': { label: 'مرفوض من الجامعة', variant: 'destructive' },
    'completed': { label: 'مكتمل', variant: 'default' }
  }

  const config = statusMap[status] || { label: status, variant: 'secondary' }
  
  const classNameMap: Record<string, string> = {
    'default': 'bg-green-100 text-green-800 hover:bg-green-100',
    'secondary': 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    'destructive': 'bg-red-100 text-red-800 hover:bg-red-100',
    'outline': 'bg-blue-100 text-blue-800 hover:bg-blue-100'
  }

  return (
    <Badge variant={config.variant} className={classNameMap[config.variant]}>
      {config.label}
    </Badge>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString()}`
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد طلبات حالياً
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-right p-3 text-sm font-medium text-gray-600">إجراءات</th>
            <th className="text-right p-3 text-sm font-medium text-gray-600">معلومات</th>
            <th className="text-right p-3 text-sm font-medium text-gray-600">الحالة</th>
            <th className="text-right p-3 text-sm font-medium text-gray-600">تاريخ الطلب</th>
            <th className="text-right p-3 text-sm font-medium text-gray-600">المبلغ</th>
            <th className="text-right p-3 text-sm font-medium text-gray-600">اسم الطالب</th>
            <th className="text-right p-3 text-sm font-medium text-gray-600">رقم الطلب</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const studentName = order.formSubmission?.fullName || order.user?.fullName || 'غير معروف'
            const amount = order.commissions.reduce((sum, c) => sum + c.amount, 0)
            
            return (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/dashboard/students?id=${order.id}`}>
                    <Button variant="outline" size="sm">
                      عرض
                    </Button>
                  </Link>
                </td>
                <td className="p-3 text-sm text-gray-700">
                  {order.formSubmission?.preferredProgram || 'برنامج غير محدد'}
                </td>
                <td className="p-3">
                  {getStatusBadge(order.adminStatus === 'Pending' ? order.submissionStatus : order.adminStatus)}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </td>
                <td className="p-3 text-sm text-gray-900 font-medium">
                  {amount > 0 ? formatCurrency(amount) : '-'}
                </td>
                <td className="p-3 text-sm text-gray-900">
                  {studentName}
                </td>
                <td className="p-3 text-sm text-gray-900 font-medium">
                  #{order.id.toString().padStart(4, '0')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
