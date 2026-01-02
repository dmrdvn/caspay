import type { WebhookEvent } from 'src/types/webhook';

// ----------------------------------------------------------------------

/**
 * Generate webhook signature for payload
 * Uses HMAC-SHA256
 * @param payload - Webhook payload object
 * @param secret - Webhook signing secret
 * @returns Signature hex string
 */
export async function generateWebhookSignature(
  payload: WebhookEvent,
  secret: string
): Promise<string> {
  const payloadString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payloadString);

  // Import key for HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the payload
  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  // Convert to hex string
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return signatureHex;
}

/**
 * Verify webhook signature
 * @param payload - Received webhook payload
 * @param signature - Received signature to verify
 * @param secret - Webhook signing secret
 * @returns True if signature is valid
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert hex signature to ArrayBuffer
    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    // Verify signature
    return await crypto.subtle.verify('HMAC', key, signatureBytes, messageData);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Generate a webhook signing secret
 * @returns Random 32-character secret
 */
export function generateWebhookSecret(): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const values = new Uint8Array(32);
  crypto.getRandomValues(values);

  let result = '';
  for (let i = 0; i < 32; i += 1) {
    result += charset[values[i] % charset.length];
  }

  return `whsec_${result}`;
}

/**
 * Check if event type matches filter patterns
 * Supports wildcards (e.g., 'payment.*' matches 'payment.completed')
 * @param eventType - Event type to check
 * @param patterns - Filter patterns (e.g., ['payment.*', 'subscription.created'] or ['*'])
 * @returns True if event matches any pattern
 */
export function matchesEventFilter(eventType: string, patterns: string[]): boolean {
  // If patterns include '*', match all events
  if (patterns.includes('*')) {
    return true;
  }

  return patterns.some((pattern) => {
    // Exact match
    if (pattern === eventType) {
      return true;
    }

    // Wildcard match (e.g., 'payment.*' matches 'payment.completed')
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(`${prefix}.`);
    }

    return false;
  });
}

/**
 * Generate event ID for webhook
 * Format: evt_{timestamp}_{random}
 * @returns Event ID string
 */
export function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `evt_${timestamp}_${random}`;
}

/**
 * Calculate next retry time using exponential backoff
 * @param attemptCount - Current attempt number (1-based)
 * @param maxRetries - Maximum retry attempts (default: 5)
 * @returns Next retry timestamp, or null if max retries reached
 */
export function calculateNextRetry(attemptCount: number, maxRetries: number = 5): Date | null {
  if (attemptCount >= maxRetries) {
    return null;
  }

  // Exponential backoff: 1min, 5min, 25min, 2h, 10h
  const delays = [60, 300, 1500, 7200, 36000]; // seconds
  const delay = delays[Math.min(attemptCount, delays.length - 1)];

  const nextRetry = new Date();
  nextRetry.setSeconds(nextRetry.getSeconds() + delay);

  return nextRetry;
}
