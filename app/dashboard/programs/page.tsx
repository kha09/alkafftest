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
import { MultiSelect, Option } from '@/components/ui/multi-select'
import { Globe, Plus, Copy } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProgramsManagement() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null)
  
  // Bulk creation states
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([])
  const [selectedUniversityIds, setSelectedUniversityIds] = useState<string[]>([])
  const [bulkCreationMode, setBulkCreationMode] = useState(false)
  const [isBulkSaving, setIsBulkSaving] = useState(false)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all')
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('all')

  // Get unique departments and universities for filter dropdowns
  const departmentOptions = departments.map(d => ({ id: d.id, name: d.name, universityName: d.university?.name || '' }))
  const universityOptions = Array.from(
    new Map(
      departments
        .filter(d => d.university?.id && d.university?.name)
        .map(d => [d.university!.id, { id: d.university!.id, name: d.university!.name! }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  // Filtered programs based on search and filters
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = searchQuery === '' || 
      program.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartmentId === 'all' || 
      program.department?.id.toString() === selectedDepartmentId
    const matchesUniversity = selectedUniversityId === 'all' || 
      program.department?.university?.id.toString() === selectedUniversityId
    return matchesSearch && matchesDepartment && matchesUniversity
  })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDepartmentId('all')
    setSelectedUniversityId('all')
  }

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

  const handleBulkSave = async () => {
    if (!currentProgram || selectedDepartmentIds.length === 0) return
    
    try {
      setIsBulkSaving(true)
      
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
      
      const response = await fetch(`/api/programs/bulk?language=${selectedLanguage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programData: {
            name: currentProgram.name,
            description: currentProgram.description,
            tuitionFees: currentProgram.tuitionFees,
            duration: currentProgram.duration,
            intakeMonths: currentProgram.intakeMonths,
            qualification: currentProgram.qualification,
            englishRequirement: currentProgram.englishRequirement,
            offerLetter: currentProgram.offerLetter,
            classType: currentProgram.classType,
            yearlyTuitionFees: currentProgram.yearlyTuitionFees,
            otherFees: currentProgram.otherFees,
          },
          departmentIds: selectedDepartmentIds.map(id => parseInt(id))
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create programs')
      }
      
      // Close dialog and refresh the list
      setIsDialogOpen(false)
      setSelectedDepartmentIds([])
      setSelectedUniversityIds([])
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsBulkSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading programs...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="p-6" dir="rtl">
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

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search" className="mb-2 block">البحث بالاسم</Label>
              <Input
                id="search"
                placeholder="ابحث عن برنامج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="university-filter" className="mb-2 block">تصفية حسب الجامعة</Label>
              <Select value={selectedUniversityId} onValueChange={setSelectedUniversityId}>
                <SelectTrigger id="university-filter">
                  <SelectValue placeholder="اختر جامعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الجامعات</SelectItem>
                  {universityOptions.map((university) => (
                    <SelectItem key={university.id} value={university.id.toString()}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="department-filter" className="mb-2 block">تصفية حسب القسم</Label>
              <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                <SelectTrigger id="department-filter">
                  <SelectValue placeholder="اختر قسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  {departmentOptions.map((department) => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name} ({department.universityName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchQuery !== '' || selectedDepartmentId !== 'all' || selectedUniversityId !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            )}
          </div>
          {(searchQuery !== '' || selectedDepartmentId !== 'all' || selectedUniversityId !== 'all') && (
            <p className="text-sm text-muted-foreground mt-3">
              عرض {filteredPrograms.length} من {programs.length} برنامج
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة البرامج</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {programs.length === 0 ? 'لا توجد برامج متاحة' : 'لا توجد نتائج تطابق البحث'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>الرسوم الدراسية</TableHead>
                  <TableHead>رسالة القبول</TableHead>
                  <TableHead className="text-end">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.name}</TableCell>
                    <TableCell>{program.department?.name}</TableCell>
                    <TableCell>{program.duration}</TableCell>
                    <TableCell>{program.tuitionFees}</TableCell>
                    <TableCell>{program.offerLetter ? 'نعم' : 'لا'}</TableCell>
                    <TableCell className="text-end">
                      <Button variant="outline" size="sm" className="ml-2 rtl:ml-0 rtl:mr-2" onClick={() => handleEdit(program)}>
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
          )}
        </CardContent>
      </Card>


      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentProgram?.id ? 'تعديل البرنامج' : 'إضافة برنامج جديد'}
            </DialogTitle>
          </DialogHeader>
          {currentProgram && (
            <Tabs defaultValue={currentProgram.id ? "single" : "single"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">برنامج واحد</TabsTrigger>
                <TabsTrigger value="bulk" disabled={!!currentProgram.id}>إضافة متعددة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="name"
                      value={currentProgram.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="name" className="text-end">
                      الاسم
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Textarea
                      id="description"
                      value={currentProgram.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="description" className="text-end">
                      الوصف
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
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
                    <Label htmlFor="department" className="text-end">
                      القسم
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="tuitionFees"
                      value={currentProgram.tuitionFees}
                      onChange={(e) => handleInputChange('tuitionFees', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="tuitionFees" className="text-end">
                      الرسوم الدراسية
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="duration"
                      value={currentProgram.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="duration" className="text-end">
                      المدة
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="intakeMonths"
                      value={currentProgram.intakeMonths}
                      onChange={(e) => handleInputChange('intakeMonths', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="intakeMonths" className="text-end">
                      أشهر القبول
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="qualification"
                      value={currentProgram.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="qualification" className="text-end">
                      المؤهل المطلوب
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="englishRequirement"
                      value={currentProgram.englishRequirement}
                      onChange={(e) => handleInputChange('englishRequirement', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="englishRequirement" className="text-end">
                      متطلبات اللغة الإنجليزية
                    </Label>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="classType"
                      value={currentProgram.classType}
                      onChange={(e) => handleInputChange('classType', e.target.value)}
                      className="col-span-3"
                    />
                    <Label htmlFor="classType" className="text-end">
                      نوع الدراسة
                    </Label>
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
                    <div className="col-span-3">
                      <Switch
                        id="offerLetter"
                        checked={currentProgram.offerLetter}
                        onCheckedChange={(checked) => handleInputChange('offerLetter', checked)}
                      />
                    </div>
                    <Label htmlFor="offerLetter" className="text-end">
                      رسالة قبول
                    </Label>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSave}>
                      {currentProgram.id ? 'تحديث' : 'إنشاء'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-6">
                <div className="grid gap-6 py-4">
                  {/* Program Details Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">تفاصيل البرنامج</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="bulk-name"
                            value={currentProgram.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="col-span-3"
                          />
                          <Label htmlFor="bulk-name" className="text-end">الاسم</Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="bulk-duration"
                            value={currentProgram.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                            className="col-span-3"
                          />
                          <Label htmlFor="bulk-duration" className="text-end">المدة</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Textarea
                          id="bulk-description"
                          value={currentProgram.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="col-span-3"
                        />
                        <Label htmlFor="bulk-description" className="text-end">الوصف</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="bulk-tuitionFees"
                            value={currentProgram.tuitionFees}
                            onChange={(e) => handleInputChange('tuitionFees', e.target.value)}
                            className="col-span-3"
                          />
                          <Label htmlFor="bulk-tuitionFees" className="text-end">الرسوم الدراسية</Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="bulk-intakeMonths"
                            value={currentProgram.intakeMonths}
                            onChange={(e) => handleInputChange('intakeMonths', e.target.value)}
                            className="col-span-3"
                          />
                          <Label htmlFor="bulk-intakeMonths" className="text-end">أشهر القبول</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="bulk-qualification"
                            value={currentProgram.qualification}
                            onChange={(e) => handleInputChange('qualification', e.target.value)}
                            className="col-span-3"
                          />
                          <Label htmlFor="bulk-qualification" className="text-end">المؤهل المطلوب</Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="bulk-englishRequirement"
                            value={currentProgram.englishRequirement}
                            onChange={(e) => handleInputChange('englishRequirement', e.target.value)}
                            className="col-span-3"
                          />
                          <Label htmlFor="bulk-englishRequirement" className="text-end">متطلبات اللغة الإنجليزية</Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Input
                            id="bulk-classType"
                            value={currentProgram.classType}
                            onChange={(e) => handleInputChange('classType', e.target.value)}
                            className="col-span-3"
                          />
                          <Label htmlFor="bulk-classType" className="text-end">نوع الدراسة</Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <div className="col-span-3">
                            <Switch
                              id="bulk-offerLetter"
                              checked={currentProgram.offerLetter}
                              onCheckedChange={(checked) => handleInputChange('offerLetter', checked)}
                            />
                          </div>
                          <Label htmlFor="bulk-offerLetter" className="text-end">رسالة قبول</Label>
                        </div>
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
                    </CardContent>
                  </Card>

                  {/* Selection Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">اختيار الجامعات والأقسام</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>الجامعات</Label>
                        <MultiSelect
                          options={universityOptions.map(u => ({ value: u.id.toString(), label: u.name }))}
                          selected={selectedUniversityIds}
                          onChange={setSelectedUniversityIds}
                          placeholder="اختر الجامعات..."
                        />
                      </div>
                      <div>
                        <Label>الأقسام</Label>
                        <MultiSelect
                          options={departments
                            .filter(d => selectedUniversityIds.length === 0 || selectedUniversityIds.includes(d.university?.id.toString() || ''))
                            .map(d => ({ 
                              value: d.id.toString(), 
                              label: `${d.name} (${d.university?.name})` 
                            }))}
                          selected={selectedDepartmentIds}
                          onChange={setSelectedDepartmentIds}
                          placeholder="اختر الأقسام..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview Section */}
                  {selectedDepartmentIds.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          معاينة البرامج المراد إنشاؤها ({selectedDepartmentIds.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-60 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>اسم البرنامج</TableHead>
                                <TableHead>القسم</TableHead>
                                <TableHead>الجامعة</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedDepartmentIds.map(deptId => {
                                const department = departments.find(d => d.id.toString() === deptId)
                                return (
                                  <TableRow key={deptId}>
                                    <TableCell>{currentProgram.name || 'اسم البرنامج'}</TableCell>
                                    <TableCell>{department?.name}</TableCell>
                                    <TableCell>{department?.university?.name}</TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedDepartmentIds([])
                        setSelectedUniversityIds([])
                      }}
                    >
                      مسح التحديد
                    </Button>
                    <Button 
                      onClick={handleBulkSave}
                      disabled={selectedDepartmentIds.length === 0 || isBulkSaving}
                    >
                      {isBulkSaving ? 'جاري الحفظ...' : `إنشاء ${selectedDepartmentIds.length} برنامج`}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
