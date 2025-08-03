// app/api/platforms/[platform]/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { userId } = await auth()
    const { platform } = await params // Await the params promise
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete the platform integration
    await prisma.platformIntegration.delete({
      where: {
        userId_platform: {
          userId: user.id,
          platform
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error disconnecting platform:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect platform' }, 
      { status: 500 }
    )
  }
}