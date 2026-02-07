'use client'

import { useState, useEffect } from 'react'
import { University } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CountrySelect } from '@/components/ui/country-select'
import { ColorPicker } from '@/components/ui/color-picker'
import { EnhancedFileUpload } from '@/components/ui/enhanced-file-upload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Globe, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Extended interface for university data that includes File objects
interface UniversityFormData extends Omit<University, 'logo'> {
  logo: string | File;
}

export default function UniversitiesManagement() {
  const [universities, setUniversities] = useState<University[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentUniversity, setCurrentUniversity] = useState<UniversityFormData | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUniversities()
  }, [selectedLanguage])

  const fetchUniversities = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/universities?language=${selectedLanguage}`)
      if (!response.ok) throw new Error('Failed to fetch universities')
      const data = await response.json()
      setUniversities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    const newUniversity: UniversityFormData = {
      id: 0,
      name: '',
      country: '',
      logo: '',
      ranking: '',
      students: '',
      programs: '',
      acceptance: '',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      flag: '',
      freeOfferLetter: false
    };
    setCurrentUniversity(newUniversity)
    setIsDialogOpen(true)
  }

  const handleEdit = (university: University) => {
    // Convert University to UniversityFormData
    const universityFormData: UniversityFormData = {
      ...university,
      logo: university.logo
    };
    setCurrentUniversity(universityFormData)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this university?')) return
    
    try {
      const response = await fetch(`/api/universities/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete university')
      
      // Refresh the list
      fetchUniversities()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  const handleSave = async () => {
    if (!currentUniversity) return
    
    try {
      const method = currentUniversity.id ? 'PUT' : 'POST'
      const url = currentUniversity.id ? `/api/universities/${currentUniversity.id}?language=${selectedLanguage}` : `/api/universities?language=${selectedLanguage}`
      
      // Create FormData object
      const formData = new FormData()
      
      // Create a copy of the university data without the logo file
      const { logo, ...universityData } = currentUniversity;
      
      // Append university data as JSON
      formData.append('university', JSON.stringify(universityData))
      
      // Append logo file if it's a File object
      if (logo instanceof File) {
        formData.append('logo', logo)
      }
      
      const response = await fetch(url, {
        method,
        body: formData,
      })
      
      if (!response.ok) throw new Error(`Failed to ${currentUniversity.id ? 'update' : 'create'} university`)
      
      // Close dialog and refresh the list
      setIsDialogOpen(false)
      fetchUniversities()
      
      toast({
        title: "تم الحفظ بنجاح",
        description: `تم ${currentUniversity.id ? 'تحديث' : 'إضافة'} الجامعة بنجاح`,
        duration: 3000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast({
        title: "خطأ في الحفظ",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleInputChange = (field: keyof University, value: string | boolean | File) => {
    if (currentUniversity) {
      setCurrentUniversity({
        ...currentUniversity,
        [field]: value
      })
    }
  }

  const handleCountryChange = (countryData: { country: string; flag: string }) => {
    if (currentUniversity) {
      setCurrentUniversity({
        ...currentUniversity,
        country: countryData.country,
        flag: countryData.flag
      })
    }
  }

  if (loading) return <div className="p-6">Loading universities...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة الجامعات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وتحرير معلومات الجامعات المتاحة في المنصة
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
            {universities.length} جامعة
          </Badge>
          <Button onClick={handleCreate}>إضافة جامعة جديدة</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الجامعات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البلد</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الطلاب</TableHead>
                <TableHead>البرامج</TableHead>
                <TableHead>معدل القبول</TableHead>
                <TableHead>رسالة قبول مجانية</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universities.map((university) => (
                <TableRow key={university.id}>
                  <TableCell className="font-medium">{university.name}</TableCell>
                  <TableCell>{university.country}</TableCell>
                  <TableCell>{university.ranking}</TableCell>
                  <TableCell>{university.students}</TableCell>
                  <TableCell>{university.programs}</TableCell>
                  <TableCell>{university.acceptance}</TableCell>
                  <TableCell>
                    {university.freeOfferLetter ? 'نعم' : 'لا'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => handleEdit(university)}>
                      تعديل
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(university.id)}>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">
              {currentUniversity?.id ? 'تعديل الجامعة' : 'إضافة جامعة جديدة'}
            </DialogTitle>
          </DialogHeader>
          {currentUniversity && (
            <div className="grid gap-6 py-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-right border-b pb-2">المعلومات الأساسية</h3>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    اسم الجامعة
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={currentUniversity.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="col-span-3"
                    placeholder="أدخل اسم الجامعة"
                    required
                  />
                </div>

                <CountrySelect
                  label="الدولة"
                  value={{ country: currentUniversity.country, flag: currentUniversity.flag }}
                  onChange={handleCountryChange}
                  required
                  placeholder="اختر دولة الجامعة"
                />

                <EnhancedFileUpload
                  label="شعار الجامعة"
                  value={currentUniversity.logo instanceof File ? currentUniversity.logo : null}
                  onChange={(file) => handleInputChange('logo', file || '')}
                  accept="image/*"
                  maxSize={5}
                  required
                  preview={typeof currentUniversity.logo === 'string' ? currentUniversity.logo : undefined}
                />
              </div>

              {/* Academic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-right border-b pb-2">المعلومات الأكاديمية</h3>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ranking" className="text-right">
                    الترتيب العالمي
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Input
                    id="ranking"
                    value={currentUniversity.ranking}
                    onChange={(e) => handleInputChange('ranking', e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: #150 عالمياً"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="students" className="text-right">
                    عدد الطلاب
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Input
                    id="students"
                    value={currentUniversity.students}
                    onChange={(e) => handleInputChange('students', e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: 25,000+ طالب"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="programs" className="text-right">
                    عدد البرامج
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Input
                    id="programs"
                    value={currentUniversity.programs}
                    onChange={(e) => handleInputChange('programs', e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: 200+ برنامج"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="acceptance" className="text-right">
                    معدل القبول
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <Input
                    id="acceptance"
                    value={currentUniversity.acceptance}
                    onChange={(e) => handleInputChange('acceptance', e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: 75%"
                    required
                  />
                </div>
              </div>

              {/* Visual Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-right border-b pb-2">الإعدادات المرئية</h3>
                
                <ColorPicker
                  label="لون الخلفية"
                  value={currentUniversity.color}
                  onChange={(color) => handleInputChange('color', color)}
                  required
                  placeholder="اختر لون أو تدرج للخلفية"
                />
              </div>

              {/* Additional Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-right border-b pb-2">إعدادات إضافية</h3>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="freeOfferLetter" className="text-right">
                    رسالة قبول مجانية
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Switch
                      id="freeOfferLetter"
                      checked={currentUniversity.freeOfferLetter}
                      onCheckedChange={(checked) => handleInputChange('freeOfferLetter', checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {currentUniversity.freeOfferLetter ? 'متاحة مجاناً' : 'غير متاحة مجاناً'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSave} className="min-w-[100px]">
                  {currentUniversity.id ? 'تحديث الجامعة' : 'إضافة الجامعة'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
