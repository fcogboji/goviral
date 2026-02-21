import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { PostStatus, Prisma } from '@prisma/client'
import { validateRequest, createPostSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/error-handler'
import { requireActiveSubscription } from '@/lib/require-subscription'
import { requireNotBlocked } from '@/lib/access-control'

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

    try {
      await requireNotBlocked(user.id)
    } catch {
      return NextResponse.json(
        { error: 'Account is blocked. Please contact support.', redirectTo: '/blocked' },
        { status: 403 }
      )
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

    // Validate request body
    const validation = validateRequest(createPostSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const {
      content,
      imageUrl,
      videoUrl,
      mediaUrls,
      scheduledFor,
      platforms,
      campaignId,
      hashtags,
      metadata
    } = validation.data;

    // Check subscription — require active trial or paid subscription
    const subCheck = await requireActiveSubscription(userId);
    if (!subCheck.authorized) {
      return NextResponse.json(
        { error: subCheck.error, redirectTo: subCheck.redirectTo },
        { status: 403 }
      );
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

    // Check post limits (skip for admins)
    if (user.role !== 'admin' && user.subscription?.plan) {
      const currentMonthPosts = await prisma.post.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })

      if (user.subscription.plan.maxPosts > 0 && currentMonthPosts >= user.subscription.plan.maxPosts) {
        return NextResponse.json(
          {
            error: 'Monthly post limit reached. Please upgrade your plan.',
            details: {
              limit: user.subscription.plan.maxPosts,
              current: currentMonthPosts
            }
          },
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
        videoUrl,
        mediaUrls: mediaUrls || [],
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        platforms,
        campaignId,
        hashtags: hashtags || [],
        metadata: metadata as Prisma.InputJsonValue,
        status: scheduledFor ? PostStatus.SCHEDULED : PostStatus.DRAFT
      },
      include: {
        campaign: true,
        socialAccounts: true
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    return handleApiError(error, 'POST /api/posts');
  }
}