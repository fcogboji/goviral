// app/api/platforms/sync/route.ts - Sync platform data from Ayrshare
// Uses CentralPostingService as the single entry point
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { CentralPostingService } from '@/lib/social-media'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform } = body

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    try {
      const service = await CentralPostingService.forUser(user.id)

      if (platform) {
        // Sync a specific platform's profile data
        const profile = await service.getProfile(platform)

        await prisma.platformIntegration.upsert({
          where: {
            userId_platform: {
              userId: user.id,
              platform: platform.toLowerCase(),
            },
          },
          create: {
            userId: user.id,
            platform: platform.toLowerCase(),
            platformUserId: profile.platformUserId || '',
            accountName: profile.displayName || platform,
            accessToken: 'managed-by-ayrshare',
            isConnected: true,
            isActive: true,
            profileUrl: profile.profileUrl,
            profileImageUrl: profile.profileImageUrl,
            connectedAt: new Date(),
            metadata: {
              managedByAyrshare: true,
              followers: profile.followerCount || 0,
              ...(profile.metadata || {}),
            },
          },
          update: {
            accountName: profile.displayName || platform,
            profileUrl: profile.profileUrl,
            profileImageUrl: profile.profileImageUrl,
            isConnected: true,
            connectedAt: new Date(),
            metadata: {
              managedByAyrshare: true,
              followers: profile.followerCount || 0,
              ...(profile.metadata || {}),
            },
          },
        })

        return NextResponse.json({
          success: true,
          platform,
          profile,
        })
      } else {
        // Sync ALL connected platforms from Ayrshare
        const connectedPlatforms = await service.syncConnectedPlatforms()

        return NextResponse.json({
          success: true,
          connectedPlatforms,
          message: `Synced ${connectedPlatforms.length} platform(s)`,
        })
      }
    } catch (apiError: unknown) {
      console.error(`Error syncing platform(s):`, apiError)
      return NextResponse.json(
        { error: apiError instanceof Error ? apiError.message : 'Failed to sync platform data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error syncing platform:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
