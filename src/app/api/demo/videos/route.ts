import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch active demo videos (public endpoint)
export async function GET() {
  try {
    const videos = await prisma.demoVideo.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        youtubeUrl: true,
        thumbnailUrl: true,
        order: true,
      },
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
