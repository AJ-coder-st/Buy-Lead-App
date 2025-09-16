'use client'

import { Suspense } from 'react'
import { BuyersList } from './BuyersList'
import { BuyersFilters } from './BuyersFilters'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function BuyersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buyer Leads</h1>
            <p className="text-muted-foreground">
              Manage and track your buyer leads efficiently
            </p>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <BuyersFilters />
          <BuyersList />
        </Suspense>
      </div>
    </div>
  )
}
