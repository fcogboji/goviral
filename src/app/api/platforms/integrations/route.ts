// app/api/platforms/integrations/route.ts
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
            expiresAt: true
          }
        }
      }
    })

    return NextResponse.json({
      integrations: user.platformIntegrations || []
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}