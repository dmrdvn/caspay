import type { NextRequest} from 'next/server';

import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase';
import { checkRateLimit, getRateLimitHeaders } from 'src/lib/api/rate-limit';
import { recordPayment, createSubscription } from 'src/lib/api/contract-service';
import { triggerWebhooks } from 'src/lib/api/trigger-webhook';
import { isValidationError, validatePublicApiKey } from 'src/lib/api/validate-api-key';
import { verifyTransaction, checkTransactionProcessed } from 'src/lib/api/verify-transaction';

function addCorsHeaders(headers: Record<string, string> = {}, origin?: string | null): Record<string, string> {
  
  const corsOrigin = origin || 'https://caspay.link';
  
  return {
    ...headers,
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CasPay-Key',
    'Access-Control-Allow-Credentials': 'true'
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const origin = req.headers.get('origin');
    const apiKey = req.headers.get('X-CasPay-Key');
    const merchant = await validatePublicApiKey(apiKey, 'write:payments', origin);

    if (isValidationError(merchant)) {
      return NextResponse.json(
        { error: merchant.error, code: merchant.code },
        { 
          status: merchant.status,
          headers: addCorsHeaders({}, origin)
        }
      );
    }

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
          headers: addCorsHeaders(rateLimitHeaders, origin)
        }
      );
    }

    const body = await req.json();
    const {
      merchant_id,
      transaction_hash,
      product_id,
      subscription_plan_id,
      amount,
      currency = 'CSPR',
      sender_address
    } = body;

    if (!merchant_id || !transaction_hash || !amount || !sender_address) {
      return NextResponse.json(
        {
          error: 'Missing required fields: merchant_id, transaction_hash, amount, sender_address',
          code: 'INVALID_REQUEST'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid amount: must be a positive number',
          code: 'INVALID_AMOUNT'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    if (amount > 1000000) {
      return NextResponse.json(
        {
          error: 'Amount exceeds maximum allowed value',
          code: 'AMOUNT_TOO_LARGE'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    if (typeof transaction_hash !== 'string' || transaction_hash.length < 10 || transaction_hash.length > 128) {
      return NextResponse.json(
        {
          error: 'Invalid transaction_hash format',
          code: 'INVALID_TX_HASH'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    if (typeof merchant_id !== 'string' || !merchant_id.startsWith('MERCH_')) {
      return NextResponse.json(
        {
          error: 'Invalid merchant_id format',
          code: 'INVALID_MERCHANT_ID'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    if (merchant_id !== merchant.merchant_id) {
      return NextResponse.json(
        {
          error: 'merchant_id does not match authenticated merchant',
          code: 'MERCHANT_MISMATCH'
        },
        { status: 403, headers: addCorsHeaders(rateLimitHeaders) }
      );
    }

    if (!product_id && !subscription_plan_id) {
      return NextResponse.json(
        {
          error: 'Either product_id or subscription_plan_id is required',
          code: 'INVALID_REQUEST'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    const supabase = supabaseAdmin;

    const alreadyProcessed = await checkTransactionProcessed(transaction_hash, supabase);
    if (alreadyProcessed) {
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
          headers: addCorsHeaders(rateLimitHeaders, origin)
        }
      );
    }

    const maxRetries = 3;
    const retryDelay = 3000;
    let verification: any = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      verification = await verifyTransaction(
        transaction_hash,
        merchant.wallet_address,
        amount,
        sender_address,
        merchant.network || 'testnet'
      );

      if (verification.valid) {
        break;
      }

      if (attempt < maxRetries && verification.error?.includes('not found')) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    if (!verification || !verification.valid) {
      return NextResponse.json(
        {
          error: verification.error || 'Transaction verification failed',
          code: 'VERIFICATION_FAILED'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    if (!verification.sender) {
      return NextResponse.json(
        {
          error: 'Transaction sender address not found',
          code: 'SENDER_MISSING'
        },
        { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
      );
    }

    let paymentRecord: any;

    if (subscription_plan_id) {
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
          { status: 404, headers: addCorsHeaders(rateLimitHeaders, origin) }
        );
      }

      const { data: existingSubscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('merchant_id', merchant.id)
        .eq('plan_id', plan.id)
        .eq('subscriber_address', verification.sender.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1);

      const existingSubscription = existingSubscriptions?.[0];
      let subscriptionId: string;

      if (existingSubscription) {
        const isActive = 
          existingSubscription.status === 'active' && 
          new Date(existingSubscription.current_period_end) > new Date();

        if (isActive) {
          const currentPeriodEnd = new Date(existingSubscription.current_period_end);
          const newPeriodEnd = new Date(currentPeriodEnd);
          if (plan.interval === 'weekly') {
            newPeriodEnd.setDate(newPeriodEnd.getDate() + 7);
          } else if (plan.interval === 'monthly') {
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
            return NextResponse.json(
              {
                error: 'Failed to renew subscription. Please try again.',
                code: 'SUBSCRIPTION_RENEWAL_FAILED'
              },
              { 
                status: 500,
                headers: addCorsHeaders(rateLimitHeaders, origin)
              }
            );
          }

          subscriptionId = updatedSub.id;
        } else {
          const currentPeriodStart = new Date();
          const currentPeriodEnd = new Date();
          
          if (plan.interval === 'weekly') {
            currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7);
          } else if (plan.interval === 'monthly') {
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
            return NextResponse.json(
              {
                error: 'Failed to reactivate subscription. Please try again.',
                code: 'SUBSCRIPTION_REACTIVATION_FAILED'
              },
              { 
                status: 500,
                headers: addCorsHeaders(rateLimitHeaders, origin)
              }
            );
          }

          subscriptionId = reactivatedSub.id;
        }
      } else {
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        
        if (plan.interval === 'weekly') {
          currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7);
        } else if (plan.interval === 'monthly') {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        } else if (plan.interval === 'yearly') {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        }

        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            merchant_id: merchant.id,
            plan_id: plan.id,
            subscriber_address: verification.sender.toLowerCase(),
            status: 'active',
            current_period_start: currentPeriodStart.toISOString(),
            current_period_end: currentPeriodEnd.toISOString(),
            cancel_at_period_end: false
          })
          .select()
          .single();

        if (insertError || !newSub) {
          let errorMessage = 'Failed to create subscription. Please try again.';
          let errorCode = 'SUBSCRIPTION_CREATE_FAILED';
          
          if (insertError?.code === '23505') {
            errorMessage = 'You already have an active subscription for this plan.';
            errorCode = 'SUBSCRIPTION_ALREADY_EXISTS';
          }
          
          return NextResponse.json(
            {
              error: errorMessage,
              code: errorCode
            },
            { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
          );
        }

        subscriptionId = newSub.id;
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          merchant_id: merchant.id,
          subscription_plan_id: plan.id,
          transaction_hash,
          payer_address: verification.sender,
          amount,
          token: currency === 'CSPR' ? 'NATIVE' : currency,
          payment_type: 'subscription',
          block_timestamp: verification.timestamp || new Date().toISOString(),
          status: 'confirmed'
        })
        .select()
        .single();

      if (paymentError || !payment) {
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
          { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
        );
      }

      paymentRecord = payment;

      try {
        await recordPayment(
          verification.sender,
          null,
          plan.plan_id,
          merchant.network || 'testnet'
        );
        if (!existingSubscription || existingSubscription.status !== 'active') {
          await createSubscription(
            subscriptionId,
            merchant.merchant_id,
            verification.sender,
            plan.plan_id,
            merchant.network || 'testnet'
          );
        }
      } catch (contractError: any) {
        console.error('Contract recording failed:', contractError);
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
          { status: 404, headers: addCorsHeaders(rateLimitHeaders, origin) }
        );
      }

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
          { status: 400, headers: addCorsHeaders(rateLimitHeaders, origin) }
        );
      }

      paymentRecord = payment;

      try {
        await recordPayment(
          verification.sender,
          product.product_id,
          null,
          merchant.network || 'testnet'
        );
      } catch (contractError: any) {
        console.error('Contract recording failed:', contractError);
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

    const responseTime = Date.now() - startTime;
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
        headers: addCorsHeaders(rateLimitHeaders, origin)
      }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { 
        status: 500,
        headers: addCorsHeaders({}, req.headers.get('origin'))
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
        ...addCorsHeaders({}, origin),
        'Access-Control-Max-Age': '86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      }
    }
  );
}
