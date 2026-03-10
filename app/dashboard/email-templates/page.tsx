'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, Mail, Eye, FileText, Send, Filter, AlignRight, AlignLeft, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

interface EmailTemplate {
  id: number
  name: string
  subject: string
  body: string
  templateType: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    sentEmails: number
  }
}

type TextDirection = 'auto' | 'rtl' | 'ltr'

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    templateType: 'standard',
    description: '',
    isActive: true
  })
  const [bodyDirection, setBodyDirection] = useState<TextDirection>('auto')
  const [editBodyDirection, setEditBodyDirection] = useState<TextDirection>('auto')
  const createBodyRef = useRef<HTMLTextAreaElement>(null)
  const editBodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      } else {
        toast.error('Failed to fetch email templates')
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Error fetching email templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('تم إنشاء القالب بنجاح')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في إنشاء القالب')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('حدث خطأ أثناء إنشاء القالب')
    }
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return

    try {
      const response = await fetch(`/api/admin/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('تم تحديث القالب بنجاح')
        setIsEditDialogOpen(false)
        resetForm()
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في تحديث القالب')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('حدث خطأ أثناء تحديث القالب')
    }
  }

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return

    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('تم حذف القالب بنجاح')
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في حذف القالب')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('حدث خطأ أثناء حذف القالب')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      templateType: 'standard',
      description: '',
      isActive: true
    })
    setSelectedTemplate(null)
    setBodyDirection('auto')
    setEditBodyDirection('auto')
  }

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      templateType: template.templateType,
      description: template.description || '',
      isActive: template.isActive
    })
    setEditBodyDirection('auto')
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsViewDialogOpen(true)
  }

  // Detect text direction based on first strong character
  const detectDirection = (text: string): 'rtl' | 'ltr' => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/
    const ltrRegex = /[A-Za-z]/
    
    for (let i = 0; i < text.length; i++) {
      if (rtlRegex.test(text[i])) return 'rtl'
      if (ltrRegex.test(text[i])) return 'ltr'
    }
    return 'ltr' // default
  }

  const getEffectiveDirection = (text: string, directionSetting: TextDirection): 'rtl' | 'ltr' => {
    if (directionSetting === 'auto') {
      return detectDirection(text)
    }
    return directionSetting
  }

  const insertVariableAtCursor = (variable: string, textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = textarea.value
    const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end)
    
    // Update form data
    setFormData({ ...formData, body: newValue })
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + variable.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const templateVariables = [
    '{{fullName}}', '{{email}}', '{{nationality}}', '{{countryOfResidence}}',
    '{{contactNumber}}', '{{cityOfResidence}}', '{{preferredProgram}}',
    '{{universityName}}', '{{submissionDate}}'
  ]

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">قوالب البريد الإلكتروني</h1>
            <p className="text-[#4b5563] mt-1">إدارة قوالب البريد الإلكتروني للجامعات</p>
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
          <h1 className="text-3xl font-bold text-[#111827]">قوالب البريد الإلكتروني</h1>
          <p className="text-[#4b5563] mt-1">إدارة قوالب البريد الإلكتروني للجامعات</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة قالب جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء قالب بريد إلكتروني جديد</DialogTitle>
                <DialogDescription>
                  أنشئ قالب بريد إلكتروني جديد لإرسال الطلبات للجامعات
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">اسم القالب</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateType">نوع القالب</Label>
                    <Select value={formData.templateType} onValueChange={(value) => setFormData({ ...formData, templateType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">قياسي</SelectItem>
                        <SelectItem value="formal">رسمي</SelectItem>
                        <SelectItem value="urgent">عاجل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">موضوع البريد الإلكتروني</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="مثال: Student Application - {{fullName}}"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف مختصر للقالب"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="body">محتوى البريد الإلكتروني</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Wand2 className="w-3 h-3" />
                        {bodyDirection === 'auto' ? `تلقائي → ${getEffectiveDirection(formData.body, bodyDirection) === 'rtl' ? 'RTL' : 'LTR'}` : bodyDirection.toUpperCase()}
                      </span>
                      <div className="flex gap-1 border rounded-md p-1">
                        <Button
                          type="button"
                          variant={bodyDirection === 'auto' ? 'default' : 'ghost'}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setBodyDirection('auto')}
                        >
                          تلقائي
                        </Button>
                        <Button
                          type="button"
                          variant={bodyDirection === 'rtl' ? 'default' : 'ghost'}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setBodyDirection('rtl')}
                        >
                          <AlignRight className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant={bodyDirection === 'ltr' ? 'default' : 'ghost'}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setBodyDirection('ltr')}
                        >
                          <AlignLeft className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    ref={createBodyRef}
                    id="body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={10}
                    placeholder="اكتب محتوى البريد الإلكتروني هنا..."
                    required
                    dir={getEffectiveDirection(formData.body, bodyDirection)}
                    className={getEffectiveDirection(formData.body, bodyDirection) === 'rtl' ? 'text-right' : 'text-left'}
                  />
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">المتغيرات المتاحة:</p>
                    <div className="flex flex-wrap gap-1">
                      {templateVariables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="secondary"
                          className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => insertVariableAtCursor(variable, createBodyRef)}
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {formData.body && (
                    <div className="mt-3 p-3 bg-muted rounded-md border">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">معاينة:</p>
                      <div 
                        className="text-sm whitespace-pre-wrap"
                        dir={getEffectiveDirection(formData.body, bodyDirection)}
                        style={{ textAlign: getEffectiveDirection(formData.body, bodyDirection) === 'rtl' ? 'right' : 'left' }}
                      >
                        {formData.body}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">تفعيل القالب</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">إنشاء القالب</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
              <Mail className="w-8 h-8 text-[#4b5563]" />
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
              <FileText className="w-8 h-8 text-[#10b981]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">إجمالي الإرسالات</p>
                <p className="text-2xl font-bold text-[#f59e0b]">
                  {templates.reduce((sum, t) => sum + (t._count?.sentEmails || 0), 0)}
                </p>
              </div>
              <Send className="w-8 h-8 text-[#f59e0b]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4b5563]">القوالب غير النشطة</p>
                <p className="text-2xl font-bold text-[#ef4444]">
                  {templates.filter(t => !t.isActive).length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-[#ef4444]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>قوالب البريد الإلكتروني</CardTitle>
          <CardDescription>
            إدارة وتحرير قوالب البريد الإلكتروني المستخدمة لإرسال طلبات الطلاب للجامعات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم القالب</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الموضوع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">عدد الإرسالات</TableHead>
                  <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-[#f9fafb]">
                    <TableCell className="font-medium text-[#111827]">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {template.templateType === 'standard' ? 'قياسي' : 
                         template.templateType === 'formal' ? 'رسمي' : 
                         template.templateType === 'urgent' ? 'عاجل' : template.templateType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-[#4b5563]">{template.subject}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={template.isActive ? "default" : "secondary"}
                        className={template.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {template.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#4b5563]">{template._count?.sentEmails || 0}</TableCell>
                    <TableCell className="text-[#4b5563]">
                      {new Date(template.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      لا توجد قوالب بريد إلكتروني
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Template Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>عرض قالب البريد الإلكتروني</DialogTitle>
            <DialogDescription>
              تفاصيل قالب البريد الإلكتروني
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم القالب</Label>
                  <div className="p-2 bg-muted rounded">{selectedTemplate.name}</div>
                </div>
                <div>
                  <Label>نوع القالب</Label>
                  <div className="p-2 bg-muted rounded">
                    <Badge variant="outline">
                      {selectedTemplate.templateType === 'standard' ? 'قياسي' : 
                       selectedTemplate.templateType === 'formal' ? 'رسمي' : 
                       selectedTemplate.templateType === 'urgent' ? 'عاجل' : selectedTemplate.templateType}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>موضوع البريد الإلكتروني</Label>
                <div className="p-2 bg-muted rounded">{selectedTemplate.subject}</div>
              </div>

              {selectedTemplate.description && (
                <div>
                  <Label>الوصف</Label>
                  <div className="p-2 bg-muted rounded">{selectedTemplate.description}</div>
                </div>
              )}

              <div>
                <Label>محتوى البريد الإلكتروني</Label>
                <div className="p-4 bg-muted rounded border max-h-64 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm">{selectedTemplate.body}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الحالة</Label>
                  <div className="p-2">
                    <Badge variant={selectedTemplate.isActive ? "default" : "secondary"}>
                      {selectedTemplate.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>عدد الإرسالات</Label>
                  <div className="p-2 bg-muted rounded">{selectedTemplate._count?.sentEmails || 0}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تحرير قالب البريد الإلكتروني</DialogTitle>
            <DialogDescription>
              تحرير قالب البريد الإلكتروني المحدد
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTemplate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">اسم القالب</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-templateType">نوع القالب</Label>
                <Select value={formData.templateType} onValueChange={(value) => setFormData({ ...formData, templateType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">قياسي</SelectItem>
                    <SelectItem value="formal">رسمي</SelectItem>
                    <SelectItem value="urgent">عاجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-subject">موضوع البريد الإلكتروني</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">الوصف (اختياري)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="edit-body">محتوى البريد الإلكتروني</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    {editBodyDirection === 'auto' ? `تلقائي → ${getEffectiveDirection(formData.body, editBodyDirection) === 'rtl' ? 'RTL' : 'LTR'}` : editBodyDirection.toUpperCase()}
                  </span>
                  <div className="flex gap-1 border rounded-md p-1">
                    <Button
                      type="button"
                      variant={editBodyDirection === 'auto' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setEditBodyDirection('auto')}
                    >
                      تلقائي
                    </Button>
                    <Button
                      type="button"
                      variant={editBodyDirection === 'rtl' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setEditBodyDirection('rtl')}
                    >
                      <AlignRight className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant={editBodyDirection === 'ltr' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setEditBodyDirection('ltr')}
                    >
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Textarea
                ref={editBodyRef}
                id="edit-body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={10}
                required
                dir={getEffectiveDirection(formData.body, editBodyDirection)}
                className={getEffectiveDirection(formData.body, editBodyDirection) === 'rtl' ? 'text-right' : 'text-left'}
              />
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">المتغيرات المتاحة:</p>
                <div className="flex flex-wrap gap-1">
                  {templateVariables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => insertVariableAtCursor(variable, editBodyRef)}
                    >
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
              {formData.body && (
                <div className="mt-3 p-3 bg-muted rounded-md border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">معاينة:</p>
                  <div 
                    className="text-sm whitespace-pre-wrap"
                    dir={getEffectiveDirection(formData.body, editBodyDirection)}
                    style={{ textAlign: getEffectiveDirection(formData.body, editBodyDirection) === 'rtl' ? 'right' : 'left' }}
                  >
                    {formData.body}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">تفعيل القالب</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">حفظ التغييرات</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
