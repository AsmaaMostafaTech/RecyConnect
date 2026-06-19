import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// System prompt for the recycling marketplace assistant
const SYSTEM_PROMPT = `You are RecyBot, an intelligent AI assistant for RecyConnect - a premium recycling materials marketplace. 

Your role is to help users with:
- Finding recycling materials of all types
- Understanding pricing and market trends
- Connecting buyers with sellers
- Answering questions about recycling processes
- Providing tips for sustainable trading

Guidelines:
- Be friendly, professional, and helpful
- Provide specific, actionable advice
- If asked about prices, mention they vary by material type and quality
- Encourage sustainable practices
- Keep responses concise but informative (2-4 sentences unless more detail is needed)
- Use emojis occasionally to make responses more engaging ♻️
- If you don't know something specific about a listing, suggest they browse the marketplace

Marketplace categories:
- Plastic: HDPE, LDPE, PET, PP, PS, bottles, containers, packaging
- Metal: Copper, Aluminum, Steel, Iron, scrap metal
- Paper: Cardboard, Office paper, Newspaper, books
- Electronics: E-waste, Circuit boards, Components, devices
- Agricultural Waste: Crop residues, organic farm waste, plant matter
- Food Surplus: Excess food, perishables, near-expiry items
- Textiles: Clothes, fabrics, shoes, linens
- Glass: Bottles, jars, windows, containers

Price ranges (approximate):
- Plastic: $250-400 per ton
- Metal: $800-1500 per ton (copper higher, up to $3000)
- Paper: $100-200 per ton
- Electronics: Varies widely by type ($50-2000)
- Agricultural Waste: $50-150 per ton
- Food Surplus: Often free or minimal cost for pickup
- Textiles: $100-300 per ton
- Glass: $50-100 per ton

Always be encouraging about recycling and sustainability! 🌱`

// Store conversation histories (in production, use a database)
const conversations = new Map<string, Array<{role: 'user' | 'assistant', content: string}>>()

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
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

    const zai = await getZAI()

    // Get or create conversation history
    const sessionKey = sessionId || 'default'
    let history = conversations.get(sessionKey) || []
    
    // Build messages array
    const messages = [
      { role: 'assistant' as const, content: SYSTEM_PROMPT },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user' as const, content: message }
    ]

    // Get AI completion
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' }
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.'

    // Update conversation history
    history.push({ role: 'user', content: message })
    history.push({ role: 'assistant', content: aiResponse })
    conversations.set(sessionKey, history.slice(-20)) // Keep last 20 messages

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId: sessionKey
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
