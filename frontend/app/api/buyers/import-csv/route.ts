import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// This endpoint mocks CSV import for demo deployments.
// It returns the structure expected by the frontend Import page.
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }

  // We don't actually parse the CSV in the Edge runtime mock.
  // Return a deterministic, successful response matching ImportResult.
  const totalRows = 2
  const successfulImports = 2
  const failedImports = 0
  const errors: Array<{ row: number; errors: string[]; data?: unknown }> = []
  const warnings: string[] = []

  return NextResponse.json({
    success: true,
    message: `Imported ${successfulImports} buyers successfully`,
    data: {
      totalRows,
      successfulImports,
      failedImports,
      errors,
      warnings,
    },
  })
}


