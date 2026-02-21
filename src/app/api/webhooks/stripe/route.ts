// Stripe webhook handler for payment and subscription events
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { constructWebhookEvent } from '@/lib/stripe';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No signature provided');
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature and construct event
    const event = constructWebhookEvent(body, signature);

    console.log('Stripe webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('Unhandled event type:', event.type);
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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata;

    if (!metadata || !metadata.userId) {
      console.log('No metadata in session');
      return;
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkId: metadata.userId }
    });

    if (!user) {
      console.error('User not found:', metadata.userId);
      return;
    }

    // Update payment record
    if (metadata.reference) {
      await prisma.payment.updateMany({
        where: { reference: metadata.reference },
        data: {
          status: 'success',
        }
      });
    }

    // If this is a subscription payment, create or update subscription
    if (session.subscription && typeof session.subscription === 'string') {
      const now = new Date();
      const nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const planName = metadata.planName || 'Starter';

      // Get or create plan
      let plan = await prisma.plan.findFirst({
        where: { name: planName }
      });

      if (!plan) {
        plan = await prisma.plan.create({
          data: {
            name: planName,
            price: 9,
            currency: 'USD',
            features: ['Basic features'],
            maxPosts: 10,
            maxPlatforms: 3,
            maxWhatsAppMessages: 0
          }
        });
      }

      await prisma.subscription.upsert({
        where: {
          userId: user.id
        },
        create: {
          userId: user.id,
          planId: plan.id,
          planType: planName,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: nextBillingDate,
          nextBillingDate,
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer as string,
        },
        update: {
          planId: plan.id,
          planType: planName,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: nextBillingDate,
          nextBillingDate,
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer as string,
        }
      });
    }

    console.log('Checkout session completed:', session.id);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment intent succeeded:', paymentIntent.id);
    // Additional logic for successful payments if needed
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata;

    if (metadata && metadata.reference) {
      await prisma.payment.updateMany({
        where: { reference: metadata.reference },
        data: {
          status: 'failed',
        }
      });
    }

    console.log('Payment intent failed:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleSubscriptionCreated(stripeSubscription: Stripe.Subscription) {
  try {
    const customerId = stripeSubscription.customer as string;
    const metadata = stripeSubscription.metadata;

    if (!metadata || !metadata.userId) {
      console.log('No metadata in subscription');
      return;
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: metadata.userId }
    });

    if (!user) {
      console.error('User not found:', metadata.userId);
      return;
    }

    const now = new Date();
    const sub = stripeSubscription as unknown as { current_period_end: number };
    const periodEnd = new Date(sub.current_period_end * 1000);
    const planName = metadata.planName || 'Starter';

    // Get or create plan
    let plan = await prisma.plan.findFirst({
      where: { name: planName }
    });

    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          name: planName,
          price: 9,
          currency: 'USD',
          features: ['Basic features'],
          maxPosts: 10,
          maxPlatforms: 3,
          maxWhatsAppMessages: 0
        }
      });
    }

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        planId: plan.id,
        planType: planName,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
      },
      update: {
        planId: plan.id,
        status: 'active',
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
      }
    });

    console.log('Subscription created:', stripeSubscription.id);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  try {
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (existingSubscription) {
      const subData = stripeSubscription as unknown as { current_period_end: number; status: string; cancel_at_period_end?: boolean };
      const periodEnd = new Date(subData.current_period_end * 1000);

      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: subData.status === 'active' ? 'active' : 'inactive',
          currentPeriodEnd: periodEnd,
          nextBillingDate: periodEnd,
          cancelAtPeriodEnd: subData.cancel_at_period_end,
        }
      });

      console.log('Subscription updated:', stripeSubscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  try {
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'cancelled',
          cancelAtPeriodEnd: true
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: existingSubscription.userId,
          message: 'Your subscription has been cancelled. You will have access until the end of your billing period.',
          type: 'in-app'
        }
      });

      console.log('Subscription deleted:', stripeSubscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const sub = (invoice as { subscription?: string | { id?: string } }).subscription;
    const subscriptionId = typeof sub === 'string' ? sub : sub?.id;

    if (!subscriptionId) {
      return;
    }

    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId }
    });

    if (dbSubscription) {
      const now = new Date();
      const nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: nextBillingDate,
          nextBillingDate
        }
      });

      console.log('Invoice paid for subscription:', subscriptionId);
    }
  } catch (error) {
    console.error('Error handling invoice paid:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const sub = (invoice as { subscription?: string | { id?: string } }).subscription;
    const subscriptionId = typeof sub === 'string' ? sub : sub?.id;

    if (!subscriptionId) {
      return;
    }

    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId }
    });

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'past_due'
        }
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: dbSubscription.userId,
          message: 'We were unable to process your payment. Please update your payment method to avoid service interruption.',
          type: 'in-app'
        }
      });

      console.log('Invoice payment failed for subscription:', subscriptionId);
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
