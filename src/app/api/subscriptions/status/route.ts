// app/api/subscriptions/status/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: {
          include: { plan: true },
        },
        platformIntegrations: {
          where: { isActive: true },
        },
        posts: {
          where: {
            createdAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ),
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscription = user.subscription
    const plan = subscription?.plan

    // Calculate usage
    const currentMonthPosts = user.posts.length
    const connectedPlatforms = user.platformIntegrations.length

    const limits = {
      maxPosts: plan?.maxPosts ?? 10,
      maxPlatforms: plan?.maxPlatforms ?? 3,
    }

    const usage = {
      posts: {
        used: currentMonthPosts,
        limit: limits.maxPosts,
        remaining:
          limits.maxPosts === -1
            ? -1
            : Math.max(0, limits.maxPosts - currentMonthPosts),
      },
      platforms: {
        used: connectedPlatforms,
        limit: limits.maxPlatforms,
        remaining:
          limits.maxPlatforms === -1
            ? -1
            : Math.max(0, limits.maxPlatforms - connectedPlatforms),
      },
    }

    return NextResponse.json({
      subscription: subscription
        ? {
            status: subscription.status,
            planType: subscription.planType,
            planName: plan?.name || subscription.planType,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialEndsAt: subscription.trialEndsAt,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            nextBillingDate: subscription.nextBillingDate,
            cardLast4: subscription.cardLast4,
            cardBrand: subscription.cardBrand,
            cardExpMonth: subscription.cardExpMonth,
            cardExpYear: subscription.cardExpYear,
            isActive: ['active', 'trial'].includes(subscription.status),
          }
        : null,
      limits,
      usage,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            description: plan.description,
            features: plan.features,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}
