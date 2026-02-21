// Cron job to process recurring monthly billing
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import PaystackAPI from '@/lib/paystack';
import { getPlanFeatures } from '@/lib/plan-features';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find active subscriptions that need to be billed today
    // Note: Currently only Stripe subscriptions are auto-renewed via Stripe webhooks
    // Paystack subscriptions would need card authorization stored separately
    const subscriptionsToBill = await prisma.subscription.findMany({
      where: {
        status: 'active',
        nextBillingDate: {
          lte: now
        },
        stripeSubscriptionId: null, // Only process non-Stripe subscriptions here
        cancelAtPeriodEnd: false // Don't charge if they've cancelled
      },
      include: {
        user: true,
        plan: true
      }
    });

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ userId: string; error: string }>
    };

    const paystack = new PaystackAPI();

    for (const subscription of subscriptionsToBill) {
      results.processed++;

      try {
        const planConfig = getPlanFeatures(subscription.planType);
        // Use the plan price from config (in USD cents for Stripe-style amount)
        const amount = subscription.plan?.price || planConfig.price;
        const amountInCents = amount * 100;

        const reference = `recurring_${subscription.userId}_${Date.now()}`;

        // Use the stored Paystack authorization code for recurring charges
        const authCode = subscription.paystackAuthCode;

        if (!authCode) {
          results.errors.push({
            userId: subscription.userId,
            error: 'No Paystack authorization code on file'
          });
          results.failed++;
          continue;
        }

        const chargeResponse = await paystack.chargeAuthorization({
          email: subscription.user.email,
          amount: amountInCents,
          authorization_code: authCode,
          reference,
          metadata: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            planType: subscription.planType,
            billingPeriod: 'monthly',
            billingReason: 'recurring_subscription'
          }
        });

        if (chargeResponse.status && chargeResponse.data?.status === 'success') {
          // Payment successful
          const nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              currentPeriodStart: now,
              currentPeriodEnd: nextBillingDate,
              nextBillingDate,
              status: 'active'
            }
          });

          // Record payment
          await prisma.payment.create({
            data: {
              userId: subscription.userId,
              planId: subscription.planId,
              reference,
              amount: amount,
              currency: 'USD',
              status: 'paid',
            }
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId: subscription.userId,
              message: `Your ${subscription.planType} subscription has been renewed. Your card was charged $${amount}.`,
              type: 'in-app'
            }
          });

          results.successful++;
        } else {
          throw new Error(chargeResponse.message || 'Payment failed');
        }
      } catch (error: unknown) {
        results.failed++;

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        results.errors.push({
          userId: subscription.userId,
          error: errorMessage
        });

        // Mark subscription as past_due
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'past_due',
            nextBillingDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // Retry in 3 days
          }
        });

        // Notify user
        await prisma.notification.create({
          data: {
            userId: subscription.userId,
            message: `We couldn't process your payment for ${subscription.planType} plan. Please update your payment method to avoid service interruption.`,
            type: 'in-app'
          }
        });

        console.error(`Failed to charge user ${subscription.userId}:`, errorMessage);
      }
    }

    console.log('Recurring billing completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Recurring billing completed',
      results
    });
  } catch (error) {
    console.error('Error processing recurring billing:', error);
    return NextResponse.json(
      { error: 'Failed to process recurring billing' },
      { status: 500 }
    );
  }
}
