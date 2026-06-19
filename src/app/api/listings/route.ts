import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// GET all listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const sellerId = searchParams.get('sellerId')
    
    let where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (sellerId) {
      where.sellerId = sellerId
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-low') orderBy = { price: 'asc' }
    if (sort === 'price-high') orderBy = { price: 'desc' }
    
    const listings = await db.listing.findMany({
      where,
      orderBy,
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
          }
        }
      }
    })
    
    const formattedListings = listings.map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      quantity: l.quantity,
      price: l.price,
      location: l.location,
      lat: l.lat,
      lng: l.lng,
      description: l.description,
      views: l.views,
      sellerId: l.sellerId,
      sellerName: l.seller.firstName,
      createdAt: l.createdAt.toISOString(),
    }))
    
    return NextResponse.json({ listings: formattedListings })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST new listing
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { title, category, quantity, price, location, lat, lng, description } = await request.json()
    
    if (!title || !category || !quantity || !price || !location) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }
    
    const listing = await db.listing.create({
      data: {
        title,
        category,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        location,
        lat: lat ? parseFloat(lat) : 25.0 + Math.random() * 2,
        lng: lng ? parseFloat(lng) : 55.0 + Math.random() * 2,
        description,
        sellerId: userId,
      },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
          }
        }
      }
    })
    
    // Create notification
    await db.notification.create({
      data: {
        title: `New listing: ${title}`,
        userId,
      }
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
        views: listing.views,
        sellerId: listing.sellerId,
        sellerName: listing.seller.firstName,
        createdAt: listing.createdAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
