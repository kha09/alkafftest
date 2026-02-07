'use client'

import { University } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { EnhancedFileUpload } from '@/components/ui/enhanced-file-upload'
import { CountrySelect } from '@/components/ui/country-select'
import { ColorPicker } from '@/components/ui/color-picker'
import { Plus, Trash2, GraduationCap, AlertCircle, Building2, Users, BookOpen, TrendingUp, Award } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UniversitiesEditorProps {
  universities: University[]
  onChange: (universities: University[]) => void
}

export default function UniversitiesEditor({ universities, onChange }: UniversitiesEditorProps) {
  const addUniversity = () => {
    const newUniversity: University = {
      id: 0, // This will be set by the database
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
    }
    onChange([...universities, newUniversity])
  }

  const updateUniversity = (index: number, field: keyof University, value: string | boolean) => {
    const updatedUniversities = [...universities]
    updatedUniversities[index] = { ...updatedUniversities[index], [field]: value }
    onChange(updatedUniversities)
  }

  const removeUniversity = (index: number) => {
    const updatedUniversities = universities.filter((_, i) => i !== index)
    onChange(updatedUniversities)
  }

  const handleLogoUpload = async (index: number, file: File | null) => {
    if (file) {
      try {
        // Create FormData for the API request
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', 'university-logos')
        formData.append('identifier', `homepage-university-${index}-${Date.now()}`)

        // Upload the file using the API endpoint
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        console.log('Upload successful:', result)
        
        // Store the S3 file path for serving through the API
        updateUniversity(index, 'logo', result.filePath)
      } catch (error) {
        console.error('Error uploading logo:', error)
        alert(`فشل في رفع الشعار: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
      }
    } else {
      updateUniversity(index, 'logo', '')
    }
  }

  const handleCountrySelect = (index: number, country: { country: string; flag: string }) => {
    updateUniversity(index, 'country', country.country)
    updateUniversity(index, 'flag', country.flag)
  }

  const validateUniversity = (university: University) => {
    const errors = []
    if (!university.name.trim()) errors.push('اسم الجامعة مطلوب')
    if (!university.country.trim()) errors.push('الدولة مطلوبة')
    if (!university.logo.trim()) errors.push('شعار الجامعة مطلوب')
    return errors
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">الجامعات المميزة</h3>
          <p className="text-sm text-muted-foreground">
            إدارة الجامعات المعروضة في الصفحة الرئيسية ({universities.length} جامعة)
          </p>
        </div>
        <Button onClick={addUniversity} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة جامعة جديدة
        </Button>
      </div>

      {universities.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لا توجد جامعات حالياً. انقر على "إضافة جامعة جديدة" لإنشاء أول جامعة.
          </AlertDescription>
        </Alert>
      )}
      
      {universities.map((university, index) => {
        const errors = validateUniversity(university)
        return (
          <Card key={index} className={errors.length > 0 ? 'border-red-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    الجامعة {index + 1}
                  </CardTitle>
                  {errors.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {errors.length} خطأ
                    </Badge>
                  )}
                  {university.freeOfferLetter && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      قبول مجاني
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeUniversity(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  حذف
                </Button>
              </div>
              {errors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    يرجى إصلاح الأخطاء التالية: {errors.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">المعلومات الأساسية</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`} className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      اسم الجامعة
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`name-${index}`}
                      value={university.name}
                      onChange={(e) => updateUniversity(index, 'name', e.target.value)}
                      placeholder="أدخل اسم الجامعة"
                      className={!university.name.trim() ? 'border-red-300' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      الدولة
                      <span className="text-red-500">*</span>
                    </Label>
                    <CountrySelect
                      label=""
                      value={{ country: university.country, flag: university.flag }}
                      onChange={(country) => handleCountrySelect(index, country)}
                      placeholder="اختر الدولة"
                      required={true}
                    />
                    {university.flag && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-lg">{university.flag}</span>
                        {university.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">الشعار والهوية البصرية</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      شعار الجامعة
                      <span className="text-red-500">*</span>
                    </Label>
                    <EnhancedFileUpload
                      label=""
                      value={null}
                      onChange={(file) => handleLogoUpload(index, file)}
                      accept="image/*"
                      maxSize={3}
                      required={true}
                      preview={university.logo}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>ألوان الجامعة</Label>
                    <ColorPicker
                      label=""
                      value={university.color}
                      onChange={(color) => {
                        // Ensure we always store a gradient string for consistency with homepage
                        const gradientColor = color.startsWith('linear-gradient') 
                          ? color 
                          : `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
                        updateUniversity(index, 'color', gradientColor);
                      }}
                      placeholder="اختر لون أو تدرج"
                    />
                    <div className="mt-2">
                      <Label className="text-xs text-muted-foreground">معاينة اللون:</Label>
                      <div 
                        className="w-full h-8 rounded-md mt-1 border"
                        style={{ background: university.color }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">الإحصائيات والمعلومات</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`ranking-${index}`} className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      التصنيف العالمي
                    </Label>
                    <Input
                      id={`ranking-${index}`}
                      value={university.ranking}
                      onChange={(e) => updateUniversity(index, 'ranking', e.target.value)}
                      placeholder="#1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`students-${index}`} className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      عدد الطلاب
                    </Label>
                    <Input
                      id={`students-${index}`}
                      value={university.students}
                      onChange={(e) => updateUniversity(index, 'students', e.target.value)}
                      placeholder="23,000+"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`programs-${index}`} className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      عدد البرامج
                    </Label>
                    <Input
                      id={`programs-${index}`}
                      value={university.programs}
                      onChange={(e) => updateUniversity(index, 'programs', e.target.value)}
                      placeholder="180+"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`acceptance-${index}`}>معدل القبول</Label>
                    <Input
                      id={`acceptance-${index}`}
                      value={university.acceptance}
                      onChange={(e) => updateUniversity(index, 'acceptance', e.target.value)}
                      placeholder="3.4%"
                    />
                  </div>
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2">الخيارات الإضافية</h4>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`freeOfferLetter-${index}`}
                    checked={university.freeOfferLetter}
                    onCheckedChange={(checked) => updateUniversity(index, 'freeOfferLetter', checked as boolean)}
                  />
                  <Label htmlFor={`freeOfferLetter-${index}`} className="flex items-center gap-2 cursor-pointer">
                    <Award className="h-4 w-4" />
                    قبول مجاني متاح
                  </Label>
                </div>
              </div>
              
              {university.name && university.country && university.logo && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    الجامعة جاهزة للنشر
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
