// app/api/analytics/testimonial-click/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testimonial_id, source, timestamp } = body;

    // Log testimonial click
    console.log('Testimonial clicked:', { testimonial_id, source, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging testimonial click:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log testimonial click' },
      { status: 500 }
    );
  }
}