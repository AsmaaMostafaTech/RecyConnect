import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        createdAt: true,
        _count: {
          select: { listings: true }
        }
      }
    })
    
    const listings = await db.listing.findMany({
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const chats = await db.chat.findMany({
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      }
    })
    
    const messages = await db.message.findMany({
      include: {
        sender: {
          select: { id: true, firstName: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    })

    return NextResponse.json({
      database: {
        users: {
          count: users.length,
          data: users
        },
        listings: {
          count: listings.length,
          data: listings
        },
        chats: {
          count: chats.length,
          data: chats
        },
        messages: {
          count: await db.message.count(),
          latest: messages
        }
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
