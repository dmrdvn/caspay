// ----------------------------------------------------------------------

/**
 * Webhook event types for CasPay platform
 * These events are triggered by Casper Network explorer listener
 */
export type WebhookEventType =
  // Payment Events (triggered when contract receives balance)
  | 'payment.received'       // Contract'a ödeme geldi (explorer detected)
  | 'payment.confirmed'      // Ödeme onaylandı (N block confirmations)
  | 'payment.failed'         // Ödeme başarısız oldu
  
  // Subscription Events
  | 'subscription.created'   // Yeni abonelik başladı
  | 'subscription.renewed'   // Abonelik yenilendi
  | 'subscription.cancelled' // Abonelik iptal edildi
  | 'subscription.expired'   // Abonelik süresi doldu
  
  // Invoice Events
  | 'invoice.created'        // Fatura oluşturuldu
  | 'invoice.paid'           // Fatura ödendi
  
  // Payout Events (merchant withdraws balance)
  | 'payout.initiated'       // Para çekme başlatıldı
  | 'payout.completed'       // Para çekme tamamlandı
  | 'payout.failed'          // Para çekme başarısız
  
  // Contract Events
  | 'contract.deployed'      // Contract başarıyla deploy edildi
  | 'contract.error';        // Contract hatası oluştu

/**
 * Webhook delivery status
 */
export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retry_scheduled';

// ----------------------------------------------------------------------

/**
 * Webhook endpoint entity
 */
export type WebhookEndpoint = {
  id: string;
  merchant_id: string;
  url: string;
  secret: string;
  description: string | null;
  events: string[]; // Event type filters (e.g., ['payment.*', 'subscription.*'] or ['*'] for all)
  active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Webhook endpoint creation input
 */
export type CreateWebhookInput = {
  merchant_id: string;
  url: string;
  description?: string;
  events?: string[]; // Defaults to ['*']
};

/**
 * Webhook endpoint update input
 */
export type UpdateWebhookInput = {
  url?: string;
  description?: string;
  events?: string[];
  active?: boolean;
};

/**
 * Webhook delivery log
 */
export type WebhookDelivery = {
  id: string;
  webhook_endpoint_id: string;
  event_type: WebhookEventType;
  payload: Record<string, any>;
  response_status: number | null;
  response_body: string | null;
  response_headers: Record<string, string> | null;
  attempt_count: number;
  delivered_at: string | null;
  next_retry_at: string | null;
  created_at: string;
};

/**
 * Webhook event payload structure
 */
export type WebhookEvent<T = any> = {
  id: string; // Event ID (evt_xxx)
  type: WebhookEventType;
  created: number; // Unix timestamp
  data: {
    object: T;
  };
};

/**
 * Webhook test result
 */
export type WebhookTestResult = {
  success: boolean;
  status_code: number | null;
  response_body: string | null;
  error: string | null;
  duration_ms: number;
};

/**
 * Webhook delivery summary for UI
 */
export type WebhookDeliverySummary = {
  endpoint_id: string;
  endpoint_url: string;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  last_delivery_at: string | null;
  last_delivery_status: WebhookDeliveryStatus | null;
};
