// API Route: Generate Ayrshare linking URL for users to connect social accounts
// Users visit this URL to connect Facebook, Twitter, Instagram, TikTok, etc.
// No individual platform OAuth setup needed — Ayrshare handles it all.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CentralPostingService } from '@/lib/social-media';

/**
 * GET /api/platforms/link
 * Returns a URL that opens Ayrshare's social account linking page.
 * The user can connect/disconnect all their social accounts from there.
 */
export async function GET(_req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if Ayrshare is configured
    if (!CentralPostingService.isAyrshareConfigured()) {
      return NextResponse.json(
        { error: 'Social media integration is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const service = await CentralPostingService.forUser(user.id);
    const linkingUrl = await service.getLinkingUrl();

    return NextResponse.json({
      success: true,
      url: linkingUrl,
      message: 'Open this URL to connect your social media accounts',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate linking URL';
    console.error('Error generating linking URL:', message);

    // Determine appropriate status based on error type
    const isConfigError = message.includes('not configured') || message.includes('API key');
    return NextResponse.json(
      { error: message },
      { status: isConfigError ? 503 : 500 }
    );
  }
}

/**
 * POST /api/platforms/link
 * Called after the user finishes linking on Ayrshare's page.
 * Syncs connected platforms back to our database.
 */
export async function POST(_req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const service = await CentralPostingService.forUser(user.id);
    const connectedPlatforms = await service.syncConnectedPlatforms();

    return NextResponse.json({
      success: true,
      connectedPlatforms,
      message: `Successfully synced ${connectedPlatforms.length} platform(s)`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync platforms';
    console.error('Error syncing platforms:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

