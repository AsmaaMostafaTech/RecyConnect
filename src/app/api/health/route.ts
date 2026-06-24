import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1 as test`
    return NextResponse.json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: String(error)
    }, { status: 500 })
  }
}
