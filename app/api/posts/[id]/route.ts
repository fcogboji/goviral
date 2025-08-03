import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma, Prisma } from '@/lib/prisma'
import { PostStatus } from '@prisma/client'

// GET - Fetch a specific post
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const post = await prisma.post.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        campaign: true,
        socialAccounts: true,
        analytics: {
          // Fixed: Use createdAt instead of date
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PUT - Update a post
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
    const { 
      content, 
      imageUrl, 
      scheduledFor, 
      platforms, 
      campaignId,
      metadata 
    } = body

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: {
        content,
        imageUrl,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        platforms,
        campaignId,
        metadata,
        // Fixed: Use enum values instead of strings
        status: scheduledFor ? PostStatus.SCHEDULED : PostStatus.DRAFT
      },
      include: {
        campaign: true,
        socialAccounts: true
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// PATCH - Partial update (for actions like publish, pause, etc.)
export async function PATCH(
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
    const { action, ...updates } = body

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const updateData: Prisma.PostUpdateInput = { ...updates }

    // Handle specific actions
    switch (action) {
      case 'publish':
        // Fixed: Use enum values
        updateData.status = PostStatus.PUBLISHED
        updateData.publishedAt = new Date()
        break
      case 'pause':
        updateData.status = PostStatus.DRAFT
        break
      case 'resume':
        updateData.status = PostStatus.SCHEDULED
        break
      case 'duplicate':
        // Create a copy of the post
        const duplicatedPost = await prisma.post.create({
          data: {
            userId: user.id,
            content: existingPost.content,
            imageUrl: existingPost.imageUrl,
            scheduledFor: null,
            platforms: existingPost.platforms,
            campaignId: existingPost.campaignId,
            metadata: existingPost.metadata as Prisma.InputJsonValue,
            status: PostStatus.DRAFT
          },
          include: {
            campaign: true,
            socialAccounts: true
          }
        })
        return NextResponse.json(duplicatedPost)
      default:
        // Just update with provided data
        break
    }

    const updatedPost = await prisma.post.update({
      where: { id: id },
      data: updateData,
      include: {
        campaign: true,
        socialAccounts: true
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a post
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}