// Cron job to process trial endings and charge customers
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import PaystackAPI from '@/lib/paystack';
import { getPlanFeatures } from '@/lib/plan-features';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find all trial subscriptions that are ending today or have already ended
    // Only process non-Stripe subscriptions (Stripe handles its own trial conversions)
    const endingTrials = await prisma.subscription.findMany({
      where: {
        status: 'trial',
        trialEndsAt: {
          lte: now // Trial end date is less than or equal to now
        },
        stripeSubscriptionId: null // Only process non-Stripe subscriptions
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

    // Process each ending trial
    for (const subscription of endingTrials) {
      results.processed++;

      try {
        const planConfig = getPlanFeatures(subscription.planType);
        // Use the plan price from config (in USD) or from the plan record
        const amount = subscription.plan?.price || planConfig.price;
        const amountInCents = amount * 100;

        // Charge the customer's saved card
        const reference = `subscription_${subscription.userId}_${Date.now()}`;

        // Use the stored Paystack authorization code for recurring charges
        const authCode = subscription.paystackAuthCode;

        if (!authCode) {
          throw new Error('No Paystack authorization code on file. User needs to re-authorize card.');
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
            billingReason: 'trial_conversion'
          }
        });

        if (chargeResponse.status && chargeResponse.data?.status === 'success') {
          // Payment successful - convert to active subscription
          const nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: nextBillingDate,
              nextBillingDate,
              trialEndsAt: null // Clear trial end date
            }
          });

          // Record the payment
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
              message: `Your trial has ended and your ${subscription.planType} subscription is now active. Your card has been charged $${amount}.`,
              type: 'in-app'
            }
          });

          results.successful++;
        } else {
          // Payment failed
          throw new Error(chargeResponse.message || 'Payment failed');
        }
      } catch (error: unknown) {
        results.failed++;

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        results.errors.push({
          userId: subscription.userId,
          error: errorMessage
        });

        // Update subscription to past_due status
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'past_due'
          }
        });

        // Create notification about payment failure
        await prisma.notification.create({
          data: {
            userId: subscription.userId,
            message: `Your trial has ended but we couldn't charge your card. Please update your payment method to continue using ${subscription.planType} plan.`,
            type: 'in-app'
          }
        });

        console.error(`Failed to charge user ${subscription.userId}:`, errorMessage);
      }
    }

    console.log('Trial processing completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Trial processing completed',
      results
    });
  } catch (error) {
    console.error('Error processing trials:', error);
    return NextResponse.json(
      { error: 'Failed to process trials' },
      { status: 500 }
    );
  }
}
