// app/api/analytics/plan-selection/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { plan, source, timestamp } = body

    // Validate required fields
    if (!plan || !source) {
      return NextResponse.json(
        { error: 'Plan and source are required' },
        { status: 400 }
      )
    }

    // Log the plan selection for analytics
    console.log('Plan selected:', { 
      userId,
      plan, 
      source, 
      timestamp: timestamp || new Date().toISOString() 
    })

    // Here you would typically:
    // 1. Save the plan selection to your analytics database
    // 2. Track user behavior
    // 3. Send data to analytics services (Google Analytics, Mixpanel, etc.)
    // 4. Update user preferences if authenticated

    return NextResponse.json({
      success: true,
      message: `Successfully tracked selection of ${plan} plan`,
      data: {
        plan,
        source,
        timestamp: timestamp || new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error tracking plan selection:', error)
    return NextResponse.json(
      { error: 'Failed to track plan selection' },
      { status: 500 }
    )
  }
}

// Handle GET requests if needed (for debugging)
export async function GET() {
  return NextResponse.json({
    message: 'Plan selection analytics endpoint',
    method: 'POST',
    expectedData: {
      plan: 'string (required)',
      source: 'string (optional)',
      timestamp: 'string (optional)'
    },
    availablePlans: ['starter', 'creator', 'agency']
  });
}