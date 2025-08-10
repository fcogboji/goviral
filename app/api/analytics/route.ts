import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
  console.log('🔍 Analytics API called:', request.url)
  console.log('🔍 Request method:', request.method)

  try {
    console.log('🔍 Attempting authentication...')
    const { userId } = await auth()
    console.log('🔍 Auth result - userId:', userId)
    
    if (!userId) {
      console.log('❌ No userId - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    const platform = searchParams.get('platform')
    const postId = searchParams.get('postId')
    const metric = searchParams.get('metric')
    
    console.log('🔍 Query params:', { period, platform, postId, metric })

    // FIXED: Use upsert to avoid unique constraint violations
    console.log('🔍 Finding or creating user...')
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {}, // Don't update existing user
      create: {
        clerkId: userId,
        email: `temp_${userId}@clerk.temp`, // Generate unique temporary email
        firstName: '',
        lastName: '',
        imageUrl: ''
      }
    })
    console.log('🔍 User result:', user ? `Found/Created user ${user.id}` : 'Failed')

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }

    console.log('🔍 Date range:', { startDate, endDate: now })

    // Build where clause
    const where: Record<string, unknown> = { 
      userId: user.id,
      date: {
        gte: startDate
      }
    }
    
    if (platform) {
      where.platform = platform
    }
    
    if (postId) {
      where.postId = postId
    }
    
    if (metric) {
      where.metric = metric
    }

    console.log('🔍 Database query where clause:', where)

    // Fetch analytics data
    console.log('🔍 Fetching analytics data...')
    const analytics = await prisma.analytics.findMany({
      where,
      include: {
        post: true
      },
      orderBy: { date: 'asc' }
    })
    console.log('🔍 Found analytics records:', analytics.length)

    // Calculate summary metrics
    console.log('🔍 Calculating summary metrics...')
    const summary = await prisma.analytics.groupBy({
      by: ['metric'],
      where: {
        userId: user.id,
        date: {
          gte: startDate
        }
      },
      _sum: {
        value: true
      }
    })
    console.log('🔍 Summary metrics:', summary)

    // Get top performing posts - FIXED VERSION
    console.log('🔍 Fetching top posts...')
    const topPosts = await prisma.post.findMany({
      where: {
        userId: user.id,
        publishedAt: {
          gte: startDate
        }
      },
      include: {
        analytics: {
          // Use the correct PostAnalytics fields
          orderBy: { 
            engagements: 'desc' // Use actual field from PostAnalytics
          },
          take: 1
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 5
    })
    console.log('🔍 Found top posts:', topPosts.length)

    // Calculate platform breakdown
    console.log('🔍 Calculating platform breakdown...')
    const platformBreakdown = await prisma.analytics.groupBy({
      by: ['platform'],
      where: {
        userId: user.id,
        date: {
          gte: startDate
        }
      },
      _sum: {
        value: true
      }
    })
    console.log('🔍 Platform breakdown:', platformBreakdown)

    const result = {
      analytics,
      summary: summary.reduce((acc, item) => {
        acc[item.metric] = item._sum.value || 0
        return acc
      }, {} as Record<string, number>),
      topPosts,
      platformBreakdown: platformBreakdown.map(item => ({
        platform: item.platform,
        total: item._sum.value || 0
      })),
      period,
      dateRange: {
        start: startDate,
        end: now
      }
    }

    console.log('✅ Returning successful response')
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Analytics API error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// POST - Track analytics event
export async function POST(request: NextRequest) {
  console.log('🔍 Analytics POST called:', request.url)
  
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      postId, 
      platform, 
      metric, 
      value, 
      date 
    } = body

    console.log('🔍 POST body:', body)

    // FIXED: Use upsert here too for consistency
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `temp_${userId}@clerk.temp`, // Generate unique temporary email
        firstName: '',
        lastName: '',
        imageUrl: ''
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate required fields
    if (!platform || !metric || value === undefined) {
      return NextResponse.json(
        { error: 'Platform, metric, and value are required' },
        { status: 400 }
      )
    }

    // Create analytics record
    const analytics = await prisma.analytics.create({
      data: {
        userId: user.id,
        postId,
        platform,
        metric,
        value: parseInt(value),
        date: date ? new Date(date) : new Date()
      }
    })

    console.log('✅ Created analytics record:', analytics)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('❌ Analytics POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create analytics' },
      { status: 500 }
    )
  }
}