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
    'nav.universities': 'التخصصات والجامعات',
    'nav.about': 'من نحن',
    'nav.contact': 'تواصل معنا',
    'nav.login': 'تسجيل الدخول',
    'nav.start': 'ابدأ الآن',
    
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
    
    // Universities page
    'universities.page.title': 'التخصصات والجامعات',
    'universities.page.description': 'اكتشف أفضل الجامعات والتخصصات المناسبة لك من مختلف أنحاء العالم',
    'universities.filters.searchAndFilter': 'البحث والتصفية',
    'universities.filters.searchByName': 'البحث باسم الجامعة',
    'universities.filters.enterUniversityName': 'أدخل اسم الجامعة',
    'universities.filters.studyLevel': 'المستوى الدراسي',
    'universities.filters.location': 'الموقع',
    'universities.filters.offerLetterFees': 'رسوم خطاب القبول',
    'universities.filters.applyFilter': 'تطبيق التصفية',
    'universities.filters.allLevels': 'جميع المستويات',
    'universities.filters.allLocations': 'جميع المواقع',
    'universities.filters.allTypes': 'جميع الأنواع',
    'universities.filters.free': 'مجاني',
    'universities.filters.paid': 'مدفوع',
    'universities.sort.popular': 'الأكثر شعبية',
    'universities.sort.ranking': 'الترتيب',
    'universities.sort.tuitionLow': 'الرسوم: من الأقل للأعلى',
    'universities.sort.tuitionHigh': 'الرسوم: من الأعلى للأقل',
    'universities.sort.courses': 'عدد التخصصات',
    'universities.sort.rating': 'التقييم',
    'universities.results.title': 'الجامعات',
    'universities.results.total': 'إجمالي الجامعات',
    'universities.results.sortBy': 'ترتيب حسب',
    'universities.card.popular': 'شائع',
    'universities.card.freeOfferLetter': 'خطاب قبول مجاني',
    'universities.card.specializations': 'تخصص',
    'universities.card.yearly': 'سنوياً',
    'universities.card.more': 'المزيد',
    'universities.card.applyNow': 'قدم الآن',
    'universities.card.askUs': 'اسألنا',
    'universities.loadMore.showMore': 'عرض المزيد من الجامعات',
    'universities.noResults.title': 'لم نجد أي نتائج',
    'universities.noResults.description': 'جرب تعديل معايير البحث أو إعادة تعيين التصفية',
    'universities.noResults.resetFilters': 'إعادة تعيين التصفية',
    'universities.cta.title': 'لم تجد ما تبحث عنه؟',
    'universities.cta.description': 'تواصل مع فريق الخبراء لدينا للحصول على استشارة مجانية ومساعدتك في اختيار الجامعة والتخصص المناسب',
    'universities.cta.talkToExpert': 'تحدث مع خبير',
    'universities.cta.requestConsultation': 'طلب استشارة مجانية',
    
    // University detail page
    'university.detail.ranking': 'الترتيب',
    'university.detail.students': 'طالب',
    'university.detail.acceptance': 'معدل القبول',
    'university.detail.free.offer': 'خطاب قبول مجاني',
    'university.detail.contact.expert': 'تواصل مع خبير',
    'university.detail.ask.us': 'اسألنا',
    'university.detail.filter.title': 'البحث والتصفية',
    'university.detail.filter.search.label': 'البحث بالتخصص',
    'university.detail.filter.search.placeholder': 'أدخل اسم التخصص',
    'university.detail.filter.department': 'القسم',
    'university.detail.filter.duration': 'مدة الدراسة',
    'university.detail.filter.all.departments': 'جميع الأقسام',
    'university.detail.filter.all.durations': 'جميع المدد',
    'university.detail.filter.apply': 'تطبيق التصفية',
    'university.detail.programs.title': 'التخصصات المتاحة',
    'university.detail.programs.total': 'إجمالي التخصصات:',
    'university.detail.program.duration': 'مدة الدراسة',
    'university.detail.program.duration.years': 'سنوات',
    'university.detail.program.fees': 'الرسوم الدراسية',
    'university.detail.program.fees.yearly': 'سنوياً',
    'university.detail.program.intake': 'أشهر القبول',
    'university.detail.program.apply': 'التقديم الآن',
    'university.detail.program.learn.more': 'معرفة المزيد',
    'university.detail.no.programs.title': 'لم نجد أي تخصصات',
    'university.detail.no.programs.description': 'جرب تعديل معايير البحث أو إعادة تعيين التصفية',
    'university.detail.no.programs.reset': 'إعادة تعيين التصفية',
    'university.detail.cta.title': 'هل تحتاج إلى مساعدة في الاختيار؟',
    'university.detail.cta.description': 'تواصل مع فريق الخبراء لدينا للحصول على استشارة مجانية ومساعدتك في اختيار التخصص المناسب',
    'university.detail.cta.consultation': 'طلب استشارة مجانية',
    'university.detail.cta.expert': 'تحدث مع خبير',
    'university.detail.error.title': 'حدث خطأ أثناء تحميل التفاصيل',
    'university.detail.error.description': 'تعذر تحميل معلومات الجامعة',
    'university.detail.back.to.list': 'العودة إلى قائمة الجامعات',
    
    // Program detail page
    'program.detail.back.to': 'العودة إلى',
    'program.detail.university': 'الجامعة',
    'program.detail.copied': 'تم نسخ اسم البرنامج',
    'program.detail.qualification': 'المؤهل',
    'program.detail.duration': 'مدة الدراسة',
    'program.detail.duration.years': 'سنوات',
    'program.detail.intake': 'أشهر القبول',
    'program.detail.english.requirement': 'متطلبات اللغة',
    'program.detail.class.type': 'نوع الدراسة',
    'program.detail.free.offer': 'خطاب قبول مجاني',
    'program.detail.apply.now': 'التقديم الآن',
    'program.detail.consultation': 'طلب استشارة مجانية',
    'program.detail.university.info': 'معلومات الجامعة',
    'program.detail.university.ranking': 'الترتيب',
    'program.detail.university.students': 'طالب',
    'program.detail.university.acceptance': 'معدل القبول',
    'program.detail.university.free.offer': 'خطاب قبول مجاني',
    'program.detail.fees.title': 'الرسوم الدراسية للطلاب الدوليين',
    'program.detail.fees.yearly': 'الرسوم الدراسية السنوية',
    'program.detail.fees.other': 'رسوم أخرى',
    'program.detail.fees.year': 'السنة',
    'program.detail.fees.amount': 'الرسوم',
    'program.detail.fees.description': 'الوصف',
    'program.detail.cta.title': 'هل تحتاج إلى مساعدة في التقديم؟',
    'program.detail.cta.description': 'تواصل مع فريق الخبراء لدينا للحصول على استشارة مجانية ومساعدتك في إكمال طلب التقديم',
    'program.detail.cta.consultation': 'طلب استشارة مجانية',
    'program.detail.cta.expert': 'تحدث مع خبير',
    'program.detail.error.title': 'حدث خطأ أثناء تحميل التفاصيل',
    'program.detail.error.description': 'تعذر تحميل معلومات البرنامج',
    'program.detail.back.to.universities': 'العودة إلى قائمة الجامعات',
    
    // Month translations
    'month.january': 'يناير',
    'month.february': 'فبراير',
    'month.march': 'مارس',
    'month.april': 'أبريل',
    'month.may': 'مايو',
    'month.june': 'يونيو',
    'month.july': 'يوليو',
    'month.august': 'أغسطس',
    'month.september': 'سبتمبر',
    'month.october': 'أكتوبر',
    'month.november': 'نوفمبر',
    'month.december': 'ديسمبر',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.universities': 'Programs & Universities',
    'nav.about': 'About Us',
    'nav.contact': 'Contact Us',
    'nav.login': 'Login',
    'nav.start': 'Get Started',
    
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
    
    // Universities page
    'universities.page.title': 'Programs & Universities',
    'universities.page.description': 'Discover the best universities and programs that suit you from around the world',
    'universities.filters.searchAndFilter': 'Search & Filter',
    'universities.filters.searchByName': 'Search by university name',
    'universities.filters.enterUniversityName': 'Enter university name',
    'universities.filters.studyLevel': 'Study Level',
    'universities.filters.location': 'Location',
    'universities.filters.offerLetterFees': 'Offer Letter Fees',
    'universities.filters.applyFilter': 'Apply Filter',
    'universities.filters.allLevels': 'All Levels',
    'universities.filters.allLocations': 'All Locations',
    'universities.filters.allTypes': 'All Types',
    'universities.filters.free': 'Free',
    'universities.filters.paid': 'Paid',
    'universities.sort.popular': 'Most Popular',
    'universities.sort.ranking': 'Ranking',
    'universities.sort.tuitionLow': 'Fees: Low to High',
    'universities.sort.tuitionHigh': 'Fees: High to Low',
    'universities.sort.courses': 'Number of Programs',
    'universities.sort.rating': 'Rating',
    'universities.results.title': 'Universities',
    'universities.results.total': 'Total Universities',
    'universities.results.sortBy': 'Sort by',
    'universities.card.popular': 'Popular',
    'universities.card.freeOfferLetter': 'Free Offer Letter',
    'universities.card.specializations': 'programs',
    'universities.card.yearly': 'yearly',
    'universities.card.more': 'more',
    'universities.card.applyNow': 'Apply Now',
    'universities.card.askUs': 'Ask Us',
    'universities.loadMore.showMore': 'View More Universities',
    'universities.noResults.title': 'No Results Found',
    'universities.noResults.description': 'Try modifying your search criteria or reset the filter',
    'universities.noResults.resetFilters': 'Reset Filter',
    'universities.cta.title': 'Didn\'t find what you\'re looking for?',
    'universities.cta.description': 'Contact our expert team for free consultation and help you choose the right university and program',
    'universities.cta.talkToExpert': 'Talk to Expert',
    'universities.cta.requestConsultation': 'Request Free Consultation',
    
    // University detail page
    'university.detail.ranking': 'Ranking',
    'university.detail.students': 'students',
    'university.detail.acceptance': 'Acceptance Rate',
    'university.detail.free.offer': 'Free Offer Letter',
    'university.detail.contact.expert': 'Contact Expert',
    'university.detail.ask.us': 'Ask Us',
    'university.detail.filter.title': 'Search & Filter',
    'university.detail.filter.search.label': 'Search by program',
    'university.detail.filter.search.placeholder': 'Enter program name',
    'university.detail.filter.department': 'Department',
    'university.detail.filter.duration': 'Study Duration',
    'university.detail.filter.all.departments': 'All Departments',
    'university.detail.filter.all.durations': 'All Durations',
    'university.detail.filter.apply': 'Apply Filter',
    'university.detail.programs.title': 'Available Programs',
    'university.detail.programs.total': 'Total Programs:',
    'university.detail.program.duration': 'Study Duration',
    'university.detail.program.duration.years': 'years',
    'university.detail.program.fees': 'Tuition Fees',
    'university.detail.program.fees.yearly': 'yearly',
    'university.detail.program.intake': 'Intake Months',
    'university.detail.program.apply': 'Apply Now',
    'university.detail.program.learn.more': 'Learn More',
    'university.detail.no.programs.title': 'No Programs Found',
    'university.detail.no.programs.description': 'Try modifying your search criteria or reset the filter',
    'university.detail.no.programs.reset': 'Reset Filter',
    'university.detail.cta.title': 'Need Help Choosing?',
    'university.detail.cta.description': 'Contact our expert team for free consultation and help you choose the right program',
    'university.detail.cta.consultation': 'Request Free Consultation',
    'university.detail.cta.expert': 'Talk to Expert',
    'university.detail.error.title': 'Error Loading Details',
    'university.detail.error.description': 'Failed to load university information',
    'university.detail.back.to.list': 'Back to Universities List',
    
    // Program detail page
    'program.detail.back.to': 'Back to',
    'program.detail.university': 'University',
    'program.detail.copied': 'Program name copied',
    'program.detail.qualification': 'Qualification',
    'program.detail.duration': 'Study Duration',
    'program.detail.duration.years': 'years',
    'program.detail.intake': 'Intake Months',
    'program.detail.english.requirement': 'English Requirements',
    'program.detail.class.type': 'Class Type',
    'program.detail.free.offer': 'Free Offer Letter',
    'program.detail.apply.now': 'Apply Now',
    'program.detail.consultation': 'Request Free Consultation',
    'program.detail.university.info': 'University Information',
    'program.detail.university.ranking': 'Ranking',
    'program.detail.university.students': 'students',
    'program.detail.university.acceptance': 'Acceptance Rate',
    'program.detail.university.free.offer': 'Free Offer Letter',
    'program.detail.fees.title': 'Tuition Fees for International Students',
    'program.detail.fees.yearly': 'Yearly Tuition Fees',
    'program.detail.fees.other': 'Other Fees',
    'program.detail.fees.year': 'Year',
    'program.detail.fees.amount': 'Fees',
    'program.detail.fees.description': 'Description',
    'program.detail.cta.title': 'Need Help with Application?',
    'program.detail.cta.description': 'Contact our expert team for free consultation and help you complete your application',
    'program.detail.cta.consultation': 'Request Free Consultation',
    'program.detail.cta.expert': 'Talk to Expert',
    'program.detail.error.title': 'Error Loading Details',
    'program.detail.error.description': 'Failed to load program information',
    'program.detail.back.to.universities': 'Back to Universities List',
    
    // Month translations
    'month.january': 'January',
    'month.february': 'February',
    'month.march': 'March',
    'month.april': 'April',
    'month.may': 'May',
    'month.june': 'June',
    'month.july': 'July',
    'month.august': 'August',
    'month.september': 'September',
    'month.october': 'October',
    'month.november': 'November',
    'month.december': 'December',
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