// File path comment identifying the location of this API route
// app/api/analytics/join-creators/route.ts
// Import NextRequest and NextResponse types from Next.js server utilities
import { NextRequest, NextResponse } from 'next/server';

// Export async POST function to handle "join creators" button click analytics
// This tracks when users click the join creators CTA button
export async function POST(request: NextRequest) {
  // Try-catch block to handle errors gracefully
  try {
    // Parse the JSON body from the incoming request
    const body = await request.json();
    // Destructure the join creators click data from the request body
    const { source, timestamp } = body;

    // Log the join creators click event to console
    // In production, this would be saved to a database or analytics service
    console.log('Join creators clicked:', { source, timestamp });

    // Return successful JSON response with success flag
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any errors that occur during processing
    console.error('Error logging join creators click:', error);
    // Return error JSON response with 500 status code
    return NextResponse.json(
      { success: false, message: 'Failed to log join creators click' }, // Error message in response body
      { status: 500 } // Internal Server Error status code
    );
  }
}