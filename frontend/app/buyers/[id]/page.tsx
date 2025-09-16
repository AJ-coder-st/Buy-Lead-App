'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { buyersApi, type Buyer, type BuyerHistory } from '@/lib/api'
import { formatBudgetRange, formatPhoneNumber, formatDate, getStatusColor } from '@/lib/utils'
import {
  CITY_LABELS,
  PROPERTY_TYPE_LABELS,
  BHK_LABELS,
  PURPOSE_LABELS,
  TIMELINE_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
} from '@/lib/validators'
import { Edit, Trash2, ArrowLeft, History, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BuyerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const buyerId = params.id as string

  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [history, setHistory] = useState<BuyerHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBuyer()
    loadHistory()
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

  const loadHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await buyersApi.getHistory(buyerId)
      setHistory(response.data)
    } catch (err: any) {
      console.error('Failed to load history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!buyer) return
    
    if (!confirm(`Are you sure you want to delete ${buyer.fullName}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleting(true)
      await buyersApi.delete(buyerId)
      toast.success('Buyer deleted successfully')
      router.push('/buyers')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete buyer')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !buyer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error || 'Buyer not found'}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push('/buyers')}>
                Back to Buyers
              </Button>
              <Button variant="outline" onClick={loadBuyer}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{buyer.fullName}</h1>
              <p className="text-muted-foreground">
                Lead created {formatDate(buyer.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(`/buyers/${buyerId}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              {deleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-lg">{formatPhoneNumber(buyer.phone)}</p>
                  </div>
                  {buyer.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-lg">{buyer.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p>{CITY_LABELS[buyer.city]}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Property Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property Type</label>
                    <p className="text-lg">{PROPERTY_TYPE_LABELS[buyer.propertyType]}</p>
                  </div>
                  {buyer.bhk && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">BHK</label>
                      <p className="text-lg">{BHK_LABELS[buyer.bhk]}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                    <p className="text-lg">{PURPOSE_LABELS[buyer.purpose]}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timeline</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{TIMELINE_LABELS[buyer.timeline]}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                    <p className="text-lg font-semibold">
                      {formatBudgetRange(buyer.budgetMin, buyer.budgetMax)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {buyer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{buyer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(buyer.status)}>
                      {STATUS_LABELS[buyer.status]}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p>{SOURCE_LABELS[buyer.source]}</p>
                </div>

                {(() => {
                  const parsedTags = typeof buyer.tags === 'string' 
                    ? JSON.parse(buyer.tags || '[]') 
                    : buyer.tags || [];
                  
                  return parsedTags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsedTags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-2 border-t text-sm text-muted-foreground">
                  <p>Last updated: {formatDate(buyer.updatedAt)}</p>
                  <p>Owner: {buyer.owner.name || buyer.owner.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((entry) => (
                      <div key={entry.id} className="border-l-2 border-muted pl-4 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Changes made</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(entry.changedAt)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(entry.diff).map(([field, [oldVal, newVal]]) => (
                            <div key={field} className="text-sm">
                              <span className="font-medium capitalize">{field}:</span>
                              <br />
                              <span className="text-muted-foreground line-through">
                                {String(oldVal || 'empty')}
                              </span>
                              {' → '}
                              <span className="text-green-600">
                                {String(newVal || 'empty')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No changes recorded yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
