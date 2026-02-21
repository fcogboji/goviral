// API Route: Publish posts to social media platforms
// Uses the CentralPostingService — the single entry point for all platform interactions
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CentralPostingService } from '@/lib/social-media';
import { requireActiveSubscription } from '@/lib/require-subscription';

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Require active subscription or trial
    const subCheck = await requireActiveSubscription(clerkUserId);
    if (!subCheck.authorized) {
      return NextResponse.json(
        { error: subCheck.error, redirectTo: subCheck.redirectTo },
        { status: 403 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check subscription status
    if (!user.subscription || user.subscription.status === 'inactive') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { postId, publishNow } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get post from database
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Verify post belongs to user
    if (post.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to publish this post' },
        { status: 403 }
      );
    }

    // Check if user has reached post limit
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const postCount = await prisma.post.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: currentMonth,
        },
        status: 'PUBLISHED',
      },
    });

    if (postCount >= user.subscription.plan.maxPosts && user.subscription.plan.maxPosts !== 999999) {
      return NextResponse.json(
        {
          error: 'Monthly post limit reached',
          limit: user.subscription.plan.maxPosts,
          current: postCount,
        },
        { status: 403 }
      );
    }

    // Create centralized service for this user
    const service = await CentralPostingService.forUser(user.id);

    const publishRequest = {
      postId: post.id,
      userId: user.id,
      content: post.content,
      mediaUrls: post.mediaUrls,
      platforms: post.platforms,
      hashtags: post.hashtags,
    };

    // Publish immediately or schedule
    if (publishNow || !post.scheduledFor) {
      // Publish immediately via central service
      const results = await service.publishToAll(publishRequest);

      // Update post status
      const allSucceeded = results.every(r => r.success);
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: allSucceeded ? 'PUBLISHED' : 'FAILED',
          publishedAt: allSucceeded ? new Date() : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: allSucceeded ? 'Post published successfully' : 'Some platforms failed',
        results,
      });
    } else {
      // Schedule for later via central service
      await service.schedulePost(publishRequest, post.scheduledFor);

      // Update post status
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'SCHEDULED',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Post scheduled successfully',
        scheduledFor: post.scheduledFor,
      });
    }
  } catch (error: unknown) {
    console.error('Post publish error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish post' },
      { status: 500 }
    );
  }
}
