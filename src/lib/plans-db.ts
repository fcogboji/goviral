/**
 * Plan config from database - used when admin has customized plans.
 * Falls back to plan-features for limits/features if DB plan doesn't have them.
 */
import { prisma } from './prisma';
import { getPlanByName } from './plan-features';

export type PlanConfigFromDb = {
  id: string;
  name: string;
  price: number;
  priceUSD: number;
  priceNGN: number;
  priceGBP: number;
  yearlyMonthlyPrice: number;
  yearlyMonthlyPriceNGN: number;
  yearlyMonthlyPriceGBP: number;
  trialDays: number;
  features: string[];
  limits: {
    maxPlatforms: number;
    maxPostsPerMonth: number;
    maxScheduledPosts: number;
    maxWhatsAppMessages?: number;
  };
};

/**
 * Get plan config - DB first (if exists and active), else plan-features.
 * Use for payment/trial flows so admin-edited prices are used.
 */
export async function getPlanConfig(
  planName: string
): Promise<PlanConfigFromDb | null> {
  const dbPlan = await prisma.plan.findFirst({
    where: {
      name: { equals: planName, mode: 'insensitive' },
      isActive: true,
    },
  });

  if (dbPlan) {
    const fallback = getPlanByName(planName);
    return {
      id: dbPlan.id,
      name: dbPlan.name,
      price: dbPlan.price,
      priceUSD: dbPlan.price,
      priceNGN: dbPlan.priceNGN ?? fallback?.priceNGN ?? dbPlan.price * 1500,
      priceGBP: dbPlan.priceGBP ?? fallback?.priceGBP ?? dbPlan.price * 0.8,
      yearlyMonthlyPrice:
        dbPlan.yearlyMonthlyPrice ?? fallback?.yearlyMonthlyPrice ?? dbPlan.price * 0.85,
      yearlyMonthlyPriceNGN:
        dbPlan.yearlyMonthlyPriceNGN ??
        fallback?.yearlyMonthlyPriceNGN ??
        (dbPlan.priceNGN ?? dbPlan.price * 1500) * 0.85,
      yearlyMonthlyPriceGBP:
        dbPlan.yearlyMonthlyPriceGBP ??
        fallback?.yearlyMonthlyPriceGBP ??
        (dbPlan.priceGBP ?? dbPlan.price * 0.8) * 0.85,
      trialDays: dbPlan.trialDays ?? fallback?.trialDays ?? 7,
      features: dbPlan.features,
      limits: {
        maxPlatforms: dbPlan.maxPlatforms,
        maxPostsPerMonth: dbPlan.maxPosts,
        maxScheduledPosts: Math.min(dbPlan.maxPosts, 50),
        maxWhatsAppMessages: dbPlan.maxWhatsAppMessages,
      },
    };
  }

  const pf = getPlanByName(planName);
  if (!pf) return null;

  return {
    id: '',
    name: pf.name,
    price: pf.price,
    priceUSD: pf.priceUSD,
    priceNGN: pf.priceNGN,
    priceGBP: pf.priceGBP,
    yearlyMonthlyPrice: pf.yearlyMonthlyPrice,
    yearlyMonthlyPriceNGN: pf.yearlyMonthlyPriceNGN,
    yearlyMonthlyPriceGBP: pf.yearlyMonthlyPriceGBP,
    trialDays: pf.trialDays,
    features: [...pf.features],
    limits: {
      maxPlatforms: pf.limits.maxPlatforms,
      maxPostsPerMonth: pf.limits.maxPostsPerMonth,
      maxScheduledPosts: 50,
      maxWhatsAppMessages: (pf.limits as { maxWhatsAppMessages?: number }).maxWhatsAppMessages ?? 0,
    },
  };
}
