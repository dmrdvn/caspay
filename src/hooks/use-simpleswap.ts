'use client';

import { useState, useCallback } from 'react';

import type {
  SimpleSwapEstimate,
  SimpleSwapRange,
  SimpleSwapExchange,
  PopularCurrency,
} from 'src/types/simpleswap';
import { POPULAR_CURRENCIES } from 'src/types/simpleswap';

import {
  getEstimate as getEstimateAction,
  getRange as getRangeAction,
  createExchange as createExchangeAction,
  getExchangeStatus as getExchangeStatusAction,
  calculateRequiredAmount as calculateRequiredAmountAction,
} from 'src/actions/simpleswap';

export function useSimpleSwap() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<SimpleSwapEstimate | null>(null);
  const [range, setRange] = useState<SimpleSwapRange | null>(null);
  const [exchange, setExchange] = useState<SimpleSwapExchange | null>(null);

  const getEstimate = useCallback(
    async (
      currency: PopularCurrency,
      amount: string,
      currentRange?: SimpleSwapRange | null,
      fixed: boolean = false
    ): Promise<SimpleSwapEstimate | null> => {
      const numAmount = parseFloat(amount);
      if (Number.isNaN(numAmount) || numAmount <= 0) {
        setEstimate(null);
        return null;
      }

      const rangeToCheck = currentRange || range;
      if (rangeToCheck) {
        const safeMin = parseFloat(rangeToCheck.min) * 1.005;
        if (numAmount < safeMin) {
          setEstimate(null);
          return null;
        }
      }

      setIsLoading(true);
      setError(null);

      const result = await getEstimateAction(
        currency.ticker,
        'cspr',
        currency.network,
        'cspr',
        amount,
        fixed
      );

      setIsLoading(false);

      if (result.success && result.data) {
        setEstimate(result.data);
        return result.data;
      }

      setError(result.error || 'Failed to get estimate');
      return null;
    },
    [range]
  );

  const getRange = useCallback(
    async (currency: PopularCurrency, fixed: boolean = false): Promise<SimpleSwapRange | null> => {
      setIsLoading(true);
      setError(null);

      const result = await getRangeAction(
        currency.ticker,
        'cspr',
        currency.network,
        'cspr',
        fixed
      );

      setIsLoading(false);

      if (result.success && result.data) {
        setRange(result.data);
        return result.data;
      }

      setError(result.error || 'Failed to get range');
      return null;
    },
    []
  );

  const createExchange = useCallback(
    async (
      currency: PopularCurrency,
      amount: string,
      addressTo: string,
      fixed: boolean = false,
      refundAddress?: string
    ): Promise<SimpleSwapExchange | null> => {
      setIsLoading(true);
      setError(null);

      const result = await createExchangeAction({
        fixed,
        ticker_from: currency.ticker,
        ticker_to: 'cspr',
        network_from: currency.network,
        network_to: 'cspr',
        amount,
        address_to: addressTo,
        user_refund_address: refundAddress,
      });

      setIsLoading(false);

      if (result.success && result.data) {
        setExchange(result.data);
        return result.data;
      }

      setError(result.error || 'Failed to create exchange');
      return null;
    },
    []
  );

  const checkExchangeStatus = useCallback(
    async (exchangeId: string): Promise<SimpleSwapExchange | null> => {
      const result = await getExchangeStatusAction(exchangeId);

      if (result.success && result.data) {
        setExchange(result.data);
        return result.data;
      }

      return null;
    },
    []
  );

  const calculateRequired = useCallback(
    async (
      currency: PopularCurrency,
      targetCsprAmount: number,
      fixed: boolean = false
    ): Promise<{ amount: string; rate: string; minAmount: string } | null> => {
      setIsLoading(true);
      setError(null);

      const result = await calculateRequiredAmountAction(
        currency.ticker,
        currency.network,
        targetCsprAmount,
        fixed
      );

      setIsLoading(false);

      if (result.success && result.data) {
        return result.data;
      }

      setError(result.error || 'Failed to calculate amount');
      return null;
    },
    []
  );

  const clearState = useCallback(() => {
    setEstimate(null);
    setRange(null);
    setExchange(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    estimate,
    range,
    exchange,
    currencies: POPULAR_CURRENCIES,
    getEstimate,
    getRange,
    createExchange,
    checkExchangeStatus,
    calculateRequired,
    clearState,
  };
}
