import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PostStatus } from '@prisma/client'

// GET - Fetch all posts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const campaignId = searchParams.get('campaignId')

    // Build where clause
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = { userId: user.id }
    
    if (status) {
      // Convert lowercase status to uppercase enum value
      where.status = status.toUpperCase() as PostStatus
    }
    
    if (platform) {
      where.platforms = {
        has: platform
      }
    }
    
    if (campaignId) {
      where.campaignId = campaignId
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        campaign: true,
        socialAccounts: true,
        analytics: {
          // Use a field that actually exists in PostAnalytics
          orderBy: { 
            createdAt: 'desc' // or recordedAt, updatedAt - check your schema
          },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      content, 
      imageUrl, 
      scheduledFor, 
      platforms, 
      campaignId,
      metadata 
    } = body

    // Validate required fields
    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and platforms are required' },
        { status: 400 }
      )
    }

    // Check user's subscription limits
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

    // Skip subscription checks in development environment
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      // Check if user has active subscription
      if (!user.subscription || user.subscription.status !== 'active') {
        return NextResponse.json(
          { error: 'Active subscription required' },
          { status: 403 }
        )
      }

      // Check post limits
      const currentMonthPosts = await prisma.post.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })

      if (user.subscription.plan && currentMonthPosts >= user.subscription.plan.maxPosts) {
        return NextResponse.json(
          { error: 'Monthly post limit reached' },
          { status: 403 }
        )
      }
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        imageUrl,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        platforms,
        campaignId,
        metadata,
        status: scheduledFor ? PostStatus.SCHEDULED : PostStatus.DRAFT
      },
      include: {
        campaign: true,
        socialAccounts: true
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}