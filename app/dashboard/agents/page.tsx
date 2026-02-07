"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Types
type Agent = {
  id: number
  name: string
  email: string
  phone: string | null
  createdAt: string
  updatedAt: string
  submissions?: any[] // We'll add proper typing later
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null)
  const [agentName, setAgentName] = useState("")
  const [agentEmail, setAgentEmail] = useState("")
  const [agentPhone, setAgentPhone] = useState("")
  const [agentPassword, setAgentPassword] = useState("")
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "create">("create")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

  useEffect(() => {
    fetchAgents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, page])

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1)
      fetchAgents(1)
    }, 400)
    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const fetchAgents = async (customPage?: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (filterStatus !== "all") params.append("status", filterStatus)
      params.append("page", String(customPage || page))
      params.append("limit", "9")
      const response = await fetch(`/api/admin/agents?${params.toString()}`)
      const data = await response.json()
      setAgents(data.agents)
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الوكلاء",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = () => {
    setCurrentAgent(null)
    setAgentName("")
    setAgentEmail("")
    setAgentPhone("")
    setAgentPassword("")
    setDialogMode("create")
    setIsDialogOpen(true)
  }

  const handleEditAgent = (agent: Agent) => {
    setCurrentAgent(agent)
    setAgentName(agent.name)
    setAgentEmail(agent.email)
    setAgentPhone(agent.phone || "")
    setAgentPassword("")
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleViewAgent = (agent: Agent) => {
    setCurrentAgent(agent)
    setAgentName(agent.name)
    setAgentEmail(agent.email)
    setAgentPhone(agent.phone || "")
    setAgentPassword("")
    setDialogMode("view")
    setIsDialogOpen(true)
  }

  const handleSaveAgent = async () => {
    try {
      const agentData = {
        name: agentName,
        email: agentEmail,
        phone: agentPhone || null,
        ...(agentPassword && { password: agentPassword })
      }

      if (currentAgent) {
        // Update existing agent
        const response = await fetch(`/api/admin/agents/${currentAgent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error)
        }

        const result = await response.json()
        
        toast({
          title: "نجاح",
          description: result.plainPassword 
            ? `تم تحديث الوكيل بنجاح. كلمة المرور الجديدة: ${result.plainPassword}`
            : "تم تحديث الوكيل بنجاح",
        })
      } else {
        // Create new agent
        const response = await fetch('/api/admin/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error)
        }

        const result = await response.json()

        toast({
          title: "نجاح",
          description: result.plainPassword 
            ? `تم إنشاء الوكيل بنجاح. كلمة المرور: ${result.plainPassword}`
            : "تم إنشاء الوكيل بنجاح",
        })
      }

      setIsDialogOpen(false)
      setAgentPassword("") // Clear password field
      fetchAgents() // Refresh the agents list
    } catch (error: any) {
      console.error('Error saving agent:', error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ الوكيل",
        variant: "destructive",
      })
    }
  }

  const handleResetPassword = async (agentId: number) => {
    try {
      const response = await fetch(`/api/admin/agents/${agentId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      const result = await response.json()

      toast({
        title: "نجاح",
        description: `${result.message}. كلمة المرور الجديدة: ${result.newPassword}`,
      })
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return

    try {
      const response = await fetch(`/api/admin/agents/${agentToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      toast({
        title: "نجاح",
        description: "تم حذف الوكيل بنجاح",
      })

      setDeleteDialogOpen(false)
      setAgentToDelete(null)
      fetchAgents() // Refresh the agents list
    } catch (error: any) {
      console.error('Error deleting agent:', error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الوكيل",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">إدارة الوكلاء</h1>
            <p className="text-[#4b5563] mt-1">إدارة الوكلاء والمندوبين</p>
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
          <h1 className="text-3xl font-bold text-[#111827]">إدارة الوكلاء</h1>
          <p className="text-[#4b5563] mt-1">إدارة الوكلاء والمندوبين</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button className="bg-[#111827] hover:bg-[#374151]" onClick={handleCreateAgent}>
            <Plus className="w-4 h-4 ml-2" />
            وكيل جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">إجمالي الوكلاء</p>
                <p className="text-2xl font-bold text-[#111827]">{agents.length}</p>
              </div>
              <Users className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">وكلاء نشطون</p>
                <p className="text-2xl font-bold text-[#10b981]">{agents.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#10b981]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">إجمالي العمولات</p>
                <p className="text-2xl font-bold text-[#111827]">0$</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">متوسط الأداء</p>
                <p className="text-2xl font-bold text-[#111827]">0%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة الوكلاء</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b5563] w-4 h-4" />
              <Input 
                placeholder="البحث في الوكلاء..." 
                className="pr-10 w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الوكلاء</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            {/* Filter button can be used for advanced filters in the future */}
            <Button variant="outline" size="sm" disabled>
              <Filter className="w-4 h-4 ml-2" />
              فلترة
            </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>
                          {agent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-[#111827]">{agent.name}</h3>
                        <p className="text-sm text-[#4b5563]">وكيل #{agent.id}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      نشط
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#4b5563]">
                      <Phone className="w-4 h-4" />
                      <span>{agent.phone || "غير متوفر"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#4b5563]">
                      <Mail className="w-4 h-4" />
                      <span>{agent.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#4b5563]">
                      <MapPin className="w-4 h-4" />
                      <span>غير محدد</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-[#f9fafb] rounded-lg">
                      <p className="text-sm text-[#4b5563]">المبيعات</p>
                      <p className="font-semibold text-[#111827]">0$</p>
                    </div>
                    <div className="text-center p-3 bg-[#f9fafb] rounded-lg">
                      <p className="text-sm text-[#4b5563]">الطلبات</p>
                      <p className="font-semibold text-[#111827]">0</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleViewAgent(agent)}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditAgent(agent)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => handleDeleteClick(agent)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          السابق
        </Button>
        <span className="px-3 py-2 rounded bg-gray-100 text-gray-700">
          صفحة {page} من {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          التالي
        </Button>
      </div>

      {/* Agent Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "view"
                ? "تفاصيل الوكيل"
                : currentAgent
                ? "تعديل وكيل"
                : "وكيل جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agentName">الاسم</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="اسم الوكيل"
                disabled={dialogMode === "view"}
              />
            </div>
            <div>
              <Label htmlFor="agentEmail">البريد الإلكتروني</Label>
              <Input
                id="agentEmail"
                type="email"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                disabled={dialogMode === "view"}
              />
            </div>
            <div>
              <Label htmlFor="agentPhone">رقم الهاتف</Label>
              <Input
                id="agentPhone"
                value={agentPhone}
                onChange={(e) => setAgentPhone(e.target.value)}
                placeholder="رقم الهاتف"
                disabled={dialogMode === "view"}
              />
            </div>
            {(dialogMode === "create" || dialogMode === "edit") && (
              <div>
                <Label htmlFor="agentPassword">كلمة المرور</Label>
                <Input
                  id="agentPassword"
                  type="password"
                  value={agentPassword}
                  onChange={(e) => setAgentPassword(e.target.value)}
                  placeholder={dialogMode === "edit" ? "اتركها فارغة للاحتفاظ بكلمة المرور الحالية" : "كلمة المرور"}
                />
              </div>
            )}
            <div className="flex justify-between">
              <div>
                {dialogMode === "view" && currentAgent && (
                  <Button 
                    variant="outline" 
                    className="text-orange-600 hover:text-orange-700"
                    onClick={() => handleResetPassword(currentAgent.id)}
                  >
                    إعادة تعيين كلمة المرور
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إغلاق
                </Button>
                {dialogMode !== "view" && (
                  <Button onClick={handleSaveAgent}>
                    حفظ
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف الوكيل "{agentToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
