import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// GET messages for a chat
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    
    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }
    
    // Verify user is participant
    const participant = await db.chatParticipant.findFirst({
      where: { chatId, userId }
    })
    
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized for this chat' }, { status: 403 })
    }
    
    const messages = await db.message.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
    })
    
    return NextResponse.json({
      messages: messages.map(m => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.timestamp.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST send message
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { chatId, text } = await request.json()
    
    if (!chatId || !text) {
      return NextResponse.json({ error: 'Chat ID and text are required' }, { status: 400 })
    }
    
    // Verify user is participant
    const participant = await db.chatParticipant.findFirst({
      where: { chatId, userId }
    })
    
    if (!participant) {
      return NextResponse.json({ error: 'Not authorized for this chat' }, { status: 403 })
    }
    
    const message = await db.message.create({
      data: {
        chatId,
        senderId: userId,
        text,
      }
    })
    
    // Update chat updatedAt
    await db.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })
    
    return NextResponse.json({
      message: {
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        text: message.text,
        timestamp: message.timestamp.toISOString(),
      }
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
