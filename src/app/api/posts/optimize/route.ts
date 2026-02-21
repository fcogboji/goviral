/**
 * API Route: Optimize posts for viral potential
 *
 * POST — Analyze content and return viral score + suggestions
 *        Uses OpenAI when available, falls back to regex-based analysis
 *
 * GET  — Get trending hashtags and best posting times
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  analyzeViralPotential,
  getBestPostingTime,
  getTrendingHashtags,
} from '@/lib/viral-optimizer';
import { scoreContent, isAIAvailable } from '@/lib/viral-optimization';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        subscription: { include: { plan: true } },
        platformIntegrations: { where: { isConnected: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { content, platforms, hasMedia, mediaType, category } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get user metrics for better predictions
    let totalFollowers = 0;
    let avgEngagementRate = 3;

    const recentAnalytics = await prisma.postAnalytics.aggregate({
      where: { post: { userId: user.id } },
      _avg: { engagements: true, impressions: true },
    });

    if (recentAnalytics._avg.impressions && recentAnalytics._avg.engagements) {
      avgEngagementRate = (recentAnalytics._avg.engagements / recentAnalytics._avg.impressions) * 100;
    }

    for (const integration of user.platformIntegrations) {
      const metadata = integration.metadata as { followerCount?: number } | null;
      if (metadata?.followerCount) totalFollowers += metadata.followerCount;
    }
    if (totalFollowers === 0) totalFollowers = 1000;

    // Try AI-powered scoring first, fall back to regex
    if (isAIAvailable()) {
      try {
        const aiScore = await scoreContent(content, platforms || ['instagram']);

        // Map AI score to ViralAnalysis-compatible format for the frontend
        return NextResponse.json({
          success: true,
          analysis: {
            score: aiScore.score,
            suggestions: [...aiScore.suggestions, ...aiScore.quickFixes],
            optimizedContent: content, // AI scoring doesn't rewrite — use /ai-optimize for that
            bestPostingTime: getBestPostingTime(platforms?.[0] || 'instagram'),
            recommendedHashtags: getTrendingHashtags(category),
            platformSpecificTips: {},
            engagementPrediction: {
              likes: {
                min: Math.round((totalFollowers * avgEngagementRate) / 100 * 0.7 * (1 + aiScore.score / 100) * 0.7),
                max: Math.round((totalFollowers * avgEngagementRate) / 100 * 0.7 * (1 + aiScore.score / 100) * 1.5),
              },
              shares: {
                min: Math.round((totalFollowers * avgEngagementRate) / 100 * 0.1 * (1 + aiScore.score / 100) * 0.5),
                max: Math.round((totalFollowers * avgEngagementRate) / 100 * 0.1 * (1 + aiScore.score / 100) * 2),
              },
              comments: {
                min: Math.round((totalFollowers * avgEngagementRate) / 100 * 0.2 * (1 + aiScore.score / 100) * 0.6),
                max: Math.round((totalFollowers * avgEngagementRate) / 100 * 0.2 * (1 + aiScore.score / 100) * 1.8),
              },
              reach: {
                min: Math.round(totalFollowers * (1 + aiScore.score / 50) * 0.8),
                max: Math.round(totalFollowers * (1 + aiScore.score / 50) * 3),
              },
            },
            scoreBreakdown: aiScore.breakdown,
          },
          metrics: { followerCount: totalFollowers, avgEngagementRate },
          scoredBy: 'ai',
        });
      } catch (error) {
        logger.warn('AI scoring failed, falling back to regex analysis', error as Record<string, unknown>);
      }
    }

    // Fallback: regex-based analysis
    const viralAnalysis = analyzeViralPotential(content, platforms || ['instagram'], {
      hasMedia: hasMedia || false,
      mediaType: mediaType || 'text',
      category,
      followerCount: totalFollowers,
      avgEngagementRate,
    });

    return NextResponse.json({
      success: true,
      analysis: viralAnalysis,
      metrics: { followerCount: totalFollowers, avgEngagementRate },
      scoredBy: 'regex',
    });
  } catch (error: unknown) {
    logger.error('Post optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to optimize post' },
      { status: 500 }
    );
  }
}

// GET — trending hashtags and best posting times
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const platform = searchParams.get('platform') || 'instagram';

    const trendingHashtags = getTrendingHashtags(category || undefined);
    const bestPostingTime = getBestPostingTime(platform);

    return NextResponse.json({
      success: true,
      trendingHashtags,
      bestPostingTime,
      platform,
      category,
    });
  } catch (error: unknown) {
    logger.error('Get optimization data error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get optimization data' },
      { status: 500 }
    );
  }
}
