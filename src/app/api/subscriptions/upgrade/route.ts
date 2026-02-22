import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import PaystackAPI from '@/lib/paystack';
import { getPlanByName, calculateProratedAmount } from '@/lib/plan-features';
import { createCheckoutSession } from '@/lib/stripe';
import {
  getPaymentProvider,
  getCountryFromHeaders,
  isStripeConfigured,
  isPaystackConfigured,
  type PaymentProvider,
} from '@/lib/payment-provider';
import { getAppUrl } from '@/lib/app-url';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { newPlanName, countryCode: clientCountry } = body;

    if (!newPlanName) {
      return NextResponse.json({ error: 'New plan name is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: { include: { plan: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.subscription) {
      return NextResponse.json(
        { error: 'No active subscription found. Please start a trial first.' },
        { status: 400 }
      );
    }

    const currentPlan = user.subscription.planType;
    const newPlanConfig = getPlanByName(newPlanName);
    const currentPlanConfig = getPlanByName(currentPlan);

    if (!newPlanConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (!currentPlanConfig) {
      return NextResponse.json({ error: 'Current plan not found' }, { status: 400 });
    }
    if (newPlanConfig.price <= currentPlanConfig.price) {
      return NextResponse.json(
        { error: 'You can only upgrade to a higher plan. For downgrades, please contact support.' },
        { status: 400 }
      );
    }

    // Determine provider
    const serverCountry = getCountryFromHeaders(request.headers);
    const country = serverCountry || clientCountry || null;
    let provider: PaymentProvider = getPaymentProvider(country);

    // If the user already has a Paystack auth code, use Paystack for recurring charge
    if (user.subscription.paystackAuthCode) {
      provider = 'paystack';
    }
    // If the user has a Stripe subscription/customer, use Stripe
    else if (user.subscription.stripeSubscriptionId && isStripeConfigured()) {
      provider = 'stripe';
    }

    // Fallback if provider not configured
    if (provider === 'stripe' && !isStripeConfigured()) {
      provider = isPaystackConfigured() ? 'paystack' : provider;
    }
    if (provider === 'paystack' && !isPaystackConfigured()) {
      provider = isStripeConfigured() ? 'stripe' : provider;
    }

    const now = new Date();
    const periodEnd = new Date(user.subscription.currentPeriodEnd);
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const proratedAmount = calculateProratedAmount(currentPlan, newPlanName, daysRemaining, 30);

    // --- PAYSTACK PATH ---
    if (provider === 'paystack') {
      const authCode = user.subscription.paystackAuthCode;

      if (authCode) {
        // Charge saved card
        const paystack = new PaystackAPI();
        const reference = `upgrade_${user.id}_${Date.now()}`;
        const amountInCents = Math.round(proratedAmount * 100);

        const chargeResponse = await paystack.chargeAuthorization({
          email: user.email,
          amount: amountInCents,
          authorization_code: authCode,
          reference,
          metadata: {
            userId: user.id,
            subscriptionId: user.subscription.id,
            previousPlan: currentPlan,
            newPlan: newPlanName,
            proratedAmount,
            upgradeReason: 'plan_upgrade',
          },
        });

        if (!chargeResponse.status || chargeResponse.data?.status !== 'success') {
          return NextResponse.json(
            { error: 'Payment failed. Please update your payment method.' },
            { status: 400 }
          );
        }

        return await completeUpgrade(user, newPlanName, newPlanConfig, proratedAmount, reference, daysRemaining, currentPlan);
      } else {
        // No saved card – redirect to Paystack checkout
        const paystack = new PaystackAPI();
        const reference = `upgrade_${user.id}_${Date.now()}`;
        const amountInKobo = Math.round(proratedAmount * 100);

        const initializeResponse = await paystack.initializeTransaction({
          email: user.email,
          amount: amountInKobo,
          reference,
          metadata: {
            userId: user.id,
            subscriptionId: user.subscription.id,
            previousPlan: currentPlan,
            newPlan: newPlanName,
            proratedAmount,
            daysRemaining,
          },
        });

        if (!initializeResponse.status) {
          return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
        }

        await prisma.payment.create({
          data: {
            userId: user.id,
            planId: user.subscription.planId,
            reference,
            amount: proratedAmount,
            currency: 'USD',
            status: 'pending',
          },
        });

        return NextResponse.json({
          success: true,
          provider: 'paystack',
          message: 'Please complete payment to upgrade your plan',
          authorizationUrl: initializeResponse.data.authorization_url,
          payment: { amount: proratedAmount, reference, daysRemaining },
        });
      }
    }

    // --- STRIPE PATH ---
    const reference = `stripe_upgrade_${user.id}_${Date.now()}`;
    const amountInCents = Math.round(proratedAmount * 100);

    const session = await createCheckoutSession({
      amount: amountInCents,
      currency: 'usd',
      customerEmail: user.email,
      successUrl: `${getAppUrl()}/payment/upgrade-callback?session_id={CHECKOUT_SESSION_ID}&plan=${newPlanName}&provider=stripe`,
      cancelUrl: `${getAppUrl()}/dashboard/settings?canceled=true`,
      metadata: {
        userId: user.id,
        subscriptionId: user.subscription.id,
        previousPlan: currentPlan,
        newPlan: newPlanName,
        reference,
        proratedAmount: String(proratedAmount),
      },
      mode: 'payment',
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }

    await prisma.payment.create({
      data: {
        userId: user.id,
        planId: user.subscription.planId,
        reference,
        amount: proratedAmount,
        currency: 'USD',
        status: 'pending',
        stripeSessionId: session.sessionId,
      },
    });

    return NextResponse.json({
      success: true,
      provider: 'stripe',
      message: 'Please complete payment to upgrade your plan',
      authorizationUrl: session.url,
      payment: { amount: proratedAmount, reference, daysRemaining },
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
  }
}

// Shared helper to complete the upgrade after successful payment
async function completeUpgrade(
  user: { id: string; email: string; subscription: { id: string; planId: string } | null },
  newPlanName: string,
  newPlanConfig: ReturnType<typeof getPlanByName>,
  proratedAmount: number,
  reference: string,
  daysRemaining: number,
  _currentPlan: string,
) {
  if (!newPlanConfig) {
    return NextResponse.json({ error: 'Invalid plan config' }, { status: 500 });
  }

  let dbPlan = await prisma.plan.findFirst({ where: { name: newPlanName } });

  if (!dbPlan) {
    const limits = newPlanConfig.limits as { maxPostsPerMonth: number; maxPlatforms: number; maxWhatsAppMessages?: number };
    dbPlan = await prisma.plan.create({
      data: {
        name: newPlanConfig.name,
        price: newPlanConfig.price,
        currency: 'USD',
        features: [...newPlanConfig.features],
        maxPosts: limits.maxPostsPerMonth,
        maxPlatforms: limits.maxPlatforms,
        maxWhatsAppMessages: limits.maxWhatsAppMessages ?? 0,
      },
    });
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { userId: user.id },
    data: { planId: dbPlan.id, planType: newPlanName, status: 'active' },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      planId: dbPlan.id,
      reference,
      amount: proratedAmount,
      currency: 'USD',
      status: 'paid',
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      message: `Congratulations! You've upgraded to ${newPlanName} plan. Your card was charged $${proratedAmount.toLocaleString()} (prorated for the remaining ${daysRemaining} days).`,
      type: 'in-app',
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Subscription upgraded successfully',
    subscription: updatedSubscription,
    payment: { amount: proratedAmount, reference, status: 'success' },
  });
}

// GET - Calculate upgrade cost (unchanged)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const newPlanName = searchParams.get('plan');

    if (!newPlanName) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const currentPlan = user.subscription.planType;
    const now = new Date();
    const periodEnd = new Date(user.subscription.currentPeriodEnd);
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const proratedAmount = calculateProratedAmount(currentPlan, newPlanName, daysRemaining, 30);
    const newPlanConfig = getPlanByName(newPlanName);

    if (!newPlanConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      currentPlan,
      newPlan: newPlanName,
      proratedAmount,
      daysRemaining,
      nextBillingAmount: newPlanConfig.price,
      breakdown: {
        currentPlanPrice: getPlanByName(currentPlan)?.price || 0,
        newPlanPrice: newPlanConfig.price,
        priceDifference: newPlanConfig.price - (getPlanByName(currentPlan)?.price || 0),
        proratedAmount,
      },
    });
  } catch (error) {
    console.error('Error calculating upgrade cost:', error);
    return NextResponse.json({ error: 'Failed to calculate upgrade cost' }, { status: 500 });
  }
}
