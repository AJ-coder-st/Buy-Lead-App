import { z } from 'zod';

// Enums - matching backend
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

// Form schemas (for client-side validation)
export const buyerFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name must be less than 80 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: BHKEnum.optional(),
  purpose: PurposeEnum,
  budgetMin: z.coerce.number().int().min(0).optional().or(z.literal('')),
  budgetMax: z.coerce.number().int().min(0).optional().or(z.literal('')),
  timeline: TimelineEnum,
  source: SourceEnum,
  status: StatusEnum.optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
  tags: z.array(z.string().trim()).default([]),
}).refine((data) => {
  // BHK requirement
  if (data.propertyType === 'Apartment' || data.propertyType === 'Villa') {
    return data.bhk !== undefined;
  }
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
export type BuyerFormData = z.infer<typeof buyerFormSchema>;

// Enum display labels
export const CITY_LABELS: Record<string, string> = {
  Chandigarh: 'Chandigarh',
  Mohali: 'Mohali',
  Zirakpur: 'Zirakpur',
  Panchkula: 'Panchkula',
  Other: 'Other',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  Apartment: 'Apartment',
  Villa: 'Villa',
  Plot: 'Plot',
  Office: 'Office',
  Retail: 'Retail',
};

export const BHK_LABELS: Record<string, string> = {
  Studio: 'Studio',
  One: '1 BHK',
  Two: '2 BHK',
  Three: '3 BHK',
  Four: '4 BHK',
};

export const PURPOSE_LABELS: Record<string, string> = {
  Buy: 'Buy',
  Rent: 'Rent',
};

export const TIMELINE_LABELS: Record<string, string> = {
  ZeroToThree: '0-3 months',
  ThreeToSix: '3-6 months',
  MoreThanSix: '6+ months',
  Exploring: 'Just exploring',
};

export const SOURCE_LABELS: Record<string, string> = {
  Website: 'Website',
  Referral: 'Referral',
  WalkIn: 'Walk-in',
  Call: 'Phone Call',
  Other: 'Other',
};

export const STATUS_LABELS: Record<string, string> = {
  New: 'New',
  Qualified: 'Qualified',
  Contacted: 'Contacted',
  Visited: 'Visited',
  Negotiation: 'Negotiation',
  Converted: 'Converted',
  Dropped: 'Dropped',
};
