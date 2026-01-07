'use server';

import { supabase } from 'src/lib/supabase';
import type {
  PayLink,
  PayLinkCreateInput,
  PayLinkUpdateInput,
  PayLinkWithProduct,
  PayLinkStats,
  CreatePayLinkResponse,
} from 'src/types/paylink';

async function generateSlug(productName: string): Promise<string> {
  const baseSlug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const { data } = await supabase
      .from('paylinks')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (!data) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

export async function createPayLink(
  input: PayLinkCreateInput
): Promise<CreatePayLinkResponse> {
  try {

    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, wallet_address')
      .eq('id', input.merchant_id)
      .single();

    if (merchantError || !merchant) {
      throw new Error('Merchant not found');
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, merchant_id')
      .eq('id', input.product_id)
      .eq('merchant_id', merchant.id)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    const slug = await generateSlug(product.name);

    const { data, error } = await supabase
      .from('paylinks')
      .insert({
        product_id: input.product_id,
        merchant_id: merchant.id,
        slug,
        wallet_address: input.wallet_address || merchant.wallet_address,
        fee_percentage: input.fee_percentage ?? 2.0,
        payment_methods: input.payment_methods ?? ['wallet', 'fiat'],
        expires_at: input.expires_at,
        max_uses: input.max_uses,
        custom_message: input.custom_message,
        custom_success_url: input.custom_success_url,
        custom_button_text: input.custom_button_text ?? 'Pay Now',
        metadata: input.metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('[createPayLink] Error:', error);
      throw new Error(error.message);
    }

    const publicUrl = `https://caspay.link/pay/${slug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

    const { data: updatedPaylink } = await supabase
      .from('paylinks')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', data.id)
      .select()
      .single();

    return {
      paylink: (updatedPaylink || { ...data, qr_code_url: qrCodeUrl }) as PayLink,
      public_url: publicUrl,
      qr_code_url: qrCodeUrl,
    };
  } catch (error: any) {
    console.error('[createPayLink] Error:', error);
    throw error;
  }
}

export async function getPayLinks(merchantId: string): Promise<PayLinkWithProduct[]> {
  try {
    const { data, error } = await supabase
      .from('paylinks')
      .select(
        `
        *,
        product:products (
          id,
          name,
          description,
          price,
          currency,
          image_url,
          images
        ),
        merchant:merchants (
          id,
          store_name,
          logo_url,
          brand_color
        )
      `
      )
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getPayLinks] Error:', error);
      throw new Error(error.message);
    }

    return (data || []) as PayLinkWithProduct[];
  } catch (error: any) {
    console.error('[getPayLinks] Error:', error);
    throw error;
  }
}

export async function getPayLinkBySlug(slug: string): Promise<PayLinkWithProduct | null> {
  try {
    const { data, error } = await supabase
      .from('paylinks')
      .select(
        `
        *,
        product:products (
          id,
          name,
          description,
          price,
          currency,
          image_url,
          images
        ),
        merchant:merchants (
          id,
          store_name,
          logo_url,
          brand_color
        )
      `
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('[getPayLinkBySlug] Error:', error);
      return null;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      return null;
    }

    return data as PayLinkWithProduct;
  } catch (error: any) {
    console.error('[getPayLinkBySlug] Error:', error);
    return null;
  }
}

export async function getPayLink(id: string, merchantId: string): Promise<PayLinkWithProduct | null> {
  try {
    const { data, error } = await supabase
      .from('paylinks')
      .select(
        `
        *,
        product:products (
          id,
          name,
          description,
          price,
          currency,
          image_url,
          images
        ),
        merchant:merchants (
          id,
          store_name,
          logo_url,
          brand_color
        )
      `
      )
      .eq('id', id)
      .eq('merchant_id', merchantId)
      .single();

    if (error) {
      console.error('[getPayLink] Error:', error);
      return null;
    }

    return data as PayLinkWithProduct;
  } catch (error: any) {
    console.error('[getPayLink] Error:', error);
    return null;
  }
}

export async function updatePayLink(
  id: string,
  input: PayLinkUpdateInput
): Promise<PayLink> {
  try {
    const { data, error } = await supabase
      .from('paylinks')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updatePayLink] Error:', error);
      throw new Error(error.message);
    }

    return data as PayLink;
  } catch (error: any) {
    console.error('[updatePayLink] Error:', error);
    throw error;
  }
}

export async function deletePayLink(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('paylinks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deletePayLink] Error:', error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('[deletePayLink] Error:', error);
    throw error;
  }
}

export async function trackPayLinkEvent(
  paylinkId: string,
  eventType: 'view' | 'payment_initiated' | 'payment_completed' | 'payment_failed',
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    referer?: string;
    country?: string;
    payment_method?: 'wallet' | 'fiat';
    fiat_provider?: string;
    [key: string]: any;
  }
): Promise<void> {
  try {
    const { error } = await supabase.from('paylink_analytics').insert({
      paylink_id: paylinkId,
      event_type: eventType,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      referer: metadata?.referer,
      country: metadata?.country,
      payment_method: metadata?.payment_method,
      fiat_provider: metadata?.fiat_provider,
      metadata: metadata ? { ...metadata } : null,
    });

    if (error) {
      console.error('[trackPayLinkEvent] Error:', error);
    }
  } catch (error: any) {
    console.error('[trackPayLinkEvent] Error:', error);
  }
}

export async function incrementPayLinkUsage(paylinkId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_paylink_usage', {
      paylink_id: paylinkId,
    });

    if (error) {
      console.error('[incrementPayLinkUsage] Error:', error);
    }
  } catch (error: any) {
    console.error('[incrementPayLinkUsage] Error:', error);
  }
}

export async function getPayLinkStats(
  paylinkId: string,
  merchantId: string
): Promise<PayLinkStats | null> {
  try {

    const { data: paylink, error: paylinkError } = await supabase
      .from('paylinks')
      .select('slug, product:products(name)')
      .eq('id', paylinkId)
      .eq('merchant_id', merchantId)
      .single();

    if (paylinkError || !paylink) {
      return null;
    }

    const { data: analytics, error: analyticsError } = await supabase
      .from('paylink_analytics')
      .select('event_type, payment_method, created_at')
      .eq('paylink_id', paylinkId);

    if (analyticsError) {
      console.error('[getPayLinkStats] Analytics error:', analyticsError);
      return null;
    }

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('net_amount, payment_source, created_at')
      .eq('paylink_id', paylinkId)
      .eq('status', 'confirmed');

    if (paymentsError) {
      console.error('[getPayLinkStats] Payments error:', paymentsError);
    }

    const totalViews = analytics?.filter((a: any) => a.event_type === 'view').length || 0;
    const totalPayments = payments?.length || 0;
    const totalRevenue = payments?.reduce((sum: number, p: any) => sum + (Number(p.net_amount) || 0), 0) || 0;
    const conversionRate = totalViews > 0 ? (totalPayments / totalViews) * 100 : 0;

    const walletPayments =
      payments?.filter((p: any) => p.payment_source === 'paylink_wallet').length || 0;
    const fiatPayments =
      payments?.filter((p: any) => p.payment_source === 'paylink_fiat').length || 0;

    const lastPayment = payments?.[0];

    return {
      paylink_id: paylinkId,
      slug: paylink.slug,
      product_name: (paylink.product as any)?.name || 'Unknown',
      total_views: totalViews,
      total_payments: totalPayments,
      total_revenue: totalRevenue,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      payment_methods: {
        wallet: walletPayments,
        fiat: fiatPayments,
      },
      last_payment_at: lastPayment?.created_at || null,
    };
  } catch (error: any) {
    console.error('[getPayLinkStats] Error:', error);
    return null;
  }
}

export async function getAllPayLinkStats(merchantId: string): Promise<PayLinkStats[]> {
  try {
    const { data: paylinks, error: paylinksError } = await supabase
      .from('paylinks')
      .select('id')
      .eq('merchant_id', merchantId);

    if (paylinksError || !paylinks) {
      return [];
    }

    const stats = await Promise.all(
      paylinks.map((paylink: any) => getPayLinkStats(paylink.id, merchantId))
    );

    return stats.filter((s): s is PayLinkStats => s !== null);
  } catch (error: any) {
    console.error('[getAllPayLinkStats] Error:', error);
    return [];
  }
}
