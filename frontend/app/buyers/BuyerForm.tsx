'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { buyersApi, type Buyer } from '@/lib/api'
import { buyerFormSchema, type BuyerFormData } from '@/lib/validators'
import {
  CITY_LABELS,
  PROPERTY_TYPE_LABELS,
  BHK_LABELS,
  PURPOSE_LABELS,
  TIMELINE_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
} from '@/lib/validators'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface BuyerFormProps {
  buyer?: Buyer
  mode?: 'create' | 'edit'
}

export function BuyerForm({ buyer, mode = 'create' }: BuyerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerFormSchema),
    defaultValues: buyer ? {
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city as any,
      propertyType: buyer.propertyType as any,
      bhk: buyer.bhk as any,
      purpose: buyer.purpose as any,
      budgetMin: buyer.budgetMin || '',
      budgetMax: buyer.budgetMax || '',
      timeline: buyer.timeline as any,
      source: buyer.source as any,
      status: buyer.status as any,
      notes: buyer.notes || '',
      tags: buyer.tags || [],
    } : {
      tags: [],
      status: 'New',
    },
  })

  const watchedPropertyType = watch('propertyType')
  const watchedTags = watch('tags')

  // Reset BHK when property type changes to non-apartment/villa
  useEffect(() => {
    if (watchedPropertyType && !['Apartment', 'Villa'].includes(watchedPropertyType)) {
      setValue('bhk', undefined)
    }
  }, [watchedPropertyType, setValue])

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !watchedTags.includes(trimmedTag)) {
      setValue('tags', [...watchedTags, trimmedTag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const onSubmit = async (data: BuyerFormData) => {
    try {
      setIsSubmitting(true)

      // Transform form data to API format
      const submitData = {
        ...data,
        email: data.email || undefined,
        notes: data.notes || undefined,
        budgetMin: data.budgetMin ? Number(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? Number(data.budgetMax) : undefined,
        ...(mode === 'edit' && buyer && { updatedAt: buyer.updatedAt }),
      }

      if (mode === 'edit' && buyer) {
        await buyersApi.update(buyer.id, submitData as any)
        toast.success('Buyer updated successfully!')
        router.push(`/buyers/${buyer.id}`)
      } else {
        const response = await buyersApi.create(submitData as any)
        toast.success('Buyer created successfully!')
        router.push(`/buyers/${response.data.id}`)
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('This record has been modified by another user. Please refresh and try again.')
      } else {
        toast.error(error.response?.data?.error || `Failed to ${mode} buyer`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const requiresBHK = watchedPropertyType === 'Apartment' || watchedPropertyType === 'Villa'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="required">
              Full Name *
            </Label>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Enter full name"
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && (
              <p id="fullName-error" className="form-error" role="alert">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Enter phone number"
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p id="phone-error" className="form-error" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" className="form-error" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Select
              id="city"
              {...register('city')}
              aria-describedby={errors.city ? 'city-error' : undefined}
              aria-invalid={!!errors.city}
            >
              <option value="">Select city</option>
              {Object.entries(CITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            {errors.city && (
              <p id="city-error" className="form-error" role="alert">
                {errors.city.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Property Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Property Requirements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select
              id="propertyType"
              {...register('propertyType')}
              aria-describedby={errors.propertyType ? 'propertyType-error' : undefined}
              aria-invalid={!!errors.propertyType}
            >
              <option value="">Select property type</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            {errors.propertyType && (
              <p id="propertyType-error" className="form-error" role="alert">
                {errors.propertyType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bhk">
              BHK {requiresBHK && '*'}
            </Label>
            <Select
              id="bhk"
              {...register('bhk')}
              disabled={!requiresBHK}
              aria-describedby={errors.bhk ? 'bhk-error' : undefined}
              aria-invalid={!!errors.bhk}
            >
              <option value="">Select BHK</option>
              {Object.entries(BHK_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            {errors.bhk && (
              <p id="bhk-error" className="form-error" role="alert">
                {errors.bhk.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Select
              id="purpose"
              {...register('purpose')}
              aria-describedby={errors.purpose ? 'purpose-error' : undefined}
              aria-invalid={!!errors.purpose}
            >
              <option value="">Select purpose</option>
              {Object.entries(PURPOSE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            {errors.purpose && (
              <p id="purpose-error" className="form-error" role="alert">
                {errors.purpose.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline *</Label>
            <Select
              id="timeline"
              {...register('timeline')}
              aria-describedby={errors.timeline ? 'timeline-error' : undefined}
              aria-invalid={!!errors.timeline}
            >
              <option value="">Select timeline</option>
              {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            {errors.timeline && (
              <p id="timeline-error" className="form-error" role="alert">
                {errors.timeline.message}
              </p>
            )}
          </div>
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budgetMin">Minimum Budget (₹)</Label>
            <Input
              id="budgetMin"
              type="number"
              {...register('budgetMin')}
              placeholder="Enter minimum budget"
              aria-describedby={errors.budgetMin ? 'budgetMin-error' : undefined}
              aria-invalid={!!errors.budgetMin}
            />
            {errors.budgetMin && (
              <p id="budgetMin-error" className="form-error" role="alert">
                {errors.budgetMin.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetMax">Maximum Budget (₹)</Label>
            <Input
              id="budgetMax"
              type="number"
              {...register('budgetMax')}
              placeholder="Enter maximum budget"
              aria-describedby={errors.budgetMax ? 'budgetMax-error' : undefined}
              aria-invalid={!!errors.budgetMax}
            />
            {errors.budgetMax && (
              <p id="budgetMax-error" className="form-error" role="alert">
                {errors.budgetMax.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lead Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Lead Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <Select
              id="source"
              {...register('source')}
              aria-describedby={errors.source ? 'source-error' : undefined}
              aria-invalid={!!errors.source}
            >
              <option value="">Select source</option>
              {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            {errors.source && (
              <p id="source-error" className="form-error" role="alert">
                {errors.source.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              {...register('status')}
              aria-describedby={errors.status ? 'status-error' : undefined}
              aria-invalid={!!errors.status}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            {errors.status && (
              <p id="status-error" className="form-error" role="alert">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tagInput">Tags</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes about the buyer..."
            rows={4}
            aria-describedby={errors.notes ? 'notes-error' : undefined}
            aria-invalid={!!errors.notes}
          />
          {errors.notes && (
            <p id="notes-error" className="form-error" role="alert">
              {errors.notes.message}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {mode === 'edit' ? 'Update Buyer' : 'Create Buyer'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
