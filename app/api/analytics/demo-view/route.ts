// app/api/analytics/demo-view/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, timestamp } = body;

    // Log demo view
    console.log('Demo viewed:', { source, timestamp });

    // Here you would typically save to your analytics database
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging demo view:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log demo view' },
      { status: 500 }
    );
  }
}