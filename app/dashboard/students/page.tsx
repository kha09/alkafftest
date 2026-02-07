"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Plus, Download, Filter, Eye, Edit, Trash2, Send, Key, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
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
import { ApplicationForm } from "@/components/application-form"
import { PaymentReceiptSection } from "@/components/payment-receipt-section"
import { VisaDocumentsSection } from "@/components/visa-documents-section"

// Types
type Agent = {
  id: number
  name: string
  email: string
  phone?: string
  createdAt: string
  updatedAt: string
}

type User = {
  id: number
  username: string
  email: string
  fullName: string
  role: string
  createdAt: string
  updatedAt: string
}

type UploadedFile = {
  id: number
  filename: string
  originalName: string
  path: string
  size: number
  type: string
  uploadedAt: string
}

type FormSubmission = {
  id: number
  fullName: string
  nationality: string
  email: string
  countryOfResidence: string
  contactNumber: string
  cityOfResidence: string
  preferredProgram: string
  universityId: number | null
  programId: number | null
  submittedAt: string
  agentId: number | null
  orderStage: string
  userId: number | null
  agent: Agent | null
  user: User | null
  uploadedFiles: UploadedFile[]
}

// Status options that match the student dashboard
const submissionStatuses = [
  { value: "submitted", label: "تم التقديم" },
  { value: "approved_by_admin", label: "موافقة الإدارة" },
  { value: "sent_to_university", label: "مرسل للجامعة" },
  { value: "accepted_by_university", label: "مقبول من الجامعة" },
  { value: "rejected_by_university", label: "رفض الجامعة" },
  { value: "submitted_visa_info", label: "تقديم معلومات التأشيرة" },
  { value: "submitted_payment", label: "تقديم الدفع" },
  { value: "completed", label: "مكتمل" }
]

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function StudentsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("all")
  const [selectedOrderStage, setSelectedOrderStage] = useState("all")
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailTemplates, setEmailTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [universityEmail, setUniversityEmail] = useState("")
  const [includeAttachments, setIncludeAttachments] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [submissionToDelete, setSubmissionToDelete] = useState<FormSubmission | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    fetchSubmissions(currentPage, searchTerm, selectedAgent, selectedOrderStage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedAgent, selectedOrderStage])

  const fetchSubmissions = async (
    page = 1,
    search = "",
    agentId = "all",
    orderStage = "all"
  ) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(agentId && agentId !== "all" && { agentId }),
        ...(orderStage && orderStage !== "all" && { orderStage }),
      })
      const response = await fetch(`/api/admin/form-submissions?${params}`)
      let data: any = null
      try {
        data = await response.json()
      } catch (e) {
        data = null
      }
      if (!response.ok || !data || !Array.isArray(data.submissions) || !data.pagination) {
        setSubmissions([])
        setTotalPages(1)
        setTotalSubmissions(0)
        setCurrentPage(1)
        toast({
          title: "خطأ",
          description: data?.error || "حدث خطأ أثناء جلب الطلبات",
          variant: "destructive",
        })
        return
      }
      setSubmissions(data.submissions)
      setTotalPages(data.pagination.pages)
      setTotalSubmissions(data.pagination.total)
      setCurrentPage(data.pagination.page)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setSubmissions([])
      setTotalPages(1)
      setTotalSubmissions(0)
      setCurrentPage(1)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الطلبات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/admin/agents')
      const data = await response.json()
      setAgents(data.agents)
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الوكلاء",
        variant: "destructive",
      })
    }
  }

  const handleAssignAgent = async (submissionId: number, agentId: string) => {
    try {
      const response = await fetch(`/api/admin/form-submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: agentId === "unassigned" ? null : parseInt(agentId)
        })
      })
      
      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(submissions.map(sub => 
          sub.id === submissionId ? updatedSubmission : sub
        ))
        toast({
          title: "نجاح",
          description: "تم تعيين الوكيل بنجاح",
        })
      } else {
        throw new Error('Failed to update submission')
      }
    } catch (error) {
      console.error('Error assigning agent:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعيين الوكيل",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOrderStage = async (submissionId: number, stage: string) => {
    try {
      const response = await fetch(`/api/admin/form-submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionStatus: stage })
      })
      
      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(submissions.map(sub => 
          sub.id === submissionId ? updatedSubmission : sub
        ))
        toast({
          title: "نجاح",
          description: "تم تحديث حالة الطلب بنجاح",
        })
      } else {
        throw new Error('Failed to update submission')
      }
    } catch (error) {
      console.error('Error updating order stage:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الطلب",
        variant: "destructive",
      })
    }
  }

  const handleGenerateUser = async (submissionId: number) => {
    try {
      const response = await fetch('/api/admin/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Refresh submissions to get updated data
        fetchSubmissions()
        window.alert(`تم إنشاء المستخدم بنجاح.\nاسم المستخدم: ${data.username}\nكلمة المرور: ${data.password}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate user')
      }
    } catch (error: any) {
      console.error('Error generating user:', error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء المستخدم",
        variant: "destructive",
      })
    }
  }

  const handleRejectUser = async (submissionId: number) => {
    try {
      const response = await fetch(`/api/admin/form-submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStage: "Rejected" })
      })
      
      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(submissions.map(sub => 
          sub.id === submissionId ? updatedSubmission : sub
        ))
        toast({
          title: "نجاح",
          description: "تم رفض الطلب بنجاح",
        })
      } else {
        throw new Error('Failed to reject submission')
      }
    } catch (error) {
      console.error('Error rejecting submission:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض الطلب",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubmissionField = async (submissionId: number, field: string, value: string) => {
    try {
      const response = await fetch(`/api/admin/form-submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      
      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(submissions.map(sub => 
          sub.id === submissionId ? updatedSubmission : sub
        ))
        toast({
          title: "نجاح",
          description: "تم تحديث المعلومات بنجاح",
        })
      } else {
        throw new Error('Failed to update submission field')
      }
    } catch (error) {
      console.error(`Error updating submission ${field}:`, error)
      toast({
        title: "خطأ",
        description: `حدث خطأ أثناء تحديث ${field}`,
        variant: "destructive",
      })
    }
  }

  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setEmailTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching email templates:', error)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (templateId && templateId !== "custom") {
      const template = emailTemplates.find(t => t.id.toString() === templateId)
      if (template) {
        setEmailSubject(template.subject)
        setEmailMessage(template.body)
      }
    } else {
      setEmailSubject("")
      setEmailMessage("")
    }
  }

  const handleSendEmail = async () => {
    if (!selectedSubmission) return
    
    // Check if using template or custom message
    if (selectedTemplate && selectedTemplate !== "custom") {
      // Send with template - template validation is handled by the template selection
    } else {
      // Send with custom message
      if (!emailSubject || !emailMessage) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال الموضوع والرسالة",
          variant: "destructive",
        })
        return
      }
    }

    try {
      const requestBody: any = {
        submissionId: selectedSubmission.id,
        includeAttachments
      }

      if (selectedTemplate && selectedTemplate !== "custom") {
        requestBody.templateId = parseInt(selectedTemplate)
      } else {
        requestBody.customSubject = emailSubject
        requestBody.customMessage = emailMessage
      }

      if (universityEmail) {
        requestBody.universityEmail = universityEmail
      }

      const response = await fetch('/api/admin/form-submissions/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsEmailDialogOpen(false)
        resetEmailForm()
        toast({
          title: "نجاح",
          description: `تم إرسال البريد الإلكتروني بنجاح إلى ${data.recipientEmail}`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send email')
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال البريد الإلكتروني",
        variant: "destructive",
      })
    }
  }

  const resetEmailForm = () => {
    setEmailSubject("")
    setEmailMessage("")
    setSelectedTemplate("")
    setUniversityEmail("")
    setIncludeAttachments(true)
    setSelectedSubmission(null)
  }

  const openEmailDialog = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    fetchEmailTemplates()
    setIsEmailDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return

    try {
      const response = await fetch(`/api/admin/form-submissions/${submissionToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove the deleted submission from the list
        setSubmissions(submissions.filter(sub => sub.id !== submissionToDelete.id))
        setDeleteDialogOpen(false)
        setSubmissionToDelete(null)
        toast({
          title: "نجاح",
          description: "تم حذف الطلب بنجاح",
        })
        // Refresh the list to get updated pagination
        fetchSubmissions(currentPage, searchTerm, selectedAgent, selectedOrderStage)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete submission')
      }
    } catch (error: any) {
      console.error('Error deleting submission:', error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الطلب",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">إدارة الطلاب</h1>
            <p className="text-[#4b5563] mt-1">إدارة جميع طلبات الطلاب</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#111827]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">إدارة الطلاب</h1>
          <p className="text-[#4b5563] mt-1">إدارة جميع طلبات الطلاب</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                إنشاء طالب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden p-0">
              <div className="max-h-[95vh] overflow-y-auto">
                <DialogHeader className="p-6 pb-4 border-b">
                  <DialogTitle className="text-xl font-bold">إنشاء طالب</DialogTitle>
                </DialogHeader>
                <div className="p-6">
                  <ApplicationForm 
                    inline={true}
                    onClose={() => {}} 
                    onSubmissionSuccess={() => {
                      // Refresh the submissions list
                      fetchSubmissions();
                    }}
                    hideSuccessModal={true}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-[#111827]">{submissions.length}</p>
              </div>
              <User className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">قيد المعالجة</p>
                <p className="text-2xl font-bold text-[#f59e0b]">
                  {submissions.filter(s => s.orderStage === "In Progress").length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-[#f59e0b]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">مكتملة</p>
                <p className="text-2xl font-bold text-[#10b981]">
                  {submissions.filter(s => s.orderStage === "Completed").length}
                </p>
              </div>
              <Key className="w-8 h-8 text-[#10b981]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">ملغية</p>
                <p className="text-2xl font-bold text-[#ef4444]">
                  {submissions.filter(s => s.orderStage === "Cancelled").length}
                </p>
              </div>
              <Trash2 className="w-8 h-8 text-[#ef4444]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b5563] w-4 h-4" />
              <Input
                placeholder="البحث في الطلبات..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  if (searchTimeout) clearTimeout(searchTimeout)
                  const timeout = setTimeout(() => {
                    fetchSubmissions(1, e.target.value, selectedAgent, selectedOrderStage)
                  }, 500)
                  setSearchTimeout(timeout)
                }}
                onBlur={() => {
                  fetchSubmissions(1, searchTerm, selectedAgent, selectedOrderStage)
                }}
              />
            </div>
            <Select value={selectedAgent} onValueChange={(value) => {
              setSelectedAgent(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الوكيل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الوكلاء</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>{agent.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedOrderStage} onValueChange={(value) => {
              setSelectedOrderStage(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {submissionStatuses.map(stage => (
                  <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchSubmissions(1, searchTerm, selectedAgent, selectedOrderStage)
              }}
            >
              <Filter className="w-4 h-4 ml-2" />
              فلترة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">الإجراءات</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">الوكيل</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">حالة الطلب</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">التخصص المفضل</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">رقم الاتصال</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">البريد الإلكتروني</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">الاسم الكامل</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">الجنسية</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">بلد الإقامة</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">مدينة الإقامة</th>
                  <th className="text-right p-3 text-sm font-medium text-[#4b5563]">رقم الطالب</th>
                </tr>
              </thead>
              <tbody>
                {submissions && submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb]">
                      {/* ... unchanged row rendering ... */}
                      {/* (keep the rest of the row code as is) */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {submission.user ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEmailDialog(submission)}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`/api/admin/form-submissions/${submission.id}/reset-password`, {
                                      method: 'POST'
                                    });
                                    const data = await response.json();
                                    if (response.ok) {
                                      // Show password in a dialog/modal
                                      window.alert(`كلمة المرور الجديدة: ${data.newPassword}`);
                                    } else {
                                      toast({
                                        title: "خطأ",
                                        description: data.error || "حدث خطأ أثناء إعادة تعيين كلمة المرور",
                                        variant: "destructive",
                                      });
                                    }
                                  } catch (error) {
                                    toast({
                                      title: "خطأ",
                                      description: "حدث خطأ أثناء إعادة تعيين كلمة المرور",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleGenerateUser(submission.id)}
                              >
                                قبول
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRejectUser(submission.id)}
                              >
                                رفض
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSubmissionToDelete(submission)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden p-0">
                              <div className="max-h-[95vh] overflow-y-auto">
                                <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-white z-10">
                                  <DialogTitle className="text-xl font-bold">تعديل الطلب</DialogTitle>
                                </DialogHeader>
                                <div className="p-6 space-y-6">
                                <div>
                                  <Label>تعيين وكيل</Label>
                                  <Select 
                                    value={submission.agent?.id?.toString() || ""} 
                                    onValueChange={(value) => handleAssignAgent(submission.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر وكيل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unassigned">غير محدد</SelectItem>
                                      {agents.map(agent => (
                                        <SelectItem key={agent.id} value={agent.id.toString()}>{agent.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>حالة الطلب</Label>
                                  <Select 
                                    value={submission.orderStage} 
                                    onValueChange={(value) => handleUpdateOrderStage(submission.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {submissionStatuses.map(stage => (
                                        <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <Label>عرض الملفات المرفقة</Label>
                                    {submission.uploadedFiles && submission.uploadedFiles.length > 0 ? (
                                      <div className="mt-2 space-y-2">
                                        {submission.uploadedFiles.map((file) => (
                                          <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="text-sm">{file.originalName}</span>
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => window.open(`/api/files/${file.path}`, '_blank')}
                                            >
                                              عرض
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500 mt-2">لا توجد ملفات مرفقة</p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <Label>إيصال الدفع للجامعة</Label>
                                    <PaymentReceiptSection submissionId={submission.id} />
                                  </div>
                                  
                                  <div>
                                    <Label>مستندات التأشيرة</Label>
                                    <VisaDocumentsSection submissionId={submission.id} />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="fullName">الاسم الكامل</Label>
                                      <Input
                                        id="fullName"
                                        value={submission.fullName}
                                        onChange={(e) => {
                                          const updatedSubmissions = submissions.map(sub => 
                                            sub.id === submission.id 
                                              ? { ...sub, fullName: e.target.value } 
                                              : sub
                                          );
                                          setSubmissions(updatedSubmissions);
                                        }}
                                        onBlur={(e) => {
                                          handleUpdateSubmissionField(submission.id, 'fullName', e.target.value);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="nationality">الجنسية</Label>
                                      <Input
                                        id="nationality"
                                        value={submission.nationality}
                                        onChange={(e) => {
                                          const updatedSubmissions = submissions.map(sub => 
                                            sub.id === submission.id 
                                              ? { ...sub, nationality: e.target.value } 
                                              : sub
                                          );
                                          setSubmissions(updatedSubmissions);
                                        }}
                                        onBlur={(e) => {
                                          handleUpdateSubmissionField(submission.id, 'nationality', e.target.value);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="email">البريد الإلكتروني</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        value={submission.email}
                                        onChange={(e) => {
                                          const updatedSubmissions = submissions.map(sub => 
                                            sub.id === submission.id 
                                              ? { ...sub, email: e.target.value } 
                                              : sub
                                          );
                                          setSubmissions(updatedSubmissions);
                                        }}
                                        onBlur={(e) => {
                                          handleUpdateSubmissionField(submission.id, 'email', e.target.value);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="contactNumber">رقم الاتصال</Label>
                                      <Input
                                        id="contactNumber"
                                        value={submission.contactNumber}
                                        onChange={(e) => {
                                          const updatedSubmissions = submissions.map(sub => 
                                            sub.id === submission.id 
                                              ? { ...sub, contactNumber: e.target.value } 
                                              : sub
                                          );
                                          setSubmissions(updatedSubmissions);
                                        }}
                                        onBlur={(e) => {
                                          handleUpdateSubmissionField(submission.id, 'contactNumber', e.target.value);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="countryOfResidence">بلد الإقامة</Label>
                                      <Input
                                        id="countryOfResidence"
                                        value={submission.countryOfResidence}
                                        onChange={(e) => {
                                          const updatedSubmissions = submissions.map(sub => 
                                            sub.id === submission.id 
                                              ? { ...sub, countryOfResidence: e.target.value } 
                                              : sub
                                          );
                                          setSubmissions(updatedSubmissions);
                                        }}
                                        onBlur={(e) => {
                                          handleUpdateSubmissionField(submission.id, 'countryOfResidence', e.target.value);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="cityOfResidence">مدينة الإقامة</Label>
                                      <Input
                                        id="cityOfResidence"
                                        value={submission.cityOfResidence}
                                        onChange={(e) => {
                                          const updatedSubmissions = submissions.map(sub => 
                                            sub.id === submission.id 
                                              ? { ...sub, cityOfResidence: e.target.value } 
                                              : sub
                                          );
                                          setSubmissions(updatedSubmissions);
                                        }}
                                        onBlur={(e) => {
                                          handleUpdateSubmissionField(submission.id, 'cityOfResidence', e.target.value);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="preferredProgram">التخصص المفضل</Label>
                                      <Input
                                        id="preferredProgram"
                                        value={submission.preferredProgram}
                                        onChange={(e) => {
                                          const updatedSubmissions = submissions.map(sub => 
                                            sub.id === submission.id 
                                              ? { ...sub, preferredProgram: e.target.value } 
                                              : sub
                                          );
                                          setSubmissions(updatedSubmissions);
                                        }}
                                        onBlur={(e) => {
                                          handleUpdateSubmissionField(submission.id, 'preferredProgram', e.target.value);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                      <td className="p-3">
                        {submission.agent ? (
                          <Badge className="bg-blue-100 text-blue-800">{submission.agent.name}</Badge>
                        ) : (
                          <Badge variant="outline">غير محدد</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge 
                          className={
                            submission.orderStage === "completed" ? "bg-green-100 text-green-800" :
                            submission.orderStage === "approved_by_admin" ? "bg-blue-100 text-blue-800" :
                            submission.orderStage === "sent_to_university" ? "bg-purple-100 text-purple-800" :
                            submission.orderStage === "accepted_by_university" ? "bg-green-100 text-green-800" :
                            submission.orderStage === "rejected_by_university" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {submissionStatuses.find(s => s.value === submission.orderStage)?.label || submission.orderStage}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-[#111827]">{submission.preferredProgram}</td>
                      <td className="p-3 text-sm text-[#111827]">{submission.contactNumber}</td>
                      <td className="p-3 text-sm text-[#111827]">{submission.email}</td>
                      <td className="p-3 text-sm font-medium text-[#111827]">{submission.fullName}</td>
                      <td className="p-3 text-sm text-[#111827]">{submission.nationality}</td>
                      <td className="p-3 text-sm text-[#111827]">{submission.countryOfResidence}</td>
                      <td className="p-3 text-sm text-[#111827]">{submission.cityOfResidence}</td>
                      <td className="p-3 text-sm font-medium text-[#111827]">#{submission.id}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      لا توجد نتائج
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                        fetchSubmissions(currentPage - 1, searchTerm, selectedAgent, selectedOrderStage)
                      }
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={e => {
                        e.preventDefault()
                        setCurrentPage(i + 1)
                        fetchSubmissions(i + 1, searchTerm, selectedAgent, selectedOrderStage)
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                        fetchSubmissions(currentPage + 1, searchTerm, selectedAgent, selectedOrderStage)
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={(open) => {
        setIsEmailDialogOpen(open)
        if (!open) resetEmailForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إرسال بريد إلكتروني للجامعة</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الطالب</Label>
                  <Input value={selectedSubmission.fullName} disabled />
                </div>
                <div>
                  <Label>بريد الطالب</Label>
                  <Input value={selectedSubmission.email} disabled />
                </div>
              </div>

              <div>
                <Label>بريد الجامعة (اختياري)</Label>
                <Input 
                  value={universityEmail} 
                  onChange={(e) => setUniversityEmail(e.target.value)} 
                  placeholder="university@example.edu"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  إذا تُرك فارغاً، سيتم استخدام بريد الجامعة المحفوظ في النظام
                </p>
              </div>

              <div>
                <Label>اختيار القالب</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قالب أو اكتب رسالة مخصصة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">رسالة مخصصة</SelectItem>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedTemplate && (
                <>
                  <div>
                    <Label>الموضوع</Label>
                    <Input 
                      value={emailSubject} 
                      onChange={(e) => setEmailSubject(e.target.value)} 
                      placeholder="موضوع البريد الإلكتروني"
                    />
                  </div>
                  <div>
                    <Label>الرسالة</Label>
                    <Textarea 
                      value={emailMessage} 
                      onChange={(e) => setEmailMessage(e.target.value)} 
                      placeholder="محتوى البريد الإلكتروني"
                      rows={8}
                    />
                  </div>
                </>
              )}

              {selectedTemplate && (
                <div className="space-y-3">
                  <div>
                    <Label>معاينة الموضوع</Label>
                    <div className="p-3 bg-muted rounded border">
                      {emailSubject}
                    </div>
                  </div>
                  <div>
                    <Label>معاينة الرسالة</Label>
                    <div className="p-3 bg-muted rounded border max-h-40 overflow-y-auto">
                      <div className="whitespace-pre-wrap text-sm">
                        {emailMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeAttachments"
                  checked={includeAttachments}
                  onChange={(e) => setIncludeAttachments(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="includeAttachments">إرفاق ملفات الطالب</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSendEmail}>
                  <Send className="w-4 h-4 mr-2" />
                  إرسال للجامعة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف الطلب للطالب "{submissionToDelete?.fullName}"؟ لا يمكن التراجع عن هذا الإجراء.
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
