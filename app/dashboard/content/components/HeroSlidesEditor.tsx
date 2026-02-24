'use client'

import { HeroSlide } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EnhancedFileUpload } from '@/components/ui/enhanced-file-upload'
import { ColorPicker } from '@/components/ui/color-picker'
import { Plus, Trash2, Image, Palette, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface HeroSlidesEditorProps {
  slides: HeroSlide[]
  onChange: (slides: HeroSlide[]) => void
}

const gradientPresets = [
  { name: 'أزرق إلى بنفسجي', value: 'from-blue-600 to-purple-700', preview: 'bg-gradient-to-r from-blue-600 to-purple-700' },
  { name: 'أخضر إلى أزرق', value: 'from-green-500 to-blue-600', preview: 'bg-gradient-to-r from-green-500 to-blue-600' },
  { name: 'وردي إلى أحمر', value: 'from-pink-500 to-red-600', preview: 'bg-gradient-to-r from-pink-500 to-red-600' },
  { name: 'برتقالي إلى أصفر', value: 'from-orange-500 to-yellow-500', preview: 'bg-gradient-to-r from-orange-500 to-yellow-500' },
  { name: 'بنفسجي إلى وردي', value: 'from-purple-600 to-pink-600', preview: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { name: 'رمادي إلى أسود', value: 'from-gray-700 to-gray-900', preview: 'bg-gradient-to-r from-gray-700 to-gray-900' },
]

export default function HeroSlidesEditor({ slides, onChange }: HeroSlidesEditorProps) {
  const addSlide = () => {
    const newSlide: HeroSlide = {
      title: '',
      subtitle: '',
      description: '',
      image: '',
      gradient: 'from-blue-600 to-purple-700'
    }
    onChange([...slides, newSlide])
  }

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    const updatedSlides = [...slides]
    updatedSlides[index] = { ...updatedSlides[index], [field]: value }
    onChange(updatedSlides)
  }

  const removeSlide = (index: number) => {
    const updatedSlides = slides.filter((_, i) => i !== index)
    onChange(updatedSlides)
  }

  const handleImageUpload = (index: number, file: File | null) => {
    if (file) {
      // For now, we'll create a URL for the file
      // In a real implementation, you'd upload to your storage service
      const url = URL.createObjectURL(file)
      updateSlide(index, 'image', url)
    } else {
      updateSlide(index, 'image', '')
    }
  }

  const validateSlide = (slide: HeroSlide) => {
    const errors = []
    if (!slide.title.trim()) errors.push('العنوان مطلوب')
    if (!slide.description.trim()) errors.push('الوصف مطلوب')
    if (!slide.image.trim()) errors.push('الصورة مطلوبة')
    return errors
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">شرائح البانر الرئيسي</h3>
          <p className="text-sm text-muted-foreground">
            إدارة الشرائح التي تظهر في أعلى الصفحة الرئيسية ({slides.length} شريحة)
          </p>
        </div>
        <Button onClick={addSlide} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة شريحة جديدة
        </Button>
      </div>

      {slides.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لا توجد شرائح حالياً. انقر على "إضافة شريحة جديدة" لإنشاء أول شريحة.
          </AlertDescription>
        </Alert>
      )}
      
      {slides.map((slide, index) => {
        const errors = validateSlide(slide)
        return (
          <Card key={index} className={errors.length > 0 ? 'border-red-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>الشريحة {index + 1}</CardTitle>
                  {errors.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {errors.length} خطأ
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeSlide(index)}
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
                  <Label htmlFor={`title-${index}`} className="flex items-center gap-1">
                    العنوان الرئيسي
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`title-${index}`}
                    value={slide.title}
                    onChange={(e) => updateSlide(index, 'title', e.target.value)}
                    placeholder="أدخل العنوان الرئيسي للشريحة"
                    className={!slide.title.trim() ? 'border-red-300' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`subtitle-${index}`}>العنوان الفرعي</Label>
                  <Input
                    id={`subtitle-${index}`}
                    value={slide.subtitle}
                    onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                    placeholder="أدخل العنوان الفرعي (اختياري)"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`} className="flex items-center gap-1">
                  الوصف
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`description-${index}`}
                  value={slide.description}
                  onChange={(e) => updateSlide(index, 'description', e.target.value)}
                  placeholder="أدخل وصف الشريحة"
                  rows={3}
                  className={!slide.description.trim() ? 'border-red-300' : ''}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    صورة الشريحة
                    <span className="text-red-500">*</span>
                  </Label>
                  <EnhancedFileUpload
                    label="صورة الشريحة"
                    value={null}
                    onChange={(file) => handleImageUpload(index, file)}
                    accept="image/*"
                    maxSize={5}
                    required={true}
                    preview={slide.image}
                  />
                  {slide.image && (
                    <div className="mt-2">
                      <img 
                        src={slide.image} 
                        alt={`معاينة الشريحة ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    تدرج الألوان
                  </Label>
                  <Select
                    value={slide.gradient}
                    onValueChange={(value) => updateSlide(index, 'gradient', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تدرج الألوان" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientPresets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${preset.preview}`} />
                            {preset.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">معاينة التدرج:</Label>
                    <div className={`w-full h-8 rounded-md bg-gradient-to-r ${slide.gradient} mt-1`} />
                  </div>
                  
                  <div className="mt-2">
                    <Label htmlFor={`gradient-custom-${index}`} className="text-xs">
                      أو أدخل تدرج مخصص:
                    </Label>
                    <Input
                      id={`gradient-custom-${index}`}
                      value={slide.gradient}
                      onChange={(e) => updateSlide(index, 'gradient', e.target.value)}
                      placeholder="from-blue-600 to-purple-700"
                      className="text-xs mt-1"
                    />
                  </div>
                </div>
              </div>
              
              {slide.title && slide.description && slide.image && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    الشريحة جاهزة للنشر
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
