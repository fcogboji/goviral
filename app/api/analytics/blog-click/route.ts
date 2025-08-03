// app/api/analytics/blog-click/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, source, timestamp } = body;

    // Log blog click
    console.log('Blog clicked:', { slug, source, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging blog click:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log blog click' },
      { status: 500 }
    );
  }
}