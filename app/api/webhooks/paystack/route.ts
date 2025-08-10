import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma, Prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || !signature) return false
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature')
    const rawBody = await request.text()

    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event?.event
    const data = event?.data

    if (eventType === 'charge.success' && data?.reference) {
      const reference: string = data.reference

      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: { plan: true },
      })

      if (!payment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'success',
          paystackData: data as Prisma.InputJsonValue,
        },
      })

      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          planId: payment.planId,
          planType: payment.plan?.name || 'Unknown',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: expiresAt,
        },
        create: {
          userId: payment.userId,
          planId: payment.planId,
          planType: payment.plan?.name || 'Unknown',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: expiresAt,
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}