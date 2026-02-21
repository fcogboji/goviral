/**
 * OpenAI-Powered Viral Content Engine
 *
 * Replaces basic regex pattern matching with real AI that:
 * 1. Rewrites any draft into a viral-optimized post
 * 2. Generates platform-specific versions (tweet vs LinkedIn vs Instagram caption)
 * 3. Scores content based on trained understanding of engagement
 * 4. Suggests hooks, CTAs, and emotional triggers
 * 5. Generates trending hashtags relevant to the content
 */

import { logger } from '@/lib/logger';

// ── Types ────────────────────────────────────────────────────────────────

export interface AIRewriteRequest {
  content: string;
  platforms: string[];
  tone?: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'provocative' | 'educational';
  category?: string;
  targetAudience?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  language?: string;
}

export interface PlatformVersion {
  platform: string;
  content: string;
  characterCount: number;
  hashtags: string[];
  estimatedEngagement: 'low' | 'medium' | 'high' | 'viral';
}

export interface AIRewriteResult {
  originalContent: string;
  viralVersion: string;
  viralScore: number; // 0-100
  platformVersions: PlatformVersion[];
  hooks: string[]; // 3 alternative hook/first-line options
  hashtags: string[];
  suggestions: string[];
  tone: string;
  engagementPrediction: {
    estimatedLikes: { min: number; max: number };
    estimatedShares: { min: number; max: number };
    estimatedComments: { min: number; max: number };
    estimatedReach: { min: number; max: number };
  };
}

export interface AIScoreResult {
  score: number;
  breakdown: {
    hookStrength: number;
    emotionalAppeal: number;
    clarity: number;
    callToAction: number;
    shareability: number;
    platformFit: number;
  };
  suggestions: string[];
  quickFixes: string[];
}

export interface AICaptionRequest {
  description: string;
  platform: string;
  tone?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  category?: string;
}

// ── Platform character limits ────────────────────────────────────────────

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  threads: 500,
  bluesky: 300,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 150,
  youtube: 5000,
};

// ── OpenAI Client ────────────────────────────────────────────────────────

class OpenAIClient {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-4o-mini'; // Cost-effective but powerful

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('OPENAI_API_KEY not set — AI rewriting will be unavailable');
    }
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async chat(
    systemPrompt: string,
    userPrompt: string,
    options?: { temperature?: number; maxTokens?: number; responseFormat?: 'json' }
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Set OPENAI_API_KEY in your environment.');
    }

    const body: Record<string, unknown> = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options?.temperature ?? 0.8,
      max_tokens: options?.maxTokens ?? 2000,
    };

    if (options?.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      logger.error('OpenAI API error', err, { status: response.status });
      throw new Error(err?.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  }
}

// Singleton
const openai = new OpenAIClient();

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Check if AI rewriting is available (API key is set)
 */
export function isAIAvailable(): boolean {
  return openai.isConfigured;
}

/**
 * Rewrite content for maximum viral potential using GPT.
 * This is the main "Make it Viral" function.
 */
