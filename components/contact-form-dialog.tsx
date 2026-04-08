'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useLanguage } from '@/contexts/LanguageContext'
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ContactFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactFormDialog({ open, onOpenChange }: ContactFormDialogProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('contact.form.name.required') || 'الاسم مطلوب'
    }
    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.email.required') || 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.email.invalid') || 'البريد الإلكتروني غير صالح'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.form.phone.required') || 'رقم الهاتف مطلوب'
    }
    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.message.required') || 'الرسالة مطلوبة'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ fullName: '', email: '', phone: '', message: '' })
        setTimeout(() => {
          onOpenChange(false)
          setSubmitStatus('idle')
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('contact.form.title') || 'تواصل معنا'}
          </DialogTitle>
          <DialogDescription>
            {t('contact.form.description') || 'أرسل لنا رسالتك وسنقوم بالرد عليك في أقرب وقت'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {t('contact.form.name') || 'الاسم الكامل'} *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder={t('contact.form.name.placeholder') || 'أدخل اسمك الكامل'}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('contact.form.email') || 'البريد الإلكتروني'} *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('contact.form.email.placeholder') || 'example@email.com'}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">
              {t('contact.form.phone') || 'رقم الهاتف'} *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t('contact.form.phone.placeholder') || '+966 50 123 4567'}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">
              {t('contact.form.message') || 'الرسالة'} *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={t('contact.form.message.placeholder') || 'اكتب رسالتك هنا...'}
              rows={4}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message}</p>
            )}
          </div>
          
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span>{t('contact.form.success') || 'تم إرسال رسالتك بنجاح!'}</span>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span>{t('contact.form.error') || 'حدث خطأ، يرجى المحاولة مرة أخرى'}</span>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel') || 'إلغاء'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {t('contact.form.sending') || 'جاري الإرسال...'}
                </>
              ) : (
                t('contact.form.send') || 'إرسال'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
