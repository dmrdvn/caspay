import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Handle docs subdomain
  if (hostname.startsWith('docs.')) {
    // If already on /docs path, continue
    if (pathname.startsWith('/docs')) {
      return NextResponse.next();
    }
    // Rewrite to /docs
    const url = request.nextUrl.clone();
    url.pathname = `/docs${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Handle api subdomain
  if (hostname.startsWith('api.')) {
    // Root path goes to health check
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/api/health';
      return NextResponse.rewrite(url);
    }
    // API routes continue normally
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
