'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { buyersApi, type Buyer, type BuyerListResponse } from '@/lib/api'
import { formatBudgetRange, formatPhoneNumber, formatRelativeTime, getStatusColor } from '@/lib/utils'
import { 
  CITY_LABELS, 
  PROPERTY_TYPE_LABELS, 
  BHK_LABELS, 
  TIMELINE_LABELS,
  STATUS_LABELS 
} from '@/lib/validators'
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export function BuyersList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<BuyerListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    loadBuyers()
  }, [searchParams])

  const loadBuyers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const query = {
        page: currentPage,
        pageSize: 10,
        q: searchParams.get('q') || undefined,
        city: searchParams.get('city') || undefined,
        propertyType: searchParams.get('propertyType') || undefined,
        status: searchParams.get('status') || undefined,
        timeline: searchParams.get('timeline') || undefined,
        sort: searchParams.get('sort') || 'updatedAt_desc',
      }

      console.log('Loading buyers with query:', query)
      const response = await buyersApi.list(query)
      console.log('API Response:', response.data)
      
      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid API response structure')
      }
      
      if (!response.data.buyers || !Array.isArray(response.data.buyers)) {
        throw new Error('Invalid buyers data in response')
      }
      
      if (!response.data.pagination || typeof response.data.pagination !== 'object') {
        throw new Error('Invalid pagination data in response')
      }
      
      setData(response.data)
    } catch (err: any) {
      console.error('Error loading buyers:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load buyers'
      setError(errorMessage)
      // Don't show toast error immediately, let user see the error state
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(id)
      await buyersApi.delete(id)
      toast.success('Buyer deleted successfully')
      loadBuyers() // Reload the list
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete buyer')
    } finally {
      setDeletingId(null)
    }
  }

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/buyers?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-muted-foreground">Loading buyers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-destructive text-lg font-medium">Unable to load buyers</div>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadBuyers} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (!data || data.buyers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No buyers found</h3>
            <p className="text-muted-foreground">
              {searchParams.toString() 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by adding your first buyer lead."
              }
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => router.push('/buyers/new')}>
                Add First Lead
              </Button>
              {searchParams.toString() && (
                <Button variant="outline" onClick={() => router.push('/buyers')}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, data.pagination.total)} of {data.pagination.total} results
        </p>
      </div>

      {/* Buyers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium">Property</th>
                  <th className="text-left p-4 font-medium">Budget</th>
                  <th className="text-left p-4 font-medium">Timeline</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Updated</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.buyers.map((buyer) => {
                  const parsedTags = typeof buyer.tags === 'string' 
                    ? JSON.parse(buyer.tags || '[]') 
                    : buyer.tags || [];
                  
                  return (
                    <tr key={buyer.id} className="border-b hover:bg-muted/25 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{buyer.fullName}</div>
                          {parsedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {parsedTags.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {parsedTags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{parsedTags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm">{formatPhoneNumber(buyer.phone)}</div>
                          {buyer.email && (
                            <div className="text-xs text-muted-foreground">{buyer.email}</div>
                          )}
                        </div>
                      </td>
                    
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            {PROPERTY_TYPE_LABELS[buyer.propertyType]}
                            {buyer.bhk && ` - ${BHK_LABELS[buyer.bhk]}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {CITY_LABELS[buyer.city]}
                          </div>
                        </div>
                      </td>
                    
                      <td className="p-4">
                        <div className="text-sm">
                          {formatBudgetRange(buyer.budgetMin, buyer.budgetMax)}
                        </div>
                      </td>
                    
                      <td className="p-4">
                        <div className="text-sm">
                          {TIMELINE_LABELS[buyer.timeline]}
                        </div>
                      </td>
                    
                      <td className="p-4">
                        <Badge className={getStatusColor(buyer.status)}>
                          {STATUS_LABELS[buyer.status]}
                        </Badge>
                      </td>
                    
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">
                          {formatRelativeTime(buyer.updatedAt)}
                        </div>
                      </td>
                    
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/buyers/${buyer.id}`)}
                            aria-label={`View ${buyer.fullName}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/buyers/${buyer.id}/edit`)}
                            aria-label={`Edit ${buyer.fullName}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(buyer.id, buyer.fullName)}
                            disabled={deletingId === buyer.id}
                            aria-label={`Delete ${buyer.fullName}`}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deletingId === buyer.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {data.pagination.totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToPage(currentPage - 1)}
              disabled={!data.pagination.hasPrev}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i
                if (pageNum > data.pagination.totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => navigateToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToPage(currentPage + 1)}
              disabled={!data.pagination.hasNext}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
