// Utility to require an active subscription or trial for API routes
import { prisma } from './prisma';

export interface SubscriptionCheck {
  authorized: true;
  user: {
    id: string;
    email: string;
    role: string;
    subscription: {
      id: string;
      status: string;
      planType: string;
      trialEndsAt: Date | null;
    } | null;
  };
}

export interface SubscriptionDenied {
  authorized: false;
  error: string;
  redirectTo: string;
}

export type SubscriptionResult = SubscriptionCheck | SubscriptionDenied;

/**
 * Checks if a user (by Clerk ID) has an active subscription or trial.
 * Returns the user if authorized, or an error + redirect if not.
 */
export async function requireActiveSubscription(clerkId: string): Promise<SubscriptionResult> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      email: true,
      role: true,
      isBlocked: true,
      subscription: {
        select: {
          id: true,
          status: true,
          planType: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (!user) {
    return {
      authorized: false,
      error: 'User not found. Please sign up first.',
      redirectTo: '/sign-up',
    };
  }

  // Blocked users cannot access
  if (user.isBlocked) {
    return {
      authorized: false,
      error: 'Your account has been blocked. Please contact support.',
      redirectTo: '/blocked',
    };
  }

  // Admins always pass
  if (user.role === 'admin') {
    return { authorized: true, user };
  }

  // No subscription at all
  if (!user.subscription) {
    return {
      authorized: false,
      error: 'No active subscription. Please start a free trial to access this feature.',
      redirectTo: '/trial-signup',
    };
  }

  const { status, trialEndsAt } = user.subscription;

  // Active subscription — good to go
  if (status === 'active') {
    return { authorized: true, user };
  }

  // Trial — check if it hasn't expired
  if (status === 'trial') {
    if (trialEndsAt && new Date(trialEndsAt) < new Date()) {
      // Expired trial
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: { status: 'inactive' },
      });
      return {
        authorized: false,
        error: 'Your free trial has expired. Please subscribe to continue.',
        redirectTo: '/trial-signup?expired=true',
      };
    }
    return { authorized: true, user };
  }

  // Any other status (inactive, cancelled, past_due)
  return {
    authorized: false,
    error: 'Your subscription is not active. Please subscribe to continue.',
    redirectTo: '/trial-signup?expired=true',
  };
}

