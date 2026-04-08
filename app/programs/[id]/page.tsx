'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  Calendar, 
  ArrowLeft,
  GraduationCap,
  MapPin,
  Star,
  Users,
  Award,
  CheckCircle,
  Copy,
  FileText,
  User,
  Globe,
  Book,
  CreditCard
} from 'lucide-react'
import Image from 'next/image'

import { Program, Department, University } from '@/lib/types'
import { ApplicationForm } from '@/components/application-form'
import { ContactFormDialog } from '@/components/contact-form-dialog'

export default function ProgramDetailPage() {
  const params = useParams()
  const programId = params.id
  const { language, t, isRTL } = useLanguage()
  
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState<{ programId: number; programName: string } | false>(false)
  const [showContactForm, setShowContactForm] = useState(false)
  
  // Parse fee data
  const yearlyFees = program?.yearlyTuitionFees ? JSON.parse(program.yearlyTuitionFees) : []
  const otherFees = program?.otherFees ? JSON.parse(program.otherFees) : []

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({ language }).toString()
        const response = await fetch(`/api/programs/${programId}?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch program details')
        }
        
        const data = await response.json()
        setProgram(data)
      } catch (err) {
        setError('Failed to load program details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (programId) {
      fetchProgram()
    }
  }, [programId, language])

  const handleCopy = () => {
    if (program) {
      // Format intake months
      const intakeMonths = program.intakeMonths.split(',').map(month => {
        const monthMap: Record<string, string> = {
          'January': 'يناير',
          'February': 'فبراير',
          'March': 'مارس',
          'April': 'أبريل',
          'May': 'مايو',
          'June': 'يونيو',
          'July': 'يوليو',
          'August': 'أغسطس',
          'September': 'سبتمبر',
          'October': 'أكتوبر',
          'November': 'نوفمبر',
          'December': 'ديسمبر'
        };
        return monthMap[month.trim()] || month.trim();
      }).join(',');

      // Parse fee data
      const yearlyFees = program.yearlyTuitionFees ? JSON.parse(program.yearlyTuitionFees) : [];
      const otherFees = program.otherFees ? JSON.parse(program.otherFees) : [];

      // Construct the formatted text
      let copyText = `${program.department?.university?.name || ''}\n`;
      copyText += `${program.name}\n\n`;
      copyText += `Duration: ${program.duration} year(s)\n`;
      copyText += `English requirement: ${program.englishRequirement}\n\n`;
      copyText += `Intake: ${intakeMonths}\n\n`;
      copyText += `Course fee for international students\n\n`;
      copyText += `Yearly Tuition fees\n\n`;
      
      yearlyFees.forEach((fee: { year: string; fee: string }) => {
        copyText += `${fee.year}: ${fee.fee}\n`;
      });
      
      copyText += `\nOther fees\n\n`;
      
      otherFees.forEach((fee: { description: string; fee: string }) => {
        copyText += ` ${fee.description}: ${fee.fee}\n`;
      });
      
      copyText += `\nMore details visit the link below:\n`;
      copyText += `http://localhost:3001/programs/${program.id}`;

      navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 ${isRTL ? 'dir-rtl text-right' : 'dir-ltr text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 ${isRTL ? 'dir-rtl text-right' : 'dir-ltr text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">{t('program.detail.error.title')}</h3>
            <p className="text-gray-500 mb-8">{error || t('program.detail.error.message')}</p>
            <Link href="/universities">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <ArrowLeft className="ml-2 h-5 w-5" />
                {t('program.detail.error.back')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 ${isRTL ? 'dir-rtl text-right' : 'dir-ltr text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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

            <nav className="hidden md:flex items-center space-x-8 space-x-reverse" dir="rtl">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.home')}
              </Link>
              <Link href="/universities" className="text-blue-600 font-medium">
                {t('nav.universities')}
              </Link>
              {/* <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.about')}
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.contact')}
              </Link> */}
            </nav>

            <div className="flex items-center space-x-4 space-x-reverse">
              <LanguageSwitcher />
              <Link href="/login">
                <Button variant="outline" className="hidden md:inline-flex">
                  {t('nav.login')}
                </Button>
              </Link>
              <Button className="hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {t('nav.start')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/universities/${program.department?.university?.id || '#'}`}>
            <Button variant="outline" className="mb-4" disabled={!program.department?.university}>
              <ArrowLeft className="ml-2 h-4 w-4" />
              {t('program.detail.back.to')} {program.department?.university?.name || t('program.detail.university')}
            </Button>
          </Link>
        </div>

        {/* Program Header */}
        <section className="mb-12">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    {program.name}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mr-2"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </h1>
                  {copied && (
                    <p className="text-sm text-green-600">{t('program.detail.copied')}</p>
                  )}
                  <p className="text-gray-600">{program.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-2 space-x-reverse bg-blue-50 p-4 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t('program.detail.qualification')}</p>
                    <p className="font-medium">{program.qualification}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse bg-green-50 p-4 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t('program.detail.duration')}</p>
                    <p className="font-medium">{program.duration} {t('program.detail.duration.years')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse bg-purple-50 p-4 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t('program.detail.intake')}</p>
                    <p className="font-medium">
                      {program.intakeMonths.split(',').map(month => {
                        const monthMap: Record<string, string> = {
                          'January': t('month.january'),
                          'February': t('month.february'),
                          'March': t('month.march'),
                          'April': t('month.april'),
                          'May': t('month.may'),
                          'June': t('month.june'),
                          'July': t('month.july'),
                          'August': t('month.august'),
                          'September': t('month.september'),
                          'October': t('month.october'),
                          'November': t('month.november'),
                          'December': t('month.december')
                        };
                        return monthMap[month.trim()] || month.trim();
                      }).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse bg-yellow-50 p-4 rounded-lg">
                  <Globe className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t('program.detail.english.requirement')}</p>
                    <p className="font-medium">{program.englishRequirement}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 space-x-reverse bg-gray-100 px-4 py-2 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                  <span>{program.classType}</span>
                </div>
                {program.offerLetter && (
                  <div className="flex items-center space-x-2 space-x-reverse bg-green-100 px-4 py-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t('program.detail.free.offer')}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                  onClick={() => setShowApplicationForm({
                    programId: program.id,
                    programName: program.name
                  })}
                >
                  <BookOpen className="ml-2 h-5 w-5" />
                  {t('program.detail.apply.now')}
                </Button>
                {/* <Button variant="outline">
                  {t('program.detail.consultation')}
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* University Info */}
        <section className="mb-12">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Image
                  src={program.department?.university?.logo || "/placeholder.svg"}
                  alt={program.department?.university?.name || t('program.detail.university')}
                  width={40}
                  height={40}
                  className="rounded-lg ml-2"
                />
                {t('program.detail.university.info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <Image
                    src={program.department?.university?.logo || "/placeholder.svg"}
                    alt={program.department?.university?.name || t('program.detail.university')}
                    width={120}
                    height={120}
                    className="rounded-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full p-2">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="text-center md:text-right flex-1">
                  <h3 className="text-2xl font-bold mb-4">{program.department?.university?.name || t('program.detail.university')}</h3>
                  <p className="text-xl text-blue-600 mb-6">{program.department?.university?.country || ""} {program.department?.university?.flag || ""}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                    <div className="flex items-center space-x-2 space-x-reverse bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                      <MapPin className="h-5 w-5" />
                      <span>{t('program.detail.university.ranking')} {program.department?.university?.ranking || ""}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Users className="h-5 w-5" />
                      <span>{program.department?.university?.students || ""} {t('program.detail.university.students')}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span>{t('program.detail.university.acceptance')} {program.department?.university?.acceptance || ""}</span>
                    </div>
                    {program.department?.university?.freeOfferLetter && (
                      <div className="flex items-center space-x-2 space-x-reverse bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-300" />
                        <span>{t('program.detail.university.free.offer')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Fees Section */}
        <section className="mb-12">
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <CreditCard className="ml-2 h-6 w-6 text-blue-600" />
                {t('program.detail.fees.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Yearly Tuition Fees */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('program.detail.fees.yearly')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 font-semibold text-gray-700">{t('program.detail.fees.year')}</th>
                          <th className="px-4 py-3 font-semibold text-gray-700">{t('program.detail.fees.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyFees.map((fee: { year: string; fee: string }, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 border-b border-gray-200">{fee.year}</td>
                            <td className="px-4 py-3 border-b border-gray-200 font-medium">{fee.fee.replace('MYR', 'USD')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Other Fees */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('program.detail.fees.other')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 font-semibold text-gray-700">{t('program.detail.fees.description')}</th>
                          <th className="px-4 py-3 font-semibold text-gray-700">{t('program.detail.fees.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherFees.map((fee: { description: string; fee: string }, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 border-b border-gray-200">{fee.description}</td>
                            <td className="px-4 py-3 border-b border-gray-200 font-medium">{fee.fee.replace('MYR', 'USD')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0">
            <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('program.detail.cta.title')}</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                {t('program.detail.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
                >
                  <GraduationCap className="ml-2 h-5 w-5" />
                  {t('program.detail.cta.consultation')}
                </Button> */}
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-blue-600 hover:bg-white transform hover:scale-105 transition-all duration-200"
                  onClick={() => setShowContactForm(true)}
                >
                  {t('program.detail.cta.expert')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {showApplicationForm && (
        <ApplicationForm 
          programId={showApplicationForm.programId}
          programName={showApplicationForm.programName}
          onClose={() => setShowApplicationForm(false)} 
        />
      )}
      
      <ContactFormDialog 
        open={showContactForm} 
        onOpenChange={setShowContactForm} 
      />
    </div>
  )
}
