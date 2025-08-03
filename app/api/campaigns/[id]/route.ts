import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        userId // Ensure user can only access their own campaigns
      },
      include: {
        posts: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, status } = body

    const campaign = await prisma.campaign.updateMany({
      where: {
        id,
        userId // Ensure user can only update their own campaigns
      },
      data: {
        name,
        description,
        status,
        updatedAt: new Date()
      }
    })

    if (campaign.count === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Fetch and return the updated campaign
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        posts: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const campaign = await prisma.campaign.deleteMany({
      where: {
        id,
        userId // Ensure user can only delete their own campaigns
      }
    })

    if (campaign.count === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}