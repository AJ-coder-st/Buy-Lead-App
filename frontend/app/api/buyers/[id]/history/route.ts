import { NextResponse } from 'next/server'

export async function GET() {
  const history = [
    {
      id: 'h1',
      buyerId: '1',
      changedBy: 'demo-user-123',
      changedAt: new Date().toISOString(),
      diff: { status: ['New', 'Contacted'] },
    },
  ]
  return NextResponse.json(history)
}


