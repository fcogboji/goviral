/**
 * Ayrshare API Integration
 *
 * Primary social media posting service
 * Supports 15+ platforms including YouTube, TikTok, Instagram, Facebook, Twitter/X, LinkedIn
 * Documentation: https://docs.ayrshare.com/
 *
 * ONE API key → post to ALL platforms. No individual platform APIs needed.
 * Each GoViral user gets an Ayrshare "Profile" with a profileKey.
 * Users link their social accounts via Ayrshare's pre-built linking page.
 */

import { logger } from '@/lib/logger';

// ─── Types ──────────────────────────────────────────────────────────────

export interface AyrsharePostRequest {
  /** The text content of the post */
  post: string;
  /** Platforms to post to: 'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'youtube', 'reddit', 'pinterest', 'threads', etc. */
  platforms: string[];
  /** Array of media URLs (images or videos) */
  mediaUrls?: string[];
  /** ISO 8601 date string for scheduling (e.g. '2025-07-15T10:30:00Z') */
  scheduleDate?: string;
  /** Shorten links in the post */
  shortenLinks?: boolean;
  /** Title (used for YouTube, LinkedIn articles) */
  title?: string;
  /** YouTube-specific: privacy status */
  youTubeVisibility?: 'public' | 'unlisted' | 'private';
  /** YouTube-specific: is this a YouTube Short? */
  isYouTubeShort?: boolean;
  /** TikTok-specific: privacy level */
  tikTokOptions?: {
    privacy_level?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
    disable_comment?: boolean;
    disable_duet?: boolean;
    disable_stitch?: boolean;
  };
  /** Instagram-specific: post type */
  instagramOptions?: {
    mediaType?: 'FEED' | 'REELS' | 'STORIES';
  };
  /** Facebook-specific options */
  faceBookOptions?: {
    pageId?: string;
  };
  /** LinkedIn-specific options */
  linkedInOptions?: {
    visibility?: 'PUBLIC' | 'CONNECTIONS';
    isArticle?: boolean;
  };
  /** Hashtags to auto-append */
  hashtags?: string[];
}

export interface AyrsharePostResult {
  status: 'success' | 'error';
  errors?: Array<{ action: string; status: string; code?: number; platform?: string; message?: string }>;
  id?: string; // Ayrshare post ID (use this for analytics/delete)
  postIds?: Array<{
    status: string;
    id: string;
    platform: string;
    postUrl?: string;
  }>;
  post?: string;
  refId?: string;
}

export interface AyrshareDeleteResult {
  status: 'success' | 'error';
  message?: string;
}

export interface AyrshareHistoryItem {
  id: string;
  post: string;
  platforms: string[];
  mediaUrls?: string[];
  status: string;
  created: string;
  scheduledDate?: string;
  postIds?: Array<{
    status: string;
    id: string;
    platform: string;
    postUrl?: string;
  }>;
  analytics?: Record<string, AyrshareAnalytics>;
}

export interface AyrshareAnalytics {
  platform: string;
  impressions?: number;
  engagements?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  reach?: number;
  saves?: number;
  views?: number;
  retweets?: number;
  replies?: number;
  favorites?: number;
  // Platform-specific fields vary — we normalize them in our adapter
  [key: string]: unknown;
}

export interface AyrshareAnalyticsResponse {
  status: 'success' | 'error';
  analytics?: Record<string, AyrshareAnalytics>;
  id?: string;
}

export interface AyrshareUserInfo {
  status: 'success' | 'error';
  activeSocialAccounts?: string[];
  displayNames?: Record<string, string>;
  userProfileUrls?: Record<string, string>;
  created?: string;
  refId?: string;
}

export interface AyrshareProfile {
  profileKey: string;
  title: string;
  created?: string;
  activeSocialAccounts?: string[];
}

export interface AyrshareProfileCreateResult {
  status: 'success' | 'error';
  profileKey?: string;
  title?: string;
  refId?: string;
}

export interface AyrshareGenerateLinkResult {
  status: 'success' | 'error';
  url?: string;
  token?: string;
}

export interface AyrshareCommentRequest {
  id: string;
  platforms: string[];
  comment: string;
}

