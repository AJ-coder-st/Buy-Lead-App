import { NextRequest, NextResponse } from 'next/server'

// Use the same in-memory list as buyers list file during runtime
// Note: In production, these routes should call the backend API
let buyersCache: any[] | null = null

function getBuyers() {
  if (!buyersCache) {
    buyersCache = [
      {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: 'Three',
        purpose: 'Buy',
        budgetMin: 5000000,
        budgetMax: 7000000,
        timeline: 'ZeroToThree',
        source: 'Website',
        status: 'New',
        notes: 'Looking for 3BHK apartment',
        tags: [],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        fullName: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9811122233',
        city: 'Mohali',
        propertyType: 'Villa',
        bhk: 'Four',
        purpose: 'Buy',
        budgetMin: 12000000,
        budgetMax: 15000000,
        timeline: 'ThreeToSix',
        source: 'Referral',
        status: 'Contacted',
        notes: 'Prefers sea-facing villa',
        tags: [],
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-16T09:15:00Z',
      },
    ]
  }
  return buyersCache
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const buyers = getBuyers()
  const buyer = buyers.find((b) => b.id === params.id)
  if (!buyer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(buyer)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const buyers = getBuyers()
  const idx = buyers.findIndex((b) => b.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  buyers[idx] = { ...buyers[idx], ...body, updatedAt: new Date().toISOString() }
  return NextResponse.json(buyers[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const buyers = getBuyers()
  const idx = buyers.findIndex((b) => b.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  buyers.splice(idx, 1)
  return new NextResponse(null, { status: 204 })
}


