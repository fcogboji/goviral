// app/api/analytics/join-creators/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, timestamp } = body;

    // Log join creators click
    console.log('Join creators clicked:', { source, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging join creators click:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log join creators click' },
      { status: 500 }
    );
  }
}