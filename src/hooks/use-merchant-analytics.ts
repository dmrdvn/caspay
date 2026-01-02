import type {
  MonthlyActivity,
  MerchantAnalytics,
  TopPerformingItem,
  RecentTransaction,
} from 'src/actions/merchant-analytics';

import useSWR from 'swr';
import { useMemo } from 'react';

import {
  getMonthlyActivity,
  getMerchantAnalytics,
  getTopPerformingItems,
  getRecentTransactions,
} from 'src/actions/merchant-analytics';

// ----------------------------------------------------------------------

type UseMerchantAnalyticsReturn = {
  analytics: MerchantAnalytics | null;
  analyticsLoading: boolean;
  analyticsError: Error | null;
  analyticsEmpty: boolean;
};

export function useMerchantAnalytics(merchantId?: string): UseMerchantAnalyticsReturn {
  const { data, error, isLoading } = useSWR(
    merchantId ? `merchant-analytics-${merchantId}` : null,
    () => getMerchantAnalytics(merchantId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      analytics: data?.data || null,
      analyticsLoading: isLoading,
      analyticsError: data?.error || error || null,
      analyticsEmpty: !isLoading && !data?.data,
    }),
    [data, error, isLoading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type UseTopPerformingItemsReturn = {
  items: TopPerformingItem[];
  itemsLoading: boolean;
  itemsError: Error | null;
  itemsEmpty: boolean;
};

export function useTopPerformingItems(
  merchantId?: string,
  limit?: number
): UseTopPerformingItemsReturn {
  const { data, error, isLoading } = useSWR(
    merchantId ? `top-performing-items-${merchantId}-${limit}` : null,
    () => getTopPerformingItems(merchantId!, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      items: data?.data || [],
      itemsLoading: isLoading,
      itemsError: data?.error || error || null,
      itemsEmpty: !isLoading && (!data?.data || data.data.length === 0),
    }),
    [data, error, isLoading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type UseRecentTransactionsReturn = {
  transactions: RecentTransaction[];
  transactionsLoading: boolean;
  transactionsError: Error | null;
  transactionsEmpty: boolean;
};

export function useRecentTransactions(
  merchantId?: string,
  limit?: number
): UseRecentTransactionsReturn {
  const { data, error, isLoading } = useSWR(
    merchantId ? `recent-transactions-${merchantId}-${limit}` : null,
    () => getRecentTransactions(merchantId!, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      transactions: data?.data || [],
      transactionsLoading: isLoading,
      transactionsError: data?.error || error || null,
      transactionsEmpty: !isLoading && (!data?.data || data.data.length === 0),
    }),
    [data, error, isLoading]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type UseMonthlyActivityReturn = {
  activity: MonthlyActivity[];
  activityLoading: boolean;
  activityError: Error | null;
  activityEmpty: boolean;
};

export function useMonthlyActivity(
  merchantId?: string,
  year?: number
): UseMonthlyActivityReturn {
  const { data, error, isLoading } = useSWR(
    merchantId ? `monthly-activity-${merchantId}-${year}` : null,
    () => getMonthlyActivity(merchantId!, year),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      activity: data?.data || [],
      activityLoading: isLoading,
      activityError: data?.error || error || null,
      activityEmpty: !isLoading && (!data?.data || data.data.length === 0),
    }),
    [data, error, isLoading]
  );

  return memoizedValue;
}
