'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  isRTL: boolean
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Basic translations for UI elements
const translations = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.universities': 'الجامعات',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.apply': 'قدم الآن',
    
    // Common UI
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'تم بنجاح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.submit': 'إرسال',
    'common.close': 'إغلاق',
    
    // Language switcher
    'language.switch': 'English',
    'language.current': 'العربية',
    
    // Homepage sections
    'home.hero.title': 'بوابتك للتعليم العالمي',
    'home.hero.subtitle': 'ادرس في الخارج مع SM Alkaff',
    'home.universities.title': 'الجامعات المميزة',
    'home.testimonials.title': 'آراء الطلاب',
    'home.faq.title': 'الأسئلة الشائعة',
    
    // Application form
    'form.title': 'نموذج التقديم',
    'form.fullName': 'الاسم الكامل',
    'form.email': 'البريد الإلكتروني',
    'form.phone': 'رقم الهاتف',
    'form.nationality': 'الجنسية',
    'form.country': 'بلد الإقامة',
    'form.city': 'المدينة',
    'form.program': 'التخصص المفضل',
    'form.submit': 'إرسال الطلب',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.universities': 'Universities',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.apply': 'Apply Now',
    
    // Common UI
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.close': 'Close',
    
    // Language switcher
    'language.switch': 'العربية',
    'language.current': 'English',
    
    // Homepage sections
    'home.hero.title': 'Your Gateway to Global Education',
    'home.hero.subtitle': 'Study Abroad with SM Alkaff',
    'home.universities.title': 'Featured Universities',
    'home.testimonials.title': 'Student Testimonials',
    'home.faq.title': 'Frequently Asked Questions',
    
    // Application form
    'form.title': 'Application Form',
    'form.fullName': 'Full Name',
    'form.email': 'Email Address',
    'form.phone': 'Phone Number',
    'form.nationality': 'Nationality',
    'form.country': 'Country of Residence',
    'form.city': 'City',
    'form.program': 'Preferred Program',
    'form.submit': 'Submit Application',
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<string>('ar')

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    
    // Update document direction and lang attribute
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const isRTL = language === 'ar'

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const langTranslations = translations[language as keyof typeof translations]
    if (langTranslations && langTranslations[key as keyof typeof langTranslations]) {
      return langTranslations[key as keyof typeof langTranslations]
    }
    return fallback || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRTL,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext