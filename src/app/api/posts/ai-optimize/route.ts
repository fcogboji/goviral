/**
 * API Route: AI-Powered Content Optimization
 *
 * POST /api/posts/ai-optimize
 *   Body: { content, platforms, tone?, category?, targetAudience?, action? }
 *   action: "rewrite" (default) | "score" | "caption" | "hashtags"
 *
 * This is the "Make it Viral" button endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  rewriteForViral,
  scoreContent,
  generateCaption,
  generateHashtags,
  isAIAvailable,
} from '@/lib/viral-optimization';
import { logger } from '@/lib/logger';
import { requireActiveSubscription } from '@/lib/require-subscription';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Require active subscription or trial
    const subCheck = await requireActiveSubscription(clerkUserId);
    if (!subCheck.authorized) {
      return NextResponse.json(
        { error: subCheck.error, redirectTo: subCheck.redirectTo },
        { status: 403 }
      );
    }

    // Check AI availability
    if (!isAIAvailable()) {
      return NextResponse.json(
        { error: 'AI optimization is not configured. Set OPENAI_API_KEY in your environment.' },
        { status: 503 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        subscription: { select: { plan: { select: { name: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      content,
      platforms = ['instagram'],
      tone,
      category,
      targetAudience,
      action = 'rewrite',
      description,
      platform,
      includeHashtags,
      includeEmojis,
    } = body;

    if (!content && action !== 'caption') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    switch (action) {
      case 'rewrite': {
        const result = await rewriteForViral({
          content,
          platforms,
          tone,
          category,
          targetAudience,
          includeHashtags: includeHashtags !== false,
          includeEmojis: includeEmojis !== false,
        });

        return NextResponse.json({ success: true, result });
      }

      case 'score': {
        const result = await scoreContent(content, platforms);
        return NextResponse.json({ success: true, result });
      }

      case 'caption': {
        if (!description) {
          return NextResponse.json({ error: 'Description is required for caption generation' }, { status: 400 });
        }

        const result = await generateCaption({
          description,
          platform: platform || platforms[0] || 'instagram',
          tone,
          category,
          includeHashtags: includeHashtags !== false,
          includeEmojis: includeEmojis !== false,
        });

        return NextResponse.json({ success: true, result });
      }

      case 'hashtags': {
        const result = await generateHashtags(content, platform || platforms[0] || 'instagram');
        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use "rewrite", "score", "caption", or "hashtags".` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    logger.error('AI optimization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI optimization failed' },
      { status: 500 }
    );
  }
}

