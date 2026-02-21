// ═══════════════════════════════════════════════════════════════════════════
// Social Media — Centralized Public API (Powered by Ayrshare)
// ═══════════════════════════════════════════════════════════════════════════
//
// ONE import for everything:
//   import { CentralPostingService } from '@/lib/social-media';

// The centralized service — use this for everything
export { CentralPostingService } from './central-service';
export type {
  PublishRequest,
  PublishResult,
  AnalyticsSyncResult,
  PostPayload,
  PostResponse,
  PlatformMetrics,
  PlatformProfile,
  TokenData,
} from './central-service';

// Ayrshare client (for advanced/direct use)
export { AyrshareClient, getAyrshareClient } from './ayrshare';
export type {
  AyrsharePostRequest,
  AyrsharePostResult,
  AyrshareAnalyticsResponse,
  AyrshareUserInfo,
  AyrshareHistoryItem,
  AyrshareProfile,
} from './ayrshare';

// Backward-compatible re-exports
export { PostPublisher, processScheduledPosts } from './post-publisher';
export { syncPostAnalytics, syncUserAnalytics, getUserAnalyticsSummary } from './analytics-fetcher';
