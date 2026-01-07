'use client';

import type { SWRConfiguration } from 'swr';
import type { TransactionItem } from 'src/types/transaction';

import useSWR from 'swr';
import { useMemo } from 'react';

import {
  getTransactions as getTransactionsAction,
  getTransaction as getTransactionAction,
} from 'src/actions/transaction';

const SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
};

async function fetchTransactions(merchantId: string | undefined): Promise<TransactionItem[]> {
  if (!merchantId) return [];

  try {
    return await getTransactionsAction();
  } catch (error) {
    console.error('[fetchTransactions] Error:', error);
    throw error;
  }
}

async function fetchTransaction(transactionId: string | undefined): Promise<TransactionItem | null> {
  if (!transactionId) return null;

  try {
    return await getTransactionAction(transactionId);
  } catch (error) {
    console.error('[fetchTransaction] Error:', error);
    throw error;
  }
}

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
