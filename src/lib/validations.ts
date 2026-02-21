// API validation schemas using Zod
import { z } from 'zod';

// User role validation
export const userRoleSchema = z.enum(['free', 'premium', 'admin']);

// Plan type validation (for subscriptions - any plan name from DB or plan-features)
export const planTypeSchema = z.string().min(1, 'Plan name is required').max(100);

// Admin plan create/update validation
export const planCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.number().min(0),
  priceNGN: z.number().min(0).optional().nullable(),
  priceGBP: z.number().min(0).optional().nullable(),
  yearlyMonthlyPrice: z.number().min(0).optional().nullable(),
  yearlyMonthlyPriceNGN: z.number().min(0).optional().nullable(),
  yearlyMonthlyPriceGBP: z.number().min(0).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  features: z.array(z.string()).min(1, 'At least one feature required'),
  maxPosts: z.number().int().min(-1),
  maxPlatforms: z.number().int().min(-1),
  maxWhatsAppMessages: z.number().int().min(0),
  trialDays: z.number().int().min(0).max(90).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const planUpdateSchema = planCreateSchema.partial();

// Subscription status validation
export const subscriptionStatusSchema = z.enum(['trial', 'active', 'inactive', 'cancelled', 'past_due']);

// Post status validation
export const postStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'CANCELLED']);

// Platform validation
export const platformSchema = z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'bluesky', 'threads']);

// Admin user update validation
export const adminUserUpdateSchema = z.object({
  role: userRoleSchema.optional(),
  planType: planTypeSchema.optional(),
  subscriptionStatus: subscriptionStatusSchema.optional(),
  trialEndsAt: z.string().datetime().optional().nullable(),
  currentPeriodEnd: z.string().datetime().optional(),
  isBlocked: z.boolean().optional(),
  blockedReason: z.string().max(500).optional().nullable(),
});

// Post creation validation
export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  platforms: z.array(platformSchema).min(1, 'At least one platform is required'),
  campaignId: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  hashtags: z.array(z.string()).optional(),
  status: postStatusSchema.optional(),
});

// Post update validation
export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  platforms: z.array(platformSchema).optional(),
  status: postStatusSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  hashtags: z.array(z.string()).optional(),
});

// Campaign creation validation
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  budget: z.number().positive().optional(),
  targetAudience: z.string().max(500).optional(),
  objectives: z.array(z.string()).optional(),
  platforms: z.array(platformSchema).min(1, 'At least one platform is required'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  contentType: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
});

// Newsletter signup validation
export const newsletterSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
});

// Demo request validation
export const demoRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
});

// Payment initialization validation
export const initializePaymentSchema = z.object({
  planType: planTypeSchema,
  email: z.string().email(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Validate request body helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
  return { success: false, errors };
}
