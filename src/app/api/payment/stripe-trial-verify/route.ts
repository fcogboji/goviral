import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCheckoutSession } from '@/lib/stripe';
import { getPlanByName } from '@/lib/plan-features';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, planName } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await getCheckoutSession(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const resolvedPlanName = metadata.planName || planName;
    const reference = metadata.reference;

    if (!userId || !resolvedPlanName) {
      return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If subscription already activated (idempotency), just return success
    if (user.subscription && user.subscription.status === 'trial') {
      return NextResponse.json({
        success: true,
        message: 'Trial already active',
        subscription: user.subscription,
      });
    }

    // Update the payment record
    if (reference) {
      await prisma.payment.updateMany({
        where: { reference },
        data: { status: 'paid', stripeSessionId: sessionId },
      });
    }

    const planConfig = getPlanByName(resolvedPlanName);
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get or create the plan in DB
    let dbPlan = await prisma.plan.findFirst({ where: { name: resolvedPlanName } });
    if (!dbPlan) {
      const limits = planConfig.limits as { maxPostsPerMonth: number; maxPlatforms: number; maxWhatsAppMessages?: number };
      dbPlan = await prisma.plan.create({
        data: {
          name: planConfig.name,
          price: planConfig.price,
          currency: 'USD',
          features: [...planConfig.features],
          maxPosts: limits.maxPostsPerMonth,
          maxPlatforms: limits.maxPlatforms,
          maxWhatsAppMessages: limits.maxWhatsAppMessages ?? 0,
        },
      });
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + (planConfig.trialDays || 7) * 24 * 60 * 60 * 1000);
    const currentPeriodEnd = new Date(trialEndsAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Retrieve card details from Stripe session if available
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.toString() || null;

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        planId: dbPlan.id,
        planType: resolvedPlanName,
        status: 'trial',
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        nextBillingDate: trialEndsAt,
        stripeCustomerId,
        stripeSubscriptionId: sessionId,
      },
      update: {
        planId: dbPlan.id,
        planType: resolvedPlanName,
        status: 'trial',
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        nextBillingDate: trialEndsAt,
        stripeCustomerId,
        stripeSubscriptionId: sessionId,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Your 7-day free trial for ${resolvedPlanName} plan has started! Your card will be charged $${planConfig.price} on ${trialEndsAt.toLocaleDateString()}.`,
        type: 'in-app',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trial activated successfully',
      subscription,
    });
  } catch (error) {
    console.error('Error verifying Stripe trial payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment. Please contact support.' },
      { status: 500 }
    );
  }
}
