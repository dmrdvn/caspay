import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

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
