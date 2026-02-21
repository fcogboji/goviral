// Environment variable validation
// Ensures all required environment variables are present at startup
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().optional(),

  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // Paystack Payment Gateway
  PAYSTACK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLISHABLE_KEY: z.string().optional(),

  // Ayrshare — Multi-platform posting (ONE key for all platforms)
  AYRSHARE_API_KEY: z.string().optional(),

  // OpenAI — "Make it Viral" AI engine
  OPENAI_API_KEY: z.string().optional(),

  // Brandwatch — Trend tracking (optional, falls back to OpenAI)
  BRANDWATCH_API_KEY: z.string().optional(),
  BRANDWATCH_PROJECT_ID: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Cron Security
  CRON_SECRET: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables at startup
 * Throws an error if required variables are missing
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Environment validation failed');
  }

  return parsed.data;
}

/**
 * Get validated environment variables
 * Call this instead of accessing process.env directly
 */
export function getEnv(): Env {
  return validateEnv();
}

// Don't validate during build time — only at runtime
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  if (process.env.NODE_ENV === 'production') {
    validateEnv();
  }
}
