
// app/api/subscriptions/cancel/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Update subscription status to cancelled
    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      },
      include: {
        plan: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        planType: updatedSubscription.planType,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        plan: updatedSubscription.plan ? {
          id: updatedSubscription.plan.id,
          name: updatedSubscription.plan.name
        } : null
      }
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}