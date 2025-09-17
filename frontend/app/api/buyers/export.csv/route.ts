import { NextResponse } from 'next/server'

export async function GET() {
  const csv = 'id,fullName,email,phone\n1,John Doe,john@example.com,9876543210\n2,Priya Sharma,priya@example.com,9811122233\n'
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="buyers.csv"',
    },
  })
}


