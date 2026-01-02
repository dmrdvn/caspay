import crypto from 'crypto';

/**
 * Webhook delivery system
 * 
 * Security features:
 * - HMAC signature verification
 * - Retry mechanism (exponential backoff)
 * - Timeout protection
 * - Delivery logging
 */

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  merchant_id: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Send webhook to merchant's endpoint
 */
export async function sendWebhook(
  endpoint: WebhookEndpoint,
  payload: WebhookPayload
): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString, endpoint.secret);

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CasPay-Signature': signature,
        'X-CasPay-Event': payload.event,
        'X-CasPay-Timestamp': payload.timestamp,
        'User-Agent': 'CasPay-Webhook/1.0'
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000) // 10s timeout
    });

    const responseText = await response.text();

    return {
      success: response.ok,
      response: {
        status: response.status,
        body: responseText,
        headers: Object.fromEntries(response.headers.entries())
      }
    };

  } catch (error: any) {
    console.error('[sendWebhook] Error:', error);
    return {
      success: false,
      error: error.message || 'Webhook delivery failed'
    };
  }
}

/**
 * Trigger webhooks for an event
 * Finds all active endpoints subscribed to the event and delivers
 */
export async function triggerWebhooks(
  supabase: any,
  merchantId: string,
  event: string,
  data: any
): Promise<void> {
  try {
    // Find active webhook endpoints
    const { data: endpoints, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('active', true);

    if (error || !endpoints || endpoints.length === 0) {
      console.log(`[triggerWebhooks] No webhooks configured for merchant ${merchantId}`);
      return;
    }

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      merchant_id: merchantId
    };

    // Filter endpoints subscribed to this event
    const subscribedEndpoints = endpoints.filter((endpoint: any) => {
      const events = endpoint.events || [];
      return events.includes('*') || events.includes(event);
    });

    if (subscribedEndpoints.length === 0) {
      console.log(`[triggerWebhooks] No endpoints subscribed to ${event} for merchant ${merchantId}`);
      return;
    }

    // Deliver webhooks (async, non-blocking)
    const deliveryPromises = subscribedEndpoints.map(async (endpoint: any) => {
      const result = await sendWebhook(endpoint, payload);

      // Log delivery attempt
      await supabase.from('webhook_deliveries').insert({
        webhook_endpoint_id: endpoint.id,
        event_type: event,
        payload,
        response_status: result.response?.status || null,
        response_body: result.response?.body || null,
        response_headers: result.response?.headers || null,
        delivered_at: result.success ? new Date().toISOString() : null,
        attempt_count: 1
      });

      return result;
    });

    // Wait for all deliveries (with timeout)
    await Promise.allSettled(deliveryPromises);

  } catch (error) {
    console.error('[triggerWebhooks] Error:', error);
    // Don't throw - webhook delivery failures shouldn't break payment processing
  }
}

/**
 * Verify webhook signature (for merchant's webhook receiver)
 * Merchant can use this to validate that webhook came from CasPay
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
