import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string[] }> }
) {
  try {
    // Await params before using its properties
    const resolvedParams = await params;
    const dimensions = resolvedParams.dimensions;
    
    let width = 400;
    let height = 300;
    
    // Parse dimensions from the URL segments
    if (dimensions && dimensions.length > 0) {
      const firstDimension = parseInt(dimensions[0]);
      if (!isNaN(firstDimension)) {
        width = firstDimension;
      }
      
      if (dimensions.length > 1) {
        const secondDimension = parseInt(dimensions[1]);
        if (!isNaN(secondDimension)) {
          height = secondDimension;
        }
      } else {
        // If only one dimension provided, make it square
        height = width;
      }
    }
    
    // Create SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#d0d0d0" stroke-width="2"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="16" fill="#666">
          ${width} × ${height}
        </text>
      </svg>
    `.trim();
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return NextResponse.json(
      { error: 'Failed to generate placeholder' },
      { status: 500 }
    );
  }
}