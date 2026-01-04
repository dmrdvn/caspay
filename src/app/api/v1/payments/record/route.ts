import type { NextRequest} from 'next/server';

import { NextResponse } from 'next/server';

import { createClient } from 'src/lib/supabase';
import { checkRateLimit, getRateLimitHeaders } from 'src/lib/api/rate-limit';
import { recordPayment, createSubscription } from 'src/lib/api/contract-service';
import { triggerWebhooks } from 'src/lib/api/trigger-webhook';
import { isValidationError, validatePublicApiKey } from 'src/lib/api/validate-api-key';
import { verifyTransaction, checkTransactionProcessed } from 'src/lib/api/verify-transaction';

/**
 * Payment Recording API
 * 
 * POST /api/v1/payments/record
 * 
 * Security:
 * - API key authentication
 * - Rate limiting (60 req/min per merchant)
 * - On-chain transaction verification
 * - Idempotency (prevent duplicate records)
 * 
 * Request body:
 * {
 *   "merchant_id": "merchant_xyz_789",
 *   "transaction_hash": "abc123...",
 *   "product_id": "prod_001",           // optional, for one-time payments
 *   "subscription_plan_id": "plan_001", // optional, for subscriptions
 *   "amount": 100,
 *   "currency": "CSPR"
 * }
 */

