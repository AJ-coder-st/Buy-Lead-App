import { NextRequest, NextResponse } from 'next/server'

const mockBuyers = [
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('pageSize') || '10', 10)
    const q = (searchParams.get('q') || '').toLowerCase()
    const city = searchParams.get('city') || ''
    const propertyType = searchParams.get('propertyType') || ''
    const status = searchParams.get('status') || ''

    let filtered = [...mockBuyers]
    if (q) {
      filtered = filtered.filter(
        (b) =>
          b.fullName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.phone.includes(q)
      )
    }
    if (city) filtered = filtered.filter((b) => b.city === city)
    if (propertyType) filtered = filtered.filter((b) => b.propertyType === propertyType)
    if (status) filtered = filtered.filter((b) => b.status === status)

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const items = filtered.slice(startIndex, endIndex)

    return NextResponse.json({
      buyers: items,
      pagination: {
        page,
        pageSize: limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: endIndex < filtered.length,
        hasPrev: startIndex > 0,
      },
    })
  } catch (error) {
    console.error('Error in buyers API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const newBuyer = {
    id: String(mockBuyers.length + 1),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockBuyers.push(newBuyer)
  return NextResponse.json(newBuyer, { status: 201 })
}


