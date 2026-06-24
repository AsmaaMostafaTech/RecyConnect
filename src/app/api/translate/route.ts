import { NextRequest, NextResponse } from 'next/server'

// Simple translation dictionary for common UI strings
const TRANSLATION_DICT: Record<string, string> = {
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
  'Notifications': 'الإشعارات',
  'Clear All': 'مسح الكل',
  'No notifications': 'لا توجد إشعارات',
  'Hi': 'مرحباً',
  'Welcome back!': 'مرحباً بعودتك!',
  'Account created!': 'تم إنشاء الحساب!',
  'Logged out': 'تم تسجيل الخروج',
  'Please login first': 'يرجى تسجيل الدخول أولاً',
  'Invalid credentials': 'بيانات الدخول غير صحيحة',
  'Registration failed': 'فشل التسجيل',
  'Login failed': 'فشل تسجيل الدخول',
  'Failed to load listing': 'فشل تحميل العرض',
  'Listing deleted': 'تم حذف العرض',
  'Failed to delete': 'فشل الحذف',
  'Listing published!': 'تم نشر العرض!',
  'Failed to create listing': 'فشل إنشاء العرض',
  'Failed to send message': 'فشل إرسال الرسالة',
  'Failed to start chat': 'فشل بدء المحادثة',
  'Title is required': 'العنوان مطلوب',
  'Valid quantity is required': 'الكمية الصحيحة مطلوبة',
  'Valid price is required': 'السعر الصحيح مطلوب',
  'Location is required': 'الموقع مطلوب',
}

// Cache for translations to avoid repeated processing
const translationCache = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLang } = await request.json()
    
    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'texts array is required' }, { status: 400 })
    }

    if (targetLang === 'en') {
      // Return original texts for English
      return NextResponse.json({ translations: texts })
    }

    // Translate using dictionary
    const translations = texts.map(text => {
      const cacheKey = `${targetLang}:${text}`
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!
      }
      
      // Check dictionary first
      const translated = TRANSLATION_DICT[text] || text
      translationCache.set(cacheKey, translated)
      return translated
    })

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ 
      error: 'Translation failed',
      translations: [] 
    }, { status: 500 })
  }
}
