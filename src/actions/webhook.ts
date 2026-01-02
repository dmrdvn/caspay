'use server';

import type {
  WebhookEndpoint,
  WebhookDelivery,
  WebhookTestResult,
  CreateWebhookInput,
  UpdateWebhookInput,
} from 'src/types/webhook';

import { generateWebhookSecret } from 'src/utils/webhook';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

/**
 * Get all webhook endpoints for a merchant
 * @param merchantId - Merchant ID
 * @returns List of webhook endpoints
 */
export async function getWebhookEndpoints(merchantId: string): Promise<WebhookEndpoint[]> {
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching webhook endpoints:', error);
    throw new Error(`Failed to fetch webhook endpoints: ${error.message}`);
  }

  return data as WebhookEndpoint[];
}

/**
 * Get a single webhook endpoint by ID
 * @param endpointId - Webhook endpoint ID
 * @returns Webhook endpoint details
 */
export async function getWebhookEndpointById(endpointId: string): Promise<WebhookEndpoint> {
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('id', endpointId)
    .single();

  if (error) {
    console.error('Error fetching webhook endpoint:', error);
    throw new Error(`Failed to fetch webhook endpoint: ${error.message}`);
  }

  return data as WebhookEndpoint;
}

/**
 * Create a new webhook endpoint
 * @param input - Webhook creation input
 * @returns Newly created webhook endpoint
 */
export async function createWebhookEndpoint(input: CreateWebhookInput): Promise<WebhookEndpoint> {
  const { merchant_id, url, description, events } = input;

  // Generate webhook secret
  const secret = generateWebhookSecret();

  // Insert into database
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .insert({
      merchant_id,
      url,
      secret,
      description,
      events: events || ['*'],
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating webhook endpoint:', error);
    throw new Error(`Failed to create webhook endpoint: ${error.message}`);
  }

  return data as WebhookEndpoint;
}

/**
 * Update an existing webhook endpoint
 * @param endpointId - Webhook endpoint ID
 * @param input - Update input
 * @returns Updated webhook endpoint
 */
export async function updateWebhookEndpoint(
  endpointId: string,
  input: UpdateWebhookInput
): Promise<WebhookEndpoint> {
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .update(input)
    .eq('id', endpointId)
    .select()
    .single();

  if (error) {
    console.error('Error updating webhook endpoint:', error);
    throw new Error(`Failed to update webhook endpoint: ${error.message}`);
  }

  return data as WebhookEndpoint;
}

/**
 * Delete a webhook endpoint
 * @param endpointId - Webhook endpoint ID
 */
export async function deleteWebhookEndpoint(endpointId: string): Promise<void> {
  const { error } = await supabase.from('webhook_endpoints').delete().eq('id', endpointId);

  if (error) {
    console.error('Error deleting webhook endpoint:', error);
    throw new Error(`Failed to delete webhook endpoint: ${error.message}`);
  }
}

/**
 * Toggle webhook endpoint active status
 * @param endpointId - Webhook endpoint ID
 * @returns Updated webhook endpoint
 */
export async function toggleWebhookStatus(endpointId: string): Promise<WebhookEndpoint> {
  // Get current status
  const { data: currentEndpoint, error: fetchError } = await supabase
    .from('webhook_endpoints')
    .select('active')
    .eq('id', endpointId)
    .single();

  if (fetchError || !currentEndpoint) {
    throw new Error('Failed to fetch current webhook endpoint');
  }

  // Toggle status
  return updateWebhookEndpoint(endpointId, { active: !currentEndpoint.active });
}

/**
 * Regenerate webhook secret
 * @param endpointId - Webhook endpoint ID
 * @returns Updated webhook endpoint with new secret
 */
export async function regenerateWebhookSecret(endpointId: string): Promise<WebhookEndpoint> {
  const newSecret = generateWebhookSecret();

  const { data, error } = await supabase
    .from('webhook_endpoints')
    .update({ secret: newSecret })
    .eq('id', endpointId)
    .select()
    .single();

  if (error) {
    console.error('Error regenerating webhook secret:', error);
    throw new Error(`Failed to regenerate webhook secret: ${error.message}`);
  }

  return data as WebhookEndpoint;
}

/**
 * Test a webhook endpoint by sending a test event
 * @param endpointId - Webhook endpoint ID
 * @returns Test result with response details
 */
export async function testWebhookEndpoint(endpointId: string): Promise<WebhookTestResult> {
  const startTime = Date.now();

  try {
    // Get endpoint details
    const endpoint = await getWebhookEndpointById(endpointId);

    // Create test payload
    const testPayload = {
      id: 'evt_test_' + Math.random().toString(36).substring(2, 10),
      type: 'test.webhook',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          message: 'This is a test webhook from CasPay',
          timestamp: new Date().toISOString(),
        },
      },
    };

    // Send POST request to webhook URL
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CasPay-Signature': 'test_signature',
      },
      body: JSON.stringify(testPayload),
    });

    const duration = Date.now() - startTime;
    const responseBody = await response.text();

    return {
      success: response.ok,
      status_code: response.status,
      response_body: responseBody,
      error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
      duration_ms: duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      status_code: null,
      response_body: null,
      error: error.message || 'Unknown error occurred',
      duration_ms: duration,
    };
  }
}

/**
 * Get webhook delivery logs for an endpoint
 * @param endpointId - Webhook endpoint ID
 * @param limit - Maximum number of deliveries to return (default: 50)
 * @returns List of webhook deliveries
 */
export async function getWebhookDeliveries(
  endpointId: string,
  limit: number = 50
): Promise<WebhookDelivery[]> {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('webhook_endpoint_id', endpointId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching webhook deliveries:', error);
    throw new Error(`Failed to fetch webhook deliveries: ${error.message}`);
  }

  return data as WebhookDelivery[];
}

/**
 * Get recent webhook deliveries for all endpoints of a merchant
 * @param merchantId - Merchant ID
 * @param limit - Maximum number of deliveries to return (default: 50)
 * @returns List of webhook deliveries
 */
export async function getRecentWebhookDeliveries(
  merchantId: string,
  limit: number = 50
): Promise<WebhookDelivery[]> {
  // First get all endpoint IDs for this merchant
  const { data: endpoints, error: endpointsError } = await supabase
    .from('webhook_endpoints')
    .select('id')
    .eq('merchant_id', merchantId);

  if (endpointsError) {
    throw new Error(`Failed to fetch webhook endpoints: ${endpointsError.message}`);
  }

  const endpointIds = endpoints.map((e) => e.id);

  // Get deliveries for these endpoints
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .in('webhook_endpoint_id', endpointIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching webhook deliveries:', error);
    throw new Error(`Failed to fetch webhook deliveries: ${error.message}`);
  }

  return data as WebhookDelivery[];
}

/**
 * Retry a failed webhook delivery
 * @param deliveryId - Webhook delivery ID
 * @returns Updated delivery record
 */
export async function retryWebhookDelivery(deliveryId: string): Promise<WebhookDelivery> {
  // Get delivery details
  const { data: delivery, error: fetchError } = await supabase
    .from('webhook_deliveries')
    .select('*, webhook_endpoints(*)')
    .eq('id', deliveryId)
    .single();

  if (fetchError || !delivery) {
    throw new Error('Failed to fetch webhook delivery');
  }

  // TODO: Implement actual retry logic with webhook sending
  // For now, just increment attempt count
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .update({
      attempt_count: delivery.attempt_count + 1,
      next_retry_at: null,
    })
    .eq('id', deliveryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to retry webhook delivery: ${error.message}`);
  }

  return data as WebhookDelivery;
}
