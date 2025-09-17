import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = {
    id: 'demo-user-123',
    email: 'demo@buyapp.com',
    name: 'Demo User',
    role: 'admin',
  }

  return NextResponse.json({ user })
}


