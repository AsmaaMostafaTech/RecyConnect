import { NextRequest, NextResponse } from 'next/server'

// Fixed responses for the recycling marketplace assistant
const FIXED_RESPONSES: Record<string, string> = {
  greeting: "مرحباً بك! 👋 أنا RecyBot، مساعدك الذكي في RecyConnect. كيف يمكنني مساعدتك اليوم؟ ♻️",
  help: "يمكنني مساعدتك في:\n- البحث عن مواد إعادة التدوير\n- معرفة الأسعار والاتجاهات السوقية\n- الربط بين المشترين والبائعين\n- الإجابة عن أسئلة عمليات إعادة التدوير\n- تقديم نصائح للتداول المستدام 🌱",
  plastic: "البلاستيك من أهم مواد إعادة التدوير! 💚 تشمل الأنواع الشائعة: HDPE, LDPE, PET, PP, PS. متوسط الأسعار: $250-400 للطن. يمكنك العثور على زجاجات وحاويات وتغليف في السوق.",
  metal: "المعادن ذات قيمة عالية في إعادة التدوير! 🔩 تشمل: النحاس، الألمنيوم، الصلب، الحديد. متوسط الأسعار: $800-1500 للطن (النحاس يصل إلى $3000).",
  paper: "الورق من أسهل المواد في إعادة التدوير! 📄 يشمل: الكرتون، ورق المكتب، الصحف، الكتب. متوسط الأسعار: $100-200 للطن.",
  electronics: "إعادة تدوير الإلكترونيات مهمة جداً! 🔌 تشمل: النفايات الإلكترونية، لوحات الدوائر، المكونات، الأجهزة. الأسعار تختلف حسب النوع ($50-2000).",
  agricultural: "النفايات الزراعية مفيدة للسماد العضوي! 🌾 تشمل: بقايا المحاصيل، النفايات العضوية، المواد النباتية. متوسط الأسعار: $50-150 للطن.",
  food: "فائض الطعام يمكن توزيعه مجاناً أو بتكلفة بسيطة! 🍎 يساعد في تقليل الهدر ومساعدة المحتاجين.",
  textiles: "إعادة تدوير الأقمشة تساعد في تقليل النفايات! 👕 تشمل: الملابس، الأقمشة، الأحذية، الملاءات. متوسط الأسعار: $100-300 للطن.",
  glass: "الزجاج قابل لإعادة التدوير بنسبة 100%! 🫙 يشمل: الزجاجات، البرطمانات، النوافذ، الحاويات. متوسط الأسعار: $50-100 للطن.",
  price: "الأسعار تختلف حسب نوع المادة وجودتها:\n- البلاستيك: $250-400 للطن\n- المعادن: $800-1500 للطن\n- الورق: $100-200 للطن\n- الإلكترونيات: $50-2000 (حسب النوع)\n- النفايات الزراعية: $50-150 للطن\n- فائض الطعام: غالباً مجاني\n- الأقمشة: $100-300 للطن\n- الزجاج: $50-100 للطن 💰",
  contact: "للتواصل مع البائع، يرجى تسجيل الدخول أولاً ثم الضغط على زر 'تواصل مع البائع' في صفحة العرض. سيتم فتح محادثة مباشرة معه! 📱",
  register: "للتسجيل، اضغط على زر 'تسجيل الدخول' في القائمة الجانبية ثم اختر 'إنشاء حساب'. العملية سريعة وسهلة! ✨",
  sell: "لبيع مواد إعادة التدوير:\n1. سجل الدخول\n2. اضغط على زر '+' لإضافة عرض جديد\n3. اختر الفئة والكمية والسعر\n4. حدد الموقع على الخريطة\n5. انشر عرضك! 🚀",
  default: "شكراً لسؤالك! 🌟 أنا هنا لمساعدتك في RecyConnect. يمكنك تصفح السوق للعثور على مواد إعادة التدوير، أو طرح سؤال محدد عن البلاستيك، المعادن، الورق، الإلكترونيات، النفايات الزراعية، الطعام، الأقمشة، أو الزجاج. ♻️"
}

// Store conversation histories (in production, use a database)
const conversations = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>()

// Function to get appropriate response based on keywords
function getFixedResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Check for keywords
  if (lowerMessage.includes('مرحبا') || lowerMessage.includes('هلا') || lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return FIXED_RESPONSES.greeting
  }
  
  if (lowerMessage.includes('مساعدة') || lowerMessage.includes('help') || lowerMessage.includes('كيف')) {
    return FIXED_RESPONSES.help
  }
  
  if (lowerMessage.includes('بلاستيك') || lowerMessage.includes('plastic')) {
    return FIXED_RESPONSES.plastic
  }
  
  if (lowerMessage.includes('معادن') || lowerMessage.includes('معدن') || lowerMessage.includes('نحاس') || lowerMessage.includes('حديد') || lowerMessage.includes('metal')) {
    return FIXED_RESPONSES.metal
  }
  
  if (lowerMessage.includes('ورق') || lowerMessage.includes('كرتون') || lowerMessage.includes('paper')) {
    return FIXED_RESPONSES.paper
  }
  
  if (lowerMessage.includes('الكترون') || lowerMessage.includes('إلكترون') || lowerMessage.includes('electronic')) {
    return FIXED_RESPONSES.electronics
  }
  
  if (lowerMessage.includes('زراع') || lowerMessage.includes('agricultural')) {
    return FIXED_RESPONSES.agricultural
  }
  
  if (lowerMessage.includes('طعام') || lowerMessage.includes('أكل') || lowerMessage.includes('food')) {
    return FIXED_RESPONSES.food
  }
  
  if (lowerMessage.includes('قماش') || lowerMessage.includes('ملابس') || lowerMessage.includes('textile')) {
    return FIXED_RESPONSES.textiles
  }
  
  if (lowerMessage.includes('زجاج') || lowerMessage.includes('glass')) {
    return FIXED_RESPONSES.glass
  }
  
  if (lowerMessage.includes('سعر') || lowerMessage.includes('كم') || lowerMessage.includes('price')) {
    return FIXED_RESPONSES.price
  }
  
  if (lowerMessage.includes('تواصل') || lowerMessage.includes('اتصال') || lowerMessage.includes('contact')) {
    return FIXED_RESPONSES.contact
  }
  
  if (lowerMessage.includes('تسجيل') || lowerMessage.includes('حساب') || lowerMessage.includes('register')) {
    return FIXED_RESPONSES.register
  }
  
  if (lowerMessage.includes('بيع') || lowerMessage.includes('sell') || lowerMessage.includes('أبيع')) {
    return FIXED_RESPONSES.sell
  }
  
  return FIXED_RESPONSES.default
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required' 
      }, { status: 400 })
    }

    // Get fixed response based on keywords
    const aiResponse = getFixedResponse(message)

    // Get or create conversation history
    const sessionKey = sessionId || 'default'
    let history = conversations.get(sessionKey) || []
    
    // Update conversation history
    history.push({ role: 'user', content: message })
    history.push({ role: 'assistant', content: aiResponse })
    conversations.set(sessionKey, history.slice(-20)) // Keep last 20 messages

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId: sessionKey
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process your message. Please try again.'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (sessionId) {
      conversations.delete(sessionId)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conversation cleared' 
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to clear conversation'
    }, { status: 500 })
  }
}
