
export type SubscriptionPlanInterval = 'weekly' | 'monthly' | 'yearly';

export type SubscriptionPlanFeature = {
  name: string;
  included: boolean;
  limit?: number; 
};

export type SubscriptionPlan = {
  id: string;
  merchant_id: string;
  plan_id: string; 
  name: string;
  description: string | null;
  price: number;
  currency: string;
  token_address: string;
  interval: SubscriptionPlanInterval;
  interval_count: number;
  trial_days: number;
  features: SubscriptionPlanFeature[] | null;
  metadata: Record<string, any> | null;
  active: boolean;
  transaction_hash: string | null; 
  created_at: string;
  updated_at: string;
};

export type SubscriptionPlanCreateInput = {
  merchant_id: string;
  plan_id?: string; 
  name: string;
  description?: string;
  price: number;
  currency?: string;
  token_address?: string;
  interval: SubscriptionPlanInterval;
  interval_count?: number;
  trial_days?: number;
  features?: SubscriptionPlanFeature[];
  metadata?: Record<string, any>;
  active?: boolean;
};

export type SubscriptionPlanUpdateInput = {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  token_address?: string;
  interval?: SubscriptionPlanInterval;
  interval_count?: number;
  trial_days?: number;
  features?: SubscriptionPlanFeature[];
  metadata?: Record<string, any>;
  active?: boolean;
};

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'paused'
  | 'cancelled'
  | 'past_due'
  | 'expired';

export type Subscription = {
  id: string;
  merchant_id: string;
  plan_id: string;
  subscriber_address: string;
  on_chain_key: string | null;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  next_charge_date: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  cancel_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  failed_payment_count: number;
  last_payment_error: string | null;
  last_payment_attempt_at: string | null;
  metadata: Record<string, any> | null;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionWithPlan = Subscription & {
  plan: SubscriptionPlan;
};

export type SubscriptionCreateInput = {
  merchant_id: string;
  plan_id: string;
  subscriber_address: string;
  current_period_start: string;
  current_period_end: string;
  trial_days?: number;
  metadata?: Record<string, any>;
};

export type SubscriptionUpdateInput = {
  status?: SubscriptionStatus;
  cancel_at_period_end?: boolean;
  cancellation_reason?: string;
  metadata?: Record<string, any>;
};

export type SubscriptionChargeStatus = 'pending' | 'success' | 'failed';

export type SubscriptionCharge = {
  id: string;
  subscription_id: string;
  payment_id: string | null;
  amount: number;
  token: string;
  status: SubscriptionChargeStatus;
  failure_reason: string | null;
  failure_code: string | null;
  transaction_hash: string | null;
  period_start: string;
  period_end: string;
  charged_at: string;
  attempt_number: number;
  created_at: string;
};

export type SubscriptionChargeWithDetails = SubscriptionCharge & {
  subscription: SubscriptionWithPlan;
};

export type SubscriptionPlanFilters = {
  interval: SubscriptionPlanInterval[];
  priceRange: [number, number] | null;
  active: boolean | null;
};

export type SubscriptionFilters = {
  status: SubscriptionStatus[];
  planIds: string[];
  dateRange: [Date | null, Date | null];
};
