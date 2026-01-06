import { NextResponse } from 'next/server';

import { getPayLinkBySlug, trackPayLinkEvent } from 'src/actions/paylink';

// ----------------------------------------------------------------------

/**
 * GET /api/paylink/[slug]
 * Public endpoint to fetch PayLink details by slug
 * No authentication required - used for public payment pages
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'PayLink slug is required' },
        { status: 400 }
      );
    }

    // Fetch PayLink
    const paylink = await getPayLinkBySlug(slug);

    if (!paylink) {
      return NextResponse.json(
        { error: 'PayLink not found or expired' },
        { status: 404 }
      );
    }

    // Track view event (async, don't await)
    const userAgent = request.headers.get('user-agent') || undefined;
    const referer = request.headers.get('referer') || undefined;
    
    trackPayLinkEvent(paylink.id, 'view', {
      user_agent: userAgent,
      referer,
    }).catch((error) => {
      console.error('[PayLink] Failed to track view event:', error);
    });

    return NextResponse.json(
      { 
        success: true,
        data: paylink 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/paylink/[slug]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
