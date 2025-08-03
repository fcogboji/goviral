// app/api/analytics/feature-click/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature, source, timestamp } = body;

    // Log feature click
    console.log('Feature clicked:', { feature, source, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging feature click:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log feature click' },
      { status: 500 }
    );
  }
}