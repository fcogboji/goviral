// Cron job for processing scheduled posts
// This file should be called by Vercel Cron or similar

import { CentralPostingService } from '../social-media';

/**
 * Main cron handler - processes scheduled posts
 * This should run every 5-10 minutes
 */
export async function handler() {
  try {
    console.log('[CRON] Starting scheduled post processor...');

    const result = await CentralPostingService.processScheduledPosts();

    console.log(`[CRON] Scheduled post processor completed. Processed: ${result.processed}, Failed: ${result.failed}`);

    return {
      status: 'success',
      message: 'Scheduled posts processed',
      processed: result.processed,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error('[CRON] Error processing scheduled posts:', error);

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * For local testing
 */
if (require.main === module) {
  handler()
    .then(result => {
      console.log('Result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
