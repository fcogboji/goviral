// File path comment identifying the location of this API route
// app/api/analytics/platform-click/route.ts
// Import NextRequest and NextResponse types from Next.js server utilities
import { NextRequest, NextResponse } from 'next/server';

// Export async POST function to handle platform integration icon click analytics
// This tracks when users click on social media platform icons
export async function POST(request: NextRequest) {
  // Try-catch block to handle errors gracefully
  try {
    // Parse the JSON body from the incoming request
    const body = await request.json();
    // Destructure the platform click data from the request body
    const { platform, source, timestamp } = body;

    // Log the platform click event to console
    // In production, this would be saved to a database or analytics service
    console.log('Platform clicked:', { platform, source, timestamp });

    // Return successful JSON response with success flag
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any errors that occur during processing
    console.error('Error logging platform click:', error);
    // Return error JSON response with 500 status code
    return NextResponse.json(
      { success: false, message: 'Failed to log platform click' }, // Error message in response body
      { status: 500 } // Internal Server Error status code
    );
  }
}