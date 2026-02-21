// File: /api/payment/initialize/route.ts
// Purpose: Initialize a Stripe Checkout Session for a subscription plan

import { NextRequest, NextResponse } from 'next/server' // Next.js 13+ App Router types
import { auth } from '@clerk/nextjs/server' // Clerk authentication for server components
import { createCheckoutSession } from '@/lib/stripe' // Stripe checkout session helper
import { prisma } from '@/lib/prisma' // Prisma database client instance
import { getPlanFeatures } from '@/lib/plan-features' // Plan features helper

// POST endpoint to initialize a payment transaction
export async function POST(request: NextRequest) {
  try {
    // Get the currently authenticated user ID from Clerk
    const { userId } = await auth()

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the request body to get payment details
    const body = await request.json()
    const { planName, email, mode = 'subscription' } = body // Extract plan name, user email, and payment mode

    // Get plan features based on plan name
    const planFeatures = getPlanFeatures(planName)

    if (!planFeatures) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Find or create user in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: email,
        createdAt: new Date()
      },
      update: {}
    })

    // Generate unique transaction reference
    const reference = `stripe_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // Calculate amount in cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(planFeatures.priceUSD * 100)

    // Create Stripe Checkout Session
    const session = await createCheckoutSession({
      amount: amountInCents,
      currency: 'usd',
      customerEmail: email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        planName,
        reference,
      },
      mode, // 'payment' for one-time or 'subscription' for recurring
    })

    // Store payment record in database for tracking
    await prisma.payment.create({
      data: {
        userId: user.id,
        reference,
        amount: planFeatures.priceUSD,
        status: 'pending',
        stripeSessionId: session.sessionId,
      }
    })

    // Return Stripe session data to client
    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    })
  } catch (error) {
    // Log error for debugging
    console.error('Payment initialization error:', error)
    // Return generic error response
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
