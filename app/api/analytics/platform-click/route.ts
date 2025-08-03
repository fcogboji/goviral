// app/api/analytics/platform-click/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, source, timestamp } = body;

    // Log platform click
    console.log('Platform clicked:', { platform, source, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging platform click:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log platform click' },
      { status: 500 }
    );
  }
}