// Helper: Add CORS headers to any headers object
function addCorsHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validate API key
    const apiKey = req.headers.get('X-CasPay-Key');
    const merchant = await validatePublicApiKey(apiKey, 'write:payments');

    if (isValidationError(merchant)) {
      return NextResponse.json(
        { error: merchant.error, code: merchant.code },
        { 
          status: merchant.status,
          headers: addCorsHeaders()
        }
      );
    }

    // 2. Rate limiting
    const rateLimit = checkRateLimit(`merchant:${merchant.merchant_id}`, {
      maxRequests: 60,
      windowMs: 60000 // 60 requests per minute
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
          headers: addCorsHeaders(rateLimitHeaders)
        }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const {
      merchant_id,
      transaction_hash,
      product_id,
      subscription_plan_id,
      amount,
      currency = 'CSPR',
      sender_address // NEW: Get sender address from user
    } = body;

    // 4. Validate required fields
    if (!merchant_id || !transaction_hash || !amount || !sender_address) {
      return NextResponse.json(
        {
          error: 'Missing required fields: merchant_id, transaction_hash, amount, sender_address',
          code: 'INVALID_REQUEST'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    // 4.1 Validate input types and ranges
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid amount: must be a positive number',
          code: 'INVALID_AMOUNT'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    if (amount > 1000000) { // Max 1M to prevent overflow attacks
      return NextResponse.json(
        {
          error: 'Amount exceeds maximum allowed value',
          code: 'AMOUNT_TOO_LARGE'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    if (typeof transaction_hash !== 'string' || transaction_hash.length < 10 || transaction_hash.length > 128) {
      return NextResponse.json(
        {
          error: 'Invalid transaction_hash format',
          code: 'INVALID_TX_HASH'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    if (typeof merchant_id !== 'string' || !merchant_id.startsWith('MERCH_')) {
      return NextResponse.json(
        {
          error: 'Invalid merchant_id format',
          code: 'INVALID_MERCHANT_ID'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    // 5. Verify merchant_id matches authenticated merchant
    if (merchant_id !== merchant.merchant_id) {
      return NextResponse.json(
        {
          error: 'merchant_id does not match authenticated merchant',
          code: 'MERCHANT_MISMATCH'
        },
        { status: 403, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    // 6. At least one of product_id or subscription_plan_id required
    if (!product_id && !subscription_plan_id) {
      return NextResponse.json(
        {
          error: 'Either product_id or subscription_plan_id is required',
          code: 'INVALID_REQUEST'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    const supabase = await createClient();

    // 7. Check idempotency - prevent duplicate processing
    const alreadyProcessed = await checkTransactionProcessed(transaction_hash, supabase);
    if (alreadyProcessed) {
      // Return existing payment record (minimal fields)
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, transaction_hash, amount, token, status, invoice_number, created_at')
        .eq('transaction_hash', transaction_hash)
        .single();

      return NextResponse.json(
        {
          success: true,
          message: 'Payment already recorded',
          payment: existingPayment,
          duplicate: true
        },
        { 
          status: 200, 
          headers: addCorsHeaders(rateLimitHeaders)
        }
      );
    }

    // 8. Verify transaction on Casper blockchain 
    const verification = await verifyTransaction(
      transaction_hash,
      merchant.wallet_address,
      amount,
      sender_address 
    );

    if (!verification.valid) {
      return NextResponse.json(
        {
          error: verification.error || 'Transaction verification failed',
          code: 'VERIFICATION_FAILED'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    // 8.1 Ensure sender address exists
    if (!verification.sender) {
      return NextResponse.json(
        {
          error: 'Transaction sender address not found',
          code: 'SENDER_MISSING'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    // 9. Determine payment type and create record
    let paymentRecord: any;

    if (subscription_plan_id) {
      // Subscription payment - query by plan_id (custom ID) instead of UUID
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_id', subscription_plan_id)
        .eq('merchant_id', merchant.id)
        .single();

      if (!plan) {
        return NextResponse.json(
          {
            error: 'Subscription plan not found',
            code: 'PLAN_NOT_FOUND'
          },
          { status: 404, headers: addCorsHeaders(rateLimitHeaders) }
        );
      }

      // Check if subscriber already has ANY subscription for this plan (active, inactive, expired)
      const { data: existingSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('plan_id', plan.id)
        .eq('subscriber_address', verification.sender)
        .order('created_at', { ascending: false })
        .limit(1);

      const existingSubscription = existingSubscriptions?.[0];
      let subscriptionId: string;

      if (existingSubscription) {
        // Check if it's active and not expired
        const isActive = 
          existingSubscription.status === 'active' && 
          new Date(existingSubscription.current_period_end) > new Date();

        if (isActive) {
          // Extend active subscription
          const currentPeriodEnd = new Date(existingSubscription.current_period_end);
          const newPeriodEnd = new Date(currentPeriodEnd);
          
          // Add interval
          if (plan.interval === 'monthly') {
            newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
          } else if (plan.interval === 'yearly') {
            newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
          }

          const { data: updatedSub, error: updateError } = await supabase
            .from('subscriptions')
            .update({
              current_period_end: newPeriodEnd.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSubscription.id)
            .select()
            .single();

          if (updateError || !updatedSub) {
            console.error('[PaymentRecord] Subscription update error:', updateError);
            return NextResponse.json(
              {
                error: 'Failed to renew subscription. Please try again.',
                code: 'SUBSCRIPTION_RENEWAL_FAILED'
              },
              { 
                status: 500,
                headers: addCorsHeaders(rateLimitHeaders)
              }
            );
          }

          subscriptionId = updatedSub.id;
        } else {
          // Reactivate expired/cancelled subscription
          const currentPeriodStart = new Date();
          const currentPeriodEnd = new Date();
          
          if (plan.interval === 'monthly') {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
          } else if (plan.interval === 'yearly') {
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
          }

          const { data: reactivatedSub, error: reactivateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: currentPeriodStart.toISOString(),
              current_period_end: currentPeriodEnd.toISOString(),
              cancel_at_period_end: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSubscription.id)
            .select()
            .single();

          if (reactivateError || !reactivatedSub) {
            console.error('[PaymentRecord] Subscription reactivation error:', reactivateError);
            return NextResponse.json(
              {
                error: 'Failed to reactivate subscription. Please try again.',
                code: 'SUBSCRIPTION_REACTIVATION_FAILED'
              },
              { 
                status: 500,
                headers: addCorsHeaders(rateLimitHeaders)
              }
            );
          }

          subscriptionId = reactivatedSub.id;
        }
      } else {
        // Create new subscription
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        
        if (plan.interval === 'monthly') {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        } else if (plan.interval === 'yearly') {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        }

        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            merchant_id: merchant.id,
            plan_id: plan.id, // Use DB ID
            subscriber_address: verification.sender,
            status: 'active',
            current_period_start: currentPeriodStart.toISOString(),
            current_period_end: currentPeriodEnd.toISOString(),
            cancel_at_period_end: false
          })
          .select()
          .single();

        if (insertError || !newSub) {
          console.error('[PaymentRecord] Subscription insert error:', insertError);
          
          // User-friendly error messages
          let errorMessage = 'Failed to create subscription. Please try again.';
          let errorCode = 'SUBSCRIPTION_CREATE_FAILED';
          
          if (insertError?.code === '23505') {
            // Duplicate key - race condition or data inconsistency
            errorMessage = 'You already have an active subscription for this plan.';
            errorCode = 'SUBSCRIPTION_ALREADY_EXISTS';
          }
          
          return NextResponse.json(
            {
              error: errorMessage,
              code: errorCode
            },
            { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
          );
        }

        subscriptionId = newSub.id;
      }

      // Record subscription payment (use DB ID)
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          merchant_id: merchant.id,
          subscription_plan_id: plan.id, // DB UUID
          transaction_hash,
          payer_address: verification.sender,
          amount,
          token: currency === 'CSPR' ? 'NATIVE' : currency,
          payment_type: 'subscription', // ✅ Zorunlu alan
          block_timestamp: verification.timestamp || new Date().toISOString(),
          status: 'confirmed'
        })
        .select()
        .single();

      if (paymentError || !payment) {
        console.error('[PaymentRecord] Payment insert error:', paymentError);
        
        let errorMessage = 'Failed to record payment. Please try again.';
        let errorCode = 'PAYMENT_RECORD_FAILED';
        
        if (paymentError?.code === '23505') {
          errorMessage = 'This transaction has already been processed.';
          errorCode = 'DUPLICATE_TRANSACTION';
        }
        
        return NextResponse.json(
          {
            error: errorMessage,
            code: errorCode
          },
          { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
        );
      }

      paymentRecord = payment;

      // Step 2: Write to blockchain contract (subscription payment + subscription creation)
      try {
        // 2a. Record payment on blockchain (only 3 parameters)
        const paymentDeployHash = await recordPayment(
          verification.sender, // Payer wallet address
          null, // No product_id for subscriptions
          plan.plan_id // plan_xxx
        );
        
        console.log('[PaymentRecord] Subscription payment recorded on blockchain:', paymentDeployHash);

        // 2b. Create subscription on blockchain (if new subscription)
        if (!existingSubscription || existingSubscription.status !== 'active') {
          const subscriptionDeployHash = await createSubscription(
            subscriptionId, // Supabase UUID for subscription
            merchant.merchant_id, // MERCH_xxx
            verification.sender, // Subscriber wallet address
            plan.plan_id // plan_xxx
          );
          
          console.log('[PaymentRecord] Subscription created on blockchain:', subscriptionDeployHash);
        }
      } catch (contractError: any) {
        console.error('[PaymentRecord] Blockchain write failed:', contractError);
      }

      // Trigger webhook
      await triggerWebhooks(
        supabase,
        merchant.merchant_id,
        existingSubscription ? 'subscription.renewed' : 'subscription.created',
        {
          subscription_id: subscriptionId,
          plan_id: subscription_plan_id,
          payment_id: payment.id,
          transaction_hash,
          subscriber: verification.sender,
          amount,
          currency
        }
      );

    } else {
      // One-time product payment - query by product_id (custom ID)
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', product_id)
        .eq('merchant_id', merchant.id)
        .single();

      if (!product) {
        return NextResponse.json(
          {
            error: 'Product not found',
            code: 'PRODUCT_NOT_FOUND'
          },
          { status: 404, headers: addCorsHeaders(rateLimitHeaders) }
        );
      }

      // Record payment
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          merchant_id: merchant.id,
          product_id: product.id, 
          transaction_hash,
          payer_address: verification.sender,
          amount,
          token: currency === 'CSPR' ? 'NATIVE' : currency,
          payment_type: 'product', 
          block_timestamp: verification.timestamp || new Date().toISOString(),
          status: 'confirmed'
        })
        .select()
        .single();

      if (paymentError || !payment) {
        console.error('[PaymentRecord] Insert error:', paymentError);
        
        let errorMessage = 'Failed to record payment. Please try again.';
        let errorCode = 'PAYMENT_RECORD_FAILED';
        
        if (paymentError?.code === '23505') {
          errorMessage = 'This transaction has already been processed.';
          errorCode = 'DUPLICATE_TRANSACTION';
        }
        
        return NextResponse.json(
          {
            error: errorMessage,
            code: errorCode
          },
          { status: 400, headers: addCorsHeaders(rateLimitHeaders) }
        );
      }

      paymentRecord = payment;

      // Step 2: Write to blockchain contract 
      try {
        const deployHash = await recordPayment(
          verification.sender, // Payer wallet address
          product.product_id, // prod_xxx
          null // No subscription_plan_id for products
        );
        
        console.log('[PaymentRecord] Product payment recorded on blockchain:', deployHash);
      } catch (contractError: any) {
        console.error('[PaymentRecord] Blockchain write failed:', contractError);
      }

      // Trigger webhook
      await triggerWebhooks(
        supabase,
        merchant.merchant_id,
        'payment.received',
        {
          payment_id: payment.id,
          product_id,
          transaction_hash,
          payer: verification.sender,
          amount,
          currency
        }
      );
    }

    // 10. Success response 
    const responseTime = Date.now() - startTime;
    
    // Minimal payment info
    const paymentResponse = {
      id: paymentRecord.id,
      transaction_hash: paymentRecord.transaction_hash,
      amount: paymentRecord.amount,
      token: paymentRecord.token,
      status: paymentRecord.status,
      invoice_number: paymentRecord.invoice_number,
      created_at: paymentRecord.created_at
    };
    
    return NextResponse.json(
      {
        success: true,
        payment: paymentResponse,
        verification: {
          verified: true,
          transaction_hash: verification.deployHash,
          amount: verification.amount
        },
        responseTime: `${responseTime}ms`
      },
      { 
        status: 200, 
        headers: {
          ...rateLimitHeaders,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key'
        }
      }
    );

  } catch (error: any) {
    console.error('[PaymentRecord] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { 
        status: 500,
        headers: addCorsHeaders()
      }
    );
  }
}


export async function OPTIONS(req: NextRequest) {

  const origin = req.headers.get('origin');
  
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*', 
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key',
        'Access-Control-Max-Age': '86400', // 24 hours
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      }
    }
  );
}
