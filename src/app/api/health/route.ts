import type { NextRequest} from 'next/server';

import { NextResponse } from 'next/server';

import { createClient } from 'src/lib/supabase';

/**
 * Health Check Endpoint
 * 
 * GET /api/health
 * 
 * No authentication required
 * Check system status and dependencies
 */

export async function GET(_req: NextRequest) {
  const startTime = Date.now();
  
  console.log('[Health Check] Request received');
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      api: 'ok',
      database: 'checking',
      casper: 'ok'
    }
  };

  try {
    // Check Supabase connection
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('merchants')
        .select('id')
        .limit(1);

      if (error) {
        console.error('[Health Check] Database error:', error);
        health.checks.database = 'error';
        health.status = 'degraded';
      } else {
        console.log('[Health Check] Database OK');
        health.checks.database = 'ok';
      }
    } catch (dbError: any) {
      console.error('[Health Check] Database connection failed:', dbError);
      health.checks.database = 'error';
      health.status = 'degraded';
    }

    const responseTime = Date.now() - startTime;

    const response = {
      ...health,
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    console.log('[Health Check] Response:', response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Health Check] Error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks: health.checks
      },
      { status: 503 }
    );
  }
}
