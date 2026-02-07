'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  Calendar, 
  Search,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Star,
  Users,
  Award,
  CheckCircle
} from 'lucide-react'
import Image from 'next/image'

import { Program, Department, University } from '@/lib/types'
import { ApplicationForm } from '@/components/application-form'

export default function UniversityDetailPage() {
  const params = useParams()
  const universityId = params.id
  const { language } = useLanguage()
  
  const [university, setUniversity] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<number | 'all'>('all')
  const [selectedDuration, setSelectedDuration] = useState<string | 'all'>('all')
  const [showApplicationForm, setShowApplicationForm] = useState<{ programId: number; programName: string } | false>(false)
  
  // Ref for debouncing search
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  
  // Extract unique durations from programs
  const getUniqueDurations = () => {
    if (!university || !university.departments) return []
    
    const durations = university.departments.flatMap(department => 
      department.programs ? department.programs.map(program => program.duration) : []
    )
    
    const uniqueDurations = [...new Set(durations)]
    
    return [
      { id: 'all', name: 'جميع المدد' },
      ...uniqueDurations.map(duration => ({
        id: duration,
        name: `${duration} سنوات`
      }))
    ]
  }

  const fetchUniversity = async (filters = {}) => {
    try {
      setLoading(true)
      const allParams = { language, ...filters }
      const queryParams = new URLSearchParams(allParams as any).toString()
      const url = `/api/universities/${universityId}?${queryParams}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch university details')
      }
      
      const data = await response.json()
      setUniversity(data)
    } catch (err) {
      setError('Failed to load university details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    const filters: any = {}
    
    if (searchQuery) filters.search = searchQuery
    if (selectedDepartment !== 'all') filters.department = selectedDepartment
    if (selectedDuration !== 'all') filters.duration = selectedDuration
    
    fetchUniversity(filters)
  }

  useEffect(() => {
    if (universityId) {
      fetchUniversity()
    }
  }, [universityId, language])

  // Apply filters when filter values change (with debouncing for search)
  useEffect(() => {
    if (universityId) {
      // Clear previous timeout
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
      
      // Set new timeout
      searchDebounceRef.current = setTimeout(() => {
        const filters: any = {}
        
        if (searchQuery) filters.search = searchQuery
        if (selectedDepartment !== 'all') filters.department = selectedDepartment
        if (selectedDuration !== 'all') filters.duration = selectedDuration
        
        fetchUniversity(filters)
      }, 1000) // 1000ms delay
      
      // Cleanup function to clear timeout
      return () => {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current)
        }
      }
    }
  }, [searchQuery, selectedDepartment, selectedDuration, universityId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dir-rtl text-right" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dir-rtl text-right" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">حدث خطأ أثناء تحميل التفاصيل</h3>
            <p className="text-gray-500 mb-8">{error || 'تعذر تحميل معلومات الجامعة'}</p>
            <Link href="/universities">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <ArrowLeft className="ml-2 h-5 w-5" />
                العودة إلى قائمة الجامعات
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Programs are now filtered by the backend API
  const filteredPrograms = university.departments?.flatMap(department => 
    department.programs?.map(program => ({ ...program, departmentName: department.name })) || []
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dir-rtl text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SM Alkaff
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                الرئيسية
              </Link>
              <Link href="/universities" className="text-blue-600 font-medium">
                التخصصات والجامعات
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                من نحن
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                تواصل معنا
              </Link>
            </nav>

            <div className="flex items-center space-x-4 space-x-reverse">
              <LanguageSwitcher />
              <Button variant="outline" className="hidden md:inline-flex">
                تسجيل الدخول
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                ابدأ الآن
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* University Header */}
      <section className="py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative mb-6 md:mb-0 md:ml-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 rounded-full blur-xl transform scale-150"></div>
              <div className="relative">
                <Image
                  src={university.logo || "/placeholder.svg"}
                  alt={university.name}
                  width={120}
                  height={120}
                  className="rounded-lg"
                />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full p-2">
                  <Award className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right text-white flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{university.name}</h1>
              <p className="text-xl text-blue-100 mb-6">{university.country} {university.flag}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="h-5 w-5" />
                  <span>الترتيب {university.ranking}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Users className="h-5 w-5" />
                  <span>{university.students} طالب</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span>معدل القبول {university.acceptance}</span>
                </div>
                {university.freeOfferLetter && (
                  <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>خطاب قبول مجاني</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  تواصل مع خبير
                </Button>
                <Button variant="outline" className="border-white text-blue-600 hover:bg-white">
                  اسألنا
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">البحث والتصفية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البحث بالتخصص</label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="أدخل اسم التخصص"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">جميع الأقسام</option>
                      {university.departments?.map(department => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">مدة الدراسة</label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {getUniqueDurations().map((duration: { id: string; name: string }) => (
                        <option key={duration.id} value={duration.id}>
                          {duration.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Apply Filter Button */}
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    تطبيق التصفية
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Programs Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">التخصصات المتاحة</h2>
              <p className="text-gray-600">
                إجمالي التخصصات: <span className="font-semibold text-blue-600">{filteredPrograms.length}</span>
              </p>
            </div>

            {/* Programs List */}
            <div className="space-y-6">
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((program) => (
                  <Card key={program.id} className="bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{program.name}</h3>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {program.departmentName}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-6">{program.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">مدة الدراسة</p>
                                <p className="font-medium">{program.duration} سنوات</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm text-gray-500">الرسوم الدراسية</p>
                                <p className="font-medium">{program.tuitionFees.replace('RM', 'USD')} سنوياً</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Calendar className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-sm text-gray-500">أشهر القبول</p>
                                <p className="font-medium">{program.intakeMonths}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 md:mt-0 md:mr-6 flex flex-col justify-between">
                          <Button 
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white mb-3"
                            onClick={() => setShowApplicationForm({
                              programId: program.id,
                              programName: program.name
                            })}
                          >
                            <BookOpen className="ml-2 h-5 w-5" />
                            التقديم الآن
                          </Button>
                          <Link href={`/programs/${program.id}`}>
                            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                              معرفة المزيد
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">لم نجد أي تخصصات</h3>
                  <p className="text-gray-500 mb-8">جرب تعديل معايير البحث أو إعادة تعيين التصفية</p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedDepartment('all')
                      setSelectedDuration('all')
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    إعادة تعيين التصفية
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">هل تحتاج إلى مساعدة في الاختيار؟</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              تواصل مع فريق الخبراء لدينا للحصول على استشارة مجانية ومساعدتك في اختيار التخصص المناسب
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
              >
                <GraduationCap className="ml-2 h-5 w-5" />
                طلب استشارة مجانية
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-blue-600 hover:bg-white transform hover:scale-105 transition-all duration-200"
              >
                تحدث مع خبير
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {showApplicationForm && (
        <ApplicationForm 
          universityId={parseInt(universityId as string)} 
          programId={showApplicationForm.programId}
          programName={showApplicationForm.programName}
          onClose={() => setShowApplicationForm(false)} 
        />
      )}
    </div>
  )
}
