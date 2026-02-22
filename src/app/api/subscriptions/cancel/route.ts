// app/api/subscriptions/cancel/route.ts
// Cancel subscription at end of current billing period (user keeps access until then)
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cancelSubscription as cancelStripeSubscription } from '@/lib/stripe'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: { plan: true }
        }
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

    const sub = user.subscription

    // If already set to cancel at period end
    if (sub.cancelAtPeriodEnd) {
      return NextResponse.json({
        success: true,
        message: 'Subscription is already set to cancel at the end of the billing period.',
        subscription: {
          id: sub.id,
          status: sub.status,
          planType: sub.planType,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          currentPeriodEnd: sub.currentPeriodEnd,
        }
      })
    }

    // If Stripe subscription exists, cancel at period end in Stripe first
    if (sub.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        await cancelStripeSubscription(sub.stripeSubscriptionId, true)
      } catch (stripeErr) {
        console.error('Stripe cancel error (continuing with DB update):', stripeErr)
        // Still update DB so user's cancel intent is recorded
      }
    }

    // Mark as cancel-at-period-end — user keeps access until currentPeriodEnd / trialEndsAt
    const updatedSubscription = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      },
      include: {
        plan: true
      }
    })

    // Determine when access ends
    const accessEndsAt = sub.status === 'trial' && sub.trialEndsAt
      ? sub.trialEndsAt
      : sub.currentPeriodEnd

    // Notify user
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Your ${sub.planType} subscription has been set to cancel. You'll have access until ${new Date(accessEndsAt).toLocaleDateString()}.`,
        type: 'in-app'
      }
    })

    return NextResponse.json({
      success: true,
      message: `Subscription will be cancelled at the end of your current period (${new Date(accessEndsAt).toLocaleDateString()}).`,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        planType: updatedSubscription.planType,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        trialEndsAt: updatedSubscription.trialEndsAt,
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

// Reactivate a subscription that was set to cancel
export async function DELETE() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    })

    if (!user?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    if (!user.subscription.cancelAtPeriodEnd) {
      return NextResponse.json({ error: 'Subscription is not set to cancel' }, { status: 400 })
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        updatedAt: new Date()
      }
    })

    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Your ${user.subscription.planType} subscription has been reactivated.`,
        type: 'in-app'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: updatedSubscription
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}
