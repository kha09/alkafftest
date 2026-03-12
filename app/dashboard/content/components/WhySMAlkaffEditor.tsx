'use client'

import { useState } from 'react'
import { WhySMAlkaff } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TailwindGradientPicker } from '@/components/ui/tailwind-gradient-picker'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface WhySMAlkaffEditorProps {
  whySMAlkaff?: WhySMAlkaff
  onChange: (whySMAlkaff: WhySMAlkaff) => void
}

export default function WhySMAlkaffEditor({ whySMAlkaff, onChange }: WhySMAlkaffEditorProps) {
  const [section, setSection] = useState<WhySMAlkaff>(whySMAlkaff || {
    id: 0,
    title: '',
    description: '',
    useUniversityColor: false,
    features: [
      {
        icon: '',
        title: '',
        subtitle: '',
        description: '',
        color: 'from-blue-500 to-cyan-500',
        delay: '0',
        stats: '',
        statsLabel: '',
      },
      {
        icon: '',
        title: '',
        subtitle: '',
        description: '',
        color: 'from-emerald-500 to-teal-500',
        delay: '200',
        stats: '',
        statsLabel: '',
      },
      {
        icon: '',
        title: '',
        subtitle: '',
        description: '',
        color: 'from-purple-500 to-pink-500',
        delay: '400',
        stats: '',
        statsLabel: '',
      },
      {
        icon: '',
        title: '',
        subtitle: '',
        description: '',
        color: 'from-orange-500 to-red-500',
        delay: '600',
        stats: '',
        statsLabel: '',
      },
    ],
  })

  const handleSectionChange = (field: keyof WhySMAlkaff, value: string) => {
    const updatedSection = { ...section, [field]: value }
    setSection(updatedSection)
    onChange(updatedSection)
  }

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const updatedFeatures = [...section.features]
    ;(updatedFeatures[index] as any)[field] = value
    const updatedSection = { ...section, features: updatedFeatures }
    setSection(updatedSection)
    onChange(updatedSection)
  }

  const handleUseUniversityColorChange = (checked: boolean) => {
    const updatedSection = { ...section, useUniversityColor: checked }
    setSection(updatedSection)
    onChange(updatedSection)
  }


  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>لماذا SM Alkaff؟ - قسم الرأس</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">العنوان</label>
            <Input
              value={section.title}
              onChange={(e) => handleSectionChange('title', e.target.value)}
              placeholder="لماذا SM Alkaff؟"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <Textarea
              value={section.description}
              onChange={(e) => handleSectionChange('description', e.target.value)}
              placeholder="نحن نجعل رحلة التقديم الجامعي أسهل وأكثر فعالية من خلال منصتنا المتطورة والمبتكرة"
            />
          </div>
          
          {/* Use University Color Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <Label htmlFor="useUniversityColor" className="text-sm font-medium">
                استخدام لون الجامعة المختارة
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                عند تفعيل هذا الخيار، سيظهر قسم "لماذا SM Alkaff؟" بلون الجامعة المختارة في الصفحة الرئيسية
              </p>
            </div>
            <Switch
              id="useUniversityColor"
              checked={section.useUniversityColor}
              onCheckedChange={handleUseUniversityColorChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الميزات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {section.features.map((feature, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-medium">الميزة {index + 1}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الأيقونة</label>
                  <Input
                    value={feature.icon}
                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                    placeholder="FileText"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">العنوان</label>
                  <Input
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                    placeholder="تقديم إلكتروني شامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                  <Input
                    value={feature.subtitle}
                    onChange={(e) => handleFeatureChange(index, 'subtitle', e.target.value)}
                    placeholder="نظام متكامل ومتطور"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">اللون</label>
                  <TailwindGradientPicker
                    label=""
                    value={feature.color}
                    onChange={(color) => handleFeatureChange(index, 'color', color)}
                    placeholder="اختر تدرج لوني"
                  />
                  <div className="mt-2">
                    <div 
                      className={`w-full h-6 rounded-md border bg-gradient-to-r ${feature.color}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">التأخير</label>
                  <Input
                    value={feature.delay}
                    onChange={(e) => handleFeatureChange(index, 'delay', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الإحصائيات</label>
                  <Input
                    value={feature.stats}
                    onChange={(e) => handleFeatureChange(index, 'stats', e.target.value)}
                    placeholder="99.9%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تسمية الإحصائيات</label>
                  <Input
                    value={feature.statsLabel}
                    onChange={(e) => handleFeatureChange(index, 'statsLabel', e.target.value)}
                    placeholder="معدل النجاح"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <Textarea
                  value={feature.description}
                  onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                  placeholder="نظام متكامل لإدارة جميع طلباتك الجامعية بكفاءة عالية وأمان تام"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
