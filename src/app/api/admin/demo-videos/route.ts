import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all demo videos
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const videos = await prisma.demoVideo.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching demo videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo videos' },
      { status: 500 }
    );
  }
}

// POST - Create a new demo video
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, youtubeUrl, thumbnailUrl, isActive, order } = body;

    if (!title || !youtubeUrl) {
      return NextResponse.json(
        { error: 'Title and YouTube URL are required' },
        { status: 400 }
      );
    }

    const video = await prisma.demoVideo.create({
      data: {
        title,
        description,
        youtubeUrl,
        thumbnailUrl,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Error creating demo video:', error);
    return NextResponse.json(
      { error: 'Failed to create demo video' },
      { status: 500 }
    );
  }
}

// PATCH - Update a demo video
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, youtubeUrl, thumbnailUrl, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const video = await prisma.demoVideo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Error updating demo video:', error);
    return NextResponse.json(
      { error: 'Failed to update demo video' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a demo video
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await prisma.demoVideo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting demo video:', error);
    return NextResponse.json(
      { error: 'Failed to delete demo video' },
      { status: 500 }
    );
  }
}
