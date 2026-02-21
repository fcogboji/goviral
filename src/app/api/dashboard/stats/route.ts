// API Route: Dashboard statistics
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { requireNotBlocked } from '@/lib/access-control';

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        subscription: {
          include: { plan: true },
        },
        platformIntegrations: {
          where: { isConnected: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
      await requireNotBlocked(user.id);
    } catch {
      return NextResponse.json(
        { error: 'Account is blocked. Please contact support.', redirectTo: '/blocked' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    // Get current period stats
    const [
      totalPosts,
      publishedPosts,
      scheduledPosts,
      totalCampaigns,
      activeCampaigns,
      currentAnalytics,
      previousAnalytics,
      recentPosts,
      topPosts,
    ] = await Promise.all([
      // Total posts
      prisma.post.count({
        where: { userId: user.id },
      }),

      // Published posts in period
      prisma.post.count({
        where: {
          userId: user.id,
          status: 'PUBLISHED',
          publishedAt: { gte: startDate },
        },
      }),

      // Scheduled posts
      prisma.post.count({
        where: {
          userId: user.id,
          status: 'SCHEDULED',
        },
      }),

      // Total campaigns
      prisma.campaign.count({
        where: { userId: user.id },
      }),

      // Active campaigns
      prisma.campaign.count({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
      }),

      // Current period analytics
      prisma.postAnalytics.aggregate({
        where: {
          post: { userId: user.id },
          recordedAt: { gte: startDate },
        },
        _sum: {
          impressions: true,
          engagements: true,
          likes: true,
          comments: true,
          shares: true,
          reach: true,
        },
      }),

      // Previous period analytics for comparison
      prisma.postAnalytics.aggregate({
        where: {
          post: { userId: user.id },
          recordedAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
        _sum: {
          impressions: true,
          engagements: true,
          likes: true,
          comments: true,
          shares: true,
          reach: true,
        },
      }),

      // Recent posts
      prisma.post.findMany({
        where: { userId: user.id },
        include: {
          postResults: true,
          analytics: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Top performing posts
      prisma.post.findMany({
        where: {
          userId: user.id,
          status: 'PUBLISHED',
        },
        include: {
          analytics: {
            orderBy: { engagements: 'desc' },
            take: 1,
          },
        },
        orderBy: {
          analytics: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // Calculate changes
    const currentTotals = currentAnalytics._sum;
    const previousTotals = previousAnalytics._sum;

    const calculateChange = (current: number | null, previous: number | null) => {
      const curr = current || 0;
      const prev = previous || 1; // Avoid division by zero
      return prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
    };

    // Platform breakdown
    const platformStats = await prisma.postAnalytics.groupBy({
      by: ['platform'],
      where: {
        post: { userId: user.id },
        recordedAt: { gte: startDate },
      },
      _sum: {
        engagements: true,
        impressions: true,
      },
      _count: true,
    });

    // Get subscription usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const postsThisMonth = await prisma.post.count({
      where: {
        userId: user.id,
        createdAt: { gte: currentMonth },
        status: 'PUBLISHED',
      },
    });

    const maxPosts = user.subscription?.plan?.maxPosts || 5;
    const maxPlatforms = user.subscription?.plan?.maxPlatforms || 1;

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        totalCampaigns,
        activeCampaigns,
        connectedPlatforms: user.platformIntegrations.length,
      },
      metrics: {
        totalReach: currentTotals.reach || 0,
        reachChange: calculateChange(currentTotals.reach, previousTotals.reach),
        totalEngagements: currentTotals.engagements || 0,
        engagementChange: calculateChange(currentTotals.engagements, previousTotals.engagements),
        totalImpressions: currentTotals.impressions || 0,
        impressionChange: calculateChange(currentTotals.impressions, previousTotals.impressions),
        totalLikes: currentTotals.likes || 0,
        totalComments: currentTotals.comments || 0,
        totalShares: currentTotals.shares || 0,
        engagementRate:
          (currentTotals.impressions || 0) > 0
            ? Math.round(((currentTotals.engagements || 0) / (currentTotals.impressions || 1)) * 10000) / 100
            : 0,
      },
      platformBreakdown: platformStats.map((p) => ({
        platform: p.platform,
        engagements: p._sum.engagements || 0,
        impressions: p._sum.impressions || 0,
        posts: p._count,
      })),
      recentPosts: recentPosts.map((post) => ({
        id: post.id,
        content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        status: post.status,
        platforms: post.platforms,
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
        analytics: post.analytics[0] || null,
      })),
      topPosts: topPosts
        .filter((p) => p.analytics.length > 0)
        .map((post) => ({
          id: post.id,
          content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          engagements: post.analytics[0]?.engagements || 0,
          reach: post.analytics[0]?.reach || 0,
        })),
      subscription: {
        plan: user.subscription?.plan?.name || 'Free',
        status: user.subscription?.status || 'inactive',
        postsUsed: postsThisMonth,
        postsLimit: maxPosts,
        platformsUsed: user.platformIntegrations.length,
        platformsLimit: maxPlatforms,
      },
      period,
    });
  } catch (error: unknown) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get dashboard stats' },
      { status: 500 }
    );
  }
}
