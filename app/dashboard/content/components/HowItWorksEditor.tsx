'use client'

import { useState } from 'react'
import { HowItWorks } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HowItWorksEditorProps {
  howItWorks?: HowItWorks
  onChange: (howItWorks: HowItWorks) => void
}

export default function HowItWorksEditor({ howItWorks, onChange }: HowItWorksEditorProps) {
  const [section, setSection] = useState<HowItWorks>(howItWorks || {
    id: 0,
    title: 'كيف تعمل المنصة؟',
    description: 'رحلة تفاعلية بسيطة تقودك إلى حلمك الجامعي خطوة بخطوة - من التسجيل إلى القبول',
    steps: [
      {
        step: '1',
        title: 'أنشئ حسابك',
        subtitle: 'تسجيل سريع وآمن',
        description: 'ابدأ رحلتك بإنشاء حساب شخصي آمن في دقائق معدودة',
        icon: 'Users',
        color: 'from-blue-500 to-cyan-500',
        delay: '0',
      },
      {
        step: '2',
        title: 'اختر تخصصك',
        subtitle: 'من بين مئات الخيارات',
        description: 'استكشف التخصصات المتاحة واختر ما يناسب شغفك وأهدافك',
        icon: 'BookOpen',
        color: 'from-purple-500 to-pink-500',
        delay: '200',
      },
      {
        step: '3',
        title: 'أرسل طلبك',
        subtitle: 'بضغطة زر واحدة',
        description: 'قدم طلبك للجامعات المختارة بنظام إلكتروني متطور',
        icon: 'FileText',
        color: 'from-teal-500 to-green-500',
        delay: '400',
      },
      {
        step: '4',
        title: 'تابع وادفع',
        subtitle: 'بكل سهولة ويسر',
        description: 'راقب حالة طلبك واستكمل عملية الدفع بطرق آمنة ومتنوعة',
        icon: 'CreditCard',
        color: 'from-orange-500 to-red-500',
        delay: '600',
      },
      {
        step: '5',
        title: 'ابدأ دراستك',
        subtitle: 'حقق حلمك',
        description: 'استعد لبدء مغامرتك التعليمية في أفضل الجامعات العالمية',
        icon: 'GraduationCap',
        color: 'from-indigo-500 to-purple-500',
        delay: '800',
      },
    ],
  })

  const handleSectionChange = (field: keyof HowItWorks, value: string) => {
    const updatedSection = { ...section, [field]: value }
    setSection(updatedSection)
    onChange(updatedSection)
  }

  const handleStepChange = (index: number, field: string, value: string) => {
    const updatedSteps = [...section.steps]
    ;(updatedSteps[index] as any)[field] = value
    const updatedSection = { ...section, steps: updatedSteps }
    setSection(updatedSection)
    onChange(updatedSection)
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>كيف تعمل المنصة؟ - قسم الرأس</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">العنوان</label>
            <Input
              value={section.title}
              onChange={(e) => handleSectionChange('title', e.target.value)}
              placeholder="كيف تعمل المنصة؟"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <Textarea
              value={section.description}
              onChange={(e) => handleSectionChange('description', e.target.value)}
              placeholder="رحلة تفاعلية بسيطة تقودك إلى حلمك الجامعي خطوة بخطوة - من التسجيل إلى القبول"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الخطوات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {section.steps.map((step, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-lg font-medium">الخطوة {index + 1}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الخطوة</label>
                  <Input
                    value={step.step}
                    onChange={(e) => handleStepChange(index, 'step', e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الأيقونة</label>
                  <Input
                    value={step.icon}
                    onChange={(e) => handleStepChange(index, 'icon', e.target.value)}
                    placeholder="Users"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">العنوان</label>
                  <Input
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    placeholder="أنشئ حسابك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">العنوان الفرعي</label>
                  <Input
                    value={step.subtitle}
                    onChange={(e) => handleStepChange(index, 'subtitle', e.target.value)}
                    placeholder="تسجيل سريع وآمن"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">اللون</label>
                  <Input
                    value={step.color}
                    onChange={(e) => handleStepChange(index, 'color', e.target.value)}
                    placeholder="from-blue-500 to-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">التأخير</label>
                  <Input
                    value={step.delay}
                    onChange={(e) => handleStepChange(index, 'delay', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <Textarea
                  value={step.description}
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  placeholder="ابدأ رحلتك بإنشاء حساب شخصي آمن في دقائق معدودة"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
