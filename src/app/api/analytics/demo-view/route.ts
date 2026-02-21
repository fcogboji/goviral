// File path comment identifying the location of this API route
// app/api/analytics/demo-view/route.ts
// Import NextRequest and NextResponse types from Next.js server utilities
import { NextRequest, NextResponse } from 'next/server';

// Export async POST function to handle demo view analytics tracking
// This is a Next.js API route handler for POST requests
export async function POST(request: NextRequest) {
  // Try-catch block to handle errors gracefully
  try {
    // Parse the JSON body from the incoming request
    const body = await request.json();
    // Destructure the demo view data from the request body
    const { source, timestamp } = body;

    // Log the demo view event to console
    console.log('Demo viewed:', { source, timestamp });

    // TODO: In production, this data would be saved to an analytics database
    // Example: await prisma.analytics.create({ data: { event: 'demo_view', source, timestamp } })

    // Return successful JSON response with success flag
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any errors that occur during processing
    console.error('Error logging demo view:', error);
    // Return error JSON response with 500 status code
    return NextResponse.json(
      { success: false, message: 'Failed to log demo view' }, // Error message in response body
      { status: 500 } // Internal Server Error status code
    );
  }
}