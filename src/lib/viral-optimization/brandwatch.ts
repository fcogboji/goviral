/**
 * Brandwatch API Integration
 *
 * Trend tracking and analysis — scans millions of social conversations
 * to find "nascent" trends before they blow up.
 *
 * Documentation: https://developers.brandwatch.com/
 *
 * When BRANDWATCH_API_KEY is not set, falls back to OpenAI-powered
 * trend estimation so the feature still works.
 */

import { logger } from '@/lib/logger';

// ── Types ────────────────────────────────────────────────────────────────

export interface TrendRequest {
  topic: string;
  platform?: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'all';
  timeframe?: '24h' | '7d' | '30d';
  minMentions?: number;
  category?: string;
}

export interface Trend {
  keyword: string;
  hashtag: string;
  mentionCount: number;
  growthRate: number; // Percentage growth
  sentiment: 'positive' | 'neutral' | 'negative';
  relatedTopics: string[];
  peakTime?: string;
  estimatedReach?: number;
  platform?: string;
}

export interface TrendResponse {
  trends: Trend[];
  topTrending: Trend[];
  emergingTrends: Trend[]; // New trends with high growth
  recommendedHashtags: string[];
  bestPostingTimes: string[];
  lastUpdated: string;
}

// ── Brandwatch Client ────────────────────────────────────────────────────

class BrandwatchClient {
  private apiKey: string;
  private projectId: string;
  private baseUrl = 'https://api.brandwatch.com/projects';

  constructor() {
    this.apiKey = process.env.BRANDWATCH_API_KEY || '';
    this.projectId = process.env.BRANDWATCH_PROJECT_ID || '';
  }

  get isConfigured(): boolean {
    return !!(this.apiKey && this.projectId);
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}/${this.projectId}${endpoint}`);
    url.searchParams.set('access_token', this.apiKey);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    logger.debug(`Brandwatch API Request: GET ${endpoint}`, { params });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      logger.error('Brandwatch API error', err, { status: response.status });
      throw new Error(err?.message || `Brandwatch API error: ${response.status}`);
    }

    const data = await response.json();
    logger.debug(`Brandwatch API Response: ${endpoint}`, { resultCount: data?.results?.length });
    return data as T;
  }

  /**
   * Fetch trending topics from Brandwatch.
   */
  async fetchTrends(request: TrendRequest): Promise<TrendResponse> {
    const timeframeMap: Record<string, string> = {
      '24h': '1',
      '7d': '7',
      '30d': '30',
    };

    const days = timeframeMap[request.timeframe || '7d'] || '7';
    const now = new Date();
    const startDate = new Date(now.getTime() - parseInt(days) * 24 * 60 * 60 * 1000);

    try {
      // Fetch mentions data
      const mentionsData = await this.request<{
        results: Array<{
          topic: string;
          volume: number;
          sentiment: number;
          reach: number;
          trendScore: number;
        }>;
      }>('/data/mentions/topics', {
        queryName: request.topic,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        ...(request.platform && request.platform !== 'all'
          ? { pageType: request.platform }
          : {}),
      });

      // Transform Brandwatch data into our format
      const trends: Trend[] = (mentionsData.results || []).map((item) => ({
        keyword: item.topic,
        hashtag: `#${item.topic.replace(/\s+/g, '')}`,
        mentionCount: item.volume || 0,
        growthRate: item.trendScore || 0,
        sentiment: item.sentiment > 0.3 ? 'positive' : item.sentiment < -0.3 ? 'negative' : 'neutral',
        relatedTopics: [],
        estimatedReach: item.reach || 0,
        platform: request.platform || 'all',
      }));

      // Sort by growth rate for trending
      const sortedByGrowth = [...trends].sort((a, b) => b.growthRate - a.growthRate);
      const sortedByVolume = [...trends].sort((a, b) => b.mentionCount - a.mentionCount);

      return {
        trends: sortedByVolume.slice(0, 20),
        topTrending: sortedByVolume.slice(0, 5),
        emergingTrends: sortedByGrowth.filter((t) => t.growthRate > 50).slice(0, 5),
        recommendedHashtags: sortedByVolume.slice(0, 10).map((t) => t.hashtag),
        bestPostingTimes: getDefaultPostingTimes(),
        lastUpdated: now.toISOString(),
      };
    } catch (error) {
      logger.error('Brandwatch fetchTrends failed', error);
      throw error;
    }
  }
}

// Singleton
const brandwatch = new BrandwatchClient();

// ── AI Fallback (when Brandwatch is not configured) ──────────────────────

