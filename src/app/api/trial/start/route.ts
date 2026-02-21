// app/api/trial/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, source } = body

    // Log the trial start attempt for analytics
    console.log('Trial start attempt:', { plan, source, timestamp: new Date().toISOString() })

    // Get authenticated user (if any)
    const { userId } = await auth()

    if (userId) {
      // User is authenticated, we can check/update their subscription
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          subscription: true
        }
      })

      if (user && !user.subscription) {
        // User exists but has no subscription, create a trial subscription
        const trialPlan = await prisma.plan.findFirst({
          where: { name: 'Starter' } // Assuming 'Starter' is your trial plan
        })

        if (trialPlan) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: trialPlan.id,
              planType: plan || 'Starter',
              status: 'trial',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
            }
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Trial started successfully',
        plan,
        redirectUrl: '/dashboard'
      })
    } else {
      // User not authenticated, redirect to signup
      return NextResponse.json({
        success: true,
        message: 'Please sign up to start your trial',
        plan,
        redirectUrl: '/sign-up'
      })
    }
  } catch (error) {
    console.error('Error starting trial:', error)
    return NextResponse.json(
      { error: 'Failed to start trial' },
      { status: 500 }
    )
  }
}

// GET method to check trial status
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
          include: {
            plan: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is on trial
    const isOnTrial = user.subscription?.status === 'trial'
    const trialEndsAt = user.subscription?.currentPeriodEnd

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        hasSubscription: !!user.subscription,
        isOnTrial,
        trialEndsAt,
        subscription: user.subscription
      }
    })
  } catch (error) {
    console.error('Error checking trial status:', error)
    return NextResponse.json(
      { error: 'Failed to check trial status' },
      { status: 500 }
    )
  }
}