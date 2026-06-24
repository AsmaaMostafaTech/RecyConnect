'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// All UI strings for the application
export const uiStrings = {
  // Navigation
  'Home': 'الرئيسية',
  'Dashboard': 'لوحة التحكم',
  'Market': 'السوق',
  'Map': 'الخريطة',
  'Chat': 'المحادثات',
  'Analytics': 'التحليلات',
  'Settings': 'الإعدادات',
  'Theme': 'المظهر',
  'Alerts': 'التنبيهات',
  'Login': 'تسجيل الدخول',
  'Logout': 'تسجيل الخروج',
  
  // Landing Page
  'FULL STACK PLATFORM': 'منصة متكاملة',
  'Turn Waste': 'حوّل النفايات',
  'Into Wealth.': 'إلى ثروة.',
  'The premium full-stack marketplace connecting recyclers globally with real-time data and secure transactions.': 'منصة السوق المتكاملة المتميزة التي تربط معيدي التدوير عالميًا مع بيانات في الوقت الفعلي ومعاملات آمنة.',
  'Explore Materials': 'استكشف المواد',
  'Join Network': 'انضم للشبكة',
  'Agricultural Waste': 'المخلفات الزراعية',
  'Surplus Food': 'فائض الطعام',
  'Job Opportunities': 'فرص عمل',
  'Recycle Anything': 'أعد تدوير أي شيء',
  'Live:': 'مباشر:',
  'users': 'مستخدم',
  
  // Features Section
  'WHY CHOOSE US': 'لماذا تختارنا',
  'Platform Features': 'مميزات المنصة',
  'Built for the future of recycling with cutting-edge technology': 'مبنية لمستقبل إعادة التدوير بتقنية متطورة',
  'Geo-Located': 'تحديد الموقع',
  'Find materials near you instantly with precise location tracking': 'اعثر على المواد القريبة منك فورًا مع تتبع الموقع الدقيق',
  'Secure Chat': 'محادثة آمنة',
  'End-to-end encrypted negotiations for safe trading': 'تفاوض مشفر من طرف إلى طرف لتجارة آمنة',
  'Smart Offers': 'عروض ذكية',
  'AI-powered pricing and transparent market insights': 'تسعير بالذكاء الاصطناعي ورؤى سوقية شفافة',
  'Fast Trading': 'تجارة سريعة',
  'Instant connections with verified recyclers globally': 'اتصالات فورية مع معيدي تدوير موثقين عالميًا',
  'Learn more': 'اعرف المزيد',
  
  // Stats
  'Active Users': 'مستخدم نشط',
  'Transactions': 'معاملة',
  'Uptime': 'وقت التشغيل',
  'Support': 'الدعم',
  
  // Trending Materials
  'HOT RIGHT NOW': 'الأكثر طلبًا الآن',
  'Trending Materials': 'المواد الرائجة',
  'High-demand recyclable materials in your area': 'مواد إعادة التدوير عالية الطلب في منطقتك',
  'View All': 'عرض الكل',
  'Verified Seller': 'بائع موثق',
  'View Details': 'عرض التفاصيل',
  
  // Dashboard
  "Welcome back": "مرحبًا بعودتك",
  "Here's what's happening with your listings": "إليك ما يحدث مع قوائمك",
  'Total Listings': 'إجمالي القوائم',
  'Total Views': 'إجمالي المشاهدات',
  'Est. Revenue': 'الإيرادات المتوقعة',
  'Quick Actions': 'إجراءات سريعة',
  'Add New Listing': 'إضافة قائمة جديدة',
  'Browse Marketplace': 'تصفح السوق',
  'View Analytics': 'عرض التحليلات',
  'Recent Activity': 'النشاط الأخير',
  'No recent activity': 'لا يوجد نشاط أخير',
  
  // Marketplace
  'Marketplace': 'السوق',
  'Search materials...': 'ابحث عن المواد...',
  'All Categories': 'جميع الفئات',
  'Newest': 'الأحدث',
  'Price: Low to High': 'السعر: من الأقل للأعلى',
  'Price: High to Low': 'السعر: من الأعلى للأقل',
  'listing': 'قائمة',
  'listings': 'قوائم',
  'found': 'تم العثور على',
  'Add Listing': 'إضافة قائمة',
  
  // Map Page
  'Recycling Map': 'خريطة إعادة التدوير',
  'Find recyclable materials near you': 'اعثر على مواد قابلة لإعادة التدوير بالقرب منك',
  'Total Listings': 'إجمالي القوائم',
  'Active Regions': 'المناطق النشطة',
  'All': 'الكل',
  'Filter by category': 'تصفية حسب الفئة',
  
  // Chat Page
  'Messages': 'الرسائل',
  'Select a conversation': 'اختر محادثة',
  'Type a message...': 'اكتب رسالة...',
  'No conversations yet': 'لا توجد محادثات بعد',
  'Start by browsing listings': 'ابدأ بتصفح القوائم',
  
  // Analytics Page
  'Analytics Dashboard': 'لوحة التحليلات',
  'Market insights and performance metrics': 'رؤى السوق ومقاييس الأداء',
  'Category Distribution': 'توزيع الفئات',
  'Price Trends': 'اتجاهات الأسعار',
  'Monthly price trends': 'اتجاهات الأسعار الشهرية',
  'Market Overview': 'نظرة عامة على السوق',
  'Total Market Value': 'إجمالي قيمة السوق',
  'Avg. Listing Price': 'متوسط سعر القائمة',
  
  // Settings Page
  'Settings': 'الإعدادات',
  'Manage your account and preferences': 'إدارة حسابك وتفضيلاتك',
  'Appearance': 'المظهر',
  'Theme': 'المظهر',
  'Light Mode': 'الوضع الفاتح',
  'Dark Mode': 'الوضع الداكن',
  'Language': 'اللغة',
  'English': 'الإنجليزية',
  'Arabic': 'العربية',
  'Notifications': 'الإشعارات',
  'Email Notifications': 'إشعارات البريد الإلكتروني',
  'Push Notifications': 'الإشعارات الفورية',
  'Marketing Emails': 'رسائل التسويق',
  'Data Management': 'إدارة البيانات',
  'Export Data': 'تصدير البيانات',
  'Download all your data': 'حمّل جميع بياناتك',
  'Delete Account': 'حذف الحساب',
  'Permanently delete your account': 'احذف حسابك نهائيًا',
  
  // Auth Pages
  'Sign In': 'تسجيل الدخول',
  'Sign in to your account': 'سجل الدخول إلى حسابك',
  'Email': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Sign In': 'دخول',
  "Don't have an account?": 'ليس لديك حساب؟',
  'Create one': 'أنشئ واحدًا',
  
  'Create Account': 'إنشاء حساب',
  'Join the recycling network': 'انضم لشبكة إعادة التدوير',
  'First Name': 'الاسم الأول',
  'Confirm Password': 'تأكيد كلمة المرور',
  'Create Account': 'إنشاء حساب',
  'Already have an account?': 'لديك حساب بالفعل؟',
  'Sign in': 'سجل دخول',
  
  // Listing Details
  'Listing Details': 'تفاصيل القائمة',
  'Contact Seller': 'تواصل مع البائع',
  'Posted by': 'نشرها',
  'Location': 'الموقع',
  'Quantity': 'الكمية',
  'Price': 'السعر',
  'Description': 'الوصف',
  'Views': 'المشاهدات',
  'Posted': 'نُشر',
  'Delete Listing': 'حذف القائمة',
  'Edit Listing': 'تعديل القائمة',
  
  // Add Listing Modal
  'Create New Listing': 'إنشاء قائمة جديدة',
  'Step': 'الخطوة',
  'of': 'من',
  'Select a Category': 'اختر فئة',
  'Choose the type of material': 'اختر نوع المادة',
  'Continue': 'متابعة',
  'Back': 'رجوع',
  'Listing Details': 'تفاصيل القائمة',
  'Title': 'العنوان',
  'Enter listing title': 'أدخل عنوان القائمة',
  'Quantity (kg)': 'الكمية (كجم)',
  'Enter quantity': 'أدخل الكمية',
  'Price per kg ($)': 'السعر لكل كجم ($)',
  'Enter price': 'أدخل السعر',
  'Location': 'الموقع',
  'Enter location': 'أدخل الموقع',
  'Description (optional)': 'الوصف (اختياري)',
  'Describe your material': 'صف مادتك',
  'Publish': 'نشر',
  'Success!': 'تم بنجاح!',
  'Your listing has been published': 'تم نشر قائمتك',
  'View Listing': 'عرض القائمة',
  'Create Another': 'إنشاء أخرى',
  
  // Chatbot
  'AI Assistant': 'المساعد الذكي',
  'Ask me anything about recycling...': 'اسألني أي شيء عن إعادة التدوير...',
  'Send': 'إرسال',
  
  // Notifications
  'Notifications': 'الإشعارات',
  'Clear All': 'مسح الكل',
  'No notifications': 'لا توجد إشعارات',
  
  // Misc
  'Just now': 'الآن',
  'ago': 'مضت',
  'Hi': 'مرحبًا',
  'Sustainable Trading': 'التجارة المستدامة',
  'Plastic': 'بلاستيك',
  'Metal': 'معادن',
  'Paper': 'ورق',
  'Electronics': 'إلكترونيات',
  'Textiles': 'منسوجات',
  'Glass': 'زجاج',
  'Agricultural Waste': 'مخلفات زراعية',
  'Food Surplus': 'فائض طعام',
  
  // Additional strings
  'BROWSE MATERIALS': 'تصفح المواد',
  'materials': 'مواد',
  'materials available from verified sellers': 'مادة متاحة من بائعين موثقين',
  'OVERVIEW': 'نظرة عامة',
  'Here\'s what\'s happening with your listings': 'إليك ما يحدث مع قوائمك',
  'Add New Listing': 'إضافة قائمة جديدة',
  'Online': 'متصل',
  'Your conversations': 'محادثاتك',
  'No messages yet': 'لا توجد رسائل بعد',
  'Start by contacting a seller': 'ابدأ بالتواصل مع بائع',
  'Choose from your existing conversations': 'اختر من محادثاتك الحالية',
  'INSIGHTS': 'رؤى',
  'Track your performance and market trends': 'تابع أداءك واتجاهات السوق',
  'Active': 'نشط',
  'categories': 'فئات',
  'months': 'شهور',
  'PREFERENCES': 'التفضيلات',
  'Customize your experience': 'خصص تجربتك',
  'Customize how the app looks': 'خصص مظهر التطبيق',
  'Current mode': 'الوضع الحالي',
  'mode': 'وضع',
  'Current language': 'اللغة الحالية',
  'Manage your notification preferences': 'إدارة تفضيلات الإشعارات',
  'Receive updates via email': 'تلقي التحديثات عبر البريد',
  'Browser push notifications': 'إشعارات المتصفح',
  'Get notified about price changes': 'الحصول على إشعارات تغير الأسعار',
  'Instant message notifications': 'إشعارات الرسائل الفورية',
  'Export or delete your data': 'تصدير أو حذف بياناتك',
  'Download all your data': 'حمّل جميع بياناتك',
  'Permanently delete all your data': 'احذف جميع بياناتك نهائيًا',
  'locations': 'مواقع',
  'Showing': 'عرض',
  'pins': 'دبابيس',
  'Region': 'المنطقة',
  'Online': 'متصل',
  'Waste': 'النفايات',
  'Job Opportunities': 'فرص عمل',
  'Recycle Anything': 'أعد تدوير أي شيء',
  'users': 'مستخدم',
  'Live:': 'مباشر:',
  'Your name': 'اسمك',
  'Min 6 characters': '6 أحرف على الأقل',
  'Showing': 'عرض',
  'pins': 'دبابيس',
  'Region': 'المنطقة',
  'Online': 'متصل',
  'Waste': 'النفايات',
  'Job Opportunities': 'فرص عمل',
  'Recycle Anything': 'أعد تدوير أي شيء',
  'users': 'مستخدم',
  'Live:': 'مباشر:',
  'Powered by AI': 'مدعوم بالذكاء الاصطناعي',
  'Clear chat': 'مسح المحادثة',
  'Hi': 'مرحبًا',
  'I\'m RecyBot': 'أنا ريسي بوت',
  'Your AI assistant for recycling marketplace': 'مساعدك الذكي لسوق إعادة التدوير',
  'Plastic prices?': 'أسعار البلاستيك؟',
  'Find copper': 'ابحث عن نحاس',
  'Recycling tips': 'نصائح إعادة التدوير',
  'How to sell?': 'كيف أبيع؟',
  'Ask me anything about recycling...': 'اسألني أي شيء عن إعادة التدوير...',
  'AI may make mistakes. Verify important info.': 'الذكاء الاصطناعي قد يخطئ. تحقق من المعلومات المهمة.',
  'Create New Listing': 'إنشاء قائمة جديدة',
  'locations': 'مواقع',
  'found': 'تم العثور على',
  
  // Errors & Success
  'Please login first': 'يرجى تسجيل الدخول أولاً',
  'Welcome back!': 'مرحبًا بعودتك!',
  'Account created!': 'تم إنشاء الحساب!',
  'Logged out': 'تم تسجيل الخروج',
  'Listing published!': 'تم نشر القائمة!',
  'Listing deleted': 'تم حذف القائمة',
  'Failed to load listing': 'فشل تحميل القائمة',
  'Delete this listing?': 'حذف هذه القائمة؟',
  'Delete': 'حذف',
  'Cancel': 'إلغاء',
}

