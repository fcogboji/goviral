// ═══════════════════════════════════════════════════════════════════════════
// GoViral AI Engine — barrel exports
// ═══════════════════════════════════════════════════════════════════════════
//
// OpenAI  → rewrites content for viral potential, scores posts, generates captions
// Brandwatch → discovers trending topics and hashtags in real time
//
// Usage:
//   import { rewriteForViral, fetchTrends } from '@/lib/viral-optimization';
// ═══════════════════════════════════════════════════════════════════════════

// AI Content Rewriter (OpenAI GPT)
export {
  rewriteForViral,
  scoreContent,
  generateCaption,
  generateHashtags,
  isAIAvailable,
} from './ai-rewriter';

export type {
  AIRewriteRequest,
  AIRewriteResult,
  AIScoreResult,
  AICaptionRequest,
  PlatformVersion,
} from './ai-rewriter';

// Trend Tracking (Brandwatch → OpenAI fallback → static)
export {
  fetchTrends,
  getTrendingHashtags,
  discoverTrends,
  isBrandwatchConfigured,
} from './brandwatch';

export type {
  TrendRequest,
  Trend,
  TrendResponse,
} from './brandwatch';

