import { describe, it, expect } from 'vitest'
import { formatCurrency, formatBudgetRange, formatPhoneNumber, debounce } from '../utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000000)).toBe('₹10,00,000')
      expect(formatCurrency(500000)).toBe('₹5,00,000')
      expect(formatCurrency(null)).toBe('-')
      expect(formatCurrency(undefined)).toBe('-')
    })
  })

  describe('formatBudgetRange', () => {
    it('should format budget range correctly', () => {
      expect(formatBudgetRange(500000, 1000000)).toBe('₹5,00,000 - ₹10,00,000')
      expect(formatBudgetRange(500000, null)).toBe('₹5,00,000+')
      expect(formatBudgetRange(null, 1000000)).toBe('Up to ₹10,00,000')
      expect(formatBudgetRange(null, null)).toBe('-')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format Indian phone numbers', () => {
      expect(formatPhoneNumber('9876543210')).toBe('+91 98765 43210')
      expect(formatPhoneNumber('1234567890')).toBe('+91 12345 67890')
      expect(formatPhoneNumber('123')).toBe('123') // Invalid length
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0
      const debouncedFn = debounce(() => {
        callCount++
      }, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      // Should not be called immediately
      expect(callCount).toBe(0)

      // Should be called once after delay
      setTimeout(() => {
        expect(callCount).toBe(1)
        done()
      }, 150)
    })
  })
})
