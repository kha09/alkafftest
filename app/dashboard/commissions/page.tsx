"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter, DollarSign, Check, X, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CommissionReceiptSection } from "@/components/commission-receipt-section"

// Types
type Agent = {
  id: number
  name: string
  email: string
}

type Order = {
  id: number
  formSubmission: {
    fullName: string
  } | null
  adminStatus: string
  paymentStatus: string
  dateCreated: string
}

type Commission = {
  id: number
  agentId: number
  agent: Agent
  orderId: number
  order: Order
  amount: number
  status: string
  requestedAt: string
  approvedAt: string | null
  paidAt: string | null
  notes: string | null
  receiptPath: string | null
  receiptUploadedAt: string | null
  receiptViewedByAgent: boolean
  deliveredToAgent: boolean
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [agentFilter, setAgentFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)
  const [newCommission, setNewCommission] = useState({
    agentId: null as number | null,
    studentId: null as number | null,
    amount: null as number | null,
    notes: ""
  })
  const [agentStudents, setAgentStudents] = useState<any[]>([])

  useEffect(() => {
    fetchCommissions()
    fetchAgents()
    fetchStudents()
  }, [])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/commissions')
      if (!response.ok) {
        throw new Error('Failed to fetch commissions')
      }
      const data = await response.json()
      setCommissions(data.commissions || [])
    } catch (error) {
      console.error('Error fetching commissions:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات العمولات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents')
      if (!response.ok) {
        throw new Error('Failed to fetch agents')
      }
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الوكلاء",
        variant: "destructive",
      })
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/form-submissions')
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }
      const data = await response.json()
      setAgentStudents(data.submissions || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الطلاب",
        variant: "destructive",
      })
    }
  }

  const handleViewCommission = (commission: Commission) => {
    setSelectedCommission(commission)
    setIsViewDialogOpen(true)
  }

  const handleApproveCommission = async (commissionId: number) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في الموافقة على العمولة')
      }

      // Refresh the commissions list
      await fetchCommissions()

      toast({
        title: "نجاح",
        description: "تمت الموافقة على طلب العمولة",
      })
    } catch (error) {
      console.error('Error approving commission:', error)
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء الموافقة على طلب العمولة",
        variant: "destructive",
      })
    }
  }

  const handlePayCommission = async (commissionId: number) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'paid'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في دفع العمولة')
      }

      // Refresh the commissions list
      await fetchCommissions()

      toast({
        title: "نجاح",
        description: "تم دفع العمولة بنجاح",
      })
    } catch (error) {
      console.error('Error paying commission:', error)
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء دفع العمولة",
        variant: "destructive",
      })
    }
  }

  const handleRejectCommission = async (commissionId: number) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في رفض العمولة')
      }

      // Refresh the commissions list
      await fetchCommissions()

      toast({
        title: "نجاح",
        description: "تم رفض طلب العمولة",
      })
    } catch (error) {
      console.error('Error rejecting commission:', error)
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء رفض طلب العمولة",
        variant: "destructive",
      })
    }
  }

  const handleCreateCommission = async () => {
    try {
      if (!newCommission.agentId || !newCommission.studentId || !newCommission.amount) {
        toast({
          title: "خطأ",
          description: "جميع الحقول مطلوبة",
          variant: "destructive",
        })
        return
      }

      // Call the API to create the commission
      const response = await fetch('/api/admin/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: newCommission.agentId,
          orderId: newCommission.studentId, // Using studentId as orderId for now
          amount: newCommission.amount,
          notes: newCommission.notes
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إنشاء العمولة')
      }

      const createdCommission = await response.json()

      // Refresh the commissions list
      await fetchCommissions()

      setIsCreateDialogOpen(false)
      setNewCommission({
        agentId: null,
        studentId: null,
        amount: null,
        notes: ""
      })
      toast({
        title: "نجاح",
        description: "تم إنشاء العمولة بنجاح",
      })
    } catch (error) {
      console.error('Error creating commission:', error)
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء العمولة",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return "bg-green-100 text-green-800"
      case 'approved':
        return "bg-blue-100 text-blue-800"
      case 'pending':
        return "bg-yellow-100 text-yellow-800"
      case 'rejected':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return "مدفوع"
      case 'approved':
        return "موافق عليه"
      case 'pending':
        return "قيد الانتظار"
      case 'rejected':
        return "مرفوض"
      default:
        return status
    }
  }

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.order.formSubmission?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter
    const matchesAgent = agentFilter === "all" || commission.agentId.toString() === agentFilter
    
    return matchesSearch && matchesStatus && matchesAgent
  })

  // Calculate totals
  const totalPending = commissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.amount, 0)
    
  const totalApproved = commissions
    .filter(c => c.status === "approved")
    .reduce((sum, c) => sum + c.amount, 0)
    
  const totalPaid = commissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0)

  if (loading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">عمولات ومدفوعات الوكلاء</h1>
            <p className="text-[#4b5563] mt-1">إدارة عمولات ومدفوعات الوكلاء</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#111827]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">عمولات ومدفوعات الوكلاء</h1>
          <p className="text-[#4b5563] mt-1">إدارة عمولات ومدفوعات الوكلاء</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#111827] hover:bg-[#374151]">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عمولة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة عمولة يدوياً</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agentId">الوكيل</Label>
                  <Select 
                    value={newCommission.agentId?.toString() || ''} 
                    onValueChange={(value) => setNewCommission({...newCommission, agentId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر وكيل" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="studentId">اسم الطالب</Label>
                  <Select 
                    value={newCommission.studentId?.toString() || ''} 
                    onValueChange={(value) => setNewCommission({...newCommission, studentId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">المبلغ</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newCommission.amount || ''}
                    onChange={(e) => setNewCommission({...newCommission, amount: parseFloat(e.target.value) || null})}
                    placeholder="أدخل مبلغ العمولة"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <textarea
                    id="notes"
                    className="w-full p-3 border rounded-md"
                    rows={3}
                    value={newCommission.notes}
                    onChange={(e) => setNewCommission({...newCommission, notes: e.target.value})}
                    placeholder="أضف ملاحظات حول العمولة"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleCreateCommission}>
                    إنشاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">قيد الانتظار</p>
                <p className="text-2xl font-bold text-[#f59e0b]">${totalPending.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#f59e0b]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">موافق عليه</p>
                <p className="text-2xl font-bold text-[#3b82f6]">${totalApproved.toFixed(2)}</p>
              </div>
              <Check className="w-8 h-8 text-[#3b82f6]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">مدفوع</p>
                <p className="text-2xl font-bold text-[#10b981]">${totalPaid.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#10b981]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">إجمالي العمليات</p>
                <p className="text-2xl font-bold text-[#111827]">{commissions.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b5563] w-4 h-4" />
              <Input 
                placeholder="البحث في العمولات..." 
                className="pr-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="approved">موافق عليه</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الوكيل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الوكلاء</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 ml-2" />
              فلترة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العمولات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">الإجراءات</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">الحالة</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">المبلغ</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">رقم الطلب</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">اسم الطالب</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">الوكيل</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد عمولات
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewCommission(commission)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {commission.status === "pending" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 hover:text-green-700 bg-transparent"
                                onClick={() => handleApproveCommission(commission.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => handleRejectCommission(commission.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {commission.status === "approved" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 hover:text-green-700 bg-transparent"
                              onClick={() => handlePayCommission(commission.id)}
                            >
                              دفع
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusBadgeClass(commission.status)}>
                          {getStatusLabel(commission.status)}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm font-medium text-[#111827]">${commission.amount.toFixed(2)}</td>
                      <td className="p-3 text-sm text-[#111827]">#{commission.orderId}</td>
                      <td className="p-3 text-sm text-[#111827]">
                        {commission.order.formSubmission?.fullName || "—"}
                      </td>
                      <td className="p-3 text-sm text-[#111827]">{commission.agent.name}</td>
                      <td className="p-3 text-sm text-[#4b5563]">
                        {new Date(commission.requestedAt).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Commission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العمولة #{selectedCommission?.id}</DialogTitle>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-6">
              {/* Commission Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات العمولة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم العمولة:</span>
                      <span className="font-medium">#{selectedCommission.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ:</span>
                      <span className="font-medium">${selectedCommission.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <Badge className={getStatusBadgeClass(selectedCommission.status)}>
                        {getStatusLabel(selectedCommission.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الطلب:</span>
                      <span>{new Date(selectedCommission.requestedAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                    {selectedCommission.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الموافقة:</span>
                        <span>{new Date(selectedCommission.approvedAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                    {selectedCommission.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الدفع:</span>
                        <span>{new Date(selectedCommission.paidAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>معلومات الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الطلب:</span>
                      <span className="font-medium">#{selectedCommission.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم الطالب:</span>
                      <span>{selectedCommission.order.formSubmission?.fullName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">حالة الطلب:</span>
                      <span>{selectedCommission.order.adminStatus === "completed" ? "مكتمل" : selectedCommission.order.adminStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الطلب:</span>
                      <span>{new Date(selectedCommission.order.dateCreated).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Info */}
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الوكيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الاسم:</span>
                    <span>{selectedCommission.agent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                    <span>{selectedCommission.agent.email}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedCommission.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>الملاحظات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedCommission.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Commission Receipt Section */}
              <CommissionReceiptSection 
                commission={selectedCommission}
                onCommissionUpdate={(updatedCommission) => {
                  const updatedCommissionWithFullType = updatedCommission as Commission;
                  setCommissions(commissions.map(c => 
                    c.id === updatedCommissionWithFullType.id ? updatedCommissionWithFullType : c
                  ))
                  setSelectedCommission(updatedCommissionWithFullType)
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
