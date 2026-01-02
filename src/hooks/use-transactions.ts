'use client';

import type { SWRConfiguration } from 'swr';
import type { TransactionItem } from 'src/actions/transaction';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
};

// ----------------------------------------------------------------------

/**
 * Fetch all transactions for a specific merchant from payment_analytics view
 */
async function fetchTransactions(merchantId: string | undefined): Promise<TransactionItem[]> {
  if (!merchantId) return [];

  try {
    const { data, error } = await supabase
      .from('payment_analytics')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('payment_created_at', { ascending: false });

    if (error) throw error;

    // Map payment_analytics to TransactionItem
    const transactions: TransactionItem[] = (data || []).map((row: any) => ({
      id: row.payment_id,
      merchant_id: row.merchant_id,
      transaction_hash: row.transaction_hash,
      block_height: row.block_height,
      block_timestamp: row.block_timestamp,
      payer_address: row.payer_address,
      product_id: row.product_id,
      subscription_plan_id: row.subscription_plan_id,
      amount: row.amount,
      token: row.token,
      decimals: row.decimals,
      usd_value: row.usd_value,
      exchange_rate: row.exchange_rate,
      platform_fee_bps: row.platform_fee_bps,
      platform_fee_amount: row.platform_fee_amount,
      net_amount: row.net_amount,
      status: row.payment_status,
      payment_type: row.payment_type,
      invoice_number: row.invoice_number,
      invoice_url: row.invoice_url,
      metadata: row.payment_metadata,
      created_at: row.payment_created_at,
      
      // From joined tables
      store_name: row.store_name,
      merchant_identifier: row.merchant_identifier,
      product_name: row.product_name,
      plan_name: row.plan_name,
      billing_interval: row.billing_interval,
      
      // From subscriptions table
      subscription_id: row.subscription_id,
      subscription_status: row.subscription_status,
      subscription_start: row.subscription_start,
      subscription_end: row.subscription_end,
    }));

    return transactions;
  } catch (error) {
    console.error('[fetchTransactions] Error:', error);
    throw error;
  }
}

/**
 * Fetch a single transaction by ID
 */
async function fetchTransaction(transactionId: string | undefined): Promise<TransactionItem | null> {
  if (!transactionId) return null;

  try {
    const { data, error } = await supabase
      .from('payment_analytics')
      .select('*')
      .eq('payment_id', transactionId)
      .single();

    if (error) throw error;

    // Map to TransactionItem
    const transaction: TransactionItem = {
      id: data.payment_id,
      merchant_id: data.merchant_id,
      transaction_hash: data.transaction_hash,
      block_height: data.block_height,
      block_timestamp: data.block_timestamp,
      payer_address: data.payer_address,
      product_id: data.product_id,
      subscription_plan_id: data.subscription_plan_id,
      amount: data.amount,
      token: data.token,
      decimals: data.decimals,
      usd_value: data.usd_value,
      exchange_rate: data.exchange_rate,
      platform_fee_bps: data.platform_fee_bps,
      platform_fee_amount: data.platform_fee_amount,
      net_amount: data.net_amount,
      status: data.payment_status,
      payment_type: data.payment_type,
      invoice_number: data.invoice_number,
      invoice_url: data.invoice_url,
      metadata: data.payment_metadata,
      created_at: data.payment_created_at,
      
      // From joined tables
      store_name: data.store_name,
      merchant_identifier: data.merchant_identifier,
      product_name: data.product_name,
      plan_name: data.plan_name,
      billing_interval: data.billing_interval,
      
      // From subscriptions table
      subscription_id: data.subscription_id,
      subscription_status: data.subscription_status,
      subscription_start: data.subscription_start,
      subscription_end: data.subscription_end,
    };

    return transaction;
  } catch (error) {
    console.error('[fetchTransaction] Error:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching all transactions for a merchant
 * Uses SWR for caching and automatic revalidation
 */
export function useTransactions(merchantId: string | null | undefined) {
  const {
    data: transactions,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    merchantId ? ['transactions', merchantId] : null,
    () => fetchTransactions(merchantId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      transactions: transactions || [],
      isLoading,
      isValidating,
      error,
      isEmpty: !isLoading && !transactions?.length,
      refetch: revalidate,
    }),
    [transactions, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching a single transaction by ID
 * Uses SWR for caching and automatic revalidation
 */
export function useTransaction(transactionId: string | null | undefined) {
  const {
    data: transaction,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    transactionId ? ['transaction', transactionId] : null,
    () => fetchTransaction(transactionId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      transaction: transaction || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [transaction, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}
