import { describe, it, expect } from 'vitest';
import { validateBudget, validateCSVRow } from '../validators/buyer';

describe('Buyer Validation', () => {
  describe('validateBudget', () => {
    it('should return true when budgetMax >= budgetMin', () => {
      expect(validateBudget(100000, 200000)).toBe(true);
      expect(validateBudget(100000, 100000)).toBe(true);
    });

    it('should return false when budgetMax < budgetMin', () => {
      expect(validateBudget(200000, 100000)).toBe(false);
    });

    it('should return true when only one budget is provided', () => {
      expect(validateBudget(100000, undefined)).toBe(true);
      expect(validateBudget(undefined, 200000)).toBe(true);
    });

    it('should return true when no budgets are provided', () => {
      expect(validateBudget(undefined, undefined)).toBe(true);
    });
  });

  describe('validateCSVRow', () => {
    const validRow = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: 'Three',
      purpose: 'Buy',
      budgetMin: 500000,
      budgetMax: 700000,
      timeline: 'ZeroToThree',
      source: 'Website',
      notes: 'Looking for apartment',
      tags: '["urgent"]',
      status: 'New'
    };

    it('should validate a correct CSV row', () => {
      const result = validateCSVRow(validRow);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject row with invalid email', () => {
      const invalidRow = { ...validRow, email: 'invalid-email' };
      const result = validateCSVRow(invalidRow);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('email'))).toBe(true);
    });

    it('should reject row with short phone number', () => {
      const invalidRow = { ...validRow, phone: '123' };
      const result = validateCSVRow(invalidRow);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Phone number'))).toBe(true);
    });

    it('should reject row with budgetMax < budgetMin', () => {
      const invalidRow = { ...validRow, budgetMin: 700000, budgetMax: 500000 };
      const result = validateCSVRow(invalidRow);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Budget max'))).toBe(true);
    });

    it('should reject Apartment without BHK', () => {
      const invalidRow = { ...validRow, propertyType: 'Apartment', bhk: '' };
      const result = validateCSVRow(invalidRow);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('BHK is required'))).toBe(true);
    });

    it('should allow Plot without BHK', () => {
      const validPlotRow = { ...validRow, propertyType: 'Plot', bhk: '' };
      const result = validateCSVRow(validPlotRow);
      expect(result.isValid).toBe(true);
    });

    it('should reject row with too long notes', () => {
      const invalidRow = { ...validRow, notes: 'a'.repeat(1001) };
      const result = validateCSVRow(invalidRow);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Notes must be less than 1000'))).toBe(true);
    });

    it('should handle empty optional fields', () => {
      const rowWithEmptyFields = {
        ...validRow,
        email: '',
        notes: '',
        budgetMin: '',
        budgetMax: '',
        bhk: '',
        propertyType: 'Plot' // Plot doesn't require BHK
      };
      const result = validateCSVRow(rowWithEmptyFields);
      expect(result.isValid).toBe(true);
    });
  });
});
