
export interface PayLink {
  id: string;
  product_id: string;
  merchant_id: string;

  // PayLink Properties
  slug: string;
  qr_code_url: string | null;

  // Payment Settings
  wallet_address: string;
  fee_percentage: number;
  payment_methods: ('wallet' | 'fiat')[];

  // Limits
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;

  // Customization
  custom_message: string | null;
  custom_success_url: string | null;
  custom_button_text: string;

  // Metadata
  metadata: Record<string, any> | null;

  created_at: string;
  updated_at: string;
}

export interface PayLinkCreateInput {
  merchant_id: string;
  product_id: string;
  wallet_address?: string;
  fee_percentage?: number;
  payment_methods?: ('wallet' | 'fiat')[];
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
  payment_methods?: ('wallet' | 'fiat')[];
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
}

export interface PayLinkAnalyticsEvent {
  id: string;
  paylink_id: string;
  event_type: 'view' | 'payment_initiated' | 'payment_completed' | 'payment_failed';
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  country: string | null;
  payment_method: 'wallet' | 'fiat' | null;
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
  };
  last_payment_at: string | null;
}

export interface CreatePayLinkResponse {
  paylink: PayLink;
  public_url: string;
  qr_code_url: string;
}
