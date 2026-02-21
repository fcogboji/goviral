// Viral Optimization Engine
// Helps users create content that has higher potential to go viral

import { NIGERIAN_TRENDING_HASHTAGS, OPTIMAL_POSTING_TIMES, getSuggestedHashtags } from './nigerian-features';

export interface ViralAnalysis {
  score: number; // 0-100 viral potential score
  suggestions: string[];
  optimizedContent: string;
  bestPostingTime: Date;
  recommendedHashtags: string[];
  platformSpecificTips: Record<string, string[]>;
  engagementPrediction: {
    likes: { min: number; max: number };
    shares: { min: number; max: number };
    comments: { min: number; max: number };
    reach: { min: number; max: number };
  };
}

export interface ContentAnalysis {
  wordCount: number;
  hasEmoji: boolean;
  hasHashtags: boolean;
  hasCallToAction: boolean;
  hasMention: boolean;
  hasQuestion: boolean;
  hasNumbers: boolean;
  sentimentScore: number; // -1 to 1
  readabilityScore: number; // 0-100
  hookStrength: number; // 0-100 (first line engagement potential)
}

// Viral content patterns that work across platforms
const VIRAL_PATTERNS = {
  hooks: [
    /^(you won't believe|this is why|here's how|the secret to|stop doing|start doing|i was wrong about)/i,
    /^(unpopular opinion|hot take|truth about|nobody talks about|what they don't tell you)/i,
    /^(\d+ (ways|tips|tricks|secrets|reasons|things)|thread:|breaking:)/i,
  ],
  callToActions: [
    /\b(share|retweet|comment|tag|follow|like|save|bookmark|subscribe)\b/i,
    /\b(let me know|what do you think|agree\?|thoughts\?|drop a|tell me)\b/i,
  ],
  emotionalTriggers: [
    /\b(amazing|incredible|shocking|unbelievable|game.?changer|life.?changing)\b/i,
    /\b(must.?see|can't miss|exclusive|limited|breaking|urgent)\b/i,
  ],
  engagement: [
    /\?$/, // Questions
    /\b(you|your|you're)\b/i, // Second person (talks to reader)
  ],
};

// Platform-specific optimal content lengths
const PLATFORM_OPTIMAL_LENGTHS = {
  twitter: { min: 70, optimal: 100, max: 280 },
  instagram: { min: 100, optimal: 150, max: 2200 },
  facebook: { min: 80, optimal: 250, max: 500 },
  linkedin: { min: 150, optimal: 300, max: 3000 },
  tiktok: { min: 50, optimal: 100, max: 150 },
  youtube: { min: 200, optimal: 500, max: 5000 },
};

// Engagement multipliers by content type
const CONTENT_MULTIPLIERS = {
  video: 2.5,
  image: 1.8,
  carousel: 2.0,
  text: 1.0,
  link: 0.7,
};

/**
 * Analyze content for viral potential
 */
export function analyzeContent(content: string): ContentAnalysis {
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const firstSentence = content.split(/[.!?]/)[0] || content;

  return {
    wordCount: words.length,
    hasEmoji: /[\u{1F300}-\u{1F9FF}]/u.test(content),
    hasHashtags: /#\w+/.test(content),
    hasCallToAction: VIRAL_PATTERNS.callToActions.some(p => p.test(content)),
    hasMention: /@\w+/.test(content),
    hasQuestion: /\?/.test(content),
    hasNumbers: /\d+/.test(content),
    sentimentScore: analyzeSentiment(content),
    readabilityScore: calculateReadability(content),
    hookStrength: analyzeHook(firstSentence),
  };
}

/**
 * Simple sentiment analysis
 */
function analyzeSentiment(content: string): number {
  const positiveWords = [
    'amazing', 'awesome', 'best', 'brilliant', 'excellent', 'fantastic',
    'great', 'incredible', 'love', 'perfect', 'wonderful', 'success',
    'happy', 'excited', 'proud', 'grateful', 'blessed', 'win', 'winning'
  ];
  const negativeWords = [
    'bad', 'terrible', 'awful', 'worst', 'hate', 'horrible', 'poor',
    'disappointing', 'fail', 'failure', 'sad', 'angry', 'frustrated'
  ];

  const lowerContent = content.toLowerCase();
  let score = 0;

  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) score += 0.1;
  });

  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 0.1;
  });

  return Math.max(-1, Math.min(1, score));
}

