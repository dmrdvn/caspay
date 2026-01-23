'use client';

import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { useMemo, useCallback } from 'react';

import {
  checkPaymentStatus as checkPaymentStatusAction,
  createPendingPayment as createPendingPaymentAction,
  cancelPendingPayment as cancelPendingPaymentAction,
  recordPayLinkPayment as recordPayLinkPaymentAction,
  recordBridgePayment as recordBridgePaymentAction,
  verifyPendingPayments as verifyPendingPaymentsAction,
} from 'src/actions/payment';

// ----------------------------------------------------------------------

const SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, 
  errorRetryCount: 3,
  errorRetryInterval: 3000,
};

async function fetchPaymentStatus(paymentId: string | undefined): Promise<{
  status: string;
  transactionHash?: string;
  metadata?: any;
} | null> {
  if (!paymentId) return null;

  try {
    return await checkPaymentStatusAction(paymentId);
  } catch (error) {
    console.error('[fetchPaymentStatus] Error:', error);
    throw error;
  }
}

export function usePaymentStatus(paymentId: string | null | undefined) {
  const {
    data: paymentStatus,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    paymentId ? ['payment-status', paymentId] : null,
    () => fetchPaymentStatus(paymentId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      paymentStatus: paymentStatus || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [paymentStatus, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

export function usePaymentMutations() {
  const createPendingPayment = useCallback(
    async (input: {
      paylinkId: string;
      merchantId: string;
      productId: string;
      amount: number;
      currency: string;
      walletAddress: string;
    }) => {
      try {
        return await createPendingPaymentAction(input);
      } catch (error) {
        console.error('[createPendingPayment] Error:', error);
        throw error;
      }
    },
    []
  );

  const cancelPendingPayment = useCallback(async (paymentId: string) => {
    try {
      return await cancelPendingPaymentAction(paymentId);
    } catch (error) {
      console.error('[cancelPendingPayment] Error:', error);
      throw error;
    }
  }, []);

  const recordPayLinkPayment = useCallback(
    async (input: {
      paylinkId: string;
      transactionHash: string;
      payerAddress: string;
      amount: number;
      currency: string;
      paymentMethod: 'paylink_wallet' | 'paylink_fiat';
    }) => {
      try {
        return await recordPayLinkPaymentAction(input);
      } catch (error) {
        console.error('[recordPayLinkPayment] Error:', error);
        throw error;
      }
    },
    []
  );

  const recordBridgePayment = useCallback(
    async (input: {
      paylinkId: string;
      merchantId: string;
      productId: string;
      amount: number;
      currency: string;
      exchangeId: string;
      csprTxHash: string | null;
      fromCurrency: string;
      fromAmount: string;
      fromAddress: string;
    }) => {
      try {
        return await recordBridgePaymentAction(input);
      } catch (error) {
        console.error('[recordBridgePayment] Error:', error);
        throw error;
      }
    },
    []
  );

  const verifyPendingPayments = useCallback(async () => {
    try {
      return await verifyPendingPaymentsAction();
    } catch (error) {
      console.error('[verifyPendingPayments] Error:', error);
      throw error;
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      createPendingPayment,
      cancelPendingPayment,
      recordPayLinkPayment,
      recordBridgePayment,
      verifyPendingPayments,
    }),
    [createPendingPayment, cancelPendingPayment, recordPayLinkPayment, recordBridgePayment, verifyPendingPayments]
  );

  return memoizedValue;
}