// ─── Client ─────────────────────────────────────────────────────────────

export class AyrshareClient {
  private apiKey: string;
  private baseUrl = 'https://app.ayrshare.com/api';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.AYRSHARE_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Ayrshare API key not configured');
    }
  }

  /**
   * Check if the Ayrshare API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // POSTING
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Publish a post to one or more platforms.
   * This is the core method — one API call posts to all selected platforms.
   */
  async post(
    request: AyrsharePostRequest,
    profileKey?: string
  ): Promise<AyrsharePostResult> {
    const body: Record<string, unknown> = {
      post: request.post,
      platforms: this.normalizePlatforms(request.platforms),
    };

    if (request.mediaUrls && request.mediaUrls.length > 0) {
      body.mediaUrls = request.mediaUrls;
    }

    if (request.scheduleDate) {
      body.scheduleDate = request.scheduleDate;
    }

    if (request.shortenLinks !== undefined) {
      body.shortenLinks = request.shortenLinks;
    }

    if (request.title) {
      body.title = request.title;
    }

    if (request.youTubeVisibility) {
      body.youTubeVisibility = request.youTubeVisibility;
    }

    if (request.isYouTubeShort) {
      body.isYouTubeShort = request.isYouTubeShort;
    }

    if (request.tikTokOptions) {
      body.tikTokOptions = request.tikTokOptions;
    }

    if (request.instagramOptions) {
      body.instagramOptions = request.instagramOptions;
    }

    if (request.faceBookOptions) {
      body.faceBookOptions = request.faceBookOptions;
    }

    if (request.linkedInOptions) {
      body.linkedInOptions = request.linkedInOptions;
    }

    return this.request<AyrsharePostResult>('POST', '/post', body, profileKey);
  }

  /**
   * Delete a post from all platforms it was published to.
   */
  async deletePost(
    ayrsharePostId: string,
    profileKey?: string,
    bulk = false
  ): Promise<AyrshareDeleteResult> {
    return this.request<AyrshareDeleteResult>(
      'DELETE',
      '/post',
      { id: ayrsharePostId, bulk },
      profileKey
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HISTORY
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get post history for the account/profile.
   */
  async getHistory(
    options?: { lastDays?: number; lastRecords?: number; platform?: string },
    profileKey?: string
  ): Promise<AyrshareHistoryItem[]> {
    const params = new URLSearchParams();
    if (options?.lastDays) params.set('lastDays', options.lastDays.toString());
    if (options?.lastRecords) params.set('lastRecords', options.lastRecords.toString());
    if (options?.platform) params.set('platform', options.platform);

    const query = params.toString();
    const url = query ? `/history?${query}` : '/history';

    return this.request<AyrshareHistoryItem[]>('GET', url, undefined, profileKey);
  }

  /**
   * Get a single post by Ayrshare post ID.
   */
  async getPost(
    ayrsharePostId: string,
    profileKey?: string
  ): Promise<AyrshareHistoryItem> {
    return this.request<AyrshareHistoryItem>(
      'GET',
      `/post/${ayrsharePostId}`,
      undefined,
      profileKey
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get analytics for a specific post.
   */
  async getPostAnalytics(
    ayrsharePostId: string,
    platforms?: string[],
    profileKey?: string
  ): Promise<AyrshareAnalyticsResponse> {
    const body: Record<string, unknown> = { id: ayrsharePostId };
    if (platforms) {
      body.platforms = this.normalizePlatforms(platforms);
    }

    return this.request<AyrshareAnalyticsResponse>(
      'POST',
      '/analytics/post',
      body,
      profileKey
    );
  }

  /**
   * Get analytics for a specific platform (account-level).
   */
  async getPlatformAnalytics(
    platform: string,
    profileKey?: string
  ): Promise<AyrshareAnalyticsResponse> {
    const normalizedPlatform = this.normalizePlatform(platform);
    return this.request<AyrshareAnalyticsResponse>(
      'GET',
      `/analytics/${normalizedPlatform}`,
      undefined,
      profileKey
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // USER / PROFILE INFO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get the connected social accounts for the current API key / profile.
   */
  async getUser(profileKey?: string): Promise<AyrshareUserInfo> {
    return this.request<AyrshareUserInfo>('GET', '/user', undefined, profileKey);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MULTI-USER PROFILE MANAGEMENT (Business Plan)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Create a new user profile.
   * Each GoViral user gets their own Ayrshare profile so they can link their own accounts.
   */
  async createProfile(title: string): Promise<AyrshareProfileCreateResult> {
    return this.request<AyrshareProfileCreateResult>('POST', '/profiles/profile', {
      title,
    });
  }

  /**
   * Delete a user profile.
   */
  async deleteProfile(profileKey: string): Promise<AyrshareDeleteResult> {
    return this.request<AyrshareDeleteResult>('DELETE', '/profiles/profile', {
      profileKey,
    });
  }

  /**
   * Get all profiles.
   */
  async getProfiles(): Promise<AyrshareProfile[]> {
    return this.request<AyrshareProfile[]>('GET', '/profiles');
  }

  /**
   * Generate a social account linking URL for a user.
   * Users visit this URL to connect their social media accounts via Ayrshare's UI.
   * This replaces individual OAuth flows — no Facebook App, Twitter Dev, etc. needed!
   */
  async generateLinkingUrl(
    profileKey: string,
    domain?: string
  ): Promise<AyrshareGenerateLinkResult> {
    const body: Record<string, unknown> = { profileKey };
    if (domain) {
      body.domain = domain;
    }
    return this.request<AyrshareGenerateLinkResult>(
      'POST',
      '/profiles/generateJWT',
      body
    );
  }

  /**
   * Unlink a social account from a profile.
   */
  async unlinkSocialAccount(
    platform: string,
    profileKey: string
  ): Promise<AyrshareDeleteResult> {
    return this.request<AyrshareDeleteResult>(
      'DELETE',
      '/profiles/social',
      { platform: this.normalizePlatform(platform), profileKey }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COMMENTS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Post a comment on a published post.
   */
  async postComment(
    request: AyrshareCommentRequest,
    profileKey?: string
  ): Promise<AyrsharePostResult> {
    return this.request<AyrsharePostResult>(
      'POST',
      '/comments',
      {
        id: request.id,
        platforms: this.normalizePlatforms(request.platforms),
        comment: request.comment,
      },
      profileKey
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INTERNAL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Make an authenticated request to the Ayrshare API.
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
    profileKey?: string
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Ayrshare API key is not configured. Set AYRSHARE_API_KEY in your environment.');
    }

    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    // For multi-user: pass the user's profile key
    if (profileKey) {
      headers['Profile-Key'] = profileKey;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.errors?.[0]?.message ||
          `Ayrshare API error: ${res.status} ${res.statusText}`;
        logger.error(`Ayrshare API error [${method} ${path}]:`, errorMessage);
        throw new Error(errorMessage);
      }

      return (await res.json()) as T;
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('Ayrshare API')) {
        throw error; // Already formatted
      }
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Ayrshare API request failed [${method} ${path}]:`, msg);
      throw new Error(`Ayrshare API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Normalize platform name to Ayrshare's expected format.
   */
  private normalizePlatform(platform: string): string {
    const map: Record<string, string> = {
      facebook: 'facebook',
      twitter: 'twitter',
      x: 'twitter',
      instagram: 'instagram',
      linkedin: 'linkedin',
      tiktok: 'tiktok',
      youtube: 'youtube',
      pinterest: 'pinterest',
      reddit: 'reddit',
      threads: 'threads',
      telegram: 'telegram',
      gmb: 'gmb', // Google My Business
    };
    return map[platform.toLowerCase()] || platform.toLowerCase();
  }

  /**
   * Normalize an array of platform names.
   */
  private normalizePlatforms(platforms: string[]): string[] {
    return platforms.map(p => this.normalizePlatform(p));
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────

let _client: AyrshareClient | null = null;

/**
 * Get the shared Ayrshare client instance.
 * Uses the AYRSHARE_API_KEY env var.
 */
export function getAyrshareClient(): AyrshareClient {
  if (!_client) {
    _client = new AyrshareClient();
  }
  return _client;
}

