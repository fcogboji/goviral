import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { requireNotBlocked } from '@/lib/access-control'
// Removed unused PostStatus import

// If CampaignStatus is not exported, define it manually or use Prisma's $Enums
// Option 1: Use Prisma's $Enums (recommended)
import type { $Enums } from '@prisma/client'

// Option 2: Or define manually if needed
// enum CampaignStatus {
//   DRAFT = 'DRAFT',
//   SCHEDULED = 'SCHEDULED',
//   PUBLISHED = 'PUBLISHED',
//   FAILED = 'FAILED',
//   CANCELLED = 'CANCELLED'
// }

// POST - Create a new campaign
export async function POST(request: NextRequest) {
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

    try {
      await requireNotBlocked(user.id)
    } catch {
      return NextResponse.json(
        { error: 'Account is blocked. Please contact support.', redirectTo: '/blocked' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, title, description, budget, startDate, endDate, platforms, posts } = body

    // Validate required fields - added 'name' field which was missing
    if (!name || !title || !startDate || !endDate || !platforms || !posts) {
      return NextResponse.json(
        { error: 'Missing required fields: name, title, startDate, endDate, platforms, posts' },
        { status: 400 }
      )
    }

    // Check subscription limits
    const subscription = user.subscription
    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required to create campaigns' },
        { status: 403 }
      )
    }

    // Check if user has connected platforms
    const connectedPlatforms = await prisma.platformIntegration.findMany({
      where: {
        userId: user.id,
        isActive: true
      }
    })

    if (connectedPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'Connect at least one platform before creating campaigns' },
        { status: 400 }
      )
    }

    // Validate that all selected platforms are connected
    const connectedPlatformNames = connectedPlatforms.map(p => p.platform)
    const invalidPlatforms = platforms.filter((p: string) => !connectedPlatformNames.includes(p))
    
    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        { error: `Platforms not connected: ${invalidPlatforms.join(', ')}` },
        { status: 400 }
      )
    }

    // Create campaign with posts - Fixed: Added missing 'name' field and corrected enum usage
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: name as string,  // Added required name field
        title: title as string,
        description: (description as string) || '',
        budget: (budget as number) || 0,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        platforms: platforms as string[],
        status: 'DRAFT' as $Enums.CampaignStatus, // Fixed: Use correct case and typing
        posts: {
          create: (posts as Array<{
            content: string
            imageUrl?: string
            platforms: string[]
            scheduledFor?: string
          }>).map((post) => ({
            content: post.content,
            imageUrl: post.imageUrl || '',
            platforms: post.platforms,
            status: 'DRAFT' as $Enums.PostStatus, // Fixed: Use correct case and typing
            scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
            userId: user.id // Fix: Added required userId to the post
          }))
        }
      },
      include: {
        posts: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully',
      campaign
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}