async function fetchTrendsWithAI(request: TrendRequest): Promise<TrendResponse> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    logger.warn('Neither Brandwatch nor OpenAI is configured — returning static trends');
    return getStaticTrends(request);
  }

  const systemPrompt = `You are a social media trend analyst with real-time knowledge of what's trending across all major platforms. Respond with valid JSON only.`;

  const userPrompt = `What are the current trending topics and hashtags related to "${request.topic}"${request.platform && request.platform !== 'all' ? ` on ${request.platform}` : ' across all social media platforms'}?

Timeframe: ${request.timeframe || '7d'}
${request.category ? `Category: ${request.category}` : ''}

Return JSON:
{
  "trends": [
    {
      "keyword": "<trending keyword>",
      "hashtag": "#<hashtag>",
      "mentionCount": <estimated mentions>,
      "growthRate": <percentage growth 0-500>,
      "sentiment": "<positive|neutral|negative>",
      "relatedTopics": ["<related1>", "<related2>"],
      "peakTime": "<best time to post about this, e.g. '14:00'>",
      "estimatedReach": <estimated reach>,
      "platform": "<most active platform>"
    }
  ],
  "topTrending": [<top 5 trends from above>],
  "emergingTrends": [<new trends with highest growth rate>],
  "recommendedHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"],
  "bestPostingTimes": ["09:00", "12:00", "17:00", "20:00"]
}

Include 10-15 trends. Be realistic with numbers. Mix mainstream and niche trends.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(raw);

    return {
      trends: parsed.trends || [],
      topTrending: parsed.topTrending || (parsed.trends || []).slice(0, 5),
      emergingTrends: parsed.emergingTrends || [],
      recommendedHashtags: parsed.recommendedHashtags || [],
      bestPostingTimes: parsed.bestPostingTimes || getDefaultPostingTimes(),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('AI trend fallback failed', error);
    return getStaticTrends(request);
  }
}

// ── Static fallback (no APIs at all) ─────────────────────────────────────

function getStaticTrends(request: TrendRequest): TrendResponse {
  const staticTrends: Trend[] = [
    {
      keyword: request.topic,
      hashtag: `#${request.topic.replace(/\s+/g, '')}`,
      mentionCount: 10000,
      growthRate: 25,
      sentiment: 'positive',
      relatedTopics: ['social media', 'content creation', 'marketing'],
      estimatedReach: 50000,
    },
    {
      keyword: 'viral content',
      hashtag: '#ViralContent',
      mentionCount: 85000,
      growthRate: 40,
      sentiment: 'positive',
      relatedTopics: ['engagement', 'growth', 'algorithm'],
      estimatedReach: 500000,
    },
    {
      keyword: 'social media tips',
      hashtag: '#SocialMediaTips',
      mentionCount: 120000,
      growthRate: 15,
      sentiment: 'positive',
      relatedTopics: ['content strategy', 'followers', 'reach'],
      estimatedReach: 800000,
    },
  ];

  return {
    trends: staticTrends,
    topTrending: staticTrends.slice(0, 2),
    emergingTrends: staticTrends.filter((t) => t.growthRate > 30),
    recommendedHashtags: staticTrends.map((t) => t.hashtag),
    bestPostingTimes: getDefaultPostingTimes(),
    lastUpdated: new Date().toISOString(),
  };
}

function getDefaultPostingTimes(): string[] {
  return ['09:00', '12:00', '15:00', '18:00', '20:00'];
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Check if Brandwatch is configured (vs AI fallback).
 */
export function isBrandwatchConfigured(): boolean {
  return brandwatch.isConfigured;
}

/**
 * Fetch trending topics.
 * Uses Brandwatch if configured, falls back to OpenAI, then static data.
 */
export async function fetchTrends(request: TrendRequest): Promise<TrendResponse> {
  if (brandwatch.isConfigured) {
    try {
      return await brandwatch.fetchTrends(request);
    } catch (error) {
      logger.warn('Brandwatch failed, falling back to AI trends', error as Record<string, unknown>);
      return fetchTrendsWithAI(request);
    }
  }

  return fetchTrendsWithAI(request);
}

/**
 * Get trending hashtags for a specific topic/category.
 */
export async function getTrendingHashtags(
  topic: string,
  platform?: string,
  count: number = 10
): Promise<string[]> {
  const trends = await fetchTrends({
    topic,
    platform: (platform as TrendRequest['platform']) || 'all',
    timeframe: '7d',
  });

  return trends.recommendedHashtags.slice(0, count);
}

/**
 * Discover what's trending right now (no specific topic).
 */
export async function discoverTrends(
  platform?: string,
  category?: string
): Promise<TrendResponse> {
  return fetchTrends({
    topic: category || 'trending topics social media',
    platform: (platform as TrendRequest['platform']) || 'all',
    timeframe: '24h',
    category,
  });
}

