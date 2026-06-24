import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// GET notifications for current user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    })
    
    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        read: n.read,
        timestamp: n.timestamp.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE all notifications
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await db.notification.deleteMany({
      where: { userId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
