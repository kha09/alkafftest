'use client'

import { Testimonial } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EnhancedFileUpload } from '@/components/ui/enhanced-file-upload'
import { CountrySelect } from '@/components/ui/country-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, User, Star, AlertCircle, Video, Award } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TestimonialsEditorProps {
  testimonials: Testimonial[]
  onChange: (testimonials: Testimonial[]) => void
}

export default function TestimonialsEditor({ testimonials, onChange }: TestimonialsEditorProps) {
  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now(),
      name: '',
      program: '',
      text: '',
      rating: 5,
      avatar: '',
      university: '',
      country: '',
      flag: '',
      date: new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
      hasVideo: false,
      featured: false,
      category: 'بكالوريوس'
    }
    onChange([...testimonials, newTestimonial])
  }

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string | number | boolean) => {
    const updatedTestimonials = [...testimonials]
    updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value }
    onChange(updatedTestimonials)
  }

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = testimonials.filter((_, i) => i !== index)
    onChange(updatedTestimonials)
  }

  const handleAvatarUpload = (index: number, file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file)
      updateTestimonial(index, 'avatar', url)
    } else {
      updateTestimonial(index, 'avatar', '')
    }
  }

  const handleCountrySelect = (index: number, country: { country: string; flag: string }) => {
    updateTestimonial(index, 'country', country.country)
    updateTestimonial(index, 'flag', country.flag)
  }

  const validateTestimonial = (testimonial: Testimonial) => {
    const errors = []
    if (!testimonial.name.trim()) errors.push('اسم الطالب مطلوب')
    if (!testimonial.text.trim()) errors.push('نص الشهادة مطلوب')
    if (!testimonial.university.trim()) errors.push('اسم الجامعة مطلوب')
    if (!testimonial.country.trim()) errors.push('الدولة مطلوبة')
    return errors
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">شهادات الطلاب</h3>
          <p className="text-sm text-muted-foreground">
            إدارة شهادات وتقييمات الطلاب ({testimonials.length} شهادة)
          </p>
        </div>
        <Button onClick={addTestimonial} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة شهادة جديدة
        </Button>
      </div>

      {testimonials.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لا توجد شهادات حالياً. انقر على "إضافة شهادة جديدة" لإنشاء أول شهادة.
          </AlertDescription>
        </Alert>
      )}
      
      {testimonials.map((testimonial, index) => {
        const errors = validateTestimonial(testimonial)
        return (
          <Card key={testimonial.id || index} className={errors.length > 0 ? 'border-red-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    شهادة الطالب {index + 1}
                  </CardTitle>
                  {errors.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {errors.length} خطأ
                    </Badge>
                  )}
                  {testimonial.featured && (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      <Award className="h-3 w-3 mr-1" />
                      مميزة
                    </Badge>
                  )}
                  {testimonial.hasVideo && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      <Video className="h-3 w-3 mr-1" />
                      فيديو
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeTestimonial(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 ml-1" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`} className="flex items-center gap-1">
                    اسم الطالب
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`name-${index}`}
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                    placeholder="أدخل اسم الطالب"
                    className={!testimonial.name.trim() ? 'border-red-300' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`program-${index}`}>البرنامج الدراسي</Label>
                  <Input
                    id={`program-${index}`}
                    value={testimonial.program}
                    onChange={(e) => updateTestimonial(index, 'program', e.target.value)}
                    placeholder="أدخل اسم البرنامج الدراسي"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`text-${index}`} className="flex items-center gap-1">
                  نص الشهادة
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`text-${index}`}
                  value={testimonial.text}
                  onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                  placeholder="أدخل نص شهادة الطالب"
                  rows={4}
                  className={!testimonial.text.trim() ? 'border-red-300' : ''}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    التقييم
                  </Label>
                  <Select
                    value={testimonial.rating.toString()}
                    onValueChange={(value) => updateTestimonial(index, 'rating', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التقييم" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="mr-1">({rating})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>فئة الدراسة</Label>
                  <Select
                    value={testimonial.category}
                    onValueChange={(value) => updateTestimonial(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="بكالوريوس">بكالوريوس</SelectItem>
                      <SelectItem value="ماجستير">ماجستير</SelectItem>
                      <SelectItem value="دكتوراه">دكتوراه</SelectItem>
                      <SelectItem value="دبلوم">دبلوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`date-${index}`}>تاريخ الشهادة</Label>
                  <Input
                    id={`date-${index}`}
                    value={testimonial.date}
                    onChange={(e) => updateTestimonial(index, 'date', e.target.value)}
                    placeholder="مارس 2025"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>صورة الطالب</Label>
                  <EnhancedFileUpload
                    label="صورة الطالب"
                    value={null}
                    onChange={(file) => handleAvatarUpload(index, file)}
                    accept="image/*"
                    maxSize={2}
                    preview={testimonial.avatar}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`university-${index}`} className="flex items-center gap-1">
                      اسم الجامعة
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`university-${index}`}
                      value={testimonial.university}
                      onChange={(e) => updateTestimonial(index, 'university', e.target.value)}
                      placeholder="أدخل اسم الجامعة"
                      className={!testimonial.university.trim() ? 'border-red-300' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      الدولة
                      <span className="text-red-500">*</span>
                    </Label>
                    <CountrySelect
                      label="الدولة"
                      value={{ country: testimonial.country, flag: testimonial.flag }}
                      onChange={(country) => handleCountrySelect(index, country)}
                      placeholder="اختر الدولة"
                      required={true}
                    />
                    {testimonial.flag && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-lg">{testimonial.flag}</span>
                        {testimonial.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`hasVideo-${index}`}
                    checked={testimonial.hasVideo}
                    onCheckedChange={(checked) => updateTestimonial(index, 'hasVideo', checked as boolean)}
                  />
                  <Label htmlFor={`hasVideo-${index}`} className="flex items-center gap-2 cursor-pointer">
                    <Video className="h-4 w-4" />
                    يحتوي على فيديو
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`featured-${index}`}
                    checked={testimonial.featured}
                    onCheckedChange={(checked) => updateTestimonial(index, 'featured', checked as boolean)}
                  />
                  <Label htmlFor={`featured-${index}`} className="flex items-center gap-2 cursor-pointer">
                    <Award className="h-4 w-4" />
                    شهادة مميزة
                  </Label>
                </div>
              </div>
              
              {testimonial.name && testimonial.text && testimonial.university && testimonial.country && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    الشهادة جاهزة للنشر
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
