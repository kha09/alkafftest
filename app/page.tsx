"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  FileText,
  CreditCard,
  Star,
  Globe,
  BookOpen,
  UserCheck,
  MessageCircle,
  Instagram,
  Mail,
  Phone,
  ChevronDown,
  Search,
  ArrowRight,
  Shield,
  Zap,
  Heart,
  Award,
  MapPin,
  TrendingUp,
  Crown,
  ThumbsUp,
  ThumbsDown,
  Play,
  Quote,
  X,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  MessageSquare,
  Filter,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { HomePageContent } from "@/lib/types"
import { ApplicationForm } from "@/components/application-form"

// Create a mapping from icon names to icon components
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  FileText,
  CreditCard,
  Star,
  Globe,
  BookOpen,
  UserCheck,
  MessageCircle,
  Instagram,
  Mail,
  Phone,
  ChevronDown,
  Search,
  ArrowRight,
  Shield,
  Zap,
  Heart,
  Award,
  MapPin,
  TrendingUp,
  Crown,
  ThumbsUp,
  ThumbsDown,
  Play,
  Quote,
  X,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  MessageSquare,
  Filter,
}

export default function LandingPage() {
  const { language, t } = useLanguage()
  const [content, setContent] = useState<HomePageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentUniversity, setCurrentUniversity] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredUniversity, setHoveredUniversity] = useState<number | null>(null)
  const [activeTestimonialFilter, setActiveTestimonialFilter] = useState("all")
  const [activeFaqCategory, setActiveFaqCategory] = useState("all")
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([1])
  const [searchQuery, setSearchQuery] = useState("")
  const [helpfulFaqs, setHelpfulFaqs] = useState<Record<number, boolean | null>>({})
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const testimonialRef = useRef<HTMLDivElement>(null)

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/homepage?lang=${language}`)
        if (!response.ok) throw new Error('Failed to fetch content')
        const data: HomePageContent = await response.json()
        setContent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [language])

  // Filter testimonials based on active filter
  const filteredTestimonials = content?.testimonials.filter(
    (testimonial) => activeTestimonialFilter === "all" || testimonial.category === activeTestimonialFilter,
  ) || []

  // Filter FAQs based on active category and search query
  const filteredFaqs = content?.faqs.filter(
    (faq) =>
      (activeFaqCategory === "all" || faq.category === activeFaqCategory) &&
      (searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())),
  ) || []

  const faqCategories = [
    { id: "all", name: t('faq.category.all') },
    { id: "application", name: t('faq.category.application') },
    { id: "payment", name: t('faq.category.payment') },
    { id: "universities", name: t('faq.category.universities') },
    { id: "agents", name: t('faq.category.agents') },
  ]

  useEffect(() => {
    if (!content) return
    
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % content.heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [content])

  useEffect(() => {
    if (!content) return
    
    const universityInterval = setInterval(() => {
      if (hoveredUniversity === null) {
        setCurrentUniversity((prev) => (prev + 1) % content.universities.length)
      }
    }, 4000)
    return () => clearInterval(universityInterval)
  }, [hoveredUniversity, content])

  useEffect(() => {
    if (!content) return
    
    const testimonialInterval = setInterval(() => {
      if (!isDragging && !isVideoPlaying) {
        setCurrentTestimonial((prev) => (prev + 1) % filteredTestimonials.length)
      }
    }, 6000)
    return () => clearInterval(testimonialInterval)
  }, [filteredTestimonials.length, isDragging, isVideoPlaying])

  const nextSlide = () => {
    if (!content) return
    setCurrentSlide((prev) => (prev + 1) % content.heroSlides.length)
  }

  const prevSlide = () => {
    if (!content) return
    setCurrentSlide((prev) => (prev - 1 + content.heroSlides.length) % content.heroSlides.length)
  }

  const nextUniversity = () => {
    if (!content) return
    setCurrentUniversity((prev) => (prev + 1) % content.universities.length)
  }

  const prevUniversity = () => {
    if (!content) return
    setCurrentUniversity((prev) => (prev - 1 + content.universities.length) % content.universities.length)
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % filteredTestimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length)
  }

  const toggleFaq = (id: number) => {
    setExpandedFaqs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((faqId) => faqId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const markFaqHelpful = (id: number, isHelpful: boolean) => {
    setHelpfulFaqs((prev) => ({
      ...prev,
      [id]: isHelpful,
    }))
  }

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    if ("touches" in e) {
      setDragStartX(e.touches[0].clientX)
    } else {
      setDragStartX(e.clientX)
    }
  }

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return

    let currentX: number
    if ("touches" in e) {
      currentX = e.touches[0].clientX
    } else {
      currentX = e.clientX
    }

    const diff = dragStartX - currentX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextTestimonial()
      } else {
        prevTestimonial()
      }
      setIsDragging(false)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>
  }

  if (!content) {
    return <div className="min-h-screen flex items-center justify-center">No content available</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40" dir="rtl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2" dir="rtl">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SM Alkaff
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8 space-x-reverse" dir="rtl">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.home')}
              </Link>
              <Link href="/universities" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.universities')}
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.about')}
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.contact')}
              </Link>
            </nav>

            <div className="flex items-center space-x-4" dir="rtl">
              <LanguageSwitcher />
              <Button variant="outline" className="hidden md:inline-flex">
                {t('nav.login')}
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {t('nav.start')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          {content.heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 transform translate-x-0"
                  : index < currentSlide
                    ? "opacity-0 transform -translate-x-full"
                    : "opacity-0 transform translate-x-full"
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80 z-10`} />
              <Image
                src={slide.image || "/placeholder.svg"}
                alt="Hero background"
                fill
                className="object-cover object-center"
                priority={index === 0}
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="container mx-auto px-4 text-center text-white">
                  <div
                    className={`transform transition-all duration-1000 delay-300 ${
                      index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                    }`}
                  >
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">{slide.title}</h1>
                    <p className="text-xl md:text-2xl mb-4 text-blue-100 drop-shadow-md">{slide.subtitle}</p>
                    <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-100 drop-shadow-md">
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
                      >
                        <GraduationCap className="mr-2 h-5 w-5" />
                        {t('hero.browse')}
                      </Button>
                      <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
                        onClick={() => setShowApplicationForm(true)}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        {t('hero.apply')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110 z-30"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110 z-30"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        {/*
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {content.heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
        */}
      </section>

      {/* Search Section */}
      <section className="relative -mt-20 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('search.title')}</h2>
              <p className="text-slate-300">{t('search.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Search Button - Now first (leftmost) */}
              <div className="space-y-2 md:order-1">
                <label className="text-sm font-medium text-transparent block">{t('common.search')}</label>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-3"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t('search.button')}
                </Button>
              </div>

              {/* Degree Level Dropdown - Now second */}
              <div className="space-y-2 md:order-2">
                <label className="text-sm font-medium text-slate-300 block text-right">{t('search.degree')}</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
                  <select className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-white/15 transition-all duration-200 pl-10">
                    <option value="" className="bg-slate-800 text-white">
                      {t('search.degree.placeholder')}
                    </option>
                    <option value="bachelor" className="bg-slate-800 text-white">
                      {t('search.degree.bachelor')}
                    </option>
                    <option value="master" className="bg-slate-800 text-white">
                      {t('search.degree.master')}
                    </option>
                    <option value="phd" className="bg-slate-800 text-white">
                      {t('search.degree.phd')}
                    </option>
                    <option value="diploma" className="bg-slate-800 text-white">
                      {t('search.degree.diploma')}
                    </option>
                  </select>
                </div>
              </div>

              {/* Country Dropdown - Now third */}
              <div className="space-y-2 md:order-3">
                <label className="text-sm font-medium text-slate-300 block text-right">{t('search.country')}</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
                  <select className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-white/15 transition-all duration-200 pl-10">
                    <option value="" className="bg-slate-800 text-white">
                      {t('search.country.placeholder')}
                    </option>
                    <option value="usa" className="bg-slate-800 text-white">
                      {t('search.country.usa')}
                    </option>
                    <option value="uk" className="bg-slate-800 text-white">
                      {t('search.country.uk')}
                    </option>
                    <option value="canada" className="bg-slate-800 text-white">
                      {t('search.country.canada')}
                    </option>
                    <option value="australia" className="bg-slate-800 text-white">
                      {t('search.country.australia')}
                    </option>
                    <option value="germany" className="bg-slate-800 text-white">
                      {t('search.country.germany')}
                    </option>
                    <option value="france" className="bg-slate-800 text-white">
                      {t('search.country.france')}
                    </option>
                  </select>
                </div>
              </div>

              {/* Specialization Dropdown - Now fourth (rightmost) */}
              <div className="space-y-2 md:order-4">
                <label className="text-sm font-medium text-slate-300 block text-right">{t('search.specialization')}</label>
                <div className="relative">
                  <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
                  <select className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:bg-white/15 transition-all duration-200 pl-10">
                    <option value="" className="bg-slate-800 text-white">
                      {t('search.specialization.placeholder')}
                    </option>
                    <option value="engineering" className="bg-slate-800 text-white">
                      {t('search.specialization.engineering')}
                    </option>
                    <option value="medicine" className="bg-slate-800 text-white">
                      {t('search.specialization.medicine')}
                    </option>
                    <option value="business" className="bg-slate-800 text-white">
                      {t('search.specialization.business')}
                    </option>
                    <option value="computer-science" className="bg-slate-800 text-white">
                      {t('search.specialization.computer')}
                    </option>
                    <option value="law" className="bg-slate-800 text-white">
                      {t('search.specialization.law')}
                    </option>
                    <option value="arts" className="bg-slate-800 text-white">
                      {t('search.specialization.arts')}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-slate-400 mb-3 text-right">{t('search.quick')}</p>
              <div className="flex flex-wrap gap-2 justify-end">
                {[
                  t('search.tag.medicine.usa'),
                  t('search.tag.engineering.canada'),
                  t('search.tag.business.uk'),
                  t('search.tag.computer.australia'),
                  t('search.tag.master.germany'),
                ].map((tag, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-sm rounded-full border border-white/20 hover:border-white/30 transition-all duration-200 hover:scale-105"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Partnerships - Modern Interactive */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <Crown className="h-4 w-4" />
              <span>{t('universities.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('universities.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t('universities.description')}
            </p>
          </div>

          {/* Interactive University Showcase */}
          <div className="relative">
            {/* Main University Display */}
            <div className="mb-12">
              <Card className="group bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${content.universities?.[currentUniversity]?.color || 'from-blue-500 to-purple-500'} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                    ></div>

                    <div className="relative z-10 p-12">
                      <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* University Info */}
                        <div className="text-center lg:text-right">
                          <div className="flex items-center justify-center lg:justify-end space-x-4 mb-6">
                            <div className="text-4xl">{content.universities?.[currentUniversity]?.flag || '🏛️'}</div>
                            <div
                              className={`bg-gradient-to-r ${content.universities?.[currentUniversity]?.color || 'from-blue-500 to-purple-500'} text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2`}
                            >
                              <Award className="h-4 w-4" />
                              <span>{content.universities?.[currentUniversity]?.ranking ? t('universities.ranking', content.universities[currentUniversity].ranking).replace('{ranking}', content.universities[currentUniversity].ranking) : 'Top Ranked'}</span>
                            </div>
                          </div>

                          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                            {content.universities?.[currentUniversity]?.name || 'Loading...'}
                          </h3>

                          <div className="flex items-center justify-center lg:justify-end space-x-2 mb-6">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <span className="text-xl text-gray-600">{content.universities?.[currentUniversity]?.country || 'Loading...'}</span>
                          </div>

                          {/* Statistics Grid */}
                          <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                              <div className="text-3xl font-bold text-gray-900 mb-2">
                                {content.universities?.[currentUniversity]?.students || '0'}
                              </div>
                              <div className="text-gray-600 text-sm">{t('universities.students')}</div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                              <div className="text-3xl font-bold text-gray-900 mb-2">
                                {content.universities?.[currentUniversity]?.programs || '0'}
                              </div>
                              <div className="text-gray-600 text-sm">{t('universities.programs')}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center lg:justify-end space-x-4">
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                              {content.universities?.[currentUniversity]?.acceptance ? t('universities.acceptance', content.universities[currentUniversity].acceptance).replace('{acceptance}', content.universities[currentUniversity].acceptance) : '95% Acceptance'}
                            </div>
                            <Button
                              className={`bg-gradient-to-r ${content.universities?.[currentUniversity]?.color || 'from-blue-500 to-purple-500'} hover:scale-105 transition-all duration-200 text-white border-0`}
                            >
                              {t('universities.explore')}
                            </Button>
                          </div>
                        </div>

                        {/* University Logo & Visual */}
                        <div className="relative">
                          <div className="relative group-hover:scale-105 transition-transform duration-500">
                            {/* Glow Effect */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${content.universities?.[currentUniversity]?.color || 'from-blue-500 to-purple-500'} opacity-20 blur-3xl rounded-full scale-150 group-hover:opacity-40 transition-opacity duration-500`}
                            ></div>

                            {/* Logo Container */}
                            <div className="relative bg-white rounded-3xl p-12 shadow-2xl border border-white/20">
                              <Image
                                src={content.universities?.[currentUniversity]?.logo || "/placeholder.svg"}
                                alt={content.universities?.[currentUniversity]?.name || 'University'}
                                width={200}
                                height={200}
                                className="mx-auto rounded-2xl group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>

                    {/* Floating Stats */}
                    <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 animate-float">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-bold text-gray-900">{t('homepage.available')}</span>
                      </div>
                    </div>

                    <div
                      className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 animate-float"
                      style={{ animationDelay: "1s" }}
                    >
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-bold text-gray-900">{t('homepage.rating')}</span>
                      </div>
                    </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* University Navigation */}
            <div className="relative">
              {/* Navigation Controls */}
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={prevUniversity}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full p-4 transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={nextUniversity}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full p-4 transition-all duration-200 hover:scale-110 shadow-lg"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* University Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {content.universities.map((university, index) => (
                  <div
                    key={index}
                    className={`group cursor-pointer transition-all duration-300 ${
                      index === currentUniversity ? "scale-110" : "hover:scale-105"
                    }`}
                    onClick={() => setCurrentUniversity(index)}
                    onMouseEnter={() => setHoveredUniversity(index)}
                    onMouseLeave={() => setHoveredUniversity(null)}
                  >
                    <Card
                      className={`bg-white/80 backdrop-blur-sm border-2 transition-all duration-300 overflow-hidden ${
                        index === currentUniversity
                          ? `border-transparent bg-gradient-to-r ${university.color} text-white shadow-2xl`
                          : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                      }`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="relative mb-4">
                          <Image
                            src={university.logo || "/placeholder.svg"}
                            alt={university.name}
                            width={60}
                            height={60}
                            className="mx-auto rounded-full group-hover:scale-110 transition-transform duration-300"
                          />
                          {index === currentUniversity && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
                              <Crown className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <h4
                          className={`font-bold text-sm mb-2 ${
                            index === currentUniversity ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {university.name}
                        </h4>
                        <p className={`text-xs ${index === currentUniversity ? "text-white/80" : "text-gray-600"}`}>
                          {university.country}
                        </p>
                        <div
                          className={`text-xs font-medium mt-2 ${
                            index === currentUniversity ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {university.ranking}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Partnership Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "500+", label: t('universities.stats.partners'), icon: Globe, color: "from-blue-500 to-cyan-500" },
                { number: "50+", label: t('universities.stats.countries'), icon: MapPin, color: "from-green-500 to-emerald-500" },
                { number: "1000+", label: t('universities.stats.programs'), icon: BookOpen, color: "from-purple-500 to-pink-500" },
                { number: "95%", label: t('universities.stats.acceptance'), icon: Award, color: "from-orange-500 to-red-500" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg">
              <span className="text-gray-700 font-medium">{t('homepage.discover.all')}</span>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-full px-6 py-2 transform hover:scale-105 transition-all duration-200">
                {t('homepage.browse.universities')}
              </Button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Value Proposition - Modern Interactive */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute bottom-1/3 right-1/3 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {content.whySMAlkaff?.title || "لماذا SM Alkaff؟"}
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {content.whySMAlkaff?.description || "نحن نجعل رحلة التقديم الجامعي أسهل وأكثر فعالية من خلال منصتنا المتطورة والمبتكرة"}
            </p>
          </div>

          {/* Interactive Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" dir="rtl">
            {content.whySMAlkaff?.features.map((feature, index) => (
              <div
                key={index}
                className={`group relative animate-fade-in-up`}
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                {/* Feature Card */}
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:bg-white/15 cursor-pointer h-full">
                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500 blur-xl`}
                  ></div>

                  {/* Stats Badge */}
                  <div
                    className={`absolute -top-4 -left-4 bg-gradient-to-r ${feature.color} rounded-2xl px-4 py-2 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="text-white text-sm font-bold">{feature.stats}</div>
                    <div className="text-white/80 text-xs">{feature.statsLabel}</div>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}
                  >
                    {feature.icon && iconMap[feature.icon] 
                      ? React.createElement(iconMap[feature.icon], { className: "h-10 w-10 text-white" })
                      : React.createElement(GraduationCap, { className: "h-10 w-10 text-white" })
                    }
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-blue-300 text-sm mb-4 font-medium">{feature.subtitle}</p>
                    <p className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Interactive Elements */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.color} opacity-20 blur-sm`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "5000+", label: "طالب راضٍ", icon: Heart },
              { number: "500+", label: "جامعة شريكة", icon: Globe },
              { number: "50+", label: "دولة متاحة", icon: Users },
              { number: "99.9%", label: "مع دل النجاح", icon: Star },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${800 + index * 100}ms` }}
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                  <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
              <span className="text-white font-medium">اكتشف الفرق بنفسك</span>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-full px-6 py-2 transform hover:scale-105 transition-all duration-200">
                جرب المنصة مجاناً
              </Button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* How It Works - Modern Interactive with University Background */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements - Same as University Section */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating Elements - Same as University Section */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <Zap className="h-4 w-4" />
              <span>عملية بسيطة ومتطورة</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {content.howItWorks?.title || "كيف تعمل المنصة؟"}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {content.howItWorks?.description || "رحلة تفاعلية بسيطة تقودك إلى حلمك الجامعي خطوة بخطوة - من التسجيل إلى القبول"}
            </p>
          </div>

          {/* Interactive Steps */}
          <div className="relative">
            {/* Connection Lines - RTL */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-l from-blue-500 via-purple-500 to-teal-500 transform -translate-y-1/2 opacity-20"></div>

            <div className="grid lg:grid-cols-5 gap-8 relative" dir="rtl">
              {content.howItWorks?.steps.map((step, index) => (
                <div
                  key={index}
                  className={`group relative animate-fade-in-up`}
                  style={{ animationDelay: `${step.delay}ms` }}
                >
                  {/* Step Card */}
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:bg-white/90 cursor-pointer shadow-lg hover:shadow-2xl">
                    {/* Glow Effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}
                    ></div>

                    {/* Step Number */}
                    <div
                      className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}
                    >
                      {step.icon && iconMap[step.icon] 
                        ? React.createElement(iconMap[step.icon], { className: "h-10 w-10 text-white" })
                        : React.createElement(GraduationCap, { className: "h-10 w-10 text-white" })
                      }
                    </div>

                    {/* Content */}
                    <div className="text-center relative z-10">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                        {step.title}
                      </h3>
                      <p className="text-blue-600 text-sm mb-4 font-medium">{step.subtitle}</p>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                        {step.description}
                      </p>
                    </div>

                    {/* Interactive Elements */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                    </div>

                    {/* Hover Border Effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div
                        className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${step.color} opacity-5 blur-sm`}
                      ></div>
                    </div>
                  </div>

                  {/* Connection Arrow for Desktop - RTL */}
                  {index < 4 && (
                    <div className="hidden lg:block absolute top-1/2 -left-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <ArrowRight className="h-4 w-4 text-white transform rotate-180" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Process Statistics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "3", label: "دقائق للتسجيل", icon: Users, color: "from-blue-500 to-cyan-500" },
              { number: "24", label: "ساعة للمراجعة", icon: FileText, color: "from-green-500 to-emerald-500" },
              { number: "7", label: "أيام للقبول", icon: Award, color: "from-purple-500 to-pink-500" },
              { number: "100%", label: "أمان مضمون", icon: Shield, color: "from-orange-500 to-red-500" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${1000 + index * 100}ms` }}
              >
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-lg rounded-full px-8 py-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg">
              <span className="text-gray-700 font-medium">جاهز للبدء؟</span>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 rounded-full px-6 py-2 transform hover:scale-105 transition-all duration-200">
                ابدأ رحلتك الآن
              </Button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* Targeted CTAs - Modern Interactive */}
      {false && (
        <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <Users className="h-4 w-4" />
              <span>انضم إلينا اليوم</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              اختر المسار المناسب لك
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              سواء كنت طالباً تبحث عن فرصتك الأكاديمية أو وكيلاً ترغب في مساعدة الطلاب، لدينا ما يناسبك
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Students - Interactive Card */}
            <div className="group relative perspective-1000">
              <div className="relative h-full transition-all duration-500 preserve-3d group-hover:rotate-y-5 group-hover:translate-z-10">
                {/* Card Front */}
                <div className="relative h-full bg-white/80 backdrop-blur-lg rounded-3xl p-0 border border-white/20 shadow-xl overflow-hidden">
                  {/* Background Elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-700 delay-100"></div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="relative p-12 h-full flex flex-col">
                    <div className="flex-1">
                      {/* Icon Container */}
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl transform scale-150 group-hover:scale-200 transition-transform duration-700"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                          <GraduationCap className="h-12 w-12 text-white" />
                        </div>
                      </div>

                      <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                        للطلاب
                      </h3>

                      <p className="text-xl mb-6 text-gray-600 max-w-md mx-auto">
                        تقديمك يبدأ هنا — استكشف الجامعات العالمية بنقرة واحدة
                      </p>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                          { icon: Globe, text: "500+ جامعة عالمية" },
                          { icon: BookOpen, text: "1000+ تخصص دراسي" },
                          { icon: Shield, text: "تقديم آمن ومضمون" },
                          { icon: Zap, text: "قبول سريع خلال أيام" },
                        ].map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 hover:scale-105"
                          >
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-2 shadow-sm">
                              <feature.icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300">
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          5000+
                        </div>
                        <div className="text-xs text-gray-500">طالب مسجل</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          95%
                        </div>
                        <div className="text-xs text-gray-500">معدل القبول</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          7
                        </div>
                        <div className="text-xs text-gray-500">أيام للقبول</div>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group-hover:animate-pulse"
                    >
                      سجّل كطالب
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hover Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                ابدأ مجاناً
              </div>
            </div>

            {/* For Agents - Interactive Card */}
            <div className="group relative perspective-1000">
              <div className="relative h-full transition-all duration-500 preserve-3d group-hover:rotate-y-5 group-hover:translate-z-10">
                {/* Card Front */}
                <div className="relative h-full bg-white/80 backdrop-blur-lg rounded-3xl p-0 border border-white/20 shadow-xl overflow-hidden">
                  {/* Background Elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-700 delay-100"></div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-float"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="relative p-12 h-full flex flex-col">
                    <div className="flex-1">
                      {/* Icon Container */}
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-xl transform scale-150 group-hover:scale-200 transition-transform duration-700"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                          <Users className="h-12 w-12 text-white" />
                        </div>
                      </div>

                      <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                        للوكلاء
                      </h3>

                      <p className="text-xl mb-6 text-gray-600 max-w-md mx-auto">
                        هل أنت وكيل؟ قم بمساعدة الطلاب واحصل على عمولات مجزية
                      </p>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                          { icon: CreditCard, text: "عمولات مجزية" },
                          { icon: UserCheck, text: "دعم فني متكامل" },
                          { icon: Globe, text: "عملاء من 50+ دولة" },
                          { icon: Award, text: "شهادة وكيل معتمد" },
                        ].map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-300 hover:scale-105"
                          >
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-2 shadow-sm">
                              <feature.icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300">
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          200+
                        </div>
                        <div className="text-xs text-gray-500">وكيل معتمد</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          15%
                        </div>
                        <div className="text-xs text-gray-500">نسبة العمولة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          24/7
                        </div>
                        <div className="text-xs text-gray-500">دعم فني</div>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group-hover:animate-pulse"
                    >
                      انضم كوكيل
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Hover Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                عمولات مجزية
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .rotate-y-5 {
          transform: rotateY(5deg);
        }

        .translate-z-10 {
          transform: translateZ(10px);
        }
      `}</style>
        </section>
      )}

      {/* Testimonials Carousel - Modern Interactive */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-300"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <MessageSquare className="h-4 w-4" />
              <span>تجارب حقيقية</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              شهادات وتجارب
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              استمع إلى قصص نجاح طلابنا وتجاربهم مع منصتنا من مختلف أنحاء العالم
            </p>
          </div>

          {/* Testimonial Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveTestimonialFilter("all")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTestimonialFilter === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              جميع الشهادات
            </button>
            <button
              onClick={() => setActiveTestimonialFilter("بكالوريوس")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTestimonialFilter === "بكالوريوس"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              البكالوريوس
            </button>
            <button
              onClick={() => setActiveTestimonialFilter("ماجستير")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTestimonialFilter === "ماجستير"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              الماجستير
            </button>
            <button
              onClick={() => setActiveTestimonialFilter("دكتوراه")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTestimonialFilter === "دكتوراه"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              الدكتوراه
            </button>
          </div>

          {/* Interactive Testimonial Carousel */}
          <div className="relative max-w-5xl mx-auto">
            {/* Video Modal */}
            {isVideoPlaying && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="relative w-full max-w-4xl mx-4">
                  <button
                    onClick={() => setIsVideoPlaying(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                  >
                    <X className="h-8 w-8" />
                  </button>
                  <div className="bg-black rounded-xl overflow-hidden aspect-video">
                    {/* This would be a real video in production */}
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                      <p className="text-white text-xl">فيديو الشهادة</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Testimonial Display */}
            <div
              className="overflow-hidden touch-none"
              ref={testimonialRef}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {filteredTestimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <Card className="bg-white/10 backdrop-blur-lg border-0 shadow-2xl overflow-hidden rounded-3xl group-hover:shadow-blue-500/20 transition-all duration-500">
                        <CardContent className="p-0">
                          <div className="grid md:grid-cols-2">
                            {/* Testimonial Content */}
                            <div className="p-8 md:p-10 flex flex-col h-full">
                              {/* Quote Icon */}
                              <div className="mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
                                  <Quote className="h-6 w-6 text-blue-400" />
                                </div>
                              </div>

                              {/* Rating */}
                              <div className="flex mb-6">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`}
                                  />
                                ))}
                              </div>

                              {/* Testimonial Text */}
                              <p className="text-gray-200 text-lg leading-relaxed mb-8 flex-grow">
                                "{testimonial.text}"
                              </p>

                              {/* Student Info */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-md transform scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <Image
                                      src={testimonial.avatar || "/placeholder.svg"}
                                      alt={testimonial.name}
                                      width={60}
                                      height={60}
                                      className="rounded-full border-2 border-white/20 group-hover:border-blue-400/50 transition-all duration-500"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                                    <p className="text-gray-400 text-sm">{testimonial.program}</p>
                                  </div>
                                </div>

                                {/* University Badge */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300 flex items-center space-x-2">
                                  <span>{testimonial.flag}</span>
                                  <span>{testimonial.university}</span>
                                </div>
                              </div>

                              {/* Date Badge */}
                              <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-300">
                                {testimonial.date}
                              </div>
                            </div>

                            {/* Visual Side */}
                            <div className="relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center p-10">
                              {/* Background Elements */}
                              <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                              </div>

                              {/* Content */}
                              <div className="relative z-10 text-center">
                                {testimonial.hasVideo ? (
                                  <div
                                    className="relative group/video cursor-pointer"
                                    onClick={() => setIsVideoPlaying(true)}
                                  >
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 group-hover/video:border-blue-400/50 transition-all duration-300">
                                      <Image
                                        src={testimonial.avatar || "/placeholder.svg"}
                                        alt={`${testimonial.name} video`}
                                        width={240}
                                        height={240}
                                        className="rounded-2xl object-cover w-full h-64"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    </div>

                                    {/* Play Button */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover/video:scale-110 transition-transform duration-300">
                                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                        <Play className="h-6 w-6 text-white" />
                                      </div>
                                    </div>

                                    <p className="mt-4 text-white text-sm">شاهد الشهادة كاملة</p>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl transform scale-150"></div>
                                    <Image
                                      src={testimonial.avatar || "/placeholder.svg"}
                                      alt={testimonial.name}
                                      width={200}
                                      height={200}
                                      className="rounded-full border-4 border-white/20 mx-auto"
                                    />

                                    {/* University Logo */}
                                    <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                                      <div className="text-2xl">{testimonial.flag}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Featured Badge */}
                                {testimonial.featured && (
                                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-1 rounded-br-2xl rounded-tl-2xl text-sm font-bold shadow-lg">
                                    <Crown className="h-4 w-4 inline-block mr-1" />
                                    قصة نجاح مميزة
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center mt-10 space-x-4">
              <button
                onClick={prevTestimonial}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>

              {/* Indicators */}
              <div className="flex space-x-2">
                {filteredTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 w-8"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Swipe Indicator */}
            <div className="text-center mt-6 text-gray-400 text-sm flex items-center justify-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>اسحب للتنقل بين الشهادات</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </section>

      {/* FAQ - Modern Interactive */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 6}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in-up">
              <HelpCircle className="h-4 w-4" />
              <span>نحن هنا للمساعدة</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              الأسئلة الشائعة
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              إجابات على أكثر الأسئلة شيوعاً حول خدماتنا وعملية التقديم
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative w-full md:w-2/3">
                <input
                  type="text"
                  placeholder="ابحث عن سؤال..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-5 py-3 pl-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Category Filter */}
              <div className="relative w-full md:w-1/3">
                <div className="relative">
                  <select
                    value={activeFaqCategory}
                    onChange={(e) => setActiveFaqCategory(e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-5 py-3 text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {faqCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Popular Questions */}
          {searchQuery === "" && activeFaqCategory === "all" && (
            <div className="max-w-4xl mx-auto mb-12">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                الأسئلة الأكثر شيوعاً
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {content.faqs
                  .filter((faq) => faq.popular)
                  .map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => {
                        toggleFaq(faq.id)
                        setActiveFaqCategory(faq.category)
                      }}
                      className="text-right bg-white/70 backdrop-blur-sm hover:bg-white/90 border border-gray-200 rounded-xl px-6 py-4 text-gray-700 hover:shadow-md transition-all duration-200 hover:scale-102"
                    >
                      <div className="flex items-center justify-between">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`group bg-white/80 backdrop-blur-lg rounded-2xl border transition-all duration-500 overflow-hidden ${
                    expandedFaqs.includes(faq.id)
                      ? "border-blue-200 shadow-lg shadow-blue-100/50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  {/* Question */}
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-right"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        expandedFaqs.includes(faq.id)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 rotate-180"
                          : "bg-gray-100 group-hover:bg-blue-50"
                      }`}
                    >
                      {expandedFaqs.includes(faq.id) ? (
                        <MinusCircle
                          className={`h-5 w-5 ${expandedFaqs.includes(faq.id) ? "text-white" : "text-gray-400"}`}
                        />
                      ) : (
                        <PlusCircle
                          className={`h-5 w-5 ${expandedFaqs.includes(faq.id) ? "text-white" : "text-gray-400"}`}
                        />
                      )}
                    </div>
                    <h3
                      className={`text-lg font-semibold ${expandedFaqs.includes(faq.id) ? "text-blue-700" : "text-gray-900"} flex-1 mr-4`}
                    >
                      {faq.question}
                    </h3>
                    {faq.popular && (
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium mr-4">
                        شائع
                      </div>
                    )}
                  </button>

                  {/* Answer */}
                  <div
                    className={`transition-all duration-500 ease-in-out ${
                      expandedFaqs.includes(faq.id) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-500">
                        <p className="text-gray-700 leading-relaxed text-right">{faq.answer}</p>

                        {/* Helpful Feedback */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">هل كانت هذه الإجابة مفيدة؟</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => markFaqHelpful(faq.id, true)}
                                  className={`p-2 rounded-full transition-all duration-200 ${
                                    helpfulFaqs[faq.id] === true
                                      ? "bg-green-100 text-green-600"
                                      : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500"
                                  }`}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => markFaqHelpful(faq.id, false)}
                                  className={`p-2 rounded-full transition-all duration-200 ${
                                    helpfulFaqs[faq.id] === false
                                      ? "bg-red-100 text-red-600"
                                      : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                  }`}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {helpfulFaqs[faq.id] !== undefined && (
                              <div className="text-sm text-gray-500">
                                {helpfulFaqs[faq.id] ? "شكراً لك!" : "سنحسن إجابتنا"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">لم نجد أي نتائج</h3>
                <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تصفح الفئات المختلفة</p>
              </div>
            )}
          </div>

          {/* Still Have Questions */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">لا تزال لديك أسئلة؟</h3>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  فريق الدعم لدينا متاح على مدار الساعة للإجابة على جميع استفساراتك ومساعدتك في رحلتك التعليمية
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    دردشة مباشرة
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-blue-600 hover:bg-white transform hover:scale-105 transition-all duration-200"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    راسلنا
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .hover\\:scale-102:hover {
            transform: scale(1.02);
          }
        `}</style>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">SM Alkaff</span>
              </div>
              <p className="text-gray-400 leading-relaxed">{t('footer.description')}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">{t('footer.quick.links')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('nav.universities')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('nav.universities')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('nav.about')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">{t('footer.support')}</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.help.center')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.terms')}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">{t('footer.contact')}</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">+966 50 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400">info@smalkaff.com</span>
                </div>
                <div className="flex space-x-4 mt-6">
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform"
                  >
                    <Instagram className="h-6 w-6" />
                  </Link>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform"
                  >
                    <Mail className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
      
      {showApplicationForm && (
        <ApplicationForm 
          onClose={() => setShowApplicationForm(false)} 
        />
      )}
    </div>
  )
}
