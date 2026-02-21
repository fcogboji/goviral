// app/api/platforms/integrate/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create user in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: '',
        createdAt: new Date()
      },
      update: {},
      include: {
        platformIntegrations: {
          select: {
            id: true,
            platform: true,
            accountName: true,
            isConnected: true,
            profileUrl: true,
            profileImageUrl: true,
            connectedAt: true,
            expiresAt: true,
            metadata: true,
            isActive: true
          }
        },
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    // Get user's plan limits
    const maxPlatforms = user.subscription?.plan?.maxPlatforms || 5
    const connectedCount = user.platformIntegrations.filter(p => p.isConnected).length

    // Transform integrations to match component expected format
    const platforms = [
      'instagram',
      'facebook',
      'twitter',
      'linkedin',
      'tiktok',
      'youtube',
      'whatsapp'
    ].map(platformName => {
      const integration = user.platformIntegrations.find(
        p => p.platform.toLowerCase() === platformName
      )

      if (integration && integration.isConnected) {
        // Extract followers and posts from metadata if available
        const metadata = integration.metadata as Record<string, unknown> | null
        const followers = (metadata?.followers ?? metadata?.followerCount ?? 0) as number
        const posts = (metadata?.posts ?? metadata?.postCount ?? 0) as number

        return {
          name: platformName,
          isConnected: true,
          isActive: integration.isActive,
          accountInfo: {
            username: integration.accountName || `@${platformName}_user`,
            displayName: integration.accountName || `${platformName} User`,
            profileImage: integration.profileImageUrl || undefined,
            followers,
            posts
          },
          lastSync: integration.connectedAt?.toISOString()
        }
      }

      return {
        name: platformName,
        isConnected: false,
        isActive: false
      }
    })

    return NextResponse.json({
      platforms,
      limits: {
        maxPlatforms,
        used: connectedCount,
        remaining: maxPlatforms - connectedCount
      }
    })
  } catch (error) {
    console.error('Error fetching platform integrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform name is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete or update the platform integration
    await prisma.platformIntegration.deleteMany({
      where: {
        userId: user.id,
        platform: {
          equals: platform,
          mode: 'insensitive'
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting platform:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
