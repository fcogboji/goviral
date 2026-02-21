// Admin API to manage users
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/access-control';

// GET all users (with pagination)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin
    await requireAdmin(user.id);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      email?: { contains: string; mode: 'insensitive' };
      subscription?: { status: string };
    } = {};

    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.subscription = { status };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscription: {
            include: {
              plan: true
            }
          },
          _count: {
            select: {
              posts: true,
              platformIntegrations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        clerkId: u.clerkId,
        email: u.email,
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
        role: u.role,
        isBlocked: u.isBlocked,
        blockedAt: u.blockedAt,
        blockedReason: u.blockedReason,
        createdAt: u.createdAt,
        subscription: u.subscription ? {
          id: u.subscription.id,
          planType: u.subscription.planType,
          status: u.subscription.status,
          currentPeriodEnd: u.subscription.currentPeriodEnd,
          trialEndsAt: u.subscription.trialEndsAt,
          cardLast4: u.subscription.cardLast4,
          cardBrand: u.subscription.cardBrand,
          plan: u.subscription.plan
        } : null,
        stats: {
          totalPosts: u._count.posts,
          connectedPlatforms: u._count.platformIntegrations
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
