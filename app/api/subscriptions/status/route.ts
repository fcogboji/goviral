// app/api/subscriptions/status/route.ts
// Option 1: Remove NextRequest entirely since it's not used
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
          include: { plan: true }
        },
        platformIntegrations: {
          where: { isActive: true }
        },
        posts: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current subscription info
    const subscription = user.subscription
    const plan = subscription?.plan

    // Calculate usage
    const currentMonthPosts = user.posts.length
    const connectedPlatforms = user.platformIntegrations.length

    // Get limits based on plan
    const limits = {
      maxPosts: plan?.maxPosts || 10,
      maxPlatforms: plan?.maxPlatforms || 3
    }

    const usage = {
      posts: {
        used: currentMonthPosts,
        limit: limits.maxPosts,
        remaining: Math.max(0, limits.maxPosts - currentMonthPosts)
      },
      platforms: {
        used: connectedPlatforms,
        limit: limits.maxPlatforms,
        remaining: Math.max(0, limits.maxPlatforms - connectedPlatforms)
      }
    }

    return NextResponse.json({
      subscription: {
        status: subscription?.status || 'none',
        planType: subscription?.planType || 'none',
        planName: plan?.name || 'No Plan',
        currentPeriodStart: subscription?.currentPeriodStart,
        currentPeriodEnd: subscription?.currentPeriodEnd,
        isActive: subscription?.status === 'active'
      },
      limits,
      usage,
      plan: plan ? {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        description: plan.description,
        features: plan.features
      } : null
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}

// Alternative Option 2: If you need to keep NextRequest for future use
// import { NextRequest, NextResponse } from 'next/server'
// export async function GET(_request: NextRequest) {
//   // Your existing code here
// }

// Alternative Option 3: If linting is very strict, use ESLint disable comment
// import { NextRequest, NextResponse } from 'next/server'
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export async function GET(_request: NextRequest) {
//   // Your existing code here
// }