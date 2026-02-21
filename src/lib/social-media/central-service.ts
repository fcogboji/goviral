// ═══════════════════════════════════════════════════════════════════════════
// CentralPostingService — THE single entry point for all social media ops
// ═══════════════════════════════════════════════════════════════════════════
//
// Powered by Ayrshare — ONE API key, ALL platforms.
// No individual Facebook/Twitter/TikTok API keys needed.
//
// Every part of the app (API routes, cron jobs, UI) should ONLY use this
// service. No other file should directly call platform APIs.
//
// Usage:
//   const service = await CentralPostingService.forUser(userId);
//   const results = await service.publishToAll({ content, platforms, ... });
//   const metrics = await service.getPostAnalytics(ayrsharePostId);
//   const linkUrl = await service.getLinkingUrl();

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAyrshareClient, AyrshareClient } from './ayrshare';
import type {
  AyrsharePostResult,
  AyrshareAnalyticsResponse,
  AyrshareUserInfo,
  AyrshareHistoryItem,
} from './ayrshare';

// ─── Legacy types (inlined from deleted platform-adapter.ts) ─────────

export interface PostPayload {
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];
  link?: string;
  options?: Record<string, unknown>;
}

export interface PostResponse {
  platform: string;
  success: boolean;
  externalId?: string;
  error?: string;
  publishedAt?: Date;
  platformUrl?: string;
}

export interface PlatformMetrics {
  platform: string;
  externalId: string;
  impressions: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  reach: number;
  saves: number;
  views?: number;
}

export interface PlatformProfile {
  platformUserId: string;
  displayName: string;
  username?: string;
  profileUrl?: string;
  profileImageUrl?: string;
  followerCount?: number;
  metadata?: Record<string, unknown>;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// ─── Types ──────────────────────────────────────────────────────────────

export interface PublishRequest {
  postId: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  platforms: string[];
  hashtags?: string[];
  link?: string;
  /** Platform-specific overrides keyed by platform name */
  platformOptions?: Record<string, Record<string, unknown>>;
  /** Schedule date (ISO 8601). If set, post is scheduled instead of published immediately */
  scheduleDate?: string;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  externalId?: string;
  error?: string;
  publishedAt?: Date;
  platformUrl?: string;
}

export interface AnalyticsSyncResult {
  synced: number;
  failed: number;
  details: Array<{ platform: string; postId: string; success: boolean; error?: string }>;
}

// ─── Central Service ────────────────────────────────────────────────────

export class CentralPostingService {
  private userId: string;
  private profileKey: string | null;
  private client: AyrshareClient;

  private constructor(userId: string, profileKey: string | null) {
    this.userId = userId;
    this.profileKey = profileKey;
    this.client = getAyrshareClient();
  }

  /**
   * Create a CentralPostingService for a user.
   * Automatically loads the user's Ayrshare profile key from the DB.
   * If the user doesn't have a profile yet, one is created automatically.
   */
  static async forUser(userId: string): Promise<CentralPostingService> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, ayrshareProfileKey: true, name: true, email: true },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    let profileKey = user.ayrshareProfileKey;

    // Auto-create Ayrshare profile if the user doesn't have one yet
    if (!profileKey) {
      const client = getAyrshareClient();
      if (!client.isConfigured()) {
        throw new Error(
          'Social media integration is not configured. Please set AYRSHARE_API_KEY in your environment variables.'
        );
      }

      try {
        const result = await client.createProfile(
          user.name || user.email || `user_${userId}`
        );
        if (result.status === 'success' && result.profileKey) {
          profileKey = result.profileKey;
          await prisma.user.update({
            where: { id: userId },
            data: { ayrshareProfileKey: profileKey },
          });
        } else {
          console.error(
            `Ayrshare createProfile returned unexpected result for user ${userId}:`,
            JSON.stringify(result)
          );
          throw new Error(
            'Failed to create your social media profile. Please ensure your Ayrshare plan supports multiple profiles (Business plan required).'
          );
        }
      } catch (error) {
        // Re-throw our own errors
        if (error instanceof Error && error.message.includes('Failed to create')) {
          throw error;
        }
        console.error(`Failed to auto-create Ayrshare profile for user ${userId}:`, error);
        throw new Error(
          'Could not set up your social media profile. Please check your Ayrshare API key and plan, then try again.'
        );
      }
    }

