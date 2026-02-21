// File: /api/payment/verify/route.ts
// Purpose: Verify a completed Paystack payment and update user subscription

import { NextRequest, NextResponse } from 'next/server' // Next.js 13+ App Router types
import PaystackAPI from '@/lib/paystack' // Custom Paystack API wrapper class
import { prisma } from '@/lib/prisma' // Prisma database client instance

// POST endpoint to verify a payment transaction
export async function POST(request: NextRequest) {
  try {
    // Parse request body to get transaction reference
    const body = await request.json()
    const { reference } = body // Extract transaction reference
    
    // Validate that reference is provided
    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }
    
    // Create Paystack API instance
    const paystack = new PaystackAPI()
    // Verify payment status with Paystack
    const verification = await paystack.verifyPayment(reference)
    
    // Find the payment record in our database
    const payment = await prisma.payment.findUnique({
      where: { reference }, // Find by transaction reference
      include: { plan: true } // Include related plan data
    })
    
    // Return error if payment record doesn't exist
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }
    
    // Check if payment was successful - Fixed: Added null check for verification.data
    if (verification.status && verification.data && verification.data.status === 'success') {
      // Update payment status to success
      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'paid', // Mark payment as successful
        }
      })

      // Check if this is a trial payment
      const metadata = (verification.data.metadata || {}) as Record<string, unknown>
      const isTrial = metadata.isTrial === true

      // Extract authorization data from Paystack
      const authorization = (verification.data.authorization || {}) as Record<string, unknown>
      const authorizationCode = authorization.authorization_code as string | undefined
      const cardLast4 = authorization.last4 as string | undefined
      const cardBrand = authorization.card_type as string | undefined
      const cardExpMonth = authorization.exp_month as string | undefined
      const cardExpYear = authorization.exp_year as string | undefined

      let subscription

      // Ensure plan is available before creating subscription
      if (!payment.planId || !payment.plan) {
        return NextResponse.json({ error: 'Payment plan not found' }, { status: 400 })
      }

      if (isTrial) {
        // For trial payments: create a 7-day trial subscription
        const now = new Date()
        const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        const nextBillingDate = trialEndsAt

        subscription = await prisma.subscription.upsert({
          where: { userId: payment.userId },
          update: {
            planId: payment.planId,
            planType: payment.plan.name,
            status: 'trial',
            currentPeriodStart: now,
            currentPeriodEnd: trialEndsAt,
            trialEndsAt,
            nextBillingDate,
            paystackAuthCode: authorizationCode || null,
            cardLast4: cardLast4 || null,
            cardBrand: cardBrand || null,
            cardExpMonth: cardExpMonth || null,
            cardExpYear: cardExpYear || null,
          },
          create: {
            userId: payment.userId,
            planId: payment.planId,
            planType: payment.plan.name,
            status: 'trial',
            currentPeriodStart: now,
            currentPeriodEnd: trialEndsAt,
            trialEndsAt,
            nextBillingDate,
            paystackAuthCode: authorizationCode || null,
            cardLast4: cardLast4 || null,
            cardBrand: cardBrand || null,
            cardExpMonth: cardExpMonth || null,
            cardExpYear: cardExpYear || null,
          }
        })
      } else {
        // For regular payments: create active subscription
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1) // Add 1 month

        subscription = await prisma.subscription.upsert({
          where: { userId: payment.userId },
          update: {
            planId: payment.planId,
            planType: payment.plan.name,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: expiresAt,
            nextBillingDate: expiresAt,
            paystackAuthCode: authorizationCode || null,
            cardLast4: cardLast4 || null,
            cardBrand: cardBrand || null,
            cardExpMonth: cardExpMonth || null,
            cardExpYear: cardExpYear || null,
          },
          create: {
            userId: payment.userId,
            planId: payment.planId,
            planType: payment.plan.name,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: expiresAt,
            nextBillingDate: expiresAt,
            paystackAuthCode: authorizationCode || null,
            cardLast4: cardLast4 || null,
            cardBrand: cardBrand || null,
            cardExpMonth: cardExpMonth || null,
            cardExpYear: cardExpYear || null,
          }
        })
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: isTrial ? 'Trial activated successfully' : 'Payment verified successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          planType: subscription.planType,
          nextBillingDate: subscription.nextBillingDate,
          trialEndsAt: subscription.trialEndsAt,
        },
        data: verification.data
      })
    } else {
      // Payment failed - update payment status
      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'failed', // Mark payment as failed
        }
      })
      
      // Return failure response
      return NextResponse.json({
        success: false,
        message: 'Payment verification failed',
        data: verification.data || null
      })
    }
  } catch (error) {
    // Log error for debugging
    console.error('Payment verification error:', error)
    // Return generic error response
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}