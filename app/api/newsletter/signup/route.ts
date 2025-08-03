// app/api/newsletter/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, timestamp } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Log newsletter signup
    console.log('Newsletter signup:', { email, source, timestamp });

    // Here you would typically:
    // 1. Add email to your newsletter service (Mailchimp, SendGrid, etc.)
    // 2. Save to database
    // 3. Send welcome email
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    });

  } catch (error) {
    console.error('Error with newsletter signup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}