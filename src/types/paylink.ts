
export interface PayLink {
  id: string;
  product_id: string;
  merchant_id: string;

  slug: string;
  qr_code_url: string | null;

  wallet_address: string;
  fee_percentage: number;
  payment_methods: ('wallet' | 'fiat' | 'bridge')[];
  network?: 'testnet' | 'mainnet';

  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;

  custom_message: string | null;
  custom_success_url: string | null;
  custom_button_text: string;

  metadata: Record<string, any> | null;

  created_at: string;
  updated_at: string;
}

export interface PayLinkCreateInput {
  merchant_id: string;
  product_id: string;
  wallet_address?: string;
  fee_percentage?: number;
  payment_methods?: ('wallet' | 'fiat' | 'bridge')[];
  network?: 'testnet' | 'mainnet';
  expires_at?: string;
  max_uses?: number;
  custom_message?: string;
  custom_success_url?: string;
  custom_button_text?: string;
  metadata?: Record<string, any>;
}

export interface PayLinkUpdateInput {
  wallet_address?: string;
  fee_percentage?: number;
  payment_methods?: ('wallet' | 'fiat' | 'bridge')[];
  network?: 'testnet' | 'mainnet';
  is_active?: boolean;
  expires_at?: string;
  max_uses?: number;
  custom_message?: string;
  custom_success_url?: string;
  custom_button_text?: string;
  metadata?: Record<string, any>;
}

export interface PayLinkWithProduct extends PayLink {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    image_url: string | null;
    images: string[] | null;
  };
  merchant: {
    id: string;
    store_name: string;
    logo_url: string | null;
    brand_color: string | null;
  };
  total_revenue?: number;
}

export interface PayLinkAnalyticsEvent {
  id: string;
  paylink_id: string;
  event_type: 'view' | 'payment_initiated' | 'payment_completed' | 'payment_failed';
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  country: string | null;
  payment_method: 'wallet' | 'fiat' | 'bridge' | null;
  fiat_provider: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface PayLinkStats {
  paylink_id: string;
  slug: string;
  product_name: string;
  total_views: number;
  total_payments: number;
  total_revenue: number;
  conversion_rate: number;
  payment_methods: {
    wallet: number;
    fiat: number;
    bridge: number;
  };
  last_payment_at: string | null;
}

export interface CreatePayLinkResponse {
  paylink: PayLink;
  public_url: string;
  qr_code_url: string;
}

export type FulfillmentType =
  | 'none'
  | 'digital_download'
  | 'license_key'
  | 'service_access'
  | 'donation'
  | 'coupon_voucher'
  | 'event_ticket'
  | 'content_access'
  | 'custom_message';

export interface DigitalDownloadFulfillment {
  url: string;
  file_name?: string;
  expires_hours?: number;
}

export interface LicenseKeyFulfillment {
  key: string;
  instructions?: string;
}

export interface ServiceAccessFulfillment {
  access_url: string;
  username?: string;
  instructions?: string;
}

export interface DonationFulfillment {
  campaign_name?: string;
  thank_you_note?: string;
}

export interface CouponVoucherFulfillment {
  coupon_code: string;
  discount_info?: string;
  expires_at?: string;
}

export interface EventTicketFulfillment {
  event_name: string;
  event_date: string;
  ticket_code: string;
  venue?: string;
  additional_info?: string;
}

export interface ContentAccessFulfillment {
  content_url: string;
  access_duration_days?: number;
  instructions?: string;
}

export interface CustomMessageFulfillment {
  title: string;
  message: string;
}

export interface FulfillmentMetadata {
  fulfillment_type: FulfillmentType;
  redirect_delay?: number;
  digital_download?: DigitalDownloadFulfillment;
  license_key?: LicenseKeyFulfillment;
  service_access?: ServiceAccessFulfillment;
  donation?: DonationFulfillment;
  coupon_voucher?: CouponVoucherFulfillment;
  event_ticket?: EventTicketFulfillment;
  content_access?: ContentAccessFulfillment;
  custom_message?: CustomMessageFulfillment;
}

export interface PayLinkCreateInputWithFulfillment extends Omit<PayLinkCreateInput, 'metadata'> {
  fulfillment_type?: FulfillmentType;
  fulfillment_data?: Partial<FulfillmentMetadata>;
}
