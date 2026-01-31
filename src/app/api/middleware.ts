import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

/**
 * API Middleware
 * 
 * Global security and monitoring for all API endpoints
 * 
 * Features:
 * - CORS headers
 * - Request logging
 * - Security headers
 * - Error boundary
 */

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;

  // Only apply to /api/* routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Log request
  console.log('[API] Request', {
    method: request.method,
    pathname,
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
    timestamp: new Date().toISOString()
  });

  // CORS headers for all API routes
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*'); 
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CasPay-Key');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Response time header
  const responseTime = Date.now() - startTime;
  response.headers.set('X-Response-Time', `${responseTime}ms`);

  return response;
}

export const config = {
  matcher: '/api/:path*'
};
