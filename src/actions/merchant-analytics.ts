'use server';


import { createClient } from 'src/lib/supabase';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

export async function getMerchantAnalytics(
  merchantId: string
): Promise<{ data: MerchantAnalytics | null; error: Error | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('merchant_analytics')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching merchant analytics:', error);
    return { data: null, error: error as Error };
  }
}

// ----------------------------------------------------------------------

export async function getTopPerformingItems(
  merchantId: string,
  limit: number = 10
): Promise<{ data: TopPerformingItem[]; error: Error | null }> {
  try {
    const supabase = await createClient();

    // Get products with their sales count from payments
    const { data: topProducts, error: productsError } = await supabase
      .from('products')
      .select('id, product_id, name, price, image_url')
      .eq('merchant_id', merchantId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productsError) throw productsError;

    // Get subscription plans
    const { data: topPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, plan_id, name, price')
      .eq('merchant_id', merchantId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (plansError) throw plansError;

    // Get payment counts for products
    const productIds = (topProducts || []).map((p) => p.id);
    const planIds = (topPlans || []).map((p) => p.id);

    // Get product payment stats
    const { data: productPayments, error: productPaymentsError } = await supabase
      .from('payments')
      .select('product_id, usd_value')
      .eq('merchant_id', merchantId)
      .eq('payment_type', 'product')
      .eq('status', 'confirmed')
      .in('product_id', productIds.length > 0 ? productIds : ['none']);

    if (productPaymentsError) throw productPaymentsError;

    // Get subscription payment stats
    const { data: subPayments, error: subPaymentsError } = await supabase
      .from('payments')
      .select('subscription_plan_id, usd_value')
      .eq('merchant_id', merchantId)
      .eq('payment_type', 'subscription')
      .eq('status', 'confirmed')
      .in('subscription_plan_id', planIds.length > 0 ? planIds : ['none']);

    if (subPaymentsError) throw subPaymentsError;

    // Calculate sales count and revenue for products
    const productStats = new Map<string, { count: number; revenue: number }>();
    (productPayments || []).forEach((p) => {
      const current = productStats.get(p.product_id) || { count: 0, revenue: 0 };
      productStats.set(p.product_id, {
        count: current.count + 1,
        revenue: current.revenue + (p.usd_value || 0),
      });
    });

    // Calculate sales count and revenue for plans
    const planStats = new Map<string, { count: number; revenue: number }>();
    (subPayments || []).forEach((p) => {
      const current = planStats.get(p.subscription_plan_id) || { count: 0, revenue: 0 };
      planStats.set(p.subscription_plan_id, {
        count: current.count + 1,
        revenue: current.revenue + (p.usd_value || 0),
      });
    });

    // Combine and format results
    const items: TopPerformingItem[] = [
      ...(topProducts || []).map((product) => {
        const stats = productStats.get(product.id) || { count: 0, revenue: 0 };
        return {
          id: product.id,
          name: product.name,
          type: 'product' as const,
          price: product.price || 0,
          sales_count: stats.count,
          total_revenue: stats.revenue,
          image_url: product.image_url,
        };
      }),
      ...(topPlans || []).map((plan) => {
        const stats = planStats.get(plan.id) || { count: 0, revenue: 0 };
        return {
          id: plan.id,
          name: plan.name,
          type: 'subscription_plan' as const,
          price: plan.price || 0,
          sales_count: stats.count,
          total_revenue: stats.revenue,
          image_url: null,
        };
      }),
    ];

    // Sort by sales count descending
    items.sort((a, b) => b.sales_count - a.sales_count);

    return { data: items.slice(0, limit), error: null };
  } catch (error) {
    console.error('Error fetching top performing items:', error);
    return { data: [], error: error as Error };
  }
}

// ----------------------------------------------------------------------

export async function getRecentTransactions(
  merchantId: string,
  limit: number = 5
): Promise<{ data: RecentTransaction[]; error: Error | null }> {
  try {
    const supabase = await createClient();

    const { data: payments, error } = await supabase
      .from('payment_analytics')
      .select('payment_id, payment_type, product_name, plan_name, usd_value, status, payment_created_at')
      .eq('merchant_id', merchantId)
      .order('payment_created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Format transactions
    const transactions: RecentTransaction[] = (payments || []).map((payment, index) => {
      const typeMap = ['order1', 'order2', 'order3', 'order4'] as const;
      const title =
        payment.payment_type === 'product'
          ? `Product Sale: ${payment.product_name || 'Unknown'}`
          : `Subscription: ${payment.plan_name || 'Unknown'}`;

      return {
        id: payment.payment_id,
        payment_id: payment.payment_id,
        type: typeMap[index % 4],
        title,
        time: payment.payment_created_at,
        amount: payment.usd_value || 0,
        status: payment.status,
      };
    });

    return { data: transactions, error: null };
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return { data: [], error: error as Error };
  }
}

// ----------------------------------------------------------------------

export async function getMonthlyActivity(
  merchantId: string,
  year: number = 2025
): Promise<{ data: MonthlyActivity[]; error: Error | null }> {
  try {
    const supabase = await createClient();

    // Get monthly product sales
    const { data: productSales, error: productError } = await supabase
      .from('payment_analytics')
      .select('payment_created_at')
      .eq('merchant_id', merchantId)
      .eq('payment_type', 'product')
      .eq('status', 'confirmed')
      .gte('payment_created_at', `${year}-01-01`)
      .lt('payment_created_at', `${year + 1}-01-01`);

    if (productError) throw productError;

    // Get monthly new subscriptions
    const { data: newSubs, error: subsError } = await supabase
      .from('subscriptions')
      .select('created_at')
      .eq('merchant_id', merchantId)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`);

    if (subsError) throw subsError;

    // Get monthly cancellations
    const { data: cancelled, error: cancelError } = await supabase
      .from('subscriptions')
      .select('updated_at, status')
      .eq('merchant_id', merchantId)
      .eq('status', 'cancelled')
      .gte('updated_at', `${year}-01-01`)
      .lt('updated_at', `${year + 1}-01-01`);

    if (cancelError) throw cancelError;

    // Aggregate by month
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const monthlyData: MonthlyActivity[] = months.map((month, index) => {
      const monthNum = index + 1;
      
      const products = (productSales || []).filter(
        (p) => new Date(p.payment_created_at).getMonth() + 1 === monthNum
      ).length;

      const subs = (newSubs || []).filter(
        (s) => new Date(s.created_at).getMonth() + 1 === monthNum
      ).length;

      const cancels = (cancelled || []).filter(
        (c) => new Date(c.updated_at).getMonth() + 1 === monthNum
      ).length;

      return {
        month,
        products_sold: products,
        new_subscriptions: subs,
        cancellations: cancels,
      };
    });

    return { data: monthlyData, error: null };
  } catch (error) {
    console.error('Error fetching monthly activity:', error);
    return { data: [], error: error as Error };
  }
}
