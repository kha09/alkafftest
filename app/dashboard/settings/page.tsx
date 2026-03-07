"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { User, Bell, Shield, Palette, Database, Mail, Save, MessageCircle, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WhatsAppSettings {
  id?: number
  phoneNumber: string
  displayText: string
  isEnabled: boolean
  position: string
  welcomeMessage: string
}

interface SmtpSettings {
  id: number | null
  host: string
  port: number
  username: string
  password: string
  encryption: string
  fromEmail: string
  fromName: string
  isEnabled: boolean
  testEmail: string
  lastTested: string | null
  testStatus: string | null
  testError: string | null
}

export default function SettingsPage() {
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    phoneNumber: '',
    displayText: 'تواصل معنا عبر واتساب',
    isEnabled: false,
    position: 'bottom-right',
    welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك؟'
  })
  
  // SMTP Settings State
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    id: null,
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    fromEmail: '',
    fromName: 'SM Alkaff',
    isEnabled: true,
    testEmail: '',
    lastTested: null,
    testStatus: null,
    testError: null
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSmtpLoading, setIsSmtpLoading] = useState(false)
  const { toast } = useToast()

  // Load WhatsApp and SMTP settings on component mount
  useEffect(() => {
    fetchWhatsAppSettings()
    fetchSmtpSettings()
  }, [])

  const fetchWhatsAppSettings = async () => {
    try {
      const response = await fetch('/api/admin/whatsapp-settings')
      if (response.ok) {
        const data = await response.json()
        setWhatsappSettings(data)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error)
    }
  }

  const fetchSmtpSettings = async () => {
    try {
      const response = await fetch('/api/admin/smtp-settings')
      if (response.ok) {
        const data = await response.json()
        setSmtpSettings({
          ...data,
          password: '' // Don't show password
        })
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error)
    }
  }

  const saveWhatsAppSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/whatsapp-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappSettings),
      })

      if (response.ok) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم حفظ إعدادات واتساب بنجاح",
        })
      } else {
        const error = await response.json()
        toast({
          title: "خطأ في الحفظ",
          description: error.error || "حدث خطأ أثناء حفظ الإعدادات",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSmtpSettings = async () => {
    setIsSmtpLoading(true)
    try {
      const response = await fetch('/api/admin/smtp-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpSettings),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم حفظ إعدادات SMTP بنجاح",
        })
        // Refresh settings to get updated status
        fetchSmtpSettings()
      } else {
        toast({
          title: "خطأ في الحفظ",
          description: data.error || "حدث خطأ أثناء حفظ الإعدادات",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      })
    } finally {
      setIsSmtpLoading(false)
    }
  }

  const testSmtpConnection = async () => {
    if (!smtpSettings.testEmail) {
      toast({
        title: "مطلوب",
        description: "الرجاء إدخال البريد الإلكتروني للاختبار",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      const response = await fetch('/api/admin/smtp-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...smtpSettings,
          useStoredSettings: true,
          testEmail: smtpSettings.testEmail
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "نجاح",
          description: "تم إرسال البريد التجريبي بنجاح",
        })
        // Refresh settings to get updated test status
        fetchSmtpSettings()
      } else {
        toast({
          title: "فشل الاختبار",
          description: data.error || data.details || "حدث خطأ أثناء اختبار الاتصال",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء محاولة الاتصال بخادم SMTP",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }
  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">الإعدادات</h1>
          <p className="text-[#4b5563] mt-1">إدارة إعدادات النظام والحساب</p>
        </div>
        <Button className="bg-[#111827] hover:bg-[#374151]">
          <Save className="w-4 h-4 ml-2" />
          حفظ التغييرات
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="system">النظام</TabsTrigger>
          <TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
          <TabsTrigger value="whatsapp">واتساب</TabsTrigger>
          <TabsTrigger value="integrations">التكاملات</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">الاسم الأول</Label>
                    <Input id="firstName" defaultValue="أحمد" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">الاسم الأخير</Label>
                    <Input id="lastName" defaultValue="محمود" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" defaultValue="ahmed@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" defaultValue="+966 50 123 4567" />
                </div>
                <div>
                  <Label htmlFor="position">المنصب</Label>
                  <Input id="position" defaultValue="مدير النظام" />
                </div>
                <div>
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  <Textarea id="bio" placeholder="اكتب نبذة مختصرة عنك..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>صورة الملف الشخصي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-32 h-32 bg-[#f3f4f6] rounded-full mx-auto">
                  <User className="w-16 h-16 text-[#4b5563]" />
                </div>
                <div className="text-center space-y-2">
                  <Button variant="outline">تغيير الصورة</Button>
                  <p className="text-sm text-[#4b5563]">JPG, PNG أو GIF (الحد الأقصى 2MB)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                إعدادات الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">إشعارات البريد الإلكتروني</h4>
                    <p className="text-sm text-[#4b5563]">تلقي إشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">إشعارات الطلبات الجديدة</h4>
                    <p className="text-sm text-[#4b5563]">إشعار عند وصول طلبات جديدة</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">إشعارات المبيعات</h4>
                    <p className="text-sm text-[#4b5563]">إشعار عند إتمام عمليات البيع</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">التقارير الأسبوعية</h4>
                    <p className="text-sm text-[#4b5563]">تلقي تقارير أسبوعية عن الأداء</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">إشعارات النظام</h4>
                    <p className="text-sm text-[#4b5563]">إشعارات حول تحديثات النظام</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  تغيير كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button className="w-full">تحديث كلمة المرور</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">المصادقة الثنائية</h4>
                    <p className="text-sm text-[#4b5563]">حماية إضافية للحساب</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">تسجيل الدخول التلقائي</h4>
                    <p className="text-sm text-[#4b5563]">البقاء مسجلاً للدخول</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">إشعارات تسجيل الدخول</h4>
                    <p className="text-sm text-[#4b5563]">إشعار عند تسجيل دخول جديد</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                إعدادات المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme">المظهر</Label>
                <Select defaultValue="light">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="system">تلقائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">اللغة</Label>
                <Select defaultValue="ar">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">المنطقة الزمنية</Label>
                <Select defaultValue="riyadh">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riyadh">الرياض (GMT+3)</SelectItem>
                    <SelectItem value="dubai">دبي (GMT+4)</SelectItem>
                    <SelectItem value="cairo">القاهرة (GMT+2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                إعدادات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[#111827]">النسخ الاحتياطي التلقائي</h4>
                  <p className="text-sm text-[#4b5563]">نسخ احتياطي يومي للبيانات</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[#111827]">التحديثات التلقائية</h4>
                  <p className="text-sm text-[#4b5563]">تحديث النظام تلقائياً</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[#111827]">سجل النشاطات</h4>
                  <p className="text-sm text-[#4b5563]">حفظ سجل جميع العمليات</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  إعدادات SMTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="smtpHost">خادم SMTP</Label>
                  <Input 
                    id="smtpHost" 
                    placeholder="smtp.gmail.com"
                    value={smtpSettings.host}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, host: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpPort">المنفذ</Label>
                    <Input 
                      id="smtpPort" 
                      type="number" 
                      placeholder="587"
                      value={smtpSettings.port || ''}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpEncryption">التشفير</Label>
                    <Select 
                      value={smtpSettings.encryption}
                      onValueChange={(value) => setSmtpSettings(prev => ({ ...prev, encryption: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">بدون تشفير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtpUsername">اسم المستخدم</Label>
                  <Input 
                    id="smtpUsername" 
                    placeholder="your-email@gmail.com"
                    value={smtpSettings.username}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">كلمة المرور</Label>
                  <Input 
                    id="smtpPassword" 
                    type="password" 
                    placeholder="كلمة مرور التطبيق"
                    value={smtpSettings.password}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <p className="text-xs text-[#4b5563] mt-1">اتركها فارغة إذا لا تريد تغيير كلمة المرور</p>
                </div>
                <div>
                  <Label htmlFor="fromEmail">البريد المرسل</Label>
                  <Input 
                    id="fromEmail" 
                    placeholder="no-reply@smalkaff.com"
                    value={smtpSettings.fromEmail}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">اسم المرسل</Label>
                  <Input 
                    id="fromName" 
                    value={smtpSettings.fromName}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, fromName: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">تفعيل SMTP</h4>
                    <p className="text-sm text-[#4b5563]">تمكين إرسال البريد الإلكتروني</p>
                  </div>
                  <Switch 
                    checked={smtpSettings.isEnabled}
                    onCheckedChange={(checked) => setSmtpSettings(prev => ({ ...prev, isEnabled: checked }))}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={saveSmtpSettings}
                  disabled={isSmtpLoading}
                >
                  {isSmtpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ إعدادات SMTP"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>اختبار البريد الإلكتروني</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">البريد الإلكتروني للاختبار</Label>
                  <Input 
                    id="testEmail" 
                    type="email" 
                    placeholder="test@example.com"
                    value={smtpSettings.testEmail || ''}
                    onChange={(e) => setSmtpSettings(prev => ({ ...prev, testEmail: e.target.value }))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={testSmtpConnection}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    "إرسال بريد تجريبي"
                  )}
                </Button>
                
                <div className="mt-6 p-4 bg-[#f3f4f6] rounded-lg">
                  <h4 className="font-medium text-[#111827] mb-2">حالة الاتصال</h4>
                  <div className="flex items-center gap-2">
                    {smtpSettings.testStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">متصل بنجاح</span>
                      </>
                    ) : smtpSettings.testStatus === 'failed' ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">فشل الاتصال</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-[#4b5563]">غير مختبَر</span>
                      </>
                    )}
                  </div>
                  {smtpSettings.lastTested && (
                    <p className="text-xs text-[#4b5563] mt-1">
                      آخر اختبار: {new Date(smtpSettings.lastTested).toLocaleString('ar')}
                    </p>
                  )}
                  {smtpSettings.testError && smtpSettings.testStatus === 'failed' && (
                    <p className="text-xs text-red-500 mt-1">{smtpSettings.testError}</p>
                  )}
                  {!smtpSettings.testStatus && (
                    <p className="text-xs text-[#4b5563] mt-1">لم يتم اختبار الإعدادات بعد</p>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-[#111827] mb-2">إعدادات شائعة</h4>
                  <div className="space-y-2 text-sm text-[#4b5563]">
                    <div>
                      <strong>Gmail:</strong> smtp.gmail.com:587 (TLS)
                    </div>
                    <div>
                      <strong>Outlook:</strong> smtp-mail.outlook.com:587 (TLS)
                    </div>
                    <div>
                      <strong>Yahoo:</strong> smtp.mail.yahoo.com:587 (TLS)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  إعدادات واتساب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#111827]">تفعيل زر واتساب</h4>
                    <p className="text-sm text-[#4b5563]">إظهار زر واتساب العائم في الصفحات العامة</p>
                  </div>
                  <Switch 
                    checked={whatsappSettings.isEnabled}
                    onCheckedChange={(checked) => 
                      setWhatsappSettings(prev => ({ ...prev, isEnabled: checked }))
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="phoneNumber">رقم واتساب</Label>
                  <Input 
                    id="phoneNumber" 
                    placeholder="+966501234567"
                    value={whatsappSettings.phoneNumber}
                    onChange={(e) => 
                      setWhatsappSettings(prev => ({ ...prev, phoneNumber: e.target.value }))
                    }
                  />
                  <p className="text-xs text-[#4b5563] mt-1">يجب أن يتضمن رمز الدولة (مثال: +966501234567)</p>
                </div>

                <div>
                  <Label htmlFor="displayText">نص الزر</Label>
                  <Input 
                    id="displayText" 
                    value={whatsappSettings.displayText}
                    onChange={(e) => 
                      setWhatsappSettings(prev => ({ ...prev, displayText: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="position">موضع الزر</Label>
                  <Select 
                    value={whatsappSettings.position}
                    onValueChange={(value) => 
                      setWhatsappSettings(prev => ({ ...prev, position: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">أسفل اليمين</SelectItem>
                      <SelectItem value="bottom-left">أسفل اليسار</SelectItem>
                      <SelectItem value="top-right">أعلى اليمين</SelectItem>
                      <SelectItem value="top-left">أعلى اليسار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="welcomeMessage">رسالة الترحيب</Label>
                  <Textarea 
                    id="welcomeMessage" 
                    placeholder="مرحباً! كيف يمكنني مساعدتك؟"
                    value={whatsappSettings.welcomeMessage}
                    onChange={(e) => 
                      setWhatsappSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))
                    }
                  />
                  <p className="text-xs text-[#4b5563] mt-1">هذه الرسالة ستظهر مسبقاً في محادثة واتساب</p>
                </div>

                <Button 
                  onClick={saveWhatsAppSettings} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "جاري الحفظ..." : "حفظ إعدادات واتساب"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معاينة الزر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-64 bg-[#f3f4f6] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                    <div className="text-center text-[#4b5563] text-sm">معاينة الصفحة</div>
                    
                    {whatsappSettings.isEnabled && whatsappSettings.phoneNumber && (
                      <div 
                        className={`absolute w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform ${
                          whatsappSettings.position === 'bottom-right' ? 'bottom-4 right-4' :
                          whatsappSettings.position === 'bottom-left' ? 'bottom-4 left-4' :
                          whatsappSettings.position === 'top-right' ? 'top-4 right-4' :
                          'top-4 left-4'
                        }`}
                        title={whatsappSettings.displayText}
                      >
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-[#111827]">معلومات الزر</h4>
                  <div className="text-sm text-[#4b5563] space-y-1">
                    <div><strong>الحالة:</strong> {whatsappSettings.isEnabled ? 'مفعل' : 'معطل'}</div>
                    <div><strong>الرقم:</strong> {whatsappSettings.phoneNumber || 'غير محدد'}</div>
                    <div><strong>الموضع:</strong> {
                      whatsappSettings.position === 'bottom-right' ? 'أسفل اليمين' :
                      whatsappSettings.position === 'bottom-left' ? 'أسفل اليسار' :
                      whatsappSettings.position === 'top-right' ? 'أعلى اليمين' :
                      'أعلى اليسار'
                    }</div>
                  </div>
                </div>

                {whatsappSettings.isEnabled && whatsappSettings.phoneNumber && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">الزر مفعل ومرئي للزوار</span>
                    </div>
                  </div>
                )}

                {whatsappSettings.isEnabled && !whatsappSettings.phoneNumber && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-yellow-800 text-sm">
                      <strong>تحذير:</strong> يجب إدخال رقم واتساب لتفعيل الزر
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                التكاملات الخارجية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-[#111827]">WhatsApp Business</h4>
                  <p className="text-sm text-[#4b5563]">إرسال الإشعارات عبر واتساب</p>
                </div>
                <Button variant="outline">ربط</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-[#111827]">SMS Gateway</h4>
                  <p className="text-sm text-[#4b5563]">إرسال الرسائل النصية</p>
                </div>
                <Button variant="outline">ربط</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-[#111827]">Payment Gateway</h4>
                  <p className="text-sm text-[#4b5563]">بوابة الدفع الإلكتروني</p>
                </div>
                <Button variant="outline">ربط</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