export async function rewriteForViral(request: AIRewriteRequest): Promise<AIRewriteResult> {
  const platformList = request.platforms.join(', ');
  const platformLimits = request.platforms
    .map((p) => `${p}: ${PLATFORM_LIMITS[p.toLowerCase()] || 5000} chars`)
    .join(', ');

  const systemPrompt = `You are GoViral AI — an expert social media strategist who transforms ordinary posts into viral content. You understand what makes content shareable, engaging, and algorithm-friendly across all major platforms.

Your expertise includes:
- Writing scroll-stopping hooks (first line is EVERYTHING)
- Creating emotional resonance that drives shares
- Platform-specific optimization (tweet brevity vs LinkedIn depth)
- Strategic use of emojis, hashtags, and CTAs
- Understanding algorithm preferences for each platform

ALWAYS respond with valid JSON matching the required schema.`;

  const userPrompt = `Transform this content into a viral post:

ORIGINAL CONTENT:
"""
${request.content}
"""

TARGET PLATFORMS: ${platformList}
CHARACTER LIMITS: ${platformLimits}
${request.tone ? `TONE: ${request.tone}` : 'TONE: Choose the best tone for virality'}
${request.category ? `CATEGORY/NICHE: ${request.category}` : ''}
${request.targetAudience ? `TARGET AUDIENCE: ${request.targetAudience}` : ''}
${request.language ? `LANGUAGE: ${request.language}` : 'LANGUAGE: English'}
INCLUDE EMOJIS: ${request.includeEmojis !== false ? 'Yes' : 'No'}
INCLUDE HASHTAGS: ${request.includeHashtags !== false ? 'Yes' : 'No'}

Return JSON with this exact structure:
{
  "viralVersion": "The best single viral version of the content",
  "viralScore": <number 0-100 based on viral potential>,
  "platformVersions": [
    {
      "platform": "<platform name>",
      "content": "<optimized content for this specific platform, respecting char limit>",
      "characterCount": <number>,
      "hashtags": ["#tag1", "#tag2"],
      "estimatedEngagement": "<low|medium|high|viral>"
    }
  ],
  "hooks": ["<alternative hook 1>", "<alternative hook 2>", "<alternative hook 3>"],
  "hashtags": ["#relevant1", "#relevant2", "#relevant3", "#trending1", "#trending2"],
  "suggestions": ["<tip 1 to further improve>", "<tip 2>", "<tip 3>"],
  "tone": "<the tone used>",
  "engagementPrediction": {
    "estimatedLikes": { "min": <number>, "max": <number> },
    "estimatedShares": { "min": <number>, "max": <number> },
    "estimatedComments": { "min": <number>, "max": <number> },
    "estimatedReach": { "min": <number>, "max": <number> }
  }
}

IMPORTANT RULES:
1. The hook (first line) must STOP THE SCROLL — use curiosity gaps, bold claims, or relatable pain points
2. Each platform version MUST respect that platform's character limit
3. Include a clear call-to-action that drives engagement
4. Hashtags should mix trending + niche-specific (5-8 total)
5. The viral score should be honest — not everything can be 90+
6. Engagement predictions should be realistic for an account with ~1000-10000 followers`;

  try {
    const raw = await openai.chat(systemPrompt, userPrompt, {
      temperature: 0.85,
      maxTokens: 3000,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(raw);

    return {
      originalContent: request.content,
      viralVersion: parsed.viralVersion || request.content,
      viralScore: Math.min(100, Math.max(0, parsed.viralScore || 50)),
      platformVersions: (parsed.platformVersions || []).map((pv: PlatformVersion) => ({
        platform: pv.platform,
        content: pv.content,
        characterCount: pv.characterCount || pv.content?.length || 0,
        hashtags: pv.hashtags || [],
        estimatedEngagement: pv.estimatedEngagement || 'medium',
      })),
      hooks: parsed.hooks || [],
      hashtags: parsed.hashtags || [],
      suggestions: parsed.suggestions || [],
      tone: parsed.tone || request.tone || 'casual',
      engagementPrediction: parsed.engagementPrediction || {
        estimatedLikes: { min: 50, max: 500 },
        estimatedShares: { min: 5, max: 50 },
        estimatedComments: { min: 10, max: 100 },
        estimatedReach: { min: 500, max: 5000 },
      },
    };
  } catch (error) {
    logger.error('AI rewrite failed', error);
    throw error;
  }
}

/**
 * Score existing content using AI (faster, cheaper than full rewrite).
 * Returns a detailed breakdown of why content scores the way it does.
 */
export async function scoreContent(
  content: string,
  platforms: string[]
): Promise<AIScoreResult> {
  const systemPrompt = `You are a social media content analyst. Score the provided content for viral potential. Be honest and specific. Respond with valid JSON only.`;

  const userPrompt = `Score this social media post for viral potential on ${platforms.join(', ')}:

"""
${content}
"""

Return JSON:
{
  "score": <0-100 overall viral score>,
  "breakdown": {
    "hookStrength": <0-100 how attention-grabbing is the first line>,
    "emotionalAppeal": <0-100 does it trigger emotions that drive sharing>,
    "clarity": <0-100 is the message clear and easy to understand>,
    "callToAction": <0-100 does it encourage engagement>,
    "shareability": <0-100 would someone share this with others>,
    "platformFit": <0-100 is it optimized for the target platforms>
  },
  "suggestions": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "quickFixes": ["<one small change that would immediately improve it>", "<another quick fix>"]
}`;

  try {
    const raw = await openai.chat(systemPrompt, userPrompt, {
      temperature: 0.4,
      maxTokens: 1000,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(raw);

    return {
      score: Math.min(100, Math.max(0, parsed.score || 50)),
      breakdown: {
        hookStrength: parsed.breakdown?.hookStrength || 50,
        emotionalAppeal: parsed.breakdown?.emotionalAppeal || 50,
        clarity: parsed.breakdown?.clarity || 50,
        callToAction: parsed.breakdown?.callToAction || 50,
        shareability: parsed.breakdown?.shareability || 50,
        platformFit: parsed.breakdown?.platformFit || 50,
      },
      suggestions: parsed.suggestions || [],
      quickFixes: parsed.quickFixes || [],
    };
  } catch (error) {
    logger.error('AI scoring failed', error);
    throw error;
  }
}

/**
 * Generate a caption from a brief description (for images/videos).
 */
export async function generateCaption(request: AICaptionRequest): Promise<{
  caption: string;
  alternativeCaptions: string[];
  hashtags: string[];
}> {
  const charLimit = PLATFORM_LIMITS[request.platform.toLowerCase()] || 2200;

  const systemPrompt = `You are a viral social media caption writer. Generate engaging captions that drive engagement. Respond with valid JSON only.`;

  const userPrompt = `Write a viral ${request.platform} caption for:

DESCRIPTION: ${request.description}
${request.category ? `CATEGORY: ${request.category}` : ''}
${request.tone ? `TONE: ${request.tone}` : 'TONE: engaging and relatable'}
CHARACTER LIMIT: ${charLimit}
INCLUDE EMOJIS: ${request.includeEmojis !== false ? 'Yes' : 'No'}
INCLUDE HASHTAGS: ${request.includeHashtags !== false ? 'Yes' : 'No'}

Return JSON:
{
  "caption": "<the best caption>",
  "alternativeCaptions": ["<option 2>", "<option 3>"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

  try {
    const raw = await openai.chat(systemPrompt, userPrompt, {
      temperature: 0.9,
      maxTokens: 1500,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(raw);

    return {
      caption: parsed.caption || '',
      alternativeCaptions: parsed.alternativeCaptions || [],
      hashtags: parsed.hashtags || [],
    };
  } catch (error) {
    logger.error('AI caption generation failed', error);
    throw error;
  }
}

/**
 * Generate hashtags relevant to content using AI.
 */
export async function generateHashtags(
  content: string,
  platform: string,
  count: number = 10
): Promise<{ hashtags: string[]; trending: string[]; niche: string[] }> {
  const systemPrompt = `You are a social media hashtag strategist. Generate relevant hashtags that maximize discoverability. Respond with valid JSON only.`;

  const userPrompt = `Generate ${count} hashtags for this ${platform} post:

"""
${content}
"""

Return JSON:
{
  "hashtags": ["#tag1", "#tag2", ...],
  "trending": ["#trending1", "#trending2", "#trending3"],
  "niche": ["#niche1", "#niche2", "#niche3"]
}

Mix broad trending hashtags (high volume) with niche-specific ones (less competition).`;

  try {
    const raw = await openai.chat(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 500,
      responseFormat: 'json',
    });

    const parsed = JSON.parse(raw);

    return {
      hashtags: parsed.hashtags || [],
      trending: parsed.trending || [],
      niche: parsed.niche || [],
    };
  } catch (error) {
    logger.error('AI hashtag generation failed', error);
    throw error;
  }
}