// Type for translation keys
export type TranslationKey = keyof typeof uiStrings

// Translation cache for API translations
const translationCache = new Map<string, string>()

interface UseTranslationReturn {
  t: (key: string, fallback?: string) => string
  lang: 'en' | 'ar'
  setLang: (lang: 'en' | 'ar') => void
  toggleLang: () => void
  isTranslating: boolean
  translateBatch: (texts: string[]) => Promise<string[]>
}

export function useTranslation(): UseTranslationReturn {
  const [lang, setLangState] = useState<'en' | 'ar'>('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    const savedLang = localStorage.getItem('lang') || 'en'
    setLangState(savedLang as 'en' | 'ar')
    
    return () => {
      isMounted.current = false
    }
  }, [])

  const setLang = useCallback((newLang: 'en' | 'ar') => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }, [])

  const toggleLang = useCallback(() => {
    const newLang = lang === 'en' ? 'ar' : 'en'
    setLang(newLang)
  }, [lang, setLang])

  // Simple translation using pre-defined strings
  const t = useCallback((key: string, fallback?: string): string => {
    if (lang === 'en') return fallback || key
    
    // Check pre-defined translations first
    if (key in uiStrings) {
      return uiStrings[key as TranslationKey]
    }
    
    // Return fallback or key
    return fallback || key
  }, [lang])

  // Batch translation using API (for dynamic content)
  const translateBatch = useCallback(async (texts: string[]): Promise<string[]> => {
    if (lang === 'en') return texts
    
    // Check cache first
    const cached: string[] = new Array(texts.length)
    const uncached: { text: string; index: number }[] = []
    
    texts.forEach((text, index) => {
      const cacheKey = `${lang}:${text}`
      if (translationCache.has(cacheKey)) {
        cached[index] = translationCache.get(cacheKey)!
      } else if (text && text.trim()) {
        uncached.push({ text, index })
      } else {
        cached[index] = text || ''
      }
    })
    
    if (uncached.length === 0) {
      return cached
    }
    
    setIsTranslating(true)
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: uncached.map(u => u.text),
          targetLang: lang
        })
      })
      
      const data = await response.json()
      
      if (data.translations) {
        uncached.forEach((item, i) => {
          const translated = data.translations[i] || item.text
          cached[item.index] = translated
          const cacheKey = `${lang}:${item.text}`
          translationCache.set(cacheKey, translated)
        })
      }
    } catch (error) {
      console.error('Translation error:', error)
      // Return original texts on error
      uncached.forEach(item => {
        cached[item.index] = item.text
      })
    } finally {
      if (isMounted.current) {
        setIsTranslating(false)
      }
    }
    
    return cached
  }, [lang])

  return { t, lang, setLang, toggleLang, isTranslating, translateBatch }
}

export default useTranslation