/**
 * Calculate readability score (simplified Flesch reading ease)
 */
function calculateReadability(content: string): number {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = words.reduce((acc, word) => acc + countSyllables(word), 0) / words.length;

  // Simplified Flesch score
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, score));
}

/**
 * Count syllables in a word (approximate)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Adjust for silent e
  if (word.endsWith('e')) count--;
  // Adjust for -le
  if (word.endsWith('le') && word.length > 2) count++;

  return Math.max(1, count);
}

/**
 * Analyze hook strength (first line)
 */
function analyzeHook(firstLine: string): number {
  let score = 50; // Base score

  // Check for viral patterns
  if (VIRAL_PATTERNS.hooks.some(p => p.test(firstLine))) {
    score += 25;
  }

  // Check for emotional triggers
  if (VIRAL_PATTERNS.emotionalTriggers.some(p => p.test(firstLine))) {
    score += 15;
  }

  // Check for numbers (lists, stats perform well)
  if (/^\d+/.test(firstLine) || /\d+%/.test(firstLine)) {
    score += 10;
  }

  // Check for question (engagement driver)
  if (firstLine.includes('?')) {
    score += 10;
  }

  // Check for emoji (attention grabber)
  if (/[\u{1F300}-\u{1F9FF}]/u.test(firstLine)) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Calculate viral score for content
 */
export function calculateViralScore(
  content: string,
  platforms: string[],
  _hasMedia: boolean = false,
  mediaType: 'video' | 'image' | 'carousel' | 'text' | 'link' = 'text'
): number {
  const analysis = analyzeContent(content);
  let score = 0;

  // Base score from hook strength (35%)
  score += analysis.hookStrength * 0.35;

  // Engagement elements (25%)
  let engagementScore = 0;
  if (analysis.hasCallToAction) engagementScore += 25;
  if (analysis.hasQuestion) engagementScore += 20;
  if (analysis.hasMention) engagementScore += 10;
  if (analysis.hasEmoji) engagementScore += 15;
  if (analysis.hasNumbers) engagementScore += 15;
  if (analysis.hasHashtags) engagementScore += 15;
  score += Math.min(100, engagementScore) * 0.25;

  // Readability (15%)
  score += analysis.readabilityScore * 0.15;

  // Sentiment (positive content performs better) (10%)
  const sentimentBonus = (analysis.sentimentScore + 1) * 50; // Convert -1 to 1 -> 0 to 100
  score += sentimentBonus * 0.10;

  // Content length optimization (15%)
  let lengthScore = 50;
  for (const platform of platforms) {
    const optimal = PLATFORM_OPTIMAL_LENGTHS[platform.toLowerCase() as keyof typeof PLATFORM_OPTIMAL_LENGTHS];
    if (optimal) {
      if (analysis.wordCount >= optimal.min && analysis.wordCount <= optimal.max) {
        lengthScore = 100;
      } else if (analysis.wordCount < optimal.min) {
        lengthScore = (analysis.wordCount / optimal.min) * 100;
      } else {
        lengthScore = Math.max(50, 100 - ((analysis.wordCount - optimal.max) / optimal.max) * 50);
      }
    }
  }
  score += lengthScore * 0.15;

  // Media multiplier
  const multiplier = CONTENT_MULTIPLIERS[mediaType];
  score = Math.min(100, score * multiplier);

  return Math.round(score);
}

/**
 * Generate optimization suggestions
 */
export function generateSuggestions(content: string, analysis: ContentAnalysis): string[] {
  const suggestions: string[] = [];

  if (analysis.hookStrength < 60) {
    suggestions.push('Start with a stronger hook - use numbers, questions, or bold statements');
  }

  if (!analysis.hasCallToAction) {
    suggestions.push('Add a call-to-action (e.g., "Share your thoughts", "Tag a friend")');
  }

  if (!analysis.hasQuestion) {
    suggestions.push('Include a question to encourage comments and engagement');
  }

  if (!analysis.hasEmoji) {
    suggestions.push('Add relevant emojis to increase visual appeal and stop-scroll rate');
  }

  if (!analysis.hasHashtags) {
    suggestions.push('Include 3-5 relevant hashtags to increase discoverability');
  }

  if (analysis.readabilityScore < 60) {
    suggestions.push('Simplify your language - use shorter sentences and simpler words');
  }

  if (analysis.sentimentScore < 0) {
    suggestions.push('Consider adding more positive or inspiring elements');
  }

  if (analysis.wordCount < 30) {
    suggestions.push('Add more context - very short posts may not provide enough value');
  }

  if (!analysis.hasNumbers) {
    suggestions.push('Include specific numbers or statistics to increase credibility');
  }

  return suggestions;
}

/**
 * Optimize content for viral potential
 */
export function optimizeContent(content: string, category?: string): string {
  let optimized = content;

  // Ensure it starts with a hook if it doesn't have one
  const analysis = analyzeContent(content);
  if (analysis.hookStrength < 50 && !content.match(/^[0-9]/)) {
    // Add numbers hook for lists
    if (content.includes('\n') || content.includes('-')) {
      const lines = content.split('\n').filter(l => l.trim());
      if (lines.length > 2) {
        optimized = `${lines.length} things you need to know:\n\n${content}`;
      }
    }
  }

  // Add suggested hashtags if none exist
  if (!analysis.hasHashtags) {
    const hashtags = getSuggestedHashtags(content, category);
    if (hashtags.length > 0) {
      optimized = `${optimized}\n\n${hashtags.slice(0, 5).join(' ')}`;
    }
  }

  // Add call-to-action if none exists
  if (!analysis.hasCallToAction && !optimized.includes('?')) {
    optimized = `${optimized}\n\nWhat do you think? Drop your thoughts below!`;
  }

  return optimized;
}

/**
 * Get best posting time based on platform and timezone
 */
export function getBestPostingTime(platform: string, _timezone: string = 'Africa/Lagos'): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const times = isWeekend ? OPTIMAL_POSTING_TIMES.weekend : OPTIMAL_POSTING_TIMES.weekday;

  // Platform-specific adjustments
  const platformAdjustments: Record<string, number> = {
    twitter: 0, // Real-time, post anytime
    instagram: 1, // Slight delay for better engagement
    facebook: 0,
    linkedin: -1, // Earlier for business audience
    tiktok: 2, // Later for younger audience
    youtube: 0,
  };

  const adjustment = platformAdjustments[platform.toLowerCase()] || 0;

  // Find next optimal time
  const currentHour = now.getHours();
  for (const time of times) {
    const adjustedHour = time.hour + adjustment;
    if (adjustedHour > currentHour) {
      const nextTime = new Date(now);
      nextTime.setHours(adjustedHour, time.minute, 0, 0);
      return nextTime;
    }
  }

  // If no time found today, return first time tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(times[0].hour + adjustment, times[0].minute, 0, 0);
  return tomorrow;
}

