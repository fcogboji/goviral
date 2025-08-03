// app/api/analytics/contact-support/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, timestamp } = body;

    // Log support contact
    console.log('Support contacted:', { source, timestamp });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging support contact:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to log support contact' },
      { status: 500 }
    );
  }
}