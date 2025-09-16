import { z } from 'zod';

// Enhanced enum mappings with fuzzy matching
export const EnumMappings = {
  city: {
    'chandigarh': 'Chandigarh',
    'mohali': 'Mohali', 
    'zirakpur': 'Zirakpur',
    'panchkula': 'Panchkula',
    'other': 'Other',
    // Common variations
    'chd': 'Chandigarh',
    'chandi': 'Chandigarh',
    'pkula': 'Panchkula',
    'panchula': 'Panchkula'
  },
  propertyType: {
    'apartment': 'Apartment',
    'villa': 'Villa',
    'plot': 'Plot', 
    'office': 'Office',
    'retail': 'Retail',
    // Common variations
    'apt': 'Apartment',
    'flat': 'Apartment',
    'house': 'Villa',
    'bungalow': 'Villa',
    'shop': 'Retail',
    'commercial': 'Office'
  },
  bhk: {
    'studio': 'Studio',
    'one': 'One',
    'two': 'Two', 
    'three': 'Three',
    'four': 'Four',
    // Numeric variations
    '0': 'Studio',
    '1': 'One',
    '2': 'Two',
    '3': 'Three', 
    '4': 'Four',
    '1bhk': 'One',
    '2bhk': 'Two',
    '3bhk': 'Three',
    '4bhk': 'Four'
  },
  purpose: {
    'buy': 'Buy',
    'rent': 'Rent',
    'purchase': 'Buy',
    'sale': 'Buy',
    'rental': 'Rent',
    'lease': 'Rent'
  },
  timeline: {
    'zerotothree': 'ZeroToThree',
    'threetosix': 'ThreeToSix', 
    'morethansix': 'MoreThanSix',
    'exploring': 'Exploring',
    // Common variations
    '0-3': 'ZeroToThree',
    '3-6': 'ThreeToSix',
    '6+': 'MoreThanSix',
    'immediate': 'ZeroToThree',
    'asap': 'ZeroToThree',
    'flexible': 'Exploring',
    'later': 'MoreThanSix'
  },
  source: {
    'website': 'Website',
    'referral': 'Referral',
    'walkin': 'WalkIn',
    'call': 'Call',
    'other': 'Other',
    // Common variations
    'web': 'Website',
    'online': 'Website',
    'reference': 'Referral',
    'phone': 'Call',
    'telephone': 'Call',
    'walk-in': 'WalkIn',
    'visit': 'WalkIn'
  },
  status: {
    'new': 'New',
    'qualified': 'Qualified',
    'contacted': 'Contacted', 
    'visited': 'Visited',
    'negotiation': 'Negotiation',
    'converted': 'Converted',
    'dropped': 'Dropped',
    // Common variations
    'fresh': 'New',
    'lead': 'New',
    'prospect': 'Qualified',
    'called': 'Contacted',
    'reached': 'Contacted',
    'site-visit': 'Visited',
    'viewing': 'Visited',
    'deal': 'Negotiation',
    'bargaining': 'Negotiation',
    'closed': 'Converted',
    'won': 'Converted',
    'lost': 'Dropped',
    'rejected': 'Dropped'
  }
};

