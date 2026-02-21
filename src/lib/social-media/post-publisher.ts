// ═══════════════════════════════════════════════════════════════════════════
// Post Publisher — Thin facade over CentralPostingService
// ═══════════════════════════════════════════════════════════════════════════
// This file is kept for backward compatibility.
// All logic now lives in central-service.ts.

import { CentralPostingService } from './central-service';
import type { PublishRequest, PublishResult } from './central-service';

export type { PublishResult };

export interface PostPublishPayload {
  postId: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  platforms: string[];
  hashtags?: string[];
}

/**
 * PostPublisher — backward-compatible wrapper.
 * New code should use CentralPostingService directly.
 */
export class PostPublisher {
  /**
   * Publish post to all selected platforms
   */
  static async publishToAll(payload: PostPublishPayload): Promise<PublishResult[]> {
    const service = await CentralPostingService.forUser(payload.userId);

    const request: PublishRequest = {
      postId: payload.postId,
      userId: payload.userId,
      content: payload.content,
      mediaUrls: payload.mediaUrls,
      platforms: payload.platforms,
      hashtags: payload.hashtags,
    };

    return service.publishToAll(request);
  }

  /**
   * Schedule post for later publishing
   */
  static async schedulePost(payload: PostPublishPayload, scheduledFor: Date): Promise<void> {
    const service = await CentralPostingService.forUser(payload.userId);

    const request: PublishRequest = {
      postId: payload.postId,
      userId: payload.userId,
      content: payload.content,
      mediaUrls: payload.mediaUrls,
      platforms: payload.platforms,
      hashtags: payload.hashtags,
    };

    await service.schedulePost(request, scheduledFor);
  }
}

/**
 * Process scheduled posts (called by cron jobs).
 * Delegates to CentralPostingService.processScheduledPosts().
 */
export async function processScheduledPosts(): Promise<void> {
  await CentralPostingService.processScheduledPosts();
}
