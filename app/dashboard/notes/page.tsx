"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Types
type NoteTemplate = {
  id: number
  title: string
  content: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    sentNotes: number
  }
}

type SentNote = {
  id: number
  content: string
  recipientType: string
  priority: string
  sentAt: string
  recipientCount: number
  readCount: number
  unreadCount: number
  readPercentage: number
  sender: {
    id: number
    fullName: string
    email: string
  }
  template?: {
    id: number
    title: string
    category: string
  }
}

type User = {
  id: number
  fullName: string
  email: string
  role: string
}

const categories = [
  { value: 'general', label: 'عام' },
  { value: 'application', label: 'طلبات' },
  { value: 'payment', label: 'مدفوعات' },
  { value: 'urgent', label: 'عاجل' }
]

const priorities = [
  { value: 'low', label: 'منخفض' },
  { value: 'normal', label: 'عادي' },
  { value: 'high', label: 'عالي' },
  { value: 'urgent', label: 'عاجل' }
]

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState("templates")
  
  // Template state
  const [templates, setTemplates] = useState<NoteTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<NoteTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    title: '',
    content: '',
    category: 'general',
    isActive: true
  })

  // Sent notes state (all)
  const [sentNotes, setSentNotes] = useState<SentNote[]>([])
  const [sentNotesLoading, setSentNotesLoading] = useState(true)
  const [sentNotesPage, setSentNotesPage] = useState(1)
  const [sentNotesTotalPages, setSentNotesTotalPages] = useState(1)

  // Manual notes only state
  const [manualNotes, setManualNotes] = useState<SentNote[]>([])
  const [manualNotesLoading, setManualNotesLoading] = useState(true)
  const [manualNotesPage, setManualNotesPage] = useState(1)
  const [manualNotesTotalPages, setManualNotesTotalPages] = useState(1)
  const [manualNotesFilters, setManualNotesFilters] = useState({
    recipientType: 'all',
    priority: 'all',
    search: ''
  })

  // Recipients state
  type RecipientUser = {
    id: number
    fullName: string
    email: string
    role: string
    createdAt: string
    nationality: string | null
    contactNumber: string | null
    preferredProgram: string | null
    submissionStatus: string | null
    countryOfResidence: string | null
  }
  type Recipient = {
    user: RecipientUser
    totalNotes: number
    unreadNotes: number
    latestNoteAt: string
    recentNotes: { id: number; content: string; sentAt: string; priority: string; isRead: boolean }[]
  }
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [recipientsLoading, setRecipientsLoading] = useState(true)
  const [recipientsSearch, setRecipientsSearch] = useState('')
  const [recipientsRoleFilter, setRecipientsRoleFilter] = useState('all')
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)

  // Send note state
  const [sendNoteDialogOpen, setSendNoteDialogOpen] = useState(false)
  const [sendNoteForm, setSendNoteForm] = useState({
    templateId: '',
    customContent: '',
    recipientType: 'agents',
    selectedUsers: [] as number[],
    priority: 'normal',
    expiresAt: ''
  })
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Filters
  const [templateFilters, setTemplateFilters] = useState({
    category: 'all',
    isActive: 'all'
  })
  const [sentNotesFilters, setSentNotesFilters] = useState({
    recipientType: 'all',
    priority: 'all',
    search: ''
  })

  useEffect(() => {
    fetchTemplates()
  }, [templateFilters])

  useEffect(() => {
    fetchSentNotes()
  }, [sentNotesPage, sentNotesFilters])

  useEffect(() => {
    fetchManualNotes()
  }, [manualNotesPage, manualNotesFilters])

  useEffect(() => {
    fetchRecipients()
  }, [recipientsSearch, recipientsRoleFilter])

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const params = new URLSearchParams()
      if (templateFilters.category !== 'all') params.append('category', templateFilters.category)
      if (templateFilters.isActive !== 'all') params.append('isActive', templateFilters.isActive)
      
      const response = await fetch(`/api/admin/note-templates?${params}`)
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب القوالب",
        variant: "destructive",
      })
    } finally {
      setTemplatesLoading(false)
    }
  }

  const fetchSentNotes = async () => {
    try {
      setSentNotesLoading(true)
      const params = new URLSearchParams({
        page: sentNotesPage.toString(),
        limit: '10'
      })
      if (sentNotesFilters.recipientType !== 'all') params.append('recipientType', sentNotesFilters.recipientType)
      if (sentNotesFilters.priority !== 'all') params.append('priority', sentNotesFilters.priority)
      if (sentNotesFilters.search) params.append('search', sentNotesFilters.search)
      
      const response = await fetch(`/api/admin/sent-notes?${params}`)
      const data = await response.json()
      setSentNotes(data.sentNotes)
      setSentNotesTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching sent notes:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الملاحظات المرسلة",
        variant: "destructive",
      })
    } finally {
      setSentNotesLoading(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      setRecipientsLoading(true)
      const params = new URLSearchParams()
      if (recipientsRoleFilter !== 'all') params.append('role', recipientsRoleFilter)
      if (recipientsSearch) params.append('search', recipientsSearch)
      const response = await fetch(`/api/admin/sent-notes/recipients?${params}`)
      const data = await response.json()
      setRecipients(data.recipients || [])
    } catch (error) {
      console.error('Error fetching recipients:', error)
      toast({ title: "خطأ", description: "حدث خطأ أثناء جلب المستخدمين", variant: "destructive" })
    } finally {
      setRecipientsLoading(false)
    }
  }

  const fetchManualNotes = async () => {
    try {
      setManualNotesLoading(true)
      const params = new URLSearchParams({
        page: manualNotesPage.toString(),
        limit: '10',
        noteType: 'manual'
      })
      if (manualNotesFilters.recipientType !== 'all') params.append('recipientType', manualNotesFilters.recipientType)
      if (manualNotesFilters.priority !== 'all') params.append('priority', manualNotesFilters.priority)
      if (manualNotesFilters.search) params.append('search', manualNotesFilters.search)
      
      const response = await fetch(`/api/admin/sent-notes?${params}`)
      const data = await response.json()
      setManualNotes(data.sentNotes)
      setManualNotesTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching manual notes:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الملاحظات",
        variant: "destructive",
      })
    } finally {
      setManualNotesLoading(false)
    }
  }

  const fetchUsers = async (role: string) => {
    try {
      setUsersLoading(true)
      const response = await fetch(`/api/admin/users?role=${role}`)
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب المستخدمين",
        variant: "destructive",
      })
    } finally {
      setUsersLoading(false)
    }
  }

  const handleCreateTemplate = () => {
    setCurrentTemplate(null)
    setTemplateForm({
      title: '',
      content: '',
      category: 'general',
      isActive: true
    })
    setTemplateDialogOpen(true)
  }

  const handleEditTemplate = (template: NoteTemplate) => {
    setCurrentTemplate(template)
    setTemplateForm({
      title: template.title,
      content: template.content,
      category: template.category,
      isActive: template.isActive
    })
    setTemplateDialogOpen(true)
  }

  const handleSaveTemplate = async () => {
    try {
      const url = currentTemplate 
        ? `/api/admin/note-templates/${currentTemplate.id}`
        : '/api/admin/note-templates'
      
      const response = await fetch(url, {
        method: currentTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      toast({
        title: "نجاح",
        description: currentTemplate ? "تم تحديث القالب بنجاح" : "تم إنشاء القالب بنجاح",
      })

      setTemplateDialogOpen(false)
      fetchTemplates()
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ القالب",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return

    try {
      const response = await fetch(`/api/admin/note-templates/${templateId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      toast({
        title: "نجاح",
        description: "تم حذف القالب بنجاح",
      })

      fetchTemplates()
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف القالب",
        variant: "destructive",
      })
    }
  }

  const handleOpenSendNote = () => {
    setSendNoteForm({
      templateId: '',
      customContent: '',
      recipientType: 'agents',
      selectedUsers: [],
      priority: 'normal',
      expiresAt: ''
    })
    setSendNoteDialogOpen(true)
    fetchUsers('agent')
  }

  const handleRecipientTypeChange = (type: string) => {
    setSendNoteForm(prev => ({
      ...prev,
      recipientType: type,
      selectedUsers: []
    }))
    if (type === 'agents') {
      fetchUsers('agent')
    } else if (type === 'students') {
      fetchUsers('student')
    }
  }

  const handleSendNote = async () => {
    try {
      const payload: any = {
        recipientType: sendNoteForm.recipientType,
        recipientIds: sendNoteForm.selectedUsers,
        priority: sendNoteForm.priority
      }

      if (sendNoteForm.templateId && sendNoteForm.templateId !== 'custom') {
        payload.templateId = parseInt(sendNoteForm.templateId)
      } else {
        payload.customContent = sendNoteForm.customContent
      }

      if (sendNoteForm.expiresAt) {
        payload.expiresAt = sendNoteForm.expiresAt
      }

      const response = await fetch('/api/admin/sent-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      toast({
        title: "نجاح",
        description: "تم إرسال الملاحظة بنجاح",
      })

      setSendNoteDialogOpen(false)
      fetchSentNotes()
      fetchManualNotes()
      fetchRecipients()
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الملاحظة",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    const p = priorities.find(p => p.value === priority)
    return p ? p.label : priority
  }

  const getCategoryLabel = (category: string) => {
    const c = categories.find(c => c.value === category)
    return c ? c.label : category
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">إدارة الملاحظات</h1>
          <p className="text-[#4b5563] mt-1">إدارة قوالب الملاحظات وإرسال الملاحظات للوكلاء والطلاب</p>
        </div>
        <Button onClick={handleOpenSendNote} className="bg-[#111827] hover:bg-[#374151]">
          <Send className="w-4 h-4 ml-2" />
          إرسال ملاحظة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">إجمالي القوالب</p>
                <p className="text-2xl font-bold text-[#111827]">{templates.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">القوالب النشطة</p>
                <p className="text-2xl font-bold text-[#10b981]">
                  {templates.filter(t => t.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#10b981]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">الملاحظات المرسلة</p>
                <p className="text-2xl font-bold text-[#111827]">{sentNotes.length}</p>
              </div>
              <Send className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">معدل القراءة</p>
                <p className="text-2xl font-bold text-[#111827]">
                  {sentNotes.length > 0 
                    ? Math.round(sentNotes.reduce((acc, note) => acc + note.readPercentage, 0) / sentNotes.length)
                    : 0}%
                </p>
              </div>
              <Eye className="w-8 h-8 text-[#4b5563]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">قوالب الملاحظات</TabsTrigger>
          {/* hidden: <TabsTrigger value="sent">جميع الإشعارات</TabsTrigger> */}
          {/* hidden: <TabsTrigger value="notes">الملاحظات فقط</TabsTrigger> */}
          <TabsTrigger value="recipients">المستخدمون</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Template Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Select 
                  value={templateFilters.category} 
                  onValueChange={(value) => setTemplateFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={templateFilters.isActive} 
                  onValueChange={(value) => setTemplateFilters(prev => ({ ...prev, isActive: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="true">نشط</SelectItem>
                    <SelectItem value="false">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="w-4 h-4 ml-2" />
                  قالب جديد
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle>قوالب الملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#111827]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[#111827]">{template.title}</h3>
                            <Badge className={getCategoryLabel(template.category) === 'عاجل' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                              {getCategoryLabel(template.category)}
                            </Badge>
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#4b5563] mb-2 line-clamp-2">{template.content}</p>
                          <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                            <span>تم الاستخدام {template._count.sentNotes} مرة</span>
                            <span>تم الإنشاء في {new Date(template.createdAt).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد قوالب
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          {/* Sent Notes Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b5563] w-4 h-4" />
                  <Input
                    placeholder="البحث في الإشعارات..."
                    className="pr-10"
                    value={sentNotesFilters.search}
                    onChange={(e) => setSentNotesFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select 
                  value={sentNotesFilters.recipientType} 
                  onValueChange={(value) => setSentNotesFilters(prev => ({ ...prev, recipientType: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="المستقبلون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستقبلين</SelectItem>
                    <SelectItem value="agents">الوكلاء</SelectItem>
                    <SelectItem value="students">الطلاب</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={sentNotesFilters.priority} 
                  onValueChange={(value) => setSentNotesFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sent Notes List */}
          <Card>
            <CardHeader>
              <CardTitle>جميع الإشعارات المرسلة</CardTitle>
            </CardHeader>
            <CardContent>
              {sentNotesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#111827]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {note.template && (
                              <Badge className="bg-green-100 text-green-800">
                                {note.template.title}
                              </Badge>
                            )}
                            <Badge className={getPriorityColor(note.priority)}>
                              {getPriorityLabel(note.priority)}
                            </Badge>
                            <Badge variant="outline">
                              {note.recipientType === 'agents' ? 'الوكلاء' : 
                               note.recipientType === 'students' ? 'الطلاب' : 'الجميع'}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#4b5563] mb-3 line-clamp-2">{note.content}</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#6b7280]" />
                              <span>{note.recipientCount} مستقبل</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>{note.readCount} قرأ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              <span>{note.unreadCount} لم يقرأ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#6b7280]" />
                              <span>{new Date(note.sentAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#6b7280]">معدل القراءة:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${note.readPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">{note.readPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sentNotes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد إشعارات مرسلة
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {sentNotesTotalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSentNotesPage(p => Math.max(1, p - 1))}
                    disabled={sentNotesPage === 1}
                  >
                    السابق
                  </Button>
                  <span className="px-3 py-2 rounded bg-gray-100 text-gray-700">
                    صفحة {sentNotesPage} من {sentNotesTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSentNotesPage(p => Math.min(sentNotesTotalPages, p + 1))}
                    disabled={sentNotesPage === sentNotesTotalPages}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          {/* Manual Notes Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b5563] w-4 h-4" />
                  <Input
                    placeholder="البحث في الملاحظات..."
                    className="pr-10"
                    value={manualNotesFilters.search}
                    onChange={(e) => setManualNotesFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <Select 
                  value={manualNotesFilters.recipientType} 
                  onValueChange={(value) => setManualNotesFilters(prev => ({ ...prev, recipientType: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="المستقبلون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستقبلين</SelectItem>
                    <SelectItem value="agents">الوكلاء</SelectItem>
                    <SelectItem value="students">الطلاب</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={manualNotesFilters.priority} 
                  onValueChange={(value) => setManualNotesFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Manual Notes List */}
          <Card>
            <CardHeader>
              <CardTitle>الملاحظات المرسلة يدوياً</CardTitle>
            </CardHeader>
            <CardContent>
              {manualNotesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#111827]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {manualNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {note.template && (
                              <Badge className="bg-green-100 text-green-800">
                                {note.template.title}
                              </Badge>
                            )}
                            <Badge className={getPriorityColor(note.priority)}>
                              {getPriorityLabel(note.priority)}
                            </Badge>
                            <Badge variant="outline">
                              {note.recipientType === 'agents' ? 'الوكلاء' : 
                               note.recipientType === 'students' ? 'الطلاب' : 'الجميع'}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">ملاحظة يدوية</Badge>
                          </div>
                          <p className="text-sm text-[#4b5563] mb-3 line-clamp-2">{note.content}</p>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#6b7280]" />
                              <span>{note.recipientCount} مستقبل</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>{note.readCount} قرأ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              <span>{note.unreadCount} لم يقرأ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#6b7280]" />
                              <span>{new Date(note.sentAt).toLocaleDateString('ar-SA')}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#6b7280]">معدل القراءة:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${note.readPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">{note.readPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {manualNotes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد ملاحظات يدوية مرسلة
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {manualNotesTotalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManualNotesPage(p => Math.max(1, p - 1))}
                    disabled={manualNotesPage === 1}
                  >
                    السابق
                  </Button>
                  <span className="px-3 py-2 rounded bg-gray-100 text-gray-700">
                    صفحة {manualNotesPage} من {manualNotesTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManualNotesPage(p => Math.min(manualNotesTotalPages, p + 1))}
                    disabled={manualNotesPage === manualNotesTotalPages}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recipients" className="space-y-6">
          {/* Recipients Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4b5563] w-4 h-4" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    className="pr-10"
                    value={recipientsSearch}
                    onChange={(e) => setRecipientsSearch(e.target.value)}
                  />
                </div>
                <Select value={recipientsRoleFilter} onValueChange={setRecipientsRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="student">الطلاب</SelectItem>
                    <SelectItem value="agent">الوكلاء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recipients List */}
          <div className="grid grid-cols-1 gap-4">
            {recipientsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#111827]"></div>
              </div>
            ) : recipients.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  لا يوجد مستخدمون لديهم ملاحظات
                </CardContent>
              </Card>
            ) : (
              recipients.map((recipient) => (
                <Card
                  key={recipient.user.id}
                  className={`cursor-pointer transition-all border-2 ${selectedRecipient?.user.id === recipient.user.id ? 'border-[#111827]' : 'border-transparent hover:border-gray-300'}`}
                  onClick={() => setSelectedRecipient(selectedRecipient?.user.id === recipient.user.id ? null : recipient)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* User Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-[#111827] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {recipient.user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-[#111827] text-base">{recipient.user.fullName}</h3>
                            <Badge className={recipient.user.role === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                              {recipient.user.role === 'student' ? 'طالب' : 'وكيل'}
                            </Badge>
                            {recipient.unreadNotes > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                {recipient.unreadNotes} غير مقروء
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#6b7280] mb-2">{recipient.user.email}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-[#6b7280]">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {recipient.totalNotes} ملاحظة
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              آخر ملاحظة: {new Date(recipient.latestNoteAt).toLocaleDateString('ar-SA')}
                            </span>
                            {recipient.user.nationality && (
                              <span>الجنسية: {recipient.user.nationality}</span>
                            )}
                            {recipient.user.countryOfResidence && (
                              <span>بلد الإقامة: {recipient.user.countryOfResidence}</span>
                            )}
                            {recipient.user.contactNumber && (
                              <span>الهاتف: {recipient.user.contactNumber}</span>
                            )}
                          </div>
                          {recipient.user.preferredProgram && (
                            <p className="text-xs text-[#6b7280] mt-1">البرنامج المفضل: {recipient.user.preferredProgram}</p>
                          )}
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#111827]">{recipient.totalNotes}</p>
                          <p className="text-xs text-[#6b7280]">ملاحظة</p>
                        </div>
                        {recipient.unreadNotes > 0 ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            {recipient.unreadNotes} لم تُقرأ
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            مقروءة
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expanded: Recent Notes */}
                    {selectedRecipient?.user.id === recipient.user.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <h4 className="font-medium text-[#111827] text-sm">آخر الملاحظات المرسلة:</h4>
                        {recipient.recentNotes.length === 0 ? (
                          <p className="text-sm text-gray-500">لا توجد ملاحظات</p>
                        ) : (
                          recipient.recentNotes.map((note) => (
                            <div key={note.id} className={`rounded-lg p-3 text-sm border-r-4 ${note.isRead ? 'bg-gray-50 border-gray-300' : 'bg-orange-50 border-orange-400'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={getPriorityColor(note.priority)} style={{ fontSize: '10px', padding: '1px 6px' }}>
                                    {getPriorityLabel(note.priority)}
                                  </Badge>
                                  {!note.isRead && <Badge className="bg-orange-100 text-orange-700" style={{ fontSize: '10px', padding: '1px 6px' }}>لم تُقرأ</Badge>}
                                </div>
                                <span className="text-xs text-[#6b7280]">{new Date(note.sentAt).toLocaleDateString('ar-SA')}</span>
                              </div>
                              <p className="text-[#374151] line-clamp-2">{note.content}</p>
                            </div>
                          ))
                        )}
                        {/* Full user info section */}
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
                          <div><span className="font-medium text-[#374151]">الاسم: </span>{recipient.user.fullName}</div>
                          <div><span className="font-medium text-[#374151]">البريد: </span>{recipient.user.email}</div>
                          {recipient.user.nationality && <div><span className="font-medium text-[#374151]">الجنسية: </span>{recipient.user.nationality}</div>}
                          {recipient.user.contactNumber && <div><span className="font-medium text-[#374151]">الهاتف: </span>{recipient.user.contactNumber}</div>}
                          {recipient.user.countryOfResidence && <div><span className="font-medium text-[#374151]">بلد الإقامة: </span>{recipient.user.countryOfResidence}</div>}
                          {recipient.user.preferredProgram && <div className="col-span-2"><span className="font-medium text-[#374151]">البرنامج المفضل: </span>{recipient.user.preferredProgram}</div>}
                          {recipient.user.submissionStatus && <div className="col-span-2"><span className="font-medium text-[#374151]">حالة الطلب: </span>{recipient.user.submissionStatus}</div>}
                          <div><span className="font-medium text-[#374151]">تاريخ التسجيل: </span>{new Date(recipient.user.createdAt).toLocaleDateString('ar-SA')}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentTemplate ? 'تعديل قالب' : 'قالب جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={templateForm.title}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="عنوان القالب"
              />
            </div>
            <div>
              <Label htmlFor="category">الفئة</Label>
              <Select 
                value={templateForm.category} 
                onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">المحتوى</Label>
              <Textarea
                id="content"
                value={templateForm.content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="محتوى الملاحظة..."
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={templateForm.isActive}
                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isActive: !!checked }))}
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveTemplate}>
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Note Dialog */}
      <Dialog open={sendNoteDialogOpen} onOpenChange={setSendNoteDialogOpen}>
        <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إرسال ملاحظة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع المستقبلين</Label>
                <Select 
                  value={sendNoteForm.recipientType} 
                  onValueChange={handleRecipientTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agents">الوكلاء</SelectItem>
                    <SelectItem value="students">الطلاب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الأولوية</Label>
                <Select 
                  value={sendNoteForm.priority} 
                  onValueChange={(value) => setSendNoteForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>اختيار قالب (اختياري)</Label>
              <Select 
                value={sendNoteForm.templateId} 
                onValueChange={(value) => setSendNoteForm(prev => ({ ...prev, templateId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر قالب أو اكتب ملاحظة مخصصة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">ملاحظة مخصصة</SelectItem>
                  {templates.filter(t => t.isActive).map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(!sendNoteForm.templateId || sendNoteForm.templateId === 'custom') && (
              <div>
                <Label htmlFor="customContent">محتوى الملاحظة</Label>
                <Textarea
                  id="customContent"
                  value={sendNoteForm.customContent}
                  onChange={(e) => setSendNoteForm(prev => ({ ...prev, customContent: e.target.value }))}
                  placeholder="اكتب محتوى الملاحظة..."
                  rows={4}
                />
              </div>
            )}

            <div>
              <Label>المستقبلون</Label>
              {usersLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#111827]"></div>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={sendNoteForm.selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSendNoteForm(prev => ({
                              ...prev,
                              selectedUsers: [...prev.selectedUsers, user.id]
                            }))
                          } else {
                            setSendNoteForm(prev => ({
                              ...prev,
                              selectedUsers: prev.selectedUsers.filter(id => id !== user.id)
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`user-${user.id}`} className="text-sm">
                        {user.fullName} ({user.email})
                      </Label>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-gray-500">لا توجد مستخدمين</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="expiresAt">تاريخ انتهاء الصلاحية (اختياري)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={sendNoteForm.expiresAt}
                onChange={(e) => setSendNoteForm(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSendNoteDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleSendNote}
                disabled={
                  sendNoteForm.selectedUsers.length === 0 || 
                  ((!sendNoteForm.templateId || sendNoteForm.templateId === 'custom') && !sendNoteForm.customContent)
                }
              >
                <Send className="w-4 h-4 ml-2" />
                إرسال
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