export class CSVDataCleaner {
  static cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Remove country code if present (91 for India)
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned.substring(2);
    }
    return cleaned;
  }

  static cleanEmail(email: string): string {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  static cleanBudget(budget: string): number | undefined {
    if (!budget || budget.trim() === '') return undefined;
    
    // Remove currency symbols and commas
    const cleaned = budget.replace(/[₹,$,\s]/g, '');
    
    // Handle 'L' for lakhs, 'Cr' for crores
    if (cleaned.toLowerCase().includes('l')) {
      const num = parseFloat(cleaned.replace(/l/gi, ''));
      return isNaN(num) ? undefined : num * 100000;
    }
    if (cleaned.toLowerCase().includes('cr')) {
      const num = parseFloat(cleaned.replace(/cr/gi, ''));
      return isNaN(num) ? undefined : num * 10000000;
    }
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }

  static cleanTags(tags: string): string[] {
    if (!tags || tags.trim() === '' || tags.trim() === '[]') return [];
    
    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed.map(tag => String(tag).trim()).filter(tag => tag);
      }
    } catch {
      // Not JSON, try comma-separated
    }
    
    // Split by comma and clean
    return tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag && tag !== '[]' && tag !== 'null' && tag !== 'undefined');
  }

  static mapEnumValue<T extends keyof typeof EnumMappings>(
    field: T, 
    value: string
  ): string | null {
    if (!value || value.trim() === '') return null;
    
    const cleanValue = value.toLowerCase().trim();
    const mapping = EnumMappings[field] as Record<string, string>;
    
    // Direct match
    if (mapping[cleanValue]) {
      return mapping[cleanValue];
    }
    
    // Fuzzy match - find closest
    const keys = Object.keys(mapping);
    for (const key of keys) {
      if (cleanValue.includes(key) || key.includes(cleanValue)) {
        return mapping[key];
      }
    }
    
    return null; // No match found
  }

  static cleanRowData(row: any): any {
    const cleaned = { ...row };

    // Clean string fields
    Object.keys(cleaned).forEach(key => {
      if (typeof cleaned[key] === 'string') {
        cleaned[key] = cleaned[key].trim();
      }
    });

    // Clean phone
    if (cleaned.phone) {
      cleaned.phone = this.cleanPhoneNumber(cleaned.phone);
    }

    // Clean email
    if (cleaned.email) {
      cleaned.email = this.cleanEmail(cleaned.email);
      if (cleaned.email === '') cleaned.email = null;
    }

    // Clean budgets
    if (cleaned.budgetMin) {
      cleaned.budgetMin = this.cleanBudget(cleaned.budgetMin);
    }
    if (cleaned.budgetMax) {
      cleaned.budgetMax = this.cleanBudget(cleaned.budgetMax);
    }

    // Clean tags
    if (cleaned.tags) {
      cleaned.tags = this.cleanTags(cleaned.tags);
    }

    // Map enum values
    const enumFields: (keyof typeof EnumMappings)[] = [
      'city', 'propertyType', 'bhk', 'purpose', 'timeline', 'source', 'status'
    ];

    enumFields.forEach(field => {
      if (cleaned[field]) {
        const mapped = this.mapEnumValue(field, cleaned[field]);
        if (mapped) {
          cleaned[field] = mapped;
        }
      }
    });

    // Handle empty strings and nulls
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '') {
        if (['email', 'notes', 'status'].includes(key)) {
          cleaned[key] = null;
        } else if (['budgetMin', 'budgetMax'].includes(key)) {
          cleaned[key] = undefined;
        } else if (key === 'bhk') {
          // For Plot, Office, Retail - BHK should be null when empty
          if (['Plot', 'Office', 'Retail'].includes(cleaned.propertyType)) {
            cleaned[key] = null;
          } else {
            // For Apartment, Villa - keep empty string for validation to catch
            cleaned[key] = '';
          }
        }
      }
    });

    return cleaned;
  }
}

// Enhanced validation with better error messages
export class CSVRowValidator {
  static validateRow(row: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    const requiredFields = ['fullName', 'phone', 'city', 'propertyType', 'purpose', 'timeline', 'source'];
    
    requiredFields.forEach(field => {
      if (!row[field] || (typeof row[field] === 'string' && row[field].trim() === '')) {
        errors.push(`${field} is required`);
      }
    });

    // Phone validation
    if (row.phone) {
      const cleanPhone = CSVDataCleaner.cleanPhoneNumber(row.phone);
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        errors.push(`phone must be 10-15 digits (provided: ${cleanPhone})`);
      }
    }

    // Email validation
    if (row.email && row.email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push(`email format is invalid (provided: ${row.email})`);
      }
    }

    // Enum validation with suggestions
    const enumValidations = [
      { field: 'city', valid: ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'] },
      { field: 'propertyType', valid: ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'] },
      { field: 'bhk', valid: ['Studio', 'One', 'Two', 'Three', 'Four'] },
      { field: 'purpose', valid: ['Buy', 'Rent'] },
      { field: 'timeline', valid: ['ZeroToThree', 'ThreeToSix', 'MoreThanSix', 'Exploring'] },
      { field: 'source', valid: ['Website', 'Referral', 'WalkIn', 'Call', 'Other'] },
      { field: 'status', valid: ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'] }
    ];

    enumValidations.forEach(({ field, valid }) => {
      if (row[field] && !valid.includes(row[field])) {
        const suggestion = CSVDataCleaner.mapEnumValue(field as keyof typeof EnumMappings, row[field]);
        if (suggestion) {
          warnings.push(`${field} '${row[field]}' was mapped to '${suggestion}'`);
        } else {
          errors.push(`${field} must be one of: ${valid.join(', ')} (provided: ${row[field]})`);
        }
      }
    });

    // BHK business logic
    if (row.propertyType === 'Apartment' || row.propertyType === 'Villa') {
      if (!row.bhk || row.bhk === null) {
        errors.push(`bhk is required for ${row.propertyType} properties`);
      }
    } else if (row.propertyType === 'Plot' || row.propertyType === 'Office' || row.propertyType === 'Retail') {
      if (row.bhk && row.bhk !== null) {
        warnings.push(`bhk should be empty for ${row.propertyType} properties, but '${row.bhk}' was provided`);
        row.bhk = null; // Auto-fix
      }
    }

    // Budget validation
    if (row.budgetMin && row.budgetMax) {
      if (row.budgetMax < row.budgetMin) {
        errors.push(`budgetMax (${row.budgetMax}) must be greater than or equal to budgetMin (${row.budgetMin})`);
      }
    }

    // Notes length validation
    if (row.notes && row.notes.length > 1000) {
      errors.push(`notes must be less than 1000 characters (provided: ${row.notes.length})`);
    }

    // Name validation
    if (row.fullName && (row.fullName.length < 2 || row.fullName.length > 80)) {
      errors.push(`fullName must be between 2 and 80 characters (provided: ${row.fullName.length})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
