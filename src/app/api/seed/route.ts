import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check if already seeded
    const existingUsers = await db.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already seeded' })
    }
    
    // Create sample users
    const user1 = await db.user.create({
      data: {
        firstName: 'Ahmed',
        email: 'ahmed@demo.com',
        password: 'demo123',
      }
    })
    
    const user2 = await db.user.create({
      data: {
        firstName: 'Sara',
        email: 'sara@demo.com',
        password: 'demo123',
      }
    })
    
    const user3 = await db.user.create({
      data: {
        firstName: 'Mohammed',
        email: 'mohammed@demo.com',
        password: 'demo123',
      }
    })
    
    // Create sample listings
    await db.listing.createMany({
      data: [
        {
          title: 'HDPE Plastic Scrap',
          category: 'Plastic',
          quantity: 500,
          price: 250,
          location: 'Dubai',
          lat: 25.20,
          lng: 55.27,
          description: 'Clean HDPE plastic scrap, ready for recycling. High quality material.',
          sellerId: user1.id,
          views: 12,
        },
        {
          title: 'Copper Wire Scrap',
          category: 'Metal',
          quantity: 120,
          price: 1200,
          location: 'Abu Dhabi',
          lat: 24.45,
          lng: 54.37,
          description: 'High purity copper wire. Excellent conductivity.',
          sellerId: user2.id,
          views: 45,
        },
        {
          title: 'Cardboard Boxes',
          category: 'Paper',
          quantity: 1000,
          price: 85,
          location: 'Sharjah',
          lat: 25.36,
          lng: 55.39,
          description: 'Clean cardboard boxes in bulk quantity.',
          sellerId: user1.id,
          views: 28,
        },
        {
          title: 'Electronic Components',
          category: 'Electronics',
          quantity: 50,
          price: 450,
          location: 'Dubai',
          lat: 25.13,
          lng: 55.38,
          description: 'Mixed electronic components from decommissioned servers.',
          sellerId: user2.id,
          views: 67,
        },
        {
          title: 'Aluminum Cans',
          category: 'Metal',
          quantity: 300,
          price: 180,
          location: 'Ras Al Khaimah',
          lat: 25.79,
          lng: 55.95,
          description: 'Crushed aluminum cans, ready for processing.',
          sellerId: user3.id,
          views: 34,
        },
        {
          title: 'PET Bottles',
          category: 'Plastic',
          quantity: 800,
          price: 320,
          location: 'Ajman',
          lat: 25.41,
          lng: 55.51,
          description: 'Clear PET bottles, washed and sorted.',
          sellerId: user1.id,
          views: 22,
        },
        {
          title: 'Old Newspapers',
          category: 'Paper',
          quantity: 2000,
          price: 120,
          location: 'Fujairah',
          lat: 25.12,
          lng: 56.33,
          description: 'Bundled newspapers, excellent for recycling.',
          sellerId: user3.id,
          views: 18,
        },
        {
          title: 'Computer Monitors',
          category: 'Electronics',
          quantity: 25,
          price: 350,
          location: 'Dubai',
          lat: 25.23,
          lng: 55.29,
          description: 'LCD monitors from office clearance.',
          sellerId: user2.id,
          views: 55,
        },
        // New categories
        {
          title: 'Date Palm Waste',
          category: 'Agricultural Waste',
          quantity: 5000,
          price: 75,
          location: 'Al Ain',
          lat: 24.20,
          lng: 55.76,
          description: 'Dried palm fronds and trunks. Perfect for composting or biomass energy.',
          sellerId: user1.id,
          views: 29,
        },
        {
          title: 'Vegetable Farm Residue',
          category: 'Agricultural Waste',
          quantity: 2000,
          price: 60,
          location: 'Sharjah',
          lat: 25.29,
          lng: 55.45,
          description: 'Fresh vegetable scraps and farm residue. Great for animal feed or compost.',
          sellerId: user3.id,
          views: 15,
        },
        {
          title: 'Bakery Surplus Bread',
          category: 'Food Surplus',
          quantity: 150,
          price: 25,
          location: 'Dubai',
          lat: 25.27,
          lng: 55.30,
          description: 'Day-old bread from local bakery. Still fresh, suitable for animal feed or donation.',
          sellerId: user2.id,
          views: 42,
        },
        {
          title: 'Restaurant Food Surplus',
          category: 'Food Surplus',
          quantity: 80,
          price: 40,
          location: 'Abu Dhabi',
          lat: 24.48,
          lng: 54.35,
          description: 'Prepared food surplus from hotel buffet. Must be collected same day.',
          sellerId: user1.id,
          views: 38,
        },
        {
          title: 'Cotton Fabric Scraps',
          category: 'Textiles',
          quantity: 400,
          price: 180,
          location: 'Dubai',
          lat: 25.25,
          lng: 55.33,
          description: 'Clean cotton fabric offcuts from textile factory. Perfect for recycling.',
          sellerId: user2.id,
          views: 21,
        },
        {
          title: 'Mixed Clothing Bales',
          category: 'Textiles',
          quantity: 600,
          price: 150,
          location: 'Sharjah',
          lat: 25.35,
          lng: 55.40,
          description: 'Sorted second-hand clothing in good condition. Ideal for export.',
          sellerId: user3.id,
          views: 33,
        },
        {
          title: 'Glass Bottles Mixed',
          category: 'Glass',
          quantity: 800,
          price: 70,
          location: 'Dubai',
          lat: 25.18,
          lng: 55.25,
          description: 'Mixed glass bottles, sorted by color. Ready for cullet processing.',
          sellerId: user1.id,
          views: 19,
        },
        {
          title: 'Window Glass Sheets',
          category: 'Glass',
          quantity: 200,
          price: 95,
          location: 'Abu Dhabi',
          lat: 24.42,
          lng: 54.40,
          description: 'Clear window glass from building renovation. Clean and flat.',
          sellerId: user2.id,
          views: 24,
        },
      ]
    })
    
    return NextResponse.json({ message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
