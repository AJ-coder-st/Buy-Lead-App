import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-muted-foreground">Loading buyers...</span>
      </div>
    </div>
  )
}
