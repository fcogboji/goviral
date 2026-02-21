// Access control utilities for plan-based features
import { prisma } from './prisma';
import { canAccessFeature, checkUsageLimit, getPlanFeatures } from './plan-features';

export interface UserAccess {
  userId: string;
  planType: string;
  status: string;
  canAccess: (feature: string) => boolean;
  checkLimit: (limitType: 'maxPlatforms' | 'maxPostsPerMonth' | 'maxScheduledPosts' | 'maxWhatsAppMessages') => Promise<{
    allowed: boolean;
    limit: number;
    current: number;
    remaining: number;
  }>;
}

/**
 * Get user's access control object
 */
export async function getUserAccess(userId: string): Promise<UserAccess | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    const planType = user.subscription?.planType || null;
    const status = user.subscription?.status || 'inactive';

    // Only allow access if subscription is active or in trial
    const hasAccess = ['active', 'trial'].includes(status);
    const effectivePlan = hasAccess && planType ? planType : 'STARTER'; // Fallback for limit checks

    return {
      userId: user.id,
      planType: effectivePlan,
      status,

      canAccess: (feature: string) => {
        return canAccessFeature(effectivePlan, feature as never);
      },

      checkLimit: async (limitType) => {
        let currentUsage = 0;

        // Get current usage based on limit type
        switch (limitType) {
          case 'maxPlatforms': {
            const platforms = await prisma.platformIntegration.count({
              where: {
                userId: user.id,
                isActive: true
              }
            });
            currentUsage = platforms;
            break;
          }

          case 'maxPostsPerMonth': {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const posts = await prisma.post.count({
              where: {
                userId: user.id,
                createdAt: {
                  gte: startOfMonth
                }
              }
            });
            currentUsage = posts;
            break;
          }

          case 'maxScheduledPosts': {
            const scheduledPosts = await prisma.post.count({
              where: {
                userId: user.id,
                status: 'SCHEDULED'
              }
            });
            currentUsage = scheduledPosts;
            break;
          }

          case 'maxWhatsAppMessages': {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const whatsappPosts = await prisma.post.count({
              where: {
                userId: user.id,
                platforms: {
                  has: 'whatsapp'
                },
                createdAt: {
                  gte: startOfMonth
                }
              }
            });
            currentUsage = whatsappPosts;
            break;
          }
        }

        const limitCheck = checkUsageLimit(effectivePlan, limitType, currentUsage);

        return {
          allowed: limitCheck.allowed,
          limit: limitCheck.limit,
          current: currentUsage,
          remaining: limitCheck.remaining
        };
      }
    };
  } catch (error) {
    console.error('Error getting user access:', error);
    return null;
  }
}

/**
 * Get user access by Clerk ID
 */
export async function getUserAccessByClerkId(clerkId: string): Promise<UserAccess | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return null;
    }

    return getUserAccess(user.id);
  } catch (error) {
    console.error('Error getting user access by Clerk ID:', error);
    return null;
  }
}

/**
 * Check if user has access to a feature
 * Throws error if user doesn't have access
 */
export async function requireFeatureAccess(
  userId: string,
  feature: string
): Promise<void> {
  const access = await getUserAccess(userId);

  if (!access) {
    throw new Error('User not found');
  }

  if (!access.canAccess(feature)) {
    const planFeatures = getPlanFeatures(access.planType);
    throw new Error(
      `This feature requires a higher plan. Your current plan: ${planFeatures.name}`
    );
  }
}

/**
 * Check if user is within usage limits
 * Throws error if limit exceeded
 */
export async function requireUsageLimit(
  userId: string,
  limitType: 'maxPlatforms' | 'maxPostsPerMonth' | 'maxScheduledPosts' | 'maxWhatsAppMessages'
): Promise<void> {
  const access = await getUserAccess(userId);

  if (!access) {
    throw new Error('User not found');
  }

  const limitCheck = await access.checkLimit(limitType);

  if (!limitCheck.allowed) {
    const limitNames = {
      maxPlatforms: 'connected platforms',
      maxPostsPerMonth: 'posts per month',
      maxScheduledPosts: 'scheduled posts',
      maxWhatsAppMessages: 'WhatsApp messages per month'
    };

    throw new Error(
      `You've reached your limit for ${limitNames[limitType]} (${limitCheck.limit}). Please upgrade your plan.`
    );
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin access
 */
export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId);

  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Require user is not blocked. Use after fetching user from DB.
 */
export async function requireNotBlocked(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true },
  });
  if (user?.isBlocked) {
    throw new Error('Account is blocked. Please contact support.');
  }
}
