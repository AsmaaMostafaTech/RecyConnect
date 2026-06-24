import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// GET single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
          }
        }
      }
    })
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    // Increment views
    await db.listing.update({
      where: { id },
      data: { views: { increment: 1 } }
    })
    
    return NextResponse.json({
      listing: {
        id: listing.id,
        title: listing.title,
        category: listing.category,
        quantity: listing.quantity,
        price: listing.price,
        location: listing.location,
        lat: listing.lat,
        lng: listing.lng,
        description: listing.description,
        views: listing.views + 1,
        sellerId: listing.sellerId,
        sellerName: listing.seller.firstName,
        createdAt: listing.createdAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    
    const listing = await db.listing.findUnique({
      where: { id }
    })
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    
    await db.listing.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
