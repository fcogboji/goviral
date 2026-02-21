// API Route: Cron job for syncing analytics from social platforms
// Uses CentralPostingService as the single entry point
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CentralPostingService } from '@/lib/social-media';

export const maxDuration = 300; // 5 minutes max execution
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CRON] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting analytics sync...');

    // Get posts published in the last 7 days that need analytics update
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const postsToSync = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: sevenDaysAgo,
        },
        postResults: {
          some: {
            status: 'PUBLISHED',
            externalId: { not: null },
          },
        },
      },
      select: {
        id: true,
        userId: true,
      },
      take: 50,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    console.log(`[CRON] Found ${postsToSync.length} posts to sync`);

    let synced = 0;
    let failed = 0;

    // Group posts by user to avoid creating multiple service instances per user
    const postsByUser = new Map<string, string[]>();
    for (const post of postsToSync) {
      const existing = postsByUser.get(post.userId) || [];
      existing.push(post.id);
      postsByUser.set(post.userId, existing);
    }

    for (const [userId, postIds] of postsByUser) {
      try {
        const service = await CentralPostingService.forUser(userId);
        for (const postId of postIds) {
          try {
            await service.syncPostAnalytics(postId);
            synced++;
          } catch (error) {
            console.error(`[CRON] Failed to sync post ${postId}:`, error);
            failed++;
          }
        }
      } catch (error) {
        console.error(`[CRON] Failed to create service for user ${userId}:`, error);
        failed += postIds.length;
      }
    }

    console.log(`[CRON] Analytics sync completed. Synced: ${synced}, Failed: ${failed}`);

    return NextResponse.json({
      success: true,
      message: 'Analytics sync completed',
      synced,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('[CRON] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
