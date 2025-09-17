import { NextResponse } from 'next/server'

export async function POST() {
  const mockUser = {
    id: 'demo-user-123',
    email: 'demo@buyapp.com',
    name: 'Demo User',
    role: 'admin',
  }

  const mockToken = `mock-jwt-token-${Date.now()}`

  return NextResponse.json({ success: true, token: mockToken, user: mockUser })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}


