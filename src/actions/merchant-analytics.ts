'use server';

import type {
  MonthlyActivity,
  MerchantAnalytics,
  TopPerformingItem,
  RecentTransaction,
} from 'src/types/merchant-analytics';

import { createClient } from 'src/lib/supabase';

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

export async function getTopPerformingItems(
  merchantId: string,
  limit: number = 10
): Promise<{ data: TopPerformingItem[]; error: Error | null }> {
  try {
    const supabase = await createClient();

    const { data: topProducts, error: productsError } = await supabase
      .from('products')
      .select('id, product_id, name, price, image_url')
      .eq('merchant_id', merchantId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productsError) throw productsError;

    const { data: topPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, plan_id, name, price')
      .eq('merchant_id', merchantId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (plansError) throw plansError;

    const productIds = (topProducts || []).map((p) => p.id);
    const planIds = (topPlans || []).map((p) => p.id);

    const { data: productPayments, error: productPaymentsError } = await supabase
      .from('payments')
      .select('product_id, usd_value')
      .eq('merchant_id', merchantId)
      .eq('payment_type', 'product')
      .eq('status', 'confirmed')
      .in('product_id', productIds.length > 0 ? productIds : ['none']);

    if (productPaymentsError) throw productPaymentsError;

    const { data: subPayments, error: subPaymentsError } = await supabase
      .from('payments')
      .select('subscription_plan_id, usd_value')
      .eq('merchant_id', merchantId)
      .eq('payment_type', 'subscription')
      .eq('status', 'confirmed')
      .in('subscription_plan_id', planIds.length > 0 ? planIds : ['none']);

    if (subPaymentsError) throw subPaymentsError;

    const productStats = new Map<string, { count: number; revenue: number }>();
    (productPayments || []).forEach((p) => {
      const current = productStats.get(p.product_id) || { count: 0, revenue: 0 };
      productStats.set(p.product_id, {
        count: current.count + 1,
        revenue: current.revenue + (p.usd_value || 0),
      });
    });

    const planStats = new Map<string, { count: number; revenue: number }>();
    (subPayments || []).forEach((p) => {
      const current = planStats.get(p.subscription_plan_id) || { count: 0, revenue: 0 };
      planStats.set(p.subscription_plan_id, {
        count: current.count + 1,
        revenue: current.revenue + (p.usd_value || 0),
      });
    });

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

    items.sort((a, b) => b.sales_count - a.sales_count);

    return { data: items.slice(0, limit), error: null };
  } catch (error) {
    console.error('Error fetching top performing items:', error);
    return { data: [], error: error as Error };
  }
}

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

export async function getMonthlyActivity(
  merchantId: string,
  year: number = 2025
): Promise<{ data: MonthlyActivity[]; error: Error | null }> {
  try {
    const supabase = await createClient();

    const { data: productSales, error: productError } = await supabase
      .from('payment_analytics')
      .select('payment_created_at')
      .eq('merchant_id', merchantId)
      .eq('payment_type', 'product')
      .eq('status', 'confirmed')
      .gte('payment_created_at', `${year}-01-01`)
      .lt('payment_created_at', `${year + 1}-01-01`);

    if (productError) throw productError;

    const { data: newSubs, error: subsError } = await supabase
      .from('subscriptions')
      .select('created_at')
      .eq('merchant_id', merchantId)
      .gte('created_at', `${year}-01-01`)
      .lt('created_at', `${year + 1}-01-01`);

    if (subsError) throw subsError;

    const { data: cancelled, error: cancelError } = await supabase
      .from('subscriptions')
      .select('updated_at, status')
      .eq('merchant_id', merchantId)
      .eq('status', 'cancelled')
      .gte('updated_at', `${year}-01-01`)
      .lt('updated_at', `${year + 1}-01-01`);

    if (cancelError) throw cancelError;

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
