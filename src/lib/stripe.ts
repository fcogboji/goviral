// lib/stripe.ts
import Stripe from 'stripe';

// Lazy initialization to avoid errors during build
let stripeInstance: Stripe | null = null;

// Get Stripe instance - only initialize when actually needed
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export stripe getter for backward compatibility
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get charges() {
    return getStripe().charges;
  },
  get paymentIntents() {
    return getStripe().paymentIntents;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

// Helper to check if Stripe is properly configured
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Create a Stripe Checkout Session for one-time payments
 */
export async function createCheckoutSession(params: {
  priceId?: string; // Stripe Price ID (for subscriptions or predefined prices)
  amount?: number; // Amount in cents (for one-time payments)
  currency?: string; // Currency code (default: usd)
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  mode?: 'payment' | 'subscription'; // payment for one-time, subscription for recurring
}) {
  const {
    priceId,
    amount,
    currency = 'usd',
    customerEmail,
    successUrl,
    cancelUrl,
    metadata,
    mode = 'payment',
  } = params;

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer_email: customerEmail,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    };

    if (mode === 'subscription' && priceId) {
      // For subscription payments
      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else if (mode === 'payment' && amount) {
      // For one-time payments
      sessionParams.line_items = [
        {
          price_data: {
            currency,
            product_data: {
              name: metadata?.planName || 'GoViral Subscription',
              description: metadata?.description || 'Social media management platform',
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ];
    } else {
      throw new Error('Either priceId (for subscription) or amount (for payment) must be provided');
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    throw error;
  }
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrGetCustomer(email: string, metadata?: Record<string, string>) {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: metadata || {},
    });

    return customer;
  } catch (error) {
    console.error('Error creating/getting customer:', error);
    throw error;
  }
}

/**
 * Create a subscription for a customer
 */
export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialDays?: number;
}) {
  const { customerId, priceId, metadata, trialDays } = params;

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: metadata || {},
      trial_period_days: trialDays,
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
  try {
    if (cancelAtPeriodEnd) {
      // Cancel at the end of the billing period
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } else {
      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

/**
 * Update a subscription (e.g., for upgrades/downgrades)
 */
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations', // Automatically calculate prorated amounts
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw error;
  }
}

/**
 * List all transactions/charges for a customer
 */
export async function listCharges(customerId?: string, limit: number = 10) {
  try {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit,
    });

    return charges.data;
  } catch (error) {
    console.error('Error listing charges:', error);
    throw error;
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}