    return new CentralPostingService(userId, profileKey);
  }

  // ═════════════════════════════════════════════════════════════════════
  // POSTING
  // ═════════════════════════════════════════════════════════════════════

  /**
   * Publish to ALL requested platforms in one call via Ayrshare.
   * One API request → posts to all platforms simultaneously.
   */
  async publishToAll(request: PublishRequest): Promise<PublishResult[]> {
    this.ensureConfigured();

    const content = this.formatContent(request.content, request.hashtags);
    const results: PublishResult[] = [];

    try {
      const ayrshareResult: AyrsharePostResult = await this.client.post(
        {
          post: content,
          platforms: request.platforms,
          mediaUrls: request.mediaUrls,
          scheduleDate: request.scheduleDate,
          shortenLinks: true,
          // Pass platform-specific options
          ...(request.platformOptions?.youtube && {
            title: request.platformOptions.youtube.title as string,
            youTubeVisibility: (request.platformOptions.youtube.visibility as 'public' | 'unlisted' | 'private') || 'public',
            isYouTubeShort: request.platformOptions.youtube.isShort as boolean,
          }),
          ...(request.platformOptions?.tiktok && {
            tikTokOptions: {
              privacy_level: (request.platformOptions.tiktok.privacyLevel as string) || 'PUBLIC_TO_EVERYONE',
              disable_comment: request.platformOptions.tiktok.disableComment as boolean,
              disable_duet: request.platformOptions.tiktok.disableDuet as boolean,
              disable_stitch: request.platformOptions.tiktok.disableStitch as boolean,
            } as Record<string, unknown>,
          }),
          ...(request.platformOptions?.instagram && {
            instagramOptions: {
              mediaType: request.platformOptions.instagram.mediaType as string,
            } as Record<string, unknown>,
          }),
          ...(request.platformOptions?.linkedin && {
            linkedInOptions: {
              visibility: (request.platformOptions.linkedin.visibility as string) || 'PUBLIC',
            } as Record<string, unknown>,
          }),
        },
        this.profileKey || undefined
      );

      // Map Ayrshare response to our PublishResult format
      if (ayrshareResult.status === 'success' && ayrshareResult.postIds) {
        for (const platformResult of ayrshareResult.postIds) {
          const result: PublishResult = {
            platform: platformResult.platform,
            success: platformResult.status === 'success',
            externalId: platformResult.id,
            publishedAt: new Date(),
            platformUrl: platformResult.postUrl,
          };
          results.push(result);
        }

        // Store the Ayrshare post ID in the post metadata for future analytics
        if (ayrshareResult.id) {
          await prisma.post.update({
            where: { id: request.postId },
            data: {
              metadata: {
                ...(await this.getPostMetadata(request.postId)),
                ayrsharePostId: ayrshareResult.id,
              },
            },
          });
        }
      } else if (ayrshareResult.errors) {
        // Handle errors for each platform
        for (const error of ayrshareResult.errors) {
          results.push({
            platform: error.platform || 'unknown',
            success: false,
            error: error.message || error.action || 'Post failed',
          });
        }
      }

      // If we got results from Ayrshare but some platforms weren't included,
      // add failure entries for missing platforms
      const resultPlatforms = new Set(results.map(r => r.platform.toLowerCase()));
      for (const platform of request.platforms) {
        if (!resultPlatforms.has(platform.toLowerCase())) {
          results.push({
            platform: platform.toLowerCase(),
            success: false,
            error: `Platform "${platform}" not included in Ayrshare response. Is it connected?`,
          });
        }
      }

      // Persist results to database
      for (const result of results) {
        try {
          // Find the social account for this platform
          const socialAccount = await prisma.socialAccount.findFirst({
            where: {
              userId: this.userId,
              platform: { equals: result.platform, mode: 'insensitive' },
            },
          });

          if (socialAccount) {
            await prisma.postResult.upsert({
              where: {
                postId_socialAccountId: {
                  postId: request.postId,
                  socialAccountId: socialAccount.id,
                },
              },
              create: {
                postId: request.postId,
                socialAccountId: socialAccount.id,
                status: result.success ? 'PUBLISHED' : 'FAILED',
                externalId: result.externalId || null,
                error: result.error || null,
                publishedAt: result.success ? new Date() : null,
              },
              update: {
                status: result.success ? 'PUBLISHED' : 'FAILED',
                externalId: result.externalId || null,
                error: result.error || null,
                publishedAt: result.success ? new Date() : null,
              },
            });
          }
        } catch (dbError) {
          console.warn(`Failed to persist PostResult for ${result.platform}:`, dbError);
        }
      }

      return results;
    } catch (error: unknown) {
      // Total failure — return error for all platforms
      const msg = error instanceof Error ? error.message : 'Ayrshare API call failed';
      return request.platforms.map(platform => ({
        platform: platform.toLowerCase(),
        success: false,
        error: msg,
      }));
    }
  }

  /**
   * Publish to a SINGLE platform.
   */
  async publishTo(platform: string, request: PublishRequest): Promise<PublishResult> {
    const results = await this.publishToAll({ ...request, platforms: [platform] });
    return results[0];
  }

  // ═════════════════════════════════════════════════════════════════════
  // SCHEDULING
  // ═════════════════════════════════════════════════════════════════════

  /**
   * Schedule a post for future publishing.
   * Ayrshare handles scheduling natively — just pass a scheduleDate.
   */
  async schedulePost(request: PublishRequest, scheduledFor: Date): Promise<void> {
    // Store in our DB for tracking
    await prisma.scheduledTask.create({
      data: {
        type: 'PUBLISH_POST',
        payload: {
          ...request,
          scheduleDate: scheduledFor.toISOString(),
        } as Prisma.InputJsonValue,
        scheduledFor,
        status: 'PENDING',
      },
    });
  }

  /**
   * Process all pending scheduled posts (called by cron).
   */
  static async processScheduledPosts(): Promise<{ processed: number; failed: number }> {
    const now = new Date();

    const tasks = await prisma.scheduledTask.findMany({
      where: {
        type: 'PUBLISH_POST',
        status: 'PENDING',
        scheduledFor: { lte: now },
      },
      take: 10,
    });

    let processed = 0;
    let failed = 0;

    for (const task of tasks) {
      try {
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: { status: 'PROCESSING', attempts: task.attempts + 1, lastAttempt: new Date() },
        });

        const request = task.payload as unknown as PublishRequest;
        const service = await CentralPostingService.forUser(request.userId);
        const results = await service.publishToAll(request);

        const allSucceeded = results.every(r => r.success);

        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            status: allSucceeded ? 'COMPLETED' : 'FAILED',
            error: allSucceeded ? null : JSON.stringify(results.filter(r => !r.success)),
          },
        });

        await prisma.post.update({
          where: { id: request.postId },
          data: {
            status: allSucceeded ? 'PUBLISHED' : 'FAILED',
            publishedAt: allSucceeded ? new Date() : null,
          },
        });

        processed++;
      } catch (error: unknown) {
        failed++;
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            status: task.attempts + 1 >= task.maxAttempts ? 'FAILED' : 'PENDING',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return { processed, failed };
  }

  // ═════════════════════════════════════════════════════════════════════
  // ANALYTICS
  // ═════════════════════════════════════════════════════════════════════

  /**
   * Fetch analytics for a specific post via Ayrshare.
   */
  async getPostAnalytics(
    ayrsharePostId: string,
    platforms?: string[]
  ): Promise<AyrshareAnalyticsResponse> {
    this.ensureConfigured();
    return this.client.getPostAnalytics(
      ayrsharePostId,
      platforms,
      this.profileKey || undefined
    );
  }

  /**
   * Sync analytics for a specific post across all platforms.
   * Fetches from Ayrshare and stores in our PostAnalytics table.
   */
  async syncPostAnalytics(postId: string): Promise<AnalyticsSyncResult> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        metadata: true,
        platforms: true,
        postResults: {
          where: { status: 'PUBLISHED' },
          select: { id: true, externalId: true, socialAccountId: true },
          include: { socialAccount: { select: { platform: true } } },
        },
      },
    });

    if (!post) throw new Error('Post not found');

    const result: AnalyticsSyncResult = { synced: 0, failed: 0, details: [] };
    const metadata = (post.metadata as Record<string, unknown>) || {};
    const ayrsharePostId = metadata.ayrsharePostId as string;

    if (!ayrsharePostId) {
      // No Ayrshare post ID — can't fetch analytics
      result.failed = post.platforms.length;
      result.details = post.platforms.map(p => ({
        platform: p,
        postId,
        success: false,
        error: 'No Ayrshare post ID found',
      }));
      return result;
    }

    try {
      const analyticsResponse = await this.getPostAnalytics(ayrsharePostId);

      if (analyticsResponse.analytics) {
        for (const [platform, analytics] of Object.entries(analyticsResponse.analytics)) {
          try {
            await prisma.postAnalytics.upsert({
              where: {
                postId_platform_recordedAt: {
                  postId: post.id,
                  platform,
                  recordedAt: new Date(),
                },
              },
              update: {
                impressions: Number(analytics.impressions) || 0,
                engagements: Number(analytics.engagements) || Number(analytics.likes || 0) + Number(analytics.comments || 0) + Number(analytics.shares || 0),
                likes: Number(analytics.likes) || Number(analytics.favorites) || 0,
                comments: Number(analytics.comments) || Number(analytics.replies) || 0,
                shares: Number(analytics.shares) || Number(analytics.retweets) || 0,
                clicks: Number(analytics.clicks) || 0,
                reach: Number(analytics.reach) || 0,
                saves: Number(analytics.saves) || 0,
              },
              create: {
                postId: post.id,
                platform,
                impressions: Number(analytics.impressions) || 0,
                engagements: Number(analytics.engagements) || Number(analytics.likes || 0) + Number(analytics.comments || 0) + Number(analytics.shares || 0),
                likes: Number(analytics.likes) || Number(analytics.favorites) || 0,
                comments: Number(analytics.comments) || Number(analytics.replies) || 0,
                shares: Number(analytics.shares) || Number(analytics.retweets) || 0,
                clicks: Number(analytics.clicks) || 0,
                reach: Number(analytics.reach) || 0,
                saves: Number(analytics.saves) || 0,
              },
            });

            result.details.push({ platform, postId, success: true });
            result.synced++;
          } catch (error: unknown) {
            result.details.push({ platform, postId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
            result.failed++;
          }
        }
      }
    } catch (error: unknown) {
      result.failed = post.platforms.length;
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      result.details = post.platforms.map(p => ({
        platform: p,
        postId,
        success: false,
        error: errMsg,
      }));
    }

    return result;
  }

  /**
   * Sync analytics for all published posts of this user.
   */
  async syncAllAnalytics(daysBack: number = 7, limit: number = 50): Promise<AnalyticsSyncResult> {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const posts = await prisma.post.findMany({
      where: {
        userId: this.userId,
        status: 'PUBLISHED',
        publishedAt: { gte: since },
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });

    const totals: AnalyticsSyncResult = { synced: 0, failed: 0, details: [] };

    for (const post of posts) {
      const result = await this.syncPostAnalytics(post.id);
      totals.synced += result.synced;
      totals.failed += result.failed;
      totals.details.push(...result.details);
    }

    return totals;
  }

  // ═════════════════════════════════════════════════════════════════════
  // PLATFORM LINKING (replaces individual OAuth flows!)
  // ═════════════════════════════════════════════════════════════════════

  /**
   * Generate a URL where the user can connect their social accounts.
   * Ayrshare provides a pre-built UI — no individual Facebook/Twitter OAuth needed!
   */
  async getLinkingUrl(): Promise<string> {
    this.ensureConfigured();

    if (!this.profileKey) {
      throw new Error(
        'Your social media profile could not be created. This usually means the Ayrshare API key is invalid or the plan does not support multiple user profiles. Please contact support.'
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const result = await this.client.generateLinkingUrl(this.profileKey, appUrl);

    if (result.status === 'success' && result.url) {
      return result.url;
    }

    throw new Error('Failed to generate Ayrshare linking URL');
  }

  /**
   * Get which social accounts are currently connected for this user.
   */
  async getConnectedAccounts(): Promise<AyrshareUserInfo> {
    this.ensureConfigured();
    return this.client.getUser(this.profileKey || undefined);
  }

  /**
   * Sync connected platforms from Ayrshare to our PlatformIntegration table.
   * Call this after a user connects/disconnects accounts on Ayrshare.
   */
  async syncConnectedPlatforms(): Promise<string[]> {
    this.ensureConfigured();

    const userInfo = await this.client.getUser(this.profileKey || undefined);

    if (!userInfo.activeSocialAccounts) {
      return [];
    }

    const connectedPlatforms = userInfo.activeSocialAccounts;

    // Sync to our PlatformIntegration table
    for (const platform of connectedPlatforms) {
      const displayName = userInfo.displayNames?.[platform] || platform;
      const profileUrl = userInfo.userProfileUrls?.[platform] || '';

      await prisma.platformIntegration.upsert({
        where: {
          userId_platform: {
            userId: this.userId,
            platform: platform.toLowerCase(),
          },
        },
        create: {
          userId: this.userId,
          platform: platform.toLowerCase(),
          platformUserId: this.profileKey || '',
          accountName: displayName,
          accessToken: 'managed-by-ayrshare', // Ayrshare manages tokens
          isConnected: true,
          isActive: true,
          profileUrl,
          connectedAt: new Date(),
          metadata: {
            managedByAyrshare: true,
            ayrshareProfileKey: this.profileKey,
          },
        },
        update: {
          isConnected: true,
          isActive: true,
          accountName: displayName,
          profileUrl,
          connectedAt: new Date(),
          metadata: {
            managedByAyrshare: true,
            ayrshareProfileKey: this.profileKey,
          },
        },
      });
    }

    // Mark platforms that are no longer connected
    const existingIntegrations = await prisma.platformIntegration.findMany({
      where: { userId: this.userId },
      select: { platform: true },
    });

    for (const integration of existingIntegrations) {
      if (!connectedPlatforms.includes(integration.platform)) {
        await prisma.platformIntegration.update({
          where: {
            userId_platform: {
              userId: this.userId,
              platform: integration.platform,
            },
          },
          data: { isConnected: false },
        });
      }
    }

    // Also sync to SocialAccount table for PostResult compatibility
    for (const platform of connectedPlatforms) {
      const displayName = userInfo.displayNames?.[platform] || platform;
      await prisma.socialAccount.upsert({
        where: {
          userId_platform: {
            userId: this.userId,
            platform: platform.toLowerCase(),
          },
        },
        create: {
          userId: this.userId,
          platform: platform.toLowerCase(),
          username: displayName,
          displayName,
          accessToken: 'managed-by-ayrshare',
          isActive: true,
        },
        update: {
          username: displayName,
          displayName,
          isActive: true,
        },
      });
    }

    return connectedPlatforms;
  }

  /**
   * Disconnect a platform from this user's Ayrshare profile.
   */
  async disconnectPlatform(platform: string): Promise<void> {
    this.ensureConfigured();

    if (!this.profileKey) {
      throw new Error('User does not have an Ayrshare profile');
    }

    await this.client.unlinkSocialAccount(platform, this.profileKey);

    // Update our database
    await prisma.platformIntegration.updateMany({
      where: {
        userId: this.userId,
        platform: { equals: platform, mode: 'insensitive' },
      },
      data: { isConnected: false },
    });
  }

  // ═════════════════════════════════════════════════════════════════════
  // POST MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════

  /**
   * Delete a post from all platforms via Ayrshare.
   */
  async deletePost(postId: string): Promise<void> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { metadata: true },
    });

    if (!post) throw new Error('Post not found');

    const metadata = (post.metadata as Record<string, unknown>) || {};
    const ayrsharePostId = metadata.ayrsharePostId as string;

    if (ayrsharePostId) {
      await this.client.deletePost(ayrsharePostId, this.profileKey || undefined);
    }
  }

  /**
   * Get post history from Ayrshare.
   */
  async getHistory(lastDays?: number): Promise<AyrshareHistoryItem[]> {
    this.ensureConfigured();
    return this.client.getHistory(
      { lastDays: lastDays || 30 },
      this.profileKey || undefined
    );
  }

  // ═════════════════════════════════════════════════════════════════════
  // PLATFORM INFO (backward compatible)
  // ═════════════════════════════════════════════════════════════════════

  /**
   * Get list of all connected platforms for this user.
   */
  getConnectedPlatforms(): string[] {
    // This is now a sync operation using cached DB data
    // For live data, use getConnectedAccounts() or syncConnectedPlatforms()
    return [];
  }

  /**
   * Check if a specific platform is connected.
   */
  isPlatformConnected(_platform: string): boolean {
    // For live check, use getConnectedAccounts()
    return true; // Optimistic — Ayrshare will return errors for unconnected platforms
  }

  /**
   * Get profile info for a connected platform (backward compatible).
   */
  async getProfile(platform: string): Promise<{
    platformUserId: string;
    displayName: string;
    username?: string;
    profileUrl?: string;
    profileImageUrl?: string;
    followerCount?: number;
    metadata?: Record<string, unknown>;
  }> {
    const userInfo = await this.client.getUser(this.profileKey || undefined);

    return {
      platformUserId: this.profileKey || '',
      displayName: userInfo.displayNames?.[platform] || platform,
      profileUrl: userInfo.userProfileUrls?.[platform],
      metadata: {
        activeSocialAccounts: userInfo.activeSocialAccounts,
      },
    };
  }

  /**
   * Check if a platform supports a given content type.
   */
  supportsContentType(platform: string, type: 'text' | 'image' | 'video' | 'link'): boolean {
    // Ayrshare handles format conversion, but some platforms have limitations
    const restrictions: Record<string, string[]> = {
      instagram: ['image', 'video'],
      tiktok: ['video'],
      youtube: ['video'],
      pinterest: ['image', 'video'],
    };

    const allowed = restrictions[platform.toLowerCase()];
    if (!allowed) return true; // No restrictions (facebook, twitter, linkedin)
    return allowed.includes(type);
  }

  // ═════════════════════════════════════════════════════════════════════
  // STATIC HELPERS
  // ═════════════════════════════════════════════════════════════════════

  /**
   * Get the list of all supported platforms.
   */
  static getSupportedPlatforms(): string[] {
    return [
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'tiktok',
      'youtube',
      'pinterest',
      'reddit',
      'threads',
      'telegram',
      'gmb',
    ];
  }

  /**
   * Check if Ayrshare is configured (API key is present).
   */
  static isAyrshareConfigured(): boolean {
    return getAyrshareClient().isConfigured();
  }

  // ═════════════════════════════════════════════════════════════════════
  // INTERNAL
  // ═════════════════════════════════════════════════════════════════════

  private ensureConfigured(): void {
    if (!this.client.isConfigured()) {
      throw new Error(
        'Ayrshare is not configured. Set AYRSHARE_API_KEY in your environment variables. ' +
        'Get your API key at https://app.ayrshare.com'
      );
    }
  }

  private formatContent(content: string, hashtags?: string[]): string {
    if (!hashtags || hashtags.length === 0) return content;
    const hashtagStr = hashtags
      .map(t => (t.startsWith('#') ? t : `#${t}`))
      .join(' ');
    return `${content}\n\n${hashtagStr}`;
  }

  private async getPostMetadata(postId: string): Promise<Record<string, unknown>> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { metadata: true },
    });
    return (post?.metadata as Record<string, unknown>) || {};
  }
}

