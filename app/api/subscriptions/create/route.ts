// app/api/subscriptions/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, planType, planName } = body

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: '', // Will be updated when we have the email
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Get or create plan
    let plan
    if (planId) {
      plan = await prisma.plan.findUnique({
        where: { id: planId }
      })
    } else if (planName) {
      // Find plan by name or create default plans
      plan = await prisma.plan.findFirst({
        where: { name: planName }
      })
      
      if (!plan) {
        // Create default plans if they don't exist
        const defaultPlans = [
          { name: 'Starter', price: 9.00, features: ['5 social accounts', '50 posts per month', 'Basic analytics', 'Email support'] },
          { name: 'Creator', price: 29.00, features: ['15 social accounts', '200 posts per month', 'Advanced analytics', 'AI content suggestions', 'Priority support'] },
          { name: 'Agency', price: 99.00, features: ['Unlimited accounts', 'Unlimited posts', 'White-label reports', 'Team collaboration', 'Dedicated support'] }
        ]
        
        const planData = defaultPlans.find(p => p.name === planName) || defaultPlans[1] // Default to Creator
        
        plan = await prisma.plan.create({
          data: {
            name: planData.name,
            price: planData.price,
            features: planData.features,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has a subscription' },
        { status: 400 }
      )
    }

    // Calculate subscription period (30 days from now for trial)
    const now = new Date()
    const currentPeriodStart = now
    const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        planType: planType || plan.name,
        status: 'trial', // Start as trial
        currentPeriodStart,
        currentPeriodEnd,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        plan: true
      }
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planType: subscription.planType,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        plan: subscription.plan ? {
          id: subscription.plan.id,
          name: subscription.plan.name,
          price: subscription.plan.price,
          features: subscription.plan.features
        } : null
      }
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// GET method to retrieve user's subscription
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

    return NextResponse.json({
      success: true,
      subscription: user.subscription
    })
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve subscription' },
      { status: 500 }
    )
  }
}