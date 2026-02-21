// app/api/platforms/[platform]/disconnect/route.ts
// Disconnects a platform via Ayrshare and updates our database
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { CentralPostingService } from '@/lib/social-media'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { userId } = await auth()
    const { platform } = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    try {
      // Disconnect via Ayrshare
      const service = await CentralPostingService.forUser(user.id)
      await service.disconnectPlatform(platform)
    } catch (ayrshareError) {
      console.warn(`Ayrshare disconnect failed for ${platform}, cleaning up locally:`, ayrshareError)
    }

    // Also clean up our local database
    try {
      await prisma.platformIntegration.updateMany({
        where: {
          userId: user.id,
          platform: { equals: platform, mode: 'insensitive' },
        },
        data: { isConnected: false },
      })
    } catch {
      // Platform integration might not exist
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error disconnecting platform:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect platform' },
      { status: 500 }
    )
  }
}
