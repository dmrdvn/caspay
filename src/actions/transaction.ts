'use server';

import type { TransactionItem } from 'src/types/transaction';

import { createServerSupabaseClient } from 'src/lib/supabase-server';

export async function getTransactions(): Promise<TransactionItem[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (merchantError || !merchant) {
    throw new Error('Merchant not found');
  }

  const { data, error } = await supabase
    .from('payment_analytics')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('payment_created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }

  const transactions: TransactionItem[] = (data || []).map((payment: any) => ({
    id: payment.payment_id,
    merchant_id: payment.merchant_id,
    transaction_hash: payment.transaction_hash,
    block_height: payment.block_height,
    block_timestamp: payment.payment_created_at,
    payer_address: payment.payer_address,
    product_id: payment.product_id,
    subscription_plan_id: payment.subscription_plan_id,
    amount: payment.amount,
    token: payment.token,
    decimals: payment.decimals,
    usd_value: payment.usd_value,
    exchange_rate: payment.exchange_rate,
    platform_fee_bps: 0, 
    platform_fee_amount: null,
    net_amount: null,
    status: payment.status,
    payment_type: payment.payment_type,
    invoice_number: payment.invoice_number,
    invoice_url: payment.invoice_url,
    
    paylink_id: payment.paylink_id || null,
    payment_source: payment.payment_source || 'sdk',
    
    metadata: payment.payment_metadata,
    created_at: payment.payment_created_at,
    
    store_name: payment.store_name,
    merchant_identifier: payment.merchant_identifier,
    product_name: payment.product_name,
    plan_name: payment.plan_name,
    billing_interval: payment.billing_interval,
  }));

  return transactions;
}

export async function getTransaction(transactionId: string): Promise<TransactionItem | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (merchantError || !merchant) {
    throw new Error('Merchant not found');
  }

  const { data, error } = await supabase
    .from('payment_analytics')
    .select('*')
    .eq('payment_id', transactionId)
    .eq('merchant_id', merchant.id)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  if (!data) return null;

  const transaction: TransactionItem = {
    id: data.payment_id,
    merchant_id: data.merchant_id,
    transaction_hash: data.transaction_hash,
    block_height: data.block_height,
    block_timestamp: data.payment_created_at,
    payer_address: data.payer_address,
    product_id: data.product_id,
    subscription_plan_id: data.subscription_plan_id,
    amount: data.amount,
    token: data.token,
    decimals: data.decimals,
    usd_value: data.usd_value,
    exchange_rate: data.exchange_rate,
    platform_fee_bps: 0,
    platform_fee_amount: null,
    net_amount: null,
    status: data.status,
    payment_type: data.payment_type,
    invoice_number: data.invoice_number,
    invoice_url: data.invoice_url,
    
    paylink_id: data.paylink_id || null,
    payment_source: data.payment_source || 'sdk',
    
    metadata: data.payment_metadata,
    created_at: data.payment_created_at,
    
    store_name: data.store_name,
    merchant_identifier: data.merchant_identifier,
    product_name: data.product_name,
    plan_name: data.plan_name,
    billing_interval: data.billing_interval,
  };

  return transaction;
}
