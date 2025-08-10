// File: /app/api/payment/initialize/route.ts
// Purpose: Initialize a Paystack payment transaction for a subscription plan

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import PaystackAPI from '@/lib/paystack'
import { prisma } from '@/lib/prisma'

// POST endpoint to initialize a payment transaction
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, email } = body

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const paystack = new PaystackAPI()

    const reference = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    const paymentData = await paystack.initializeTransaction({
      email,
      amount: plan.price,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback`,
      metadata: {
        userId,
        planId,
        planName: plan.name,
      }
    })

    await prisma.payment.create({
      data: {
        userId,
        planId,
        reference,
        amount: plan.price,
        status: 'pending',
        paystackData: paymentData.data,
      }
    })

    return NextResponse.json(paymentData)
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}