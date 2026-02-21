import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import PaystackAPI from '@/lib/paystack';
import { getPlanConfig } from '@/lib/plans-db';
import { createCheckoutSession } from '@/lib/stripe';
import {
  getPaymentProvider,
  getCountryFromHeaders,
  isStripeConfigured,
  isPaystackConfigured,
  type PaymentProvider,
} from '@/lib/payment-provider';

async function initPaystack(user: { id: string; email: string }, dbPlan: { id: string }, planName: string, planConfig: { price: number; priceNGN?: number }) {
  const paystack = new PaystackAPI();
  const reference = `trial_${user.id}_${Date.now()}`;

  const initializeResponse = await paystack.initializeTransaction({
    email: user.email,
    amount: 100, // $1 in cents for card authorization
    reference,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/trial-callback`,
    metadata: {
      userId: user.id,
      planId: dbPlan.id,
      planName,
      isTrial: true,
      fullAmount: (planConfig.priceNGN ?? planConfig.price * 1500) * 100,
      cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    },
  });

  if (!initializeResponse.status) {
    return null;
  }

  await prisma.payment.create({
    data: {
      userId: user.id,
      planId: dbPlan.id,
      reference,
      amount: 1,
      currency: 'USD',
      status: 'pending',
    },
  });

  return {
    authorizationUrl: initializeResponse.data.authorization_url,
    reference,
    provider: 'paystack' as const,
  };
}

async function initStripe(user: { id: string; email: string }, dbPlan: { id: string }, planName: string, planConfig: { price: number; priceUSD?: number }) {
  const reference = `stripe_trial_${user.id}_${Date.now()}`;
  const amountInCents = Math.round((planConfig.priceUSD ?? planConfig.price) * 100);

  const session = await createCheckoutSession({
    amount: amountInCents,
    currency: 'usd',
    customerEmail: user.email,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/stripe-trial-callback?session_id={CHECKOUT_SESSION_ID}&plan=${planName}&user=${user.id}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/trial-signup?canceled=true`,
    metadata: {
      userId: user.id,
      planId: dbPlan.id,
      planName,
      reference,
      isTrial: 'true',
    },
    mode: 'payment',
  });

  if (!session.url) {
    return null;
  }

  await prisma.payment.create({
    data: {
      userId: user.id,
      planId: dbPlan.id,
      reference,
      amount: planConfig.priceUSD ?? planConfig.price,
      currency: 'USD',
      status: 'pending',
      stripeSessionId: session.sessionId,
    },
  });

  return {
    authorizationUrl: session.url,
    reference,
    provider: 'stripe' as const,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planName, countryCode: clientCountry } = body;

    if (!planName) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    const planConfig = await getPlanConfig(planName);
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Determine payment provider: server headers take priority, then client hint
    const serverCountry = getCountryFromHeaders(request.headers);
    const country = serverCountry || clientCountry || null;
    let provider: PaymentProvider = getPaymentProvider(country);

    // Fall back if the chosen provider isn't configured
    if (provider === 'stripe' && !isStripeConfigured()) {
      if (isPaystackConfigured()) {
        provider = 'paystack';
      } else {
        return NextResponse.json(
          { error: 'Payment processing is not available at this time. Please contact support.' },
          { status: 503 }
        );
      }
    }
    if (provider === 'paystack' && !isPaystackConfigured()) {
      if (isStripeConfigured()) {
        provider = 'stripe';
      } else {
        return NextResponse.json(
          { error: 'Payment processing is not available at this time. Please contact support.' },
          { status: 503 }
        );
      }
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          imageUrl: clerkUser.imageUrl || null,
        },
        include: { subscription: true },
      });
    }

    if (user.subscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    // Get or create plan in DB
    let dbPlan = await prisma.plan.findFirst({ where: { name: planName } });

    if (!dbPlan) {
      const limits = planConfig.limits as { maxPostsPerMonth: number; maxPlatforms: number; maxWhatsAppMessages?: number };
      dbPlan = await prisma.plan.create({
        data: {
          name: planConfig.name,
          price: planConfig.price,
          priceNGN: planConfig.priceNGN,
          priceGBP: planConfig.priceGBP,
          yearlyMonthlyPrice: planConfig.yearlyMonthlyPrice,
          yearlyMonthlyPriceNGN: planConfig.yearlyMonthlyPriceNGN,
          yearlyMonthlyPriceGBP: planConfig.yearlyMonthlyPriceGBP,
          currency: 'USD',
          features: [...planConfig.features],
          maxPosts: limits.maxPostsPerMonth,
          maxPlatforms: limits.maxPlatforms,
          maxWhatsAppMessages: limits.maxWhatsAppMessages ?? 0,
          trialDays: planConfig.trialDays,
          description: `${planConfig.name} Plan - ${planConfig.features[0]}`,
          isActive: true,
        },
      });
    }

    // Initialize payment with the selected provider
    const result =
      provider === 'paystack'
        ? await initPaystack(user, dbPlan, planName, planConfig)
        : await initStripe(user, dbPlan, planName, planConfig);

    if (!result) {
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Please complete card authorization to start your 7-day free trial',
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
      provider: result.provider,
      plan: {
        name: planConfig.name,
        price: planConfig.price,
        features: planConfig.features,
        trialDays: planConfig.trialDays || 7,
      },
    });
  } catch (error) {
    console.error('Error starting trial with card:', error);
    return NextResponse.json(
      { error: 'Failed to start trial. Please try again.' },
      { status: 500 }
    );
  }
}
