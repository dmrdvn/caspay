import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Handle CORS for all API routes
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key, X-CasPay-SDK-Version, User-Agent',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to actual requests
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-CasPay-Key, X-CasPay-SDK-Version, User-Agent');
    return response;
  }

  if (hostname.startsWith('docs.')) {

    if (pathname.startsWith('/docs')) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/docs${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname.startsWith('api.')) {

    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/health';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
