// API Route: Cron job endpoint for processing scheduled posts
import { NextRequest, NextResponse } from 'next/server';
import { CentralPostingService } from '@/lib/social-media';

export const maxDuration = 300; // 5 minutes max execution
export const dynamic = 'force-dynamic'; // Prevent static generation

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (security measure)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET environment variable is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CRON] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting scheduled post processor...');

    // Process scheduled posts via central service
    const result = await CentralPostingService.processScheduledPosts();

    console.log(`[CRON] Scheduled post processor completed. Processed: ${result.processed}, Failed: ${result.failed}`);

    return NextResponse.json({
      success: true,
      message: 'Scheduled posts processed successfully',
      processed: result.processed,
      failed: result.failed,
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
