// Callback for trial card authorization
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAppUrl } from '@/lib/app-url';
import PaystackAPI from '@/lib/paystack';
import { getPlanByName } from '@/lib/plan-features';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect(
        `${getAppUrl()}/pricing?error=invalid_reference`
      );
    }

    // Verify the payment with Paystack
    const paystack = new PaystackAPI();
    const verification = await paystack.verifyPayment(reference);

    if (!verification.status || !verification.data) {
      // Payment failed
      await prisma.payment.updateMany({
        where: { reference },
        data: { status: 'failed' }
      });

      return NextResponse.redirect(
        `${getAppUrl()}/pricing?error=payment_failed`
      );
    }

    const paymentData = verification.data as {
      status: string;
      amount: number;
      metadata: {
        userId: string;
        planId: string;
        planName: string;
        fullAmount: number;
      };
      authorization: {
        authorization_code: string;
        bin: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        channel: string;
        card_type: string;
        bank: string;
        brand: string;
        reusable: boolean;
      };
      customer: {
        id: number;
        customer_code: string;
        email: string;
      };
    };

    if (paymentData.status !== 'success') {
      await prisma.payment.updateMany({
        where: { reference },
        data: { status: 'failed' }
      });

      return NextResponse.redirect(
        `${getAppUrl()}/pricing?error=payment_failed`
      );
    }

    // Check if authorization is reusable
    if (!paymentData.authorization.reusable) {
      return NextResponse.redirect(
        `${getAppUrl()}/pricing?error=card_not_reusable`
      );
    }

    const { userId, planId, planName } = paymentData.metadata;

    // Update payment record
    await prisma.payment.updateMany({
      where: { reference },
      data: {
        status: 'paid',
      }
    });

    // Get plan config
    const planConfig = getPlanByName(planName);

    if (!planConfig) {
      return NextResponse.redirect(
        `${getAppUrl()}/pricing?error=invalid_plan`
      );
    }

    // Calculate trial period (7 days)
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + (planConfig.trialDays || 7) * 24 * 60 * 60 * 1000);
    const currentPeriodEnd = new Date(trialEndsAt.getTime() + 30 * 24 * 60 * 60 * 1000); // First billing after trial

    // Create or update subscription with card authorization
    // Store both customer_code and authorization_code — the auth code is required for recurring charges
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        planType: planName,
        status: 'trial',
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        nextBillingDate: trialEndsAt,
        stripeCustomerId: paymentData.customer.customer_code,
        paystackAuthCode: paymentData.authorization.authorization_code,
        cardLast4: paymentData.authorization.last4,
        cardBrand: paymentData.authorization.brand,
        cardExpMonth: paymentData.authorization.exp_month,
        cardExpYear: paymentData.authorization.exp_year
      },
      update: {
        planId,
        planType: planName,
        status: 'trial',
        currentPeriodStart: now,
        currentPeriodEnd,
        trialEndsAt,
        nextBillingDate: trialEndsAt,
        stripeCustomerId: paymentData.customer.customer_code,
        paystackAuthCode: paymentData.authorization.authorization_code,
        cardLast4: paymentData.authorization.last4,
        cardBrand: paymentData.authorization.brand,
        cardExpMonth: paymentData.authorization.exp_month,
        cardExpYear: paymentData.authorization.exp_year
      }
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId,
        message: `Your 7-day free trial for ${planName} plan has started! Your card will be charged $${planConfig.price} on ${trialEndsAt.toLocaleDateString()}.`,
        type: 'in-app'
      }
    });

    // Send welcome email (optional - integrate with your email service)
    // await sendTrialWelcomeEmail(user.email, planName, trialEndsAt);

    return NextResponse.redirect(
      `${getAppUrl()}/dashboard?trial_started=true&plan=${planName}`
    );
  } catch (error) {
    console.error('Error processing trial callback:', error);
    return NextResponse.redirect(
      `${getAppUrl()}/pricing?error=processing_failed`
    );
  }
}