/**
 * Get platform-specific tips
 */
export function getPlatformTips(platform: string): string[] {
  const tips: Record<string, string[]> = {
    twitter: [
      'Keep tweets under 100 characters for 17% more engagement',
      'Use 1-2 hashtags maximum for best performance',
      'Tweet during peak hours (12-3pm and 5-6pm)',
      'Include images to get 150% more retweets',
      'Start threads with a hook to get more followers',
    ],
    instagram: [
      'Use 5-10 relevant hashtags for optimal reach',
      'Post carousel posts for 3x more engagement',
      'Write captions that encourage saves and shares',
      'Use Instagram Reels for 22% more reach',
      'Reply to comments within the first hour',
    ],
    facebook: [
      'Native video gets 10x more organic reach',
      'Ask questions to increase comment count',
      'Post between 1-4pm for best engagement',
      'Use Facebook Live for real-time engagement',
      'Tag relevant pages for broader reach',
    ],
    linkedin: [
      'Personal stories outperform promotional content',
      'Use bullet points for better readability',
      'Post Tuesday-Thursday for maximum engagement',
      'Native documents get 3x more engagement',
      'Comment on others posts to boost visibility',
    ],
    tiktok: [
      'Hook viewers in the first 1-3 seconds',
      'Use trending sounds for algorithm boost',
      'Post 1-3 times daily for growth',
      'Engage with comments quickly',
      'Use 3-5 trending hashtags plus niche tags',
    ],
    youtube: [
      'Optimize titles with keywords',
      'First 48 hours are crucial for algorithm',
      'Use custom thumbnails with faces',
      'Write descriptions with timestamps',
      'Pin your best comment for engagement',
    ],
  };

  return tips[platform.toLowerCase()] || [
    'Post consistently at optimal times',
    'Engage with your audience in comments',
    'Use relevant hashtags',
    'Include visual content when possible',
  ];
}

