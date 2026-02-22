'use client'

import { useState, useEffect } from 'react'
import { Program, Department } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { JsonEditor } from '@/components/ui/json-editor'
import { Badge } from '@/components/ui/badge'
import { Globe } from 'lucide-react'

export default function ProgramsManagement() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null)

  useEffect(() => {
    fetchData()
  }, [selectedLanguage])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [programsRes, departmentsRes] = await Promise.all([
        fetch(`/api/programs?language=${selectedLanguage}`),
        fetch(`/api/departments?language=${selectedLanguage}`)
      ])

      if (!programsRes.ok || !departmentsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const programsData = await programsRes.json()
      const departmentsData = await departmentsRes.json()

      setPrograms(programsData)
      setDepartments(departmentsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setCurrentProgram({
      id: 0,
      name: '',
      description: '',
      tuitionFees: '',
      duration: '',
      intakeMonths: '',
      qualification: "Bachelor's Degree",
      englishRequirement: 'IELTS 5.5',
      offerLetter: true,
      classType: 'Physical',
      yearlyTuitionFees: '',
      otherFees: '',
      department: undefined
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (program: Program) => {
    setCurrentProgram(program)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this program?')) return
    
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete program')
      
      // Refresh the list
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleSave = async () => {
    if (!currentProgram) return
    
    try {
      // Validate JSON format for yearlyTuitionFees
      if (currentProgram.yearlyTuitionFees) {
        try {
          JSON.parse(currentProgram.yearlyTuitionFees)
        } catch (e) {
          throw new Error('تنسيق JSON غير صحيح في حقل "الرسوم السنوية"')
        }
      }
      
      // Validate JSON format for otherFees
      if (currentProgram.otherFees) {
        try {
          JSON.parse(currentProgram.otherFees)
        } catch (e) {
          throw new Error('تنسيق JSON غير صحيح في حقل "رسوم أخرى"')
        }
      }
      
      const method = currentProgram.id ? 'PUT' : 'POST'
      const url = currentProgram.id ? `/api/programs/${currentProgram.id}?language=${selectedLanguage}` : `/api/programs?language=${selectedLanguage}`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentProgram),
      })
      
      if (!response.ok) throw new Error(`Failed to ${currentProgram.id ? 'update' : 'create'} program`)
      
      // Close dialog and refresh the list
      setIsDialogOpen(false)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleInputChange = (field: keyof Program, value: string | boolean | Department) => {
    if (currentProgram) {
      setCurrentProgram({
        ...currentProgram,
        [field]: value
      })
    }
  }

  if (loading) return <div className="p-6">Loading programs...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة البرامج</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وتحرير البرامج الأكاديمية في الجامعات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={(value: 'ar' | 'en') => setSelectedLanguage(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="text-xs">
            {programs.length} برنامج
          </Badge>
          <Button onClick={handleCreate}>إضافة برنامج جديد</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة البرامج</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>المدة</TableHead>
                <TableHead>الرسوم الدراسية</TableHead>
                <TableHead>رسالة القبول</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.department?.name}</TableCell>
                  <TableCell>{program.duration}</TableCell>
                  <TableCell>{program.tuitionFees}</TableCell>
                  <TableCell>{program.offerLetter ? 'نعم' : 'لا'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => handleEdit(program)}>
                      تعديل
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(program.id)}>
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl" className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProgram?.id ? 'تعديل البرنامج' : 'إضافة برنامج جديد'}
            </DialogTitle>
          </DialogHeader>
          {currentProgram && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  الاسم
                </Label>
                <Input
                  id="name"
                  value={currentProgram.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  الوصف
                </Label>
                <Textarea
                  id="description"
                  value={currentProgram.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  القسم
                </Label>
                <Select
                  value={currentProgram.department?.id.toString() || ''}
                  onValueChange={(value) => {
                    const department = departments.find(d => d.id === parseInt(value))
                    if (department) {
                      handleInputChange('department', department)
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="اختر قسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name} ({department.university?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tuitionFees" className="text-right">
                  الرسوم الدراسية
                </Label>
                <Input
                  id="tuitionFees"
                  value={currentProgram.tuitionFees}
                  onChange={(e) => handleInputChange('tuitionFees', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  المدة
                </Label>
                <Input
                  id="duration"
                  value={currentProgram.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="intakeMonths" className="text-right">
                  أشهر القبول
                </Label>
                <Input
                  id="intakeMonths"
                  value={currentProgram.intakeMonths}
                  onChange={(e) => handleInputChange('intakeMonths', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qualification" className="text-right">
                  المؤهل المطلوب
                </Label>
                <Input
                  id="qualification"
                  value={currentProgram.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="englishRequirement" className="text-right">
                  متطلبات اللغة الإنجليزية
                </Label>
                <Input
                  id="englishRequirement"
                  value={currentProgram.englishRequirement}
                  onChange={(e) => handleInputChange('englishRequirement', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="classType" className="text-right">
                  نوع الدراسة
                </Label>
                <Input
                  id="classType"
                  value={currentProgram.classType}
                  onChange={(e) => handleInputChange('classType', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <JsonEditor
                label="الرسوم السنوية"
                value={currentProgram.yearlyTuitionFees}
                onChange={(value) => handleInputChange('yearlyTuitionFees', value)}
                placeholder='[{"year": "1st Year", "fee": "USD 5,764"}, {"year": "2nd Year", "fee": "USD 5,764"}]'
                requiredFields={['year', 'fee']}
              />
              <JsonEditor
                label="رسوم أخرى"
                value={currentProgram.otherFees}
                onChange={(value) => handleInputChange('otherFees', value)}
                placeholder='[{"description": "International Processing Fee", "fee": "USD 627"}]'
                requiredFields={['description', 'fee']}
              />
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="offerLetter" className="text-right">
                  رسالة قبول
                </Label>
                <div className="col-span-3">
                  <Switch
                    id="offerLetter"
                    checked={currentProgram.offerLetter}
                    onCheckedChange={(checked) => handleInputChange('offerLetter', checked)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  {currentProgram.id ? 'تحديث' : 'إنشاء'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
