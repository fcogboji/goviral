// ═══════════════════════════════════════════════════════════════════════════
// Analytics Fetcher — Thin facade over CentralPostingService
// ═══════════════════════════════════════════════════════════════════════════
// This file is kept for backward compatibility.
// All analytics logic now goes through Ayrshare via CentralPostingService.

import { CentralPostingService } from './central-service';

/**
 * Sync analytics for a specific post.
 * @deprecated Use CentralPostingService.syncPostAnalytics() instead.
 */
export async function syncPostAnalytics(postId: string): Promise<void> {
  const { prisma } = await import('@/lib/prisma');
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post) throw new Error('Post not found');

  const service = await CentralPostingService.forUser(post.userId);
  await service.syncPostAnalytics(postId);
}

/**
 * Sync analytics for all published posts of a user.
 * @deprecated Use CentralPostingService.syncAllAnalytics() instead.
 */
export async function syncUserAnalytics(userId: string): Promise<{
  synced: number;
  failed: number;
}> {
  const service = await CentralPostingService.forUser(userId);
  const result = await service.syncAllAnalytics();
  return { synced: result.synced, failed: result.failed };
}

/**
 * Get aggregated analytics summary for a user.
 * This function stays here as it's a pure DB query, not a platform API call.
 */
export async function getUserAnalyticsSummary(
  userId: string,
  period: '7d' | '30d' | '90d' = '30d'
): Promise<{
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReach: number;
  avgEngagementRate: number;
  topPost: { id: string; content: string; engagements: number } | null;
  platformBreakdown: Record<string, { posts: number; engagements: number }>;
}> {
  const { prisma } = await import('@/lib/prisma');

  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  const analytics = await prisma.postAnalytics.findMany({
    where: {
      post: { userId },
      recordedAt: { gte: startDate },
    },
    include: { post: true },
  });

  const totals = {
    totalPosts: new Set(analytics.map(a => a.postId)).size,
    totalImpressions: 0,
    totalEngagements: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalReach: 0,
  };

  const platformBreakdown: Record<string, { posts: number; engagements: number }> = {};
  let topPost: { id: string; content: string; engagements: number } | null = null;
  let maxEngagements = 0;

  for (const record of analytics) {
    totals.totalImpressions += record.impressions;
    totals.totalEngagements += record.engagements;
    totals.totalLikes += record.likes;
    totals.totalComments += record.comments;
    totals.totalShares += record.shares;
    totals.totalReach += record.reach;

    if (!platformBreakdown[record.platform]) {
      platformBreakdown[record.platform] = { posts: 0, engagements: 0 };
    }
    platformBreakdown[record.platform].posts++;
    platformBreakdown[record.platform].engagements += record.engagements;

    if (record.engagements > maxEngagements) {
      maxEngagements = record.engagements;
      topPost = {
        id: record.post.id,
        content: record.post.content.substring(0, 100) + (record.post.content.length > 100 ? '...' : ''),
        engagements: record.engagements,
      };
    }
  }

  const avgEngagementRate =
    totals.totalImpressions > 0
      ? (totals.totalEngagements / totals.totalImpressions) * 100
      : 0;

  return {
    ...totals,
    avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
    topPost,
    platformBreakdown,
  };
}
