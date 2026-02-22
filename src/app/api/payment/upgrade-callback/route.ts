// Callback for subscription upgrade payments
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
        `${getAppUrl()}/dashboard?error=invalid_reference`
      );
    }

    // Verify payment
    const paystack = new PaystackAPI();
    const verification = await paystack.verifyPayment(reference);

    if (!verification.status || !verification.data) {
      await prisma.payment.updateMany({
        where: { reference },
        data: { status: 'failed' }
      });

      return NextResponse.redirect(
        `${getAppUrl()}/dashboard?error=payment_failed`
      );
    }

    const paymentData = verification.data as {
      status: string;
      amount: number;
      metadata: {
        userId: string;
        subscriptionId: string;
        previousPlan: string;
        newPlan: string;
        proratedAmount: number;
      };
      authorization: {
        authorization_code: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        brand: string;
        reusable: boolean;
      };
    };

    if (paymentData.status !== 'success') {
      await prisma.payment.updateMany({
        where: { reference },
        data: { status: 'failed' }
      });

      return NextResponse.redirect(
        `${getAppUrl()}/dashboard?error=payment_failed`
      );
    }

    const { userId, newPlan } = paymentData.metadata;

    // Get new plan config
    const newPlanConfig = getPlanByName(newPlan);

    if (!newPlanConfig) {
      return NextResponse.redirect(
        `${getAppUrl()}/dashboard?error=invalid_plan`
      );
    }

    // Get or create plan
    let dbPlan = await prisma.plan.findFirst({
      where: { name: newPlan }
    });

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
          maxWhatsAppMessages: limits.maxWhatsAppMessages ?? 0
        }
      });
    }

    // Update subscription
    await prisma.subscription.update({
      where: { userId },
      data: {
        planId: dbPlan.id,
        planType: newPlan,
        status: 'active',
        cardLast4: paymentData.authorization.last4,
        cardBrand: paymentData.authorization.brand,
        cardExpMonth: paymentData.authorization.exp_month,
        cardExpYear: paymentData.authorization.exp_year
      }
    });

    // Update payment
    await prisma.payment.updateMany({
      where: { reference },
      data: {
        status: 'paid',
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        message: `Congratulations! You've successfully upgraded to the ${newPlan} plan.`,
        type: 'in-app'
      }
    });

    return NextResponse.redirect(
      `${getAppUrl()}/dashboard?upgrade_success=true&plan=${newPlan}`
    );
  } catch (error) {
    console.error('Error processing upgrade callback:', error);
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard?error=processing_failed`
    );
  }
}
