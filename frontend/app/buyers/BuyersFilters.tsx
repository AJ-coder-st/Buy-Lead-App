'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { debounce } from '@/lib/utils'
import { 
  CITY_LABELS, 
  PROPERTY_TYPE_LABELS, 
  STATUS_LABELS, 
  TIMELINE_LABELS 
} from '@/lib/validators'
import { Search, Filter, X, Plus, Download, Upload } from 'lucide-react'

export function BuyersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [timeline, setTimeline] = useState(searchParams.get('timeline') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'updatedAt_desc')
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    updateURL({ q: query || undefined })
  }, 500)

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery])

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when filters change
    if (Object.keys(updates).some(key => key !== 'page')) {
      params.delete('page')
    }
    
    router.push(`/buyers?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCity('')
    setPropertyType('')
    setStatus('')
    setTimeline('')
    setSort('updatedAt_desc')
    router.push('/buyers')
  }

  const hasActiveFilters = searchQuery || city || propertyType || status || timeline

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and Actions Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search buyers"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
                aria-expanded={showFilters}
                aria-controls="filters-panel"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {[searchQuery, city, propertyType, status, timeline].filter(Boolean).length}
                  </span>
                )}
              </Button>
              
              <Button
                onClick={() => router.push('/buyers/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Lead
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/buyers/import')}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  window.open(`/api/buyers/export.csv?${params.toString()}`, '_blank')
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div id="filters-panel" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="city-filter">City</Label>
                <Select
                  id="city-filter"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value)
                    updateURL({ city: e.target.value || undefined })
                  }}
                >
                  <option value="">All Cities</option>
                  {Object.entries(CITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property-type-filter">Property Type</Label>
                <Select
                  id="property-type-filter"
                  value={propertyType}
                  onChange={(e) => {
                    setPropertyType(e.target.value)
                    updateURL({ propertyType: e.target.value || undefined })
                  }}
                >
                  <option value="">All Types</option>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  id="status-filter"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    updateURL({ status: e.target.value || undefined })
                  }}
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline-filter">Timeline</Label>
                <Select
                  id="timeline-filter"
                  value={timeline}
                  onChange={(e) => {
                    setTimeline(e.target.value)
                    updateURL({ timeline: e.target.value || undefined })
                  }}
                >
                  <option value="">All Timelines</option>
                  {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort-filter">Sort By</Label>
                <Select
                  id="sort-filter"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    updateURL({ sort: e.target.value })
                  }}
                >
                  <option value="updatedAt_desc">Recently Updated</option>
                  <option value="updatedAt_asc">Oldest Updated</option>
                  <option value="createdAt_desc">Recently Created</option>
                  <option value="createdAt_asc">Oldest Created</option>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters & Clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        updateURL({ q: undefined })
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    City: {CITY_LABELS[city]}
                    <button
                      onClick={() => {
                        setCity('')
                        updateURL({ city: undefined })
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                      aria-label="Clear city filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {propertyType && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    Type: {PROPERTY_TYPE_LABELS[propertyType]}
                    <button
                      onClick={() => {
                        setPropertyType('')
                        updateURL({ propertyType: undefined })
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                      aria-label="Clear property type filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {status && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    Status: {STATUS_LABELS[status]}
                    <button
                      onClick={() => {
                        setStatus('')
                        updateURL({ status: undefined })
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                      aria-label="Clear status filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {timeline && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    Timeline: {TIMELINE_LABELS[timeline]}
                    <button
                      onClick={() => {
                        setTimeline('')
                        updateURL({ timeline: undefined })
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                      aria-label="Clear timeline filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
