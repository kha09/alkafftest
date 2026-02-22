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
    
    // Homepage search section
    'search.title': 'ابحث عن جامعتك المثالية',
    'search.description': 'اكتشف آلاف البرامج الدراسية في أفضل الجامعات العالمية',
    'search.button': 'ابحث الآن',
    'search.degree': 'المستوى الدراسي',
    'search.degree.placeholder': 'اختر المستوى الدراسي',
    'search.degree.bachelor': 'بكالوريوس',
    'search.degree.master': 'ماجستير',
    'search.degree.phd': 'دكتوراه',
    'search.degree.diploma': 'دبلوم',
    'search.country': 'الدولة',
    'search.country.placeholder': 'اختر الدولة',
    'search.country.usa': 'الولايات المتحدة',
    'search.country.uk': 'المملكة المتحدة',
    'search.country.canada': 'كندا',
    'search.country.australia': 'أستراليا',
    'search.country.germany': 'ألمانيا',
    'search.country.france': 'فرنسا',
    'search.specialization': 'التخصص',
    'search.specialization.placeholder': 'اختر التخصص',
    'search.specialization.engineering': 'الهندسة',
    'search.specialization.medicine': 'الطب',
    'search.specialization.business': 'إدارة الأعمال',
    'search.specialization.computer': 'علوم الحاسوب',
    'search.specialization.law': 'القانون',
    'search.specialization.arts': 'الفنون',
    'search.quick': 'البحث السريع:',
    'search.tag.medicine.usa': 'طب - أمريكا',
    'search.tag.engineering.canada': 'هندسة - كندا',
    'search.tag.business.uk': 'أعمال - بريطانيا',
    'search.tag.computer.australia': 'حاسوب - أستراليا',
    'search.tag.master.germany': 'ماجستير - ألمانيا',
    
    // Hero section
    'hero.browse': 'تصفح الجامعات',
    'hero.apply': 'قدم الآن',
    
    // Universities section
    'universities.badge': 'شراكات عالمية',
    'universities.title': 'شراكاتنا الجامعية',
    'universities.description': 'نتعاون مع أفضل الجامعات العالمية لنوفر لك خيارات تعليمية متميزة',
    'universities.ranking': 'الترتيب {ranking}',
    'universities.students': 'طالب',
    'universities.programs': 'برنامج',
    'universities.acceptance': 'معدل القبول {acceptance}',
    'universities.explore': 'استكشف الجامعة',
    'universities.stats.partners': 'جامعة شريكة',
    'universities.stats.countries': 'دولة',
    'universities.stats.programs': 'برنامج دراسي',
    'universities.stats.acceptance': 'معدل القبول',
    
    // Homepage sections
    'homepage.available': 'متاح الآن',
    'homepage.rating': '4.9 تقييم',
    'homepage.discover.all': 'اكتشف جميع الجامعات',
    'homepage.browse.universities': 'تصفح الجامعات',
    
    // FAQ section
    'faq.category.all': 'جميع الفئات',
    'faq.category.application': 'التقديم',
    'faq.category.payment': 'الدفع',
    'faq.category.universities': 'الجامعات',
    'faq.category.agents': 'الوكلاء',
    
    // Homepage static strings
    'homepage.why.choose.title': 'لماذا SM Alkaff؟',
    'homepage.discover.difference': 'اكتشف الفرق بنفسك',
    'homepage.satisfied.student': 'طالب راضٍ',
    'homepage.simple.process': 'عملية بسيطة ومتطورة',
    'homepage.minutes.register': 'دقائق للتسجيل',
    'homepage.ready.start': 'جاهز للبدء؟',
    'homepage.real.experiences': 'تجارب حقيقية',
    'homepage.testimonials.experiences': 'شهادات وتجارب',
    'homepage.faq.title': 'الأسئلة الشائعة',
    'homepage.still.questions': 'لا تزال لديك أسئلة؟',
    'homepage.contact.us': 'راسلنا',
    'homepage.try.platform': 'جرب المنصة مجاناً',
    'homepage.start.journey': 'ابدأ رحلتك الآن',
    'homepage.help.available': 'نحن هنا للمساعدة',
    'homepage.search.question': 'ابحث عن سؤال...',
    'homepage.popular.questions': 'الأسئلة الأكثر شيوعاً',
    'homepage.no.results': 'لم نجد أي نتائج',
    'homepage.try.different': 'جرب البحث بكلمات مختلفة أو تصفح الفئات المختلفة',
    'homepage.helpful.answer': 'هل كانت هذه الإجابة مفيدة؟',
    'homepage.thank.you': 'شكراً لك!',
    'homepage.improve.answer': 'سنحسن إجابتنا',
    'homepage.popular': 'شائع',
    'homepage.swipe.navigate': 'اسحب للتنقل بين الشهادات',
    'homepage.live.chat': 'دردشة مباشرة',
    'homepage.partner.universities': 'جامعة شريكة',
    'homepage.available.countries': 'دولة متاحة',
    'homepage.success.rate': 'معدل النجاح',
    'homepage.hours.review': 'ساعة للمراجعة',
    'homepage.days.acceptance': 'أيام للقبول',
    'homepage.guaranteed.security': 'أمان مضمون',
    'homepage.featured.success': 'قصة نجاح مميزة',
    'homepage.watch.full': 'شاهد الشهادة كاملة',
    'homepage.registered.students': 'طالب مسجل',
    'homepage.acceptance.rate': 'معدل القبول',
    'homepage.days.acceptance.short': 'أيام للقبول',
    'homepage.minutes.register': '3 دقائق للتسجيل',
    'homepage.hours.review': '24 ساعة للمراجعة',
    'homepage.days.accept': '7 أيام للقبول',
    'homepage.security.guaranteed': 'أمان مضمون',
    'homepage.all.testimonials': 'جميع الشهادات',
    'homepage.bachelor': 'البكالوريوس',
    'homepage.master': 'الماجستير',
    'homepage.phd': 'الدكتوراه',
    'homepage.here.to.help': 'نحن هنا للمساعدة',
    'homepage.faq.title': 'الأسئلة الشائعة',
    'homepage.search.placeholder': 'ابحث عن سؤال...',
    'homepage.most.popular': 'الأسئلة الأكثر شيوعاً',
    'homepage.helpful': 'هل كانت هذه الإجابة مفيدة؟',
    'homepage.thanks': 'شكراً لك!',
    'homepage.will.improve': 'سنحسن إجابتنا',
    'homepage.still.questions.title': 'لا تزال لديك أسئلة؟',
    'homepage.direct.chat': 'دردشة مباشرة',
    'homepage.email.us': 'راسلنا',
    
    // Footer
    'footer.description': 'منصة رائدة في مجال الاستشارات التعليمية والتقديم للجامعات العالمية',
    'footer.quick.links': 'روابط سريعة',
    'footer.support': 'الدعم',
    'footer.help.center': 'مركز المساعدة',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'الشروط والأحكام',
    'footer.contact': 'تواصل معنا',
    'footer.copyright': '© 2024 SM Alkaff. جميع الحقوق محفوظة.',
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
    
    // Homepage search section
    'search.title': 'Find Your Perfect University',
    'search.description': 'Discover thousands of study programs at the world\'s best universities',
    'search.button': 'Search Now',
    'search.degree': 'Study Level',
    'search.degree.placeholder': 'Select study level',
    'search.degree.bachelor': 'Bachelor\'s',
    'search.degree.master': 'Master\'s',
    'search.degree.phd': 'PhD',
    'search.degree.diploma': 'Diploma',
    'search.country': 'Country',
    'search.country.placeholder': 'Select country',
    'search.country.usa': 'United States',
    'search.country.uk': 'United Kingdom',
    'search.country.canada': 'Canada',
    'search.country.australia': 'Australia',
    'search.country.germany': 'Germany',
    'search.country.france': 'France',
    'search.specialization': 'Specialization',
    'search.specialization.placeholder': 'Select specialization',
    'search.specialization.engineering': 'Engineering',
    'search.specialization.medicine': 'Medicine',
    'search.specialization.business': 'Business Administration',
    'search.specialization.computer': 'Computer Science',
    'search.specialization.law': 'Law',
    'search.specialization.arts': 'Arts',
    'search.quick': 'Quick Search:',
    'search.tag.medicine.usa': 'Medicine - USA',
    'search.tag.engineering.canada': 'Engineering - Canada',
    'search.tag.business.uk': 'Business - UK',
    'search.tag.computer.australia': 'Computer - Australia',
    'search.tag.master.germany': 'Master\'s - Germany',
    
    // Hero section
    'hero.browse': 'Browse Universities',
    'hero.apply': 'Apply Now',
    
    // Universities section
    'universities.badge': 'Global Partnerships',
    'universities.title': 'Our University Partnerships',
    'universities.description': 'We partner with the world\'s best universities to provide you with exceptional educational opportunities',
    'universities.ranking': 'Ranking {ranking}',
    'universities.students': 'students',
    'universities.programs': 'programs',
    'universities.acceptance': 'Acceptance Rate {acceptance}',
    'universities.explore': 'Explore University',
    'universities.stats.partners': 'Partner Universities',
    'universities.stats.countries': 'Countries',
    'universities.stats.programs': 'Study Programs',
    'universities.stats.acceptance': 'Acceptance Rate',
    
    // Homepage sections
    'homepage.available': 'Available Now',
    'homepage.rating': '4.9 Rating',
    'homepage.discover.all': 'Discover All Universities',
    'homepage.browse.universities': 'Browse Universities',
    
    // FAQ section
    'faq.category.all': 'All Categories',
    'faq.category.application': 'Application',
    'faq.category.payment': 'Payment',
    'faq.category.universities': 'Universities',
    'faq.category.agents': 'Agents',
    
    // Homepage static strings
    'homepage.why.choose.title': 'Why Choose SM Alkaff?',
    'homepage.discover.difference': 'Discover the difference for yourself',
    'homepage.satisfied.student': 'Satisfied student',
    'homepage.simple.process': 'Simple and advanced process',
    'homepage.minutes.register': 'Minutes to register',
    'homepage.ready.start': 'Ready to start?',
    'homepage.real.experiences': 'Real experiences',
    'homepage.testimonials.experiences': 'Testimonials and experiences',
    'homepage.faq.title': 'Frequently Asked Questions',
    'homepage.still.questions': 'Still have questions?',
    'homepage.contact.us': 'Contact us',
    'homepage.try.platform': 'Try the platform for free',
    'homepage.start.journey': 'Start your journey now',
    'homepage.help.available': 'We are here to help',
    'homepage.search.question': 'Search for a question...',
    'homepage.popular.questions': 'Most Popular Questions',
    'homepage.no.results': 'No results found',
    'homepage.try.different': 'Try searching with different words or browse different categories',
    'homepage.helpful.answer': 'Was this answer helpful?',
    'homepage.thank.you': 'Thank you!',
    'homepage.improve.answer': 'We will improve our answer',
    'homepage.popular': 'Popular',
    'homepage.swipe.navigate': 'Swipe to navigate between testimonials',
    'homepage.live.chat': 'Live chat',
    'homepage.partner.universities': 'Partner universities',
    'homepage.available.countries': 'Available countries',
    'homepage.success.rate': 'Success rate',
    'homepage.hours.review': 'Hours for review',
    'homepage.days.acceptance': 'Days for acceptance',
    'homepage.guaranteed.security': 'Guaranteed security',
    'homepage.featured.success': 'Featured success story',
    'homepage.watch.full': 'Watch full testimonial',
    'homepage.registered.students': 'Registered students',
    'homepage.acceptance.rate': 'Acceptance rate',
    'homepage.days.acceptance.short': 'Days for acceptance',
    
    // Footer
    'footer.description': 'Leading platform in educational consulting and university applications worldwide',
    'footer.quick.links': 'Quick Links',
    'footer.support': 'Support',
    'footer.help.center': 'Help Center',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.contact': 'Contact Us',
    'footer.copyright': '© 2024 SM Alkaff. All rights reserved.',
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