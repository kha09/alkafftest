'use client'

import { useState, useEffect } from 'react'
import { HomePageContent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, AlertCircle, CheckCircle2, Globe } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import HeroSlidesEditor from './components/HeroSlidesEditor'
import UniversitiesEditor from './components/UniversitiesEditor'
import TestimonialsEditor from './components/TestimonialsEditor'
import FaqsEditor from './components/FaqsEditor'
import WhySMAlkaffEditor from './components/WhySMAlkaffEditor'
import HowItWorksEditor from './components/HowItWorksEditor'

export default function ContentEditor() {
  const [content, setContent] = useState<HomePageContent | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/homepage?lang=${selectedLanguage}`)
        if (!response.ok) throw new Error('فشل في تحميل المحتوى')
        const data: HomePageContent = await response.json()
        setContent(data)
        setHasUnsavedChanges(false)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف')
      } finally {
        setIsLoading(false)
      }
    }
    fetchContent()
  }, [selectedLanguage])

  const handleContentChange = (newContent: HomePageContent) => {
    setContent(newContent)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!content) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/homepage?lang=${selectedLanguage}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })
      if (!response.ok) throw new Error('فشل في حفظ المحتوى')
      
      setHasUnsavedChanges(false)
      toast({
        title: "تم الحفظ بنجاح",
        description: `تم حفظ جميع التغييرات على المحتوى ${selectedLanguage === 'ar' ? 'العربي' : 'الإنجليزي'}`,
        duration: 3000,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في حفظ المحتوى'
      setError(errorMessage)
      toast({
        title: "خطأ في الحفظ",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل المحتوى...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطأ: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لم يتم العثور على محتوى
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">محرر محتوى الصفحة الرئيسية</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وتحرير جميع أقسام الصفحة الرئيسية للموقع
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
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              تغييرات غير محفوظة
            </Badge>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasUnsavedChanges}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            نظرة عامة على المحتوى
          </CardTitle>
          <CardDescription>
            إحصائيات سريعة حول محتوى الصفحة الرئيسية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{content.heroSlides?.length || 0}</div>
              <div className="text-sm text-muted-foreground">شرائح البانر</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{content.universities?.length || 0}</div>
              <div className="text-sm text-muted-foreground">الجامعات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{content.testimonials?.length || 0}</div>
              <div className="text-sm text-muted-foreground">الشهادات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{content.faqs?.length || 0}</div>
              <div className="text-sm text-muted-foreground">الأسئلة الشائعة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{content.whySMAlkaff?.features?.length || 0}</div>
              <div className="text-sm text-muted-foreground">مميزات SM Alkaff</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{content.howItWorks?.steps?.length || 0}</div>
              <div className="text-sm text-muted-foreground">خطوات العمل</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1">
          <TabsTrigger value="hero" className="flex flex-col items-center p-3">
            <span className="text-sm font-medium">شرائح البانر</span>
            <Badge variant="outline" className="mt-1 text-xs">
              {content.heroSlides?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="universities" className="flex flex-col items-center p-3">
            <span className="text-sm font-medium">الجامعات</span>
            <Badge variant="outline" className="mt-1 text-xs">
              {content.universities?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex flex-col items-center p-3">
            <span className="text-sm font-medium">الشهادات</span>
            <Badge variant="outline" className="mt-1 text-xs">
              {content.testimonials?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex flex-col items-center p-3">
            <span className="text-sm font-medium">الأسئلة الشائعة</span>
            <Badge variant="outline" className="mt-1 text-xs">
              {content.faqs?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="why" className="flex flex-col items-center p-3">
            <span className="text-sm font-medium">لماذا SM Alkaff؟</span>
            <Badge variant="outline" className="mt-1 text-xs">
              {content.whySMAlkaff?.features?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="how" className="flex flex-col items-center p-3">
            <span className="text-sm font-medium">كيف تعمل المنصة؟</span>
            <Badge variant="outline" className="mt-1 text-xs">
              {content.howItWorks?.steps?.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>شرائح البانر الرئيسي</CardTitle>
              <CardDescription>
                إدارة الشرائح التي تظهر في أعلى الصفحة الرئيسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroSlidesEditor 
                slides={content.heroSlides} 
                onChange={(slides: any[]) => handleContentChange({...content, heroSlides: slides})} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="universities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>قسم الجامعات</CardTitle>
              <CardDescription>
                إدارة الجامعات المعروضة في الصفحة الرئيسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UniversitiesEditor 
                universities={content.universities} 
                onChange={(universities: any[]) => handleContentChange({...content, universities})} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>شهادات الطلاب</CardTitle>
              <CardDescription>
                إدارة شهادات وتقييمات الطلاب المعروضة في الموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialsEditor 
                testimonials={content.testimonials} 
                onChange={(testimonials: any[]) => handleContentChange({...content, testimonials})} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة الشائعة</CardTitle>
              <CardDescription>
                إدارة الأسئلة والأجوبة الشائعة للموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FaqsEditor 
                faqs={content.faqs} 
                onChange={(faqs: any[]) => handleContentChange({...content, faqs})} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="why" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>لماذا SM Alkaff؟</CardTitle>
              <CardDescription>
                إدارة قسم مميزات وفوائد استخدام منصة SM Alkaff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WhySMAlkaffEditor 
                whySMAlkaff={content.whySMAlkaff} 
                onChange={(whySMAlkaff: any) => handleContentChange({...content, whySMAlkaff})} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="how" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>كيف تعمل المنصة؟</CardTitle>
              <CardDescription>
                إدارة قسم شرح خطوات استخدام المنصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HowItWorksEditor 
                howItWorks={content.howItWorks} 
                onChange={(howItWorks: any) => handleContentChange({...content, howItWorks})} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
