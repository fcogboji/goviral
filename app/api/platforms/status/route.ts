// app/api/platforms/status/route.ts
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
        platformIntegrations: {
          where: { isConnected: true },
          select: {
            platform: true,
            accountName: true,
            expiresAt: true
          }
        }
      }
    })

    const connectedPlatforms = user?.platformIntegrations || []
    const expiringSoon = connectedPlatforms.filter(integration => {
      if (!integration.expiresAt) return false
      const daysUntilExpiry = (integration.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      return daysUntilExpiry <= 7 // Expires within 7 days
    })

    return NextResponse.json({
      totalConnected: connectedPlatforms.length,
      platforms: connectedPlatforms.map(p => p.platform),
      expiringSoon: expiringSoon.length
    })

  } catch (error) {
    console.error('Error fetching platform status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}