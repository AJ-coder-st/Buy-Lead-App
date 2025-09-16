import { z } from 'zod';

// Enums
export const CityEnum = z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']);
export const PropertyTypeEnum = z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']);
export const BHKEnum = z.enum(['Studio', 'One', 'Two', 'Three', 'Four']);
export const PurposeEnum = z.enum(['Buy', 'Rent']);
export const TimelineEnum = z.enum(['ZeroToThree', 'ThreeToSix', 'MoreThanSix', 'Exploring']);
export const SourceEnum = z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']);
export const StatusEnum = z.enum(['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped']);

// Phone validation - strip non-digits and validate length
const phoneSchema = z.string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length >= 10 && val.length <= 15, {
    message: 'Phone number must be 10-15 digits'
  });

// Budget validation
const budgetSchema = z.object({
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budgetMax']
});

// BHK requirement validation
const bhkRequirementSchema = z.object({
  propertyType: PropertyTypeEnum,
  bhk: BHKEnum.optional(),
}).refine((data) => {
  if (data.propertyType === 'Apartment' || data.propertyType === 'Villa') {
    return data.bhk !== undefined;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
});

// Base buyer schema
const baseBuyerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be less than 80 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: phoneSchema,
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: BHKEnum.optional(),
  purpose: PurposeEnum,
  timeline: TimelineEnum,
  source: SourceEnum,
  status: StatusEnum.optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
  tags: z.array(z.string().trim()).default([]),
});

// Create buyer schema with validations
export const createBuyerSchema = baseBuyerSchema
  .merge(budgetSchema)
  .merge(bhkRequirementSchema);

// Update buyer schema with updatedAt for optimistic concurrency
export const updateBuyerSchema = createBuyerSchema.extend({
  updatedAt: z.string().datetime(),
});

// Query parameters for listing buyers
export const buyerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().optional(),
  city: CityEnum.optional(),
  propertyType: PropertyTypeEnum.optional(),
  status: StatusEnum.optional(),
  timeline: TimelineEnum.optional(),
  sort: z.enum(['updatedAt_desc', 'updatedAt_asc', 'createdAt_desc', 'createdAt_asc']).default('updatedAt_desc'),
});

// CSV row schema for import
export const csvRowSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
  phone: phoneSchema,
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: BHKEnum.optional().or(z.literal('').transform(() => null)).or(z.null()),
  purpose: PurposeEnum,
  budgetMin: z.coerce.number().int().min(0).optional().or(z.literal('')),
  budgetMax: z.coerce.number().int().min(0).optional().or(z.literal('')),
  timeline: TimelineEnum,
  source: SourceEnum,
  notes: z.string().max(1000).optional().or(z.literal('')),
  tags: z.array(z.string()).optional().or(z.literal('')), // Array of strings
  status: StatusEnum.optional().or(z.literal('')),
}).refine((data) => {
  // BHK requirement - only for Apartment and Villa
  if (data.propertyType === 'Apartment' || data.propertyType === 'Villa') {
    return data.bhk !== undefined && data.bhk !== null;
  }
  // For Plot, Office, Retail - BHK should be null/undefined
  return true;
}, {
  message: 'BHK is required for Apartment and Villa property types',
  path: ['bhk']
}).refine((data) => {
  // Budget validation
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budgetMax']
});

// Types
export type CreateBuyerInput = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>;
export type BuyerQuery = z.infer<typeof buyerQuerySchema>;
export type CSVRowInput = z.infer<typeof csvRowSchema>;

// Validation functions
export function validateBudget(budgetMin?: number, budgetMax?: number): boolean {
  if (budgetMin && budgetMax) {
    return budgetMax >= budgetMin;
  }
  return true;
}

export function validateCSVRow(row: any): { isValid: boolean; errors: string[] } {
  try {
    csvRowSchema.parse(row);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { isValid: false, errors: ['Unknown validation error'] };
  }
}
