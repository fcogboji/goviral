// ═══════════════════════════════════════════════════════════════════════════
// Plan features, pricing, and access control
// ═══════════════════════════════════════════════════════════════════════════
//
// PRICING RATIONALE (85% profit target)
// ─────────────────────────────────────
// Cost per user per month (at 200+ users):
//
//   Ayrshare (Business plan)
//     Base $250/mo + $2/profile → ~$3.25/user amortized
//
//   OpenAI GPT-4o-mini
//     Input: $0.15/1M tokens, Output: $0.60/1M tokens
//     Avg call: ~500 input + 800 output = ~$0.0006/call
//     Starter: ~45 calls/mo = $0.03     Pro: ~200 calls/mo = $0.12
//
//   Brandwatch (optional, shared fixed cost)
//     ~$800/mo shared across all users ≈ $0/user at scale
//
//   Infrastructure (Vercel, Neon DB, Email, Domain)
//     ~$100/mo shared ≈ $0.50/user
//
//   TOTAL COST PER USER:
//     Starter: ~$3.78/mo   → price $29 = 87.0% margin ✅
//     Pro:     ~$3.87/mo   → price $59 = 93.4% margin ✅
//
// MODEL:
//   No free plan. All plans have a 7-day trial that requires card details.
//   After trial ends, card is charged automatically.
//
// ═══════════════════════════════════════════════════════════════════════════

export const PLAN_FEATURES = {
  STARTER: {
    name: 'Starter',
    price: 29,
    priceUSD: 29,
    priceNGN: 45000,
    priceGBP: 23,
    yearlyMonthlyPrice: 22,
    yearlyMonthlyPriceNGN: 34000,
    yearlyMonthlyPriceGBP: 17,
    trialDays: 7,
    features: [
      'Connect up to 5 social platforms',
      '150 posts per month',
      'AI viral rewriter (Make it Viral 🚀)',
      'Advanced analytics',
      'Viral score & suggestions',
      'Bulk scheduling',
      'Email support',
    ],
    limits: {
      maxPlatforms: 5,
      maxPostsPerMonth: 150,
      maxScheduledPosts: 50,
      analytics: 'advanced',
      aiContentGeneration: true,
      bulkScheduling: true,
      teamCollaboration: false,
      whiteLabel: false,
      prioritySupport: false,
      customBranding: false,
    },
  },
  PRO: {
    name: 'Pro',
    price: 59,
    priceUSD: 59,
    priceNGN: 90000,
    priceGBP: 47,
    yearlyMonthlyPrice: 45,
    yearlyMonthlyPriceNGN: 69000,
    yearlyMonthlyPriceGBP: 36,
    trialDays: 7,
    features: [
      'Unlimited social platforms',
      'Unlimited posts per month',
      'AI viral rewriter (Make it Viral 🚀)',
      'Platform-specific AI captions',
      'Trending topics & hashtags',
      'Advanced analytics & reports',
      'Bulk scheduling',
      'Team collaboration',
      'Custom branding',
      'Priority support',
    ],
    limits: {
      maxPlatforms: -1, // -1 = unlimited
      maxPostsPerMonth: -1,
      maxScheduledPosts: -1,
      analytics: 'premium',
      aiContentGeneration: true,
      bulkScheduling: true,
      teamCollaboration: true,
      whiteLabel: true,
      prioritySupport: true,
      customBranding: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLAN_FEATURES;

// Helper function to get plan features
// Falls back to STARTER (the lowest paid plan) if plan type is unknown
export function getPlanFeatures(planType: string | null | undefined): typeof PLAN_FEATURES[PlanType] {
  const normalizedPlanType = (planType?.toUpperCase() || 'STARTER') as PlanType;
  return PLAN_FEATURES[normalizedPlanType] || PLAN_FEATURES.STARTER;
}

// Helper function to check if user can access a feature
export function canAccessFeature(
  planType: string | null | undefined,
  feature: keyof typeof PLAN_FEATURES.STARTER.limits
): boolean {
  const plan = getPlanFeatures(planType);
  const featureValue = plan.limits[feature];

  if (typeof featureValue === 'boolean') {
    return featureValue;
  }

  return true; // For numeric limits, we'll check separately
}

// Helper function to check usage limits
export function checkUsageLimit(
  planType: string | null | undefined,
  limitType: 'maxPlatforms' | 'maxPostsPerMonth' | 'maxScheduledPosts' | 'maxWhatsAppMessages',
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const plan = getPlanFeatures(planType);
  const limits = plan.limits as Record<string, unknown>;
  const limit = typeof limits[limitType] === 'number' ? (limits[limitType] as number) : 0;

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  const remaining = Math.max(0, limit - currentUsage);
  return {
    allowed: currentUsage < limit,
    limit,
    remaining,
  };
}

// Helper to get plan by name
export function getPlanByName(name: string): typeof PLAN_FEATURES[PlanType] | null {
  const planKey = Object.keys(PLAN_FEATURES).find(
    (key) => PLAN_FEATURES[key as PlanType].name.toLowerCase() === name.toLowerCase()
  );

  return planKey ? PLAN_FEATURES[planKey as PlanType] : null;
}

// Helper to calculate prorated amount for upgrades
export function calculateProratedAmount(
  currentPlan: string,
  newPlan: string,
  daysRemainingInPeriod: number,
  daysInPeriod: number = 30
): number {
  const currentPlanData = getPlanFeatures(currentPlan);
  const newPlanData = getPlanFeatures(newPlan);

  const priceDifference = newPlanData.priceUSD - currentPlanData.priceUSD;

  if (priceDifference <= 0) {
    return 0; // Downgrade or same plan
  }

  // Calculate prorated amount based on remaining days
  const proratedAmount = (priceDifference / daysInPeriod) * daysRemainingInPeriod;

  return Math.round(proratedAmount * 100) / 100;
}

// Get all available plans for pricing page (all are paid plans)
export function getAllPlans() {
  return Object.entries(PLAN_FEATURES).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}
