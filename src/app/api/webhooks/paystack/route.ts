// Paystack webhook handler for subscription events
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('No signature provided');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    console.log('Paystack webhook event:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;

      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(event.data);
        break;

      case 'invoice.create':
      case 'invoice.update':
        await handleInvoice(event.data);
        break;

      default:
        console.log('Unhandled event type:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(data: {
  reference: string;
  amount: number;
  customer: {
    email: string;
    customer_code: string;
  };
  authorization: {
    authorization_code: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    brand: string;
  };
  metadata: {
    userId?: string;
    subscriptionId?: string;
    planType?: string;
  };
}) {
  try {
    // Update payment record
    await prisma.payment.updateMany({
      where: { reference: data.reference },
      data: {
        status: 'paid',
      }
    });

    // If this is a subscription payment, update subscription
    if (data.metadata.userId && data.metadata.subscriptionId) {
      const subscription = await prisma.subscription.findUnique({
        where: { id: data.metadata.subscriptionId }
      });

      if (subscription) {
        const now = new Date();
        const nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.update({
          where: { id: data.metadata.subscriptionId },
          data: {
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: nextBillingDate,
            nextBillingDate,
            stripeCustomerId: data.customer.customer_code,
            paystackAuthCode: data.authorization.authorization_code,
            cardLast4: data.authorization.last4,
            cardBrand: data.authorization.brand,
            cardExpMonth: data.authorization.exp_month,
            cardExpYear: data.authorization.exp_year
          }
        });
      }
    }

    console.log('Charge success handled:', data.reference);
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handleSubscriptionCreate(data: {
  customer: {
    customer_code: string;
    email: string;
  };
  plan: {
    name: string;
    plan_code: string;
  };
  subscription_code: string;
  email_token: string;
}) {
  try {
    // Find user by customer code
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeCustomerId: data.customer.customer_code
      }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          stripeSubscriptionId: data.subscription_code,
          status: 'active'
        }
      });

      console.log('Subscription created:', data.subscription_code);
    }
  } catch (error) {
    console.error('Error handling subscription create:', error);
  }
}

async function handleSubscriptionDisable(data: {
  customer: {
    customer_code: string;
  };
  subscription_code: string;
}) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: data.subscription_code
      }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelAtPeriodEnd: true
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          message: 'Your subscription has been cancelled. You will have access until the end of your billing period.',
          type: 'in-app'
        }
      });

      console.log('Subscription disabled:', data.subscription_code);
    }
  } catch (error) {
    console.error('Error handling subscription disable:', error);
  }
}

async function handleSubscriptionNotRenew(data: {
  customer: {
    customer_code: string;
  };
  subscription_code: string;
}) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: data.subscription_code
      }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'inactive',
          cancelAtPeriodEnd: true
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          message: 'Your subscription will not renew automatically. You can reactivate it from your account settings.',
          type: 'in-app'
        }
      });

      console.log('Subscription will not renew:', data.subscription_code);
    }
  } catch (error) {
    console.error('Error handling subscription not renew:', error);
  }
}

async function handleInvoice(data: {
  customer: {
    customer_code: string;
  };
  subscription: {
    subscription_code: string;
  };
  amount: number;
  paid: boolean;
  paid_at?: string;
}) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: data.subscription.subscription_code
      }
    });

    if (subscription && data.paid) {
      const now = new Date();
      const nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: nextBillingDate,
          nextBillingDate
        }
      });

      console.log('Invoice paid for subscription:', data.subscription.subscription_code);
    } else if (subscription && !data.paid) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'past_due'
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: subscription.userId,
          message: 'We were unable to process your payment. Please update your payment method to avoid service interruption.',
          type: 'in-app'
        }
      });

      console.log('Invoice unpaid for subscription:', data.subscription.subscription_code);
    }
  } catch (error) {
    console.error('Error handling invoice:', error);
  }
}
