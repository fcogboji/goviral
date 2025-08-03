// File: /api/payment/initialize/route.ts
// Purpose: Initialize a Paystack payment transaction for a subscription plan

import { NextRequest, NextResponse } from 'next/server' // Next.js 13+ App Router types
import { auth } from '@clerk/nextjs/server' // Clerk authentication for server components
import PaystackAPI from '@/lib/paystack' // Custom Paystack API wrapper class
import { prisma } from '@/lib/prisma' // Prisma database client instance

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
    const { planId, email } = body // Extract plan ID and user email
    
    // Fetch the subscription plan details from database
    const plan = await prisma.plan.findUnique({
      where: { id: planId } // Find plan by its unique ID
    })
    
    // Return error if plan doesn't exist
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    
    // Create new instance of Paystack API wrapper
    const paystack = new PaystackAPI()
    
    // Generate unique transaction reference
    // Format: txn_[timestamp]_[random_string]
    const reference = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    // Initialize payment transaction with Paystack
    const paymentData = await paystack.initializeTransaction({
      email, // Customer email address
      amount: plan.price, // Amount to charge (plan price)
      reference, // Unique transaction reference
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`, // Redirect URL after payment
      metadata: { // Additional data to store with transaction
        userId,
        planId,
        planName: plan.name,
      }
    })
    
    // Store payment record in database for tracking
    await prisma.payment.create({
      data: {
        userId, // Associate payment with user
        planId, // Associate payment with plan
        reference, // Store transaction reference
        amount: plan.price, // Store payment amount
        status: 'pending', // Initial status is pending
        paystackData: paymentData.data, // Store Paystack response data
      }
    })
    
    // Return Paystack initialization response to client
    return NextResponse.json(paymentData)
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