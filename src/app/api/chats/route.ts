import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// GET all chats for current user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const participations = await db.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                  }
                }
              }
            },
            messages: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            }
          }
        }
      }
    })
    
    const chats = participations.map(p => {
      const chat = p.chat
      const otherParticipants = chat.participants.filter(pp => pp.userId !== userId)
      const participantNames: Record<string, string> = {}
      chat.participants.forEach(pp => {
        participantNames[pp.userId] = pp.user.firstName
      })
      
      return {
        id: chat.id,
        participants: chat.participants.map(pp => pp.userId),
        participantNames,
        lastMessage: chat.messages[0]?.text,
        updatedAt: chat.updatedAt.toISOString(),
      }
    })
    
    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Get chats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new chat
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { otherUserId } = await request.json()
    
    if (!otherUserId) {
      return NextResponse.json({ error: 'Other user ID is required' }, { status: 400 })
    }
    
    // Check if chat already exists
    const existingChats = await db.chat.findMany({
      include: {
        participants: true,
      }
    })
    
    const existing = existingChats.find(chat => {
      const participantIds = chat.participants.map(p => p.userId)
      return participantIds.includes(userId) && participantIds.includes(otherUserId)
    })
    
    if (existing) {
      const participantNames: Record<string, string> = {}
      const participants = await db.chatParticipant.findMany({
        where: { chatId: existing.id },
        include: { user: { select: { firstName: true } } }
      })
      participants.forEach(p => {
        participantNames[p.userId] = p.user.firstName
      })
      
      return NextResponse.json({
        chat: {
          id: existing.id,
          participants: participants.map(p => p.userId),
          participantNames,
          updatedAt: existing.updatedAt.toISOString(),
        }
      })
    }
    
    // Create new chat
    const chat = await db.chat.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: otherUserId },
          ]
        }
      }
    })
    
    const participantNames: Record<string, string> = {}
    const participants = await db.chatParticipant.findMany({
      where: { chatId: chat.id },
      include: { user: { select: { firstName: true } } }
    })
    participants.forEach(p => {
      participantNames[p.userId] = p.user.firstName
    })
    
    return NextResponse.json({
      chat: {
        id: chat.id,
        participants: participants.map(p => p.userId),
        participantNames,
        updatedAt: chat.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Create chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