/**
 * Predict engagement based on content analysis
 */
export function predictEngagement(
  viralScore: number,
  followerCount: number = 1000,
  avgEngagementRate: number = 3 // percentage
): { likes: { min: number; max: number }; shares: { min: number; max: number }; comments: { min: number; max: number }; reach: { min: number; max: number } } {
  // Base engagement calculation
  const baseEngagement = (followerCount * avgEngagementRate) / 100;

  // Viral multiplier based on score
  const viralMultiplier = 1 + (viralScore / 100);

  // Calculate predictions with ranges
  const baseLikes = baseEngagement * 0.7 * viralMultiplier;
  const baseShares = baseEngagement * 0.1 * viralMultiplier;
  const baseComments = baseEngagement * 0.2 * viralMultiplier;
  const baseReach = followerCount * (1 + (viralScore / 50));

  return {
    likes: {
      min: Math.round(baseLikes * 0.7),
      max: Math.round(baseLikes * 1.5),
    },
    shares: {
      min: Math.round(baseShares * 0.5),
      max: Math.round(baseShares * 2),
    },
    comments: {
      min: Math.round(baseComments * 0.6),
      max: Math.round(baseComments * 1.8),
    },
    reach: {
      min: Math.round(baseReach * 0.8),
      max: Math.round(baseReach * 3), // Viral content can reach far beyond followers
    },
  };
}

/**
 * Full viral analysis for a post
 */
export function analyzeViralPotential(
  content: string,
  platforms: string[],
  options: {
    hasMedia?: boolean;
    mediaType?: 'video' | 'image' | 'carousel' | 'text' | 'link';
    category?: string;
    followerCount?: number;
    avgEngagementRate?: number;
  } = {}
): ViralAnalysis {
  const {
    hasMedia = false,
    mediaType = 'text',
    category,
    followerCount = 1000,
    avgEngagementRate = 3,
  } = options;

  const analysis = analyzeContent(content);
  const viralScore = calculateViralScore(content, platforms, hasMedia, mediaType);
  const suggestions = generateSuggestions(content, analysis);
  const optimizedContent = optimizeContent(content, category);
  const bestPostingTime = getBestPostingTime(platforms[0] || 'instagram');

  // Get platform-specific tips
  const platformSpecificTips: Record<string, string[]> = {};
  for (const platform of platforms) {
    platformSpecificTips[platform] = getPlatformTips(platform);
  }

  // Get recommended hashtags
  const recommendedHashtags = getSuggestedHashtags(content, category);

  // Predict engagement
  const engagementPrediction = predictEngagement(viralScore, followerCount, avgEngagementRate);

  return {
    score: viralScore,
    suggestions,
    optimizedContent,
    bestPostingTime,
    recommendedHashtags,
    platformSpecificTips,
    engagementPrediction,
  };
}

/**
 * Get trending hashtags for a category
 */
export function getTrendingHashtags(category?: string): string[] {
  if (category && category in NIGERIAN_TRENDING_HASHTAGS) {
    return NIGERIAN_TRENDING_HASHTAGS[category as keyof typeof NIGERIAN_TRENDING_HASHTAGS];
  }

  // Return mix of all categories if no specific category
  const allHashtags: string[] = [];
  for (const tags of Object.values(NIGERIAN_TRENDING_HASHTAGS)) {
    allHashtags.push(...tags.slice(0, 2));
  }
  return [...new Set(allHashtags)];
}
