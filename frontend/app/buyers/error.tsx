'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Buyers page error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground text-center max-w-md">
          An unexpected error occurred while loading the buyers page. Please try again.
        </p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  )
}
