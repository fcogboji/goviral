// File path comment identifying the location of this API route
// app/api/analytics/contact-support/route.ts
// Import NextRequest and NextResponse types from Next.js server utilities
import { NextRequest, NextResponse } from 'next/server';

// Export async POST function to handle support contact analytics tracking
// This is a Next.js API route handler for POST requests
export async function POST(request: NextRequest) {
  // Try-catch block to handle errors gracefully
  try {
    // Parse the JSON body from the incoming request
    const body = await request.json();
    // Destructure the support contact data from the request body
    const { source, timestamp } = body;

    // Log the support contact event to console
    // In production, this would be saved to a database or analytics service
    console.log('Support contacted:', { source, timestamp });

    // Return successful JSON response with success flag
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any errors that occur during processing
    console.error('Error logging support contact:', error);
    // Return error JSON response with 500 status code
    return NextResponse.json(
      { success: false, message: 'Failed to log support contact' }, // Error message in response body
      { status: 500 } // Internal Server Error status code
    );
  }
}