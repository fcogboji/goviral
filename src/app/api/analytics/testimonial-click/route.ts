// File path comment identifying the location of this API route
// app/api/analytics/testimonial-click/route.ts
// Import NextRequest and NextResponse types from Next.js server utilities
import { NextRequest, NextResponse } from 'next/server';

// Export async POST function to handle testimonial click analytics tracking
// This tracks when users interact with customer testimonials
export async function POST(request: NextRequest) {
  // Try-catch block to handle errors gracefully
  try {
    // Parse the JSON body from the incoming request
    const body = await request.json();
    // Destructure the testimonial click data from the request body
    const { testimonial_id, source, timestamp } = body;

    // Log the testimonial click event to console
    // In production, this would be saved to a database or analytics service
    console.log('Testimonial clicked:', { testimonial_id, source, timestamp });

    // Return successful JSON response with success flag
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log any errors that occur during processing
    console.error('Error logging testimonial click:', error);
    // Return error JSON response with 500 status code
    return NextResponse.json(
      { success: false, message: 'Failed to log testimonial click' }, // Error message in response body
      { status: 500 } // Internal Server Error status code
    );
  }
}