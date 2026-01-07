export type MerchantAnalytics = {
  id: string;
  user_id: string;
  merchant_id: string;
  store_name: string;
  wallet_address: string;
  merchant_status: string;
  accepted_tokens: string[];
  total_products: number;
  active_products: number;
  inactive_products: number;
  total_subscription_plans: number;
  active_plans: number;
  inactive_plans: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  expired_subscriptions: number;
  total_subscriptions: number;
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  product_sales: number;
  subscription_charges: number;
  total_customers: number;
  total_subscribers: number;
  total_revenue_usd: number;
  total_revenue_native: number;
  monthly_revenue_usd: number;
  monthly_revenue_native: number;
  success_rate: number;
  merchant_created_at: string;
  last_payment_at: string | null;
  last_successful_payment_at: string | null;
};

export type TopPerformingItem = {
  id: string;
  name: string;
  type: 'product' | 'subscription_plan';
  price: number;
  sales_count: number;
  total_revenue: number;
  image_url: string | null;
};

export type RecentTransaction = {
  id: string;
  payment_id: string;
  type: 'order1' | 'order2' | 'order3' | 'order4';
  title: string;
  time: string;
  amount: number;
  status: string;
};

export type MonthlyActivity = {
  month: string;
  products_sold: number;
  new_subscriptions: number;
  cancellations: number;
};
