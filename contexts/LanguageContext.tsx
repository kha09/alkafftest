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
    
    // Hero section buttons
    'hero.browse': 'تصفّح التخصصات',
    'hero.apply': 'قدّم الآن',
    
    // Search section
    'search.title': 'ابحث عن التخصص الذي ترغب فيه',
    'search.description': 'اكتشف أفضل الجامعات والتخصصات المناسبة لك',
    'search.button': 'ابحث',
    'search.degree': 'الدرجة العلمية',
    'search.degree.placeholder': 'اختر الدرجة التي ترغب فيه',
    'search.degree.bachelor': 'البكالوريوس',
    'search.degree.master': 'الماجستير',
    'search.degree.phd': 'الدكتوراه',
    'search.degree.diploma': 'الدبلوم',
    'search.country': 'البلد',
    'search.country.placeholder': 'اختر البلد الدراسية التي تريدها',
    'search.country.usa': 'الولايات المتحدة',
    'search.country.uk': 'المملكة المتحدة',
    'search.country.canada': 'كندا',
    'search.country.australia': 'أستراليا',
    'search.country.germany': 'ألمانيا',
    'search.country.france': 'فرنسا',
    'search.specialization': 'التخصص',
    'search.specialization.placeholder': 'اختر التخصص الذي ترغب فيه',
    'search.specialization.engineering': 'الهندسة',
    'search.specialization.medicine': 'الطب',
    'search.specialization.business': 'إدارة الأعمال',
    'search.specialization.computer': 'علوم الحاسوب',
    'search.specialization.law': 'القانون',
    'search.specialization.arts': 'الفنون',
    'search.quick': 'البحث السريع:',
    'search.tag.medicine.usa': 'الطب في أمريكا',
    'search.tag.engineering.canada': 'الهندسة في كندا',
    'search.tag.business.uk': 'إدارة الأعمال في بريطانيا',
    'search.tag.computer.australia': 'علوم الحاسوب في أستراليا',
    'search.tag.master.germany': 'الماجستير في ألمانيا',
    
    // University partnerships section
    'universities.badge': 'شراكات عالمية مميزة',
    'universities.title': 'شراكات مع أفضل الجامعات العالمية',
    'universities.description': 'أكثر من 500 جامعة حول العالم في انتظارك - من أعرق المؤسسات التعليمية إلى أحدث الجامعات التقنية',
    'universities.ranking': 'ترتيب {ranking} عالمياً',
    'universities.students': 'طالب مسجل',
    'universities.programs': 'برنامج دراسي',
    'universities.acceptance': 'معدل القبول: {acceptance}',
    'universities.explore': 'استكشف البرامج',
    'universities.available': 'متاح للتقديم',
    'universities.rating': 'تقييم 4.9/5',
    'universities.stats.partners': 'جامعة شريكة',
    'universities.stats.countries': 'دولة متاحة',
    'universities.stats.programs': 'برنامج دراسي',
    'universities.stats.acceptance': 'معدل القبول',
    'universities.cta': 'اكتشف جميع الجامعات الشريكة',
    'universities.browse': 'تصفح الجامعات',
    
    // Value proposition section
    'value.badge': 'عملية بسيطة ومتطورة',
    'value.stats.satisfied': 'طالب راضٍ',
    'value.stats.partners': 'جامعة شريكة',
    'value.stats.countries': 'دولة متاحة',
    'value.stats.success': 'مع دل النجاح',
    'value.cta': 'اكتشف الفرق بنفسك',
    'value.try': 'جرب المنصة مجاناً',
    
    // How it works section
    'process.badge': 'عملية بسيطة ومتطورة',
    'process.stats.minutes': 'دقائق للتسجيل',
    'process.stats.hours': 'ساعة للمراجعة',
    'process.stats.days': 'أيام للقبول',
    'process.stats.security': 'أمان مضمون',
    'process.cta': 'جاهز للبدء؟',
    'process.start': 'ابدأ رحلتك الآن',
    
    // Testimonials section
    'testimonials.badge': 'تجارب حقيقية',
    'testimonials.title': 'شهادات وتجارب',
    'testimonials.description': 'استمع إلى قصص نجاح طلابنا وتجاربهم مع منصتنا من مختلف أنحاء العالم',
    'testimonials.filter.all': 'جميع الشهادات',
    'testimonials.filter.bachelor': 'البكالوريوس',
    'testimonials.filter.master': 'الماجستير',
    'testimonials.filter.phd': 'الدكتوراه',
    'testimonials.video': 'فيديو الشهادة',
    'testimonials.watch': 'شاهد الشهادة كاملة',
    'testimonials.featured': 'قصة نجاح مميزة',
    'testimonials.swipe': 'اسحب للتنقل بين الشهادات',
    
    // FAQ section
    'faq.badge': 'نحن هنا للمساعدة',
    'faq.title': 'الأسئلة الشائعة',
    'faq.description': 'إجابات على أكثر الأسئلة شيوعاً حول خدماتنا وعملية التقديم',
    'faq.search.placeholder': 'ابحث عن سؤال...',
    'faq.category.all': 'جميع الأسئلة',
    'faq.category.application': 'التقديم',
    'faq.category.payment': 'الدفع',
    'faq.category.universities': 'الجامعات',
    'faq.category.agents': 'الوكلاء',
    'faq.popular.title': 'الأسئلة الأكثر شيوعاً',
    'faq.popular.badge': 'شائع',
    'faq.helpful': 'هل كانت هذه الإجابة مفيدة؟',
    'faq.thanks': 'شكراً لك!',
    'faq.improve': 'سنحسن إجابتنا',
    'faq.no.results': 'لم نجد أي نتائج',
    'faq.try.different': 'جرب البحث بكلمات مختلفة أو تصفح الفئات المختلفة',
    'faq.still.questions': 'لا تزال لديك أسئلة؟',
    'faq.support.description': 'فريق الدعم لدينا متاح على مدار الساعة للإجابة على جميع استفساراتك ومساعدتك في رحلتك التعليمية',
    'faq.live.chat': 'دردشة مباشرة',
    'faq.email.us': 'راسلنا',
    
    // Footer
    'footer.description': 'منصة ذكية تربطك بأفضل الجامعات والتخصصات حول العالم',
    'footer.quick.links': 'روابط سريعة',
    'footer.support': 'الدعم',
    'footer.contact': 'تواصل معنا',
    'footer.help.center': 'مركز المساعدة',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الاستخدام',
    'footer.copyright': 'جميع الحقوق محفوظة © 2025 SM Alkaff',
    
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
    
    // Additional hardcoded strings from homepage
    'homepage.available': 'متاح للتقديم',
    'homepage.rating': 'تقييم 4.9/5',
    'homepage.discover.all': 'اكتشف جميع الجامعات الشريكة',
    'homepage.browse.universities': 'تصفح الجامعات',
    'homepage.discover.difference': 'اكتشف الفرق بنفسك',
    'homepage.try.free': 'جرب المنصة مجاناً',
    'homepage.ready.start': 'جاهز للبدء؟',
    'homepage.start.journey': 'ابدأ رحلتك الآن',
    'homepage.all.testimonials': 'جميع الشهادات',
    'homepage.bachelor': 'البكالوريوس',
    'homepage.master': 'الماجستير',
    'homepage.phd': 'الدكتوراه',
    'homepage.video.testimonial': 'فيديو الشهادة',
    'homepage.watch.full': 'شاهد الشهادة كاملة',
    'homepage.featured.story': 'قصة نجاح مميزة',
    'homepage.swipe.navigate': 'اسحب للتنقل بين الشهادات',
    'homepage.search.question': 'ابحث عن سؤال...',
    'homepage.popular.questions': 'الأسئلة الأكثر شيوعاً',
    'homepage.popular.badge': 'شائع',
    'homepage.helpful.question': 'هل كانت هذه الإجابة مفيدة؟',
    'homepage.thanks': 'شكراً لك!',
    'homepage.improve': 'سنحسن إجابتنا',
    'homepage.no.results': 'لم نجد أي نتائج',
    'homepage.try.different': 'جرب البحث بكلمات مختلفة أو تصفح الفئات المختلفة',
    'homepage.still.questions': 'لا تزال لديك أسئلة؟',
    'homepage.support.description': 'فريق الدعم لدينا متاح على مدار الساعة للإجابة على جميع استفساراتك ومساعدتك في رحلتك التعليمية',
    'homepage.live.chat': 'دردشة مباشرة',
    'homepage.email.us': 'راسلنا',
    
    // Badge texts
    'badge.simple.process': 'عملية بسيطة ومتطورة',
    'badge.real.experiences': 'تجارب حقيقية',
    'badge.here.help': 'نحن هنا للمساعدة',
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
    
    // Hero section buttons
    'hero.browse': 'Browse Programs',
    'hero.apply': 'Apply Now',
    
    // Search section
    'search.title': 'Find the Program You Want',
    'search.description': 'Discover the best universities and programs that suit you',
    'search.button': 'Search',
    'search.degree': 'Degree Level',
    'search.degree.placeholder': 'Choose your desired degree',
    'search.degree.bachelor': 'Bachelor\'s',
    'search.degree.master': 'Master\'s',
    'search.degree.phd': 'PhD',
    'search.degree.diploma': 'Diploma',
    'search.country': 'Country',
    'search.country.placeholder': 'Choose your study destination',
    'search.country.usa': 'United States',
    'search.country.uk': 'United Kingdom',
    'search.country.canada': 'Canada',
    'search.country.australia': 'Australia',
    'search.country.germany': 'Germany',
    'search.country.france': 'France',
    'search.specialization': 'Specialization',
    'search.specialization.placeholder': 'Choose your desired specialization',
    'search.specialization.engineering': 'Engineering',
    'search.specialization.medicine': 'Medicine',
    'search.specialization.business': 'Business Administration',
    'search.specialization.computer': 'Computer Science',
    'search.specialization.law': 'Law',
    'search.specialization.arts': 'Arts',
    'search.quick': 'Quick Search:',
    'search.tag.medicine.usa': 'Medicine in USA',
    'search.tag.engineering.canada': 'Engineering in Canada',
    'search.tag.business.uk': 'Business in UK',
    'search.tag.computer.australia': 'Computer Science in Australia',
    'search.tag.master.germany': 'Master\'s in Germany',
    
    // University partnerships section
    'universities.badge': 'Distinguished Global Partnerships',
    'universities.title': 'Partnerships with the World\'s Best Universities',
    'universities.description': 'Over 500 universities worldwide await you - from the most prestigious educational institutions to the latest technical universities',
    'universities.ranking': 'Ranked {ranking} globally',
    'universities.students': 'enrolled students',
    'universities.programs': 'study programs',
    'universities.acceptance': 'Acceptance rate: {acceptance}',
    'universities.explore': 'Explore Programs',
    'universities.available': 'Available for application',
    'universities.rating': 'Rating 4.9/5',
    'universities.stats.partners': 'partner universities',
    'universities.stats.countries': 'available countries',
    'universities.stats.programs': 'study programs',
    'universities.stats.acceptance': 'acceptance rate',
    'universities.cta': 'Discover all partner universities',
    'universities.browse': 'Browse Universities',
    
    // Value proposition section
    'value.badge': 'Simple and Advanced Process',
    'value.stats.satisfied': 'satisfied students',
    'value.stats.partners': 'partner universities',
    'value.stats.countries': 'available countries',
    'value.stats.success': 'success rate',
    'value.cta': 'Discover the difference yourself',
    'value.try': 'Try the platform for free',
    
    // How it works section
    'process.badge': 'Simple and Advanced Process',
    'process.stats.minutes': 'minutes to register',
    'process.stats.hours': 'hours for review',
    'process.stats.days': 'days for acceptance',
    'process.stats.security': 'guaranteed security',
    'process.cta': 'Ready to start?',
    'process.start': 'Start your journey now',
    
    // Testimonials section
    'testimonials.badge': 'Real Experiences',
    'testimonials.title': 'Testimonials & Experiences',
    'testimonials.description': 'Listen to success stories of our students and their experiences with our platform from around the world',
    'testimonials.filter.all': 'All Testimonials',
    'testimonials.filter.bachelor': 'Bachelor\'s',
    'testimonials.filter.master': 'Master\'s',
    'testimonials.filter.phd': 'PhD',
    'testimonials.video': 'Video Testimonial',
    'testimonials.watch': 'Watch full testimonial',
    'testimonials.featured': 'Featured Success Story',
    'testimonials.swipe': 'Swipe to navigate between testimonials',
    
    // FAQ section
    'faq.badge': 'We\'re here to help',
    'faq.title': 'Frequently Asked Questions',
    'faq.description': 'Answers to the most common questions about our services and application process',
    'faq.search.placeholder': 'Search for a question...',
    'faq.category.all': 'All Questions',
    'faq.category.application': 'Application',
    'faq.category.payment': 'Payment',
    'faq.category.universities': 'Universities',
    'faq.category.agents': 'Agents',
    'faq.popular.title': 'Most Popular Questions',
    'faq.popular.badge': 'Popular',
    'faq.helpful': 'Was this answer helpful?',
    'faq.thanks': 'Thank you!',
    'faq.improve': 'We\'ll improve our answer',
    'faq.no.results': 'No results found',
    'faq.try.different': 'Try searching with different words or browse different categories',
    'faq.still.questions': 'Still have questions?',
    'faq.support.description': 'Our support team is available 24/7 to answer all your inquiries and help you in your educational journey',
    'faq.live.chat': 'Live Chat',
    'faq.email.us': 'Email Us',
    
    // Footer
    'footer.description': 'A smart platform connecting you to the best universities and programs worldwide',
    'footer.quick.links': 'Quick Links',
    'footer.support': 'Support',
    'footer.contact': 'Contact Us',
    'footer.help.center': 'Help Center',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.copyright': 'All rights reserved © 2025 SM Alkaff',
    
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
    
    // Additional hardcoded strings from homepage
    'homepage.available': 'Available for Application',
    'homepage.rating': 'Rating 4.9/5',
    'homepage.discover.all': 'Discover all partner universities',
    'homepage.browse.universities': 'Browse Universities',
    'homepage.discover.difference': 'Discover the difference yourself',
    'homepage.try.free': 'Try the platform for free',
    'homepage.ready.start': 'Ready to start?',
    'homepage.start.journey': 'Start your journey now',
    'homepage.all.testimonials': 'All Testimonials',
    'homepage.bachelor': 'Bachelor\'s',
    'homepage.master': 'Master\'s',
    'homepage.phd': 'PhD',
    'homepage.video.testimonial': 'Video Testimonial',
    'homepage.watch.full': 'Watch full testimonial',
    'homepage.featured.story': 'Featured Success Story',
    'homepage.swipe.navigate': 'Swipe to navigate between testimonials',
    'homepage.search.question': 'Search for a question...',
    'homepage.popular.questions': 'Most Popular Questions',
    'homepage.popular.badge': 'Popular',
    'homepage.helpful.question': 'Was this answer helpful?',
    'homepage.thanks': 'Thank you!',
    'homepage.improve': 'We\'ll improve our answer',
    'homepage.no.results': 'No results found',
    'homepage.try.different': 'Try searching with different words or browse different categories',
    'homepage.still.questions': 'Still have questions?',
    'homepage.support.description': 'Our support team is available 24/7 to answer all your inquiries and help you in your educational journey',
    'homepage.live.chat': 'Live Chat',
    'homepage.email.us': 'Email Us',
    
    // Badge texts
    'badge.simple.process': 'Simple and Advanced Process',
    'badge.real.experiences': 'Real Experiences',
    'badge.here.help': 'We\'re here to help',
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