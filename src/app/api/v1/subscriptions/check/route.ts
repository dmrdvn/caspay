import type { NextRequest} from 'next/server';

import { NextResponse } from 'next/server';

import { createClient } from 'src/lib/supabase';
import { checkRateLimit, getRateLimitHeaders } from 'src/lib/api/rate-limit';
import { isValidationError, validatePublicApiKey } from 'src/lib/api/validate-api-key';

/**
 * Subscription Status Check API
 * 
 * GET /api/v1/subscriptions/check?merchant_id=xxx&subscriber=0x123&plan_id=plan_001
 * 
 * Security:
 * - API key authentication
 * - Rate limiting (100 req/min per merchant)
 * - Permission check (read:subscriptions)
 * 
 * Query params:
 * - merchant_id: required
 * - subscriber: required (wallet address)
 * - plan_id: optional (check specific plan)
 */

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validate API key
    const apiKey = req.headers.get('X-CasPay-Key');
    const merchant = await validatePublicApiKey(apiKey, 'read:subscriptions');

    if (isValidationError(merchant)) {
      return NextResponse.json(
        { error: merchant.error, code: merchant.code },
        { 
          status: merchant.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    // 2. Rate limiting (higher limit for reads)
    const rateLimit = checkRateLimit(`merchant:${merchant.merchant_id}:subscription-check`, {
      maxRequests: 100,
      windowMs: 60000 // 100 requests per minute
    });

    const rateLimitHeaders = getRateLimitHeaders(rateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimit.retryAfter
        },
        { 
          status: 429,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    // 3. Parse query params
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get('merchant_id');
    const subscriber = searchParams.get('subscriber');
    const planId = searchParams.get('plan_id');

    // 4. Validate required params
    if (!merchantId || !subscriber) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: merchant_id, subscriber',
          code: 'INVALID_REQUEST'
        },
        { 
          status: 400,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    // 4.1 Validate input formats
    if (typeof merchantId !== 'string' || !merchantId.startsWith('MERCH_')) {
      return NextResponse.json(
        {
          error: 'Invalid merchant_id format',
          code: 'INVALID_MERCHANT_ID'
        },
        { 
          status: 400,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    if (typeof subscriber !== 'string' || subscriber.length < 10 || subscriber.length > 128) {
      return NextResponse.json(
        {
          error: 'Invalid subscriber address format',
          code: 'INVALID_SUBSCRIBER'
        },
        { 
          status: 400,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    if (planId && (typeof planId !== 'string' || !planId.startsWith('plan_'))) {
      return NextResponse.json(
        {
          error: 'Invalid plan_id format',
          code: 'INVALID_PLAN_ID'
        },
        { 
          status: 400,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    // 5. Verify merchant_id matches authenticated merchant
    if (merchantId !== merchant.merchant_id) {
      return NextResponse.json(
        {
          error: 'merchant_id does not match authenticated merchant',
          code: 'MERCHANT_MISMATCH'
        },
        { 
          status: 403,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    const supabase = await createClient();

    // 6. Build subscription query
    let query = supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        cancelled_at,
        created_at,
        subscription_plans (
          id,
          plan_id,
          name,
          description,
          price,
          currency,
          interval,
          trial_days
        )
      `)
      .eq('merchant_id', merchant.id)
      .eq('subscriber_address', subscriber.toLowerCase());

    // Filter by plan_id (custom ID) if specified
    if (planId) {
      // First get plan UUID from custom plan_id
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('plan_id', planId)
        .eq('merchant_id', merchant.id)
        .single();
      
      if (planData) {
        query = query.eq('plan_id', planData.id);
      } else {
        // Plan not found, return empty
        return NextResponse.json(
          {
            isActive: false,
            subscriptions: [],
            message: 'Plan not found',
            responseTime: `${Date.now() - startTime}ms`
          },
          { 
            status: 200,
            headers: {
              ...rateLimitHeaders,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
            }
          }
        );
      }
    }

    // Only active or trialing subscriptions that haven't expired
    query = query
      .in('status', ['active', 'trialing'])
      .gte('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false });

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('[SubscriptionCheck] Query error:', error);
      return NextResponse.json(
        {
          error: 'Failed to query subscriptions',
          code: 'QUERY_FAILED'
        },
        { 
          status: 500,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    // 7. Format response - Return minimal necessary data
    const responseTime = Date.now() - startTime;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        {
          isActive: false,
          message: 'No active subscriptions found',
          responseTime: `${responseTime}ms`
        },
        { 
          status: 200,
          headers: {
            ...rateLimitHeaders,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
          }
        }
      );
    }

    // Map to minimal subscription info
    const minimalSubscriptions = subscriptions.map(sub => {
      const plan = Array.isArray(sub.subscription_plans) 
        ? sub.subscription_plans[0] 
        : sub.subscription_plans;
      
      return {
        id: sub.id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        plan: {
          plan_id: plan?.plan_id,
          name: plan?.name,
          price: plan?.price,
          currency: plan?.currency,
          interval: plan?.interval
        }
      };
    });

    // Return most recent subscription (minimal info)
    return NextResponse.json(
      {
        isActive: true,
        subscription: minimalSubscriptions[0],
        count: subscriptions.length,
        responseTime: `${responseTime}ms`
      },
      { 
        status: 200,
        headers: {
          ...rateLimitHeaders,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
        }
      }
    );

  } catch (error: any) {
    console.error('[SubscriptionCheck] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
        }
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
      }
    }
  );
}
