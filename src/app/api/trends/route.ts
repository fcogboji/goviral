/**
 * API Route: Trending Topics & Hashtags
 *
 * GET /api/trends?topic=marketing&platform=instagram&timeframe=7d&category=tech
 *   Returns trending topics, hashtags, and best posting times
 *
 * POST /api/trends/discover
 *   Body: { platform?, category? }
 *   Discovers what's trending right now (no specific topic needed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fetchTrends, discoverTrends } from '@/lib/viral-optimization';
import { logger } from '@/lib/logger';

// GET — Fetch trends for a specific topic
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic') || 'social media trends';
    const platform = searchParams.get('platform') || undefined;
    const timeframe = (searchParams.get('timeframe') as '24h' | '7d' | '30d') || '7d';
    const category = searchParams.get('category') || undefined;

    const trends = await fetchTrends({
      topic,
      platform: platform as 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'all' | undefined,
      timeframe,
      category,
    });

    return NextResponse.json({
      success: true,
      ...trends,
    });
  } catch (error: unknown) {
    logger.error('Trends API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

// POST — Discover what's trending (no specific topic)
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { platform, category } = body;

    const trends = await discoverTrends(platform, category);

    return NextResponse.json({
      success: true,
      ...trends,
    });
  } catch (error: unknown) {
    logger.error('Trends discover error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to discover trends' },
      { status: 500 }
    );
  }
}

