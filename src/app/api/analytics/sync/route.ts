// API Route: Sync analytics from social media platforms
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  syncUserAnalytics,
  syncPostAnalytics,
  getUserAnalyticsSummary,
} from '@/lib/social-media';

// POST - Sync analytics for user's posts
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { postId } = body;

    if (postId) {
      // Sync specific post
      const post = await prisma.post.findFirst({
        where: { id: postId, userId: user.id },
      });

      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      await syncPostAnalytics(postId);

      return NextResponse.json({
        success: true,
        message: 'Post analytics synced successfully',
      });
    } else {
      // Sync all user's posts
      const result = await syncUserAnalytics(user.id);

      return NextResponse.json({
        success: true,
        message: 'Analytics synced successfully',
        synced: result.synced,
        failed: result.failed,
      });
    }
  } catch (error: unknown) {
    console.error('Analytics sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync analytics' },
      { status: 500 }
    );
  }
}

// GET - Get analytics summary
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as '7d' | '30d' | '90d') || '30d';

    const summary = await getUserAnalyticsSummary(user.id, period);

    return NextResponse.json({
      success: true,
      ...summary,
      period,
    });
  } catch (error: unknown) {
    console.error('Get analytics summary error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
