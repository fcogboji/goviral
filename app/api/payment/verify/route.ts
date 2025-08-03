// File: /api/payment/verify/route.ts
// Purpose: Verify a completed Paystack payment and update user subscription

import { NextRequest, NextResponse } from 'next/server' // Next.js 13+ App Router types
import PaystackAPI from '@/lib/paystack' // Custom Paystack API wrapper class
import { prisma, Prisma } from '@/lib/prisma' // Prisma database client instance

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
          status: 'success', // Mark payment as successful
          // Fixed: Cast verification.data to proper Prisma JSON type
          paystackData: verification.data as Prisma.InputJsonValue,
        }
      })
      
      // Calculate subscription expiry date (1 month from now)
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1) // Add 1 month
      
      // Update or create user subscription
      await prisma.subscription.upsert({
        where: { userId: payment.userId }, // Find existing subscription by user ID
        update: { // If subscription exists, update it
          planId: payment.planId, // Set new plan ID
          planType: payment.plan.name, // Set plan type from plan name
          status: 'active', // Activate subscription
          currentPeriodStart: new Date(), // Start period from now
          currentPeriodEnd: expiresAt, // End period in 1 month
        },
        create: { // If no subscription exists, create new one
          userId: payment.userId,
          planId: payment.planId,
          planType: payment.plan.name,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: expiresAt,
        }
      })
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        data: verification.data
      })
    } else {
      // Payment failed - update payment status
      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'failed', // Mark payment as failed
          // Fixed: Handle potentially undefined verification.data with proper Prisma null handling
          paystackData: verification.data ? verification.data as Prisma.InputJsonValue : Prisma.JsonNull,
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