'use client';

import type { SWRConfiguration } from 'swr';
import useSWR, { mutate } from 'swr';
import { useMemo, useCallback } from 'react';

import type {
  PayLink,
  PayLinkWithProduct,
  PayLinkCreateInput,
  PayLinkUpdateInput,
  CreatePayLinkResponse,
} from 'src/types/paylink';

import {
  createPayLink as createPayLinkAction,
  updatePayLink as updatePayLinkAction,
  deletePayLink as deletePayLinkAction,
  getPayLinks as getPayLinksAction,
  getPayLink as getPayLinkAction,
  getPayLinkStats,
} from 'src/actions/paylink';

import { useAuthContext } from 'src/auth/hooks';


const SWR_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 3000,
};

async function fetchPayLinks(merchantId: string | undefined): Promise<PayLinkWithProduct[]> {
  if (!merchantId) return [];

  try {
    const paylinks = await getPayLinksAction(merchantId);
    
    const paylinksWithStats = await Promise.all(
      paylinks.map(async (paylink) => {
        try {
          const stats = await getPayLinkStats(paylink.id, merchantId);
          return {
            ...paylink,
            total_revenue: stats?.total_revenue || 0,
          };
        } catch {
          return {
            ...paylink,
            total_revenue: 0,
          };
        }
      })
    );
    
    return paylinksWithStats;
  } catch (error) {
    console.error('[fetchPayLinks] Error:', error);
    throw error;
  }
}

async function fetchPayLink(id: string | undefined, merchantId: string | undefined): Promise<PayLinkWithProduct | null> {
  if (!id || !merchantId) return null;

  try {
    return await getPayLinkAction(id, merchantId);
  } catch (error) {
    console.error('[fetchPayLink] Error:', error);
    throw error;
  }
}

export function usePayLinks(merchantId?: string | null) {
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<PayLinkWithProduct[]>(
    merchantId ? ['paylinks', merchantId] : null,
    () => fetchPayLinks(merchantId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      paylinks: data || [],
      isLoading,
      isValidating,
      error,
      isEmpty: !isLoading && !data?.length,
      refetch: revalidate,
    }),
    [data, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

export function usePayLink(id: string | null, merchantId?: string | null) {
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<PayLinkWithProduct | null>(
    id && merchantId ? ['paylink', id, merchantId] : null,
    () => fetchPayLink(id || undefined, merchantId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      paylink: data || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [data, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

export function usePayLinkMutations(merchantId?: string | null) {
  const { user } = useAuthContext();
  const userId = user?.id;

  const createMutation = useCallback(
    async (input: Omit<PayLinkCreateInput, 'merchant_id'>): Promise<CreatePayLinkResponse> => {
      if (!userId || !merchantId) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await createPayLinkAction({
          ...input,
          merchant_id: merchantId,
        });

        await mutate(['paylinks', merchantId]);

        return result;
      } catch (error) {
        console.error('[createPayLink] Error:', error);
        throw error;
      }
    },
    [userId, merchantId]
  );

  const updateMutation = useCallback(
    async (id: string, input: PayLinkUpdateInput): Promise<PayLink> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await updatePayLinkAction(id, input);
        await Promise.all([
          merchantId ? mutate(['paylinks', merchantId]) : Promise.resolve(),
          mutate(['paylink', id, merchantId]),
        ]);

        return result;
      } catch (error) {
        console.error('[updatePayLink] Error:', error);
        throw error;
      }
    },
    [userId, merchantId]
  );

  const deleteMutation = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        await deletePayLinkAction(id);
        if (merchantId) {
          await mutate(['paylinks', merchantId]);
        }
      } catch (error) {
        console.error('[deletePayLink] Error:', error);
        throw error;
      }
    },
    [userId, merchantId]
  );

  return {
    createPayLink: createMutation,
    updatePayLink: updateMutation,
    deletePayLink: deleteMutation,
  };
}
