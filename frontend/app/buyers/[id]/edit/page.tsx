'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { BuyerForm } from '../../BuyerForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { buyersApi, type Buyer } from '@/lib/api'
import toast from 'react-hot-toast'

export default function EditBuyerPage() {
  const params = useParams()
  const buyerId = params.id as string
  
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBuyer()
  }, [buyerId])

  const loadBuyer = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await buyersApi.get(buyerId)
      setBuyer(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load buyer')
      toast.error('Failed to load buyer details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !buyer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error || 'Buyer not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Buyer Lead - {buyer.fullName}</CardTitle>
        </CardHeader>
        <CardContent>
          <BuyerForm buyer={buyer} mode="edit" />
        </CardContent>
      </Card>
    </div>
  )
}
