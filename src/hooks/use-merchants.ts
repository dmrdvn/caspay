'use client';

import type { SWRConfiguration } from 'swr';
import type { Merchant, MerchantStatus } from 'src/types/merchant';

import useSWR, { mutate } from 'swr';
import { useMemo, useState, useCallback } from 'react';

import { supabase } from 'src/lib/supabase';
import {
  createMerchant as createMerchantAction,
  updateMerchant as updateMerchantAction,
  deleteMerchant as deleteMerchantAction,
  updateMerchantStatus as updateMerchantStatusAction,
} from 'src/actions/merchant';

import { useAuthContext } from 'src/auth/hooks';

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
 * Fetch all merchants for the authenticated user
 */
async function fetchMerchants(userId: string | undefined): Promise<Merchant[]> {
  if (!userId) return [];

  try {
    // Fetch merchants for this user
    const { data: merchantsData, error: merchantsError } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (merchantsError) throw merchantsError;

    return (merchantsData || []) as Merchant[];
  } catch (error) {
    console.error('[fetchMerchants] Error:', error);
    throw error;
  }
}

/**
 * Fetch a single merchant by ID
 */
async function fetchMerchant(merchantId: string | undefined): Promise<Merchant | null> {
  if (!merchantId) return null;

  try {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (error) throw error;

    return data as Merchant;
  } catch (error) {
    console.error('[fetchMerchant] Error:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching all merchants
 * Uses SWR for caching and automatic revalidation
 */
export function useMerchants() {
  const { user } = useAuthContext();
  const userId = user?.id;

  const {
    data: merchants,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    userId ? ['merchants', userId] : null,
    () => fetchMerchants(userId),
    SWR_OPTIONS
  );

  // Current merchant management
  const [currentMerchantId, setCurrentMerchantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_merchant_id');
    }
    return null;
  });

  const currentMerchant = useMemo(() => {
    if (!merchants?.length) return null;

    // Try to find saved merchant
    if (currentMerchantId) {
      const saved = merchants.find((m) => m.id === currentMerchantId);
      if (saved) return saved;
    }

    // Fallback to first active merchant or first merchant
    const active = merchants.find((m) => m.status === 'active');
    return active || merchants[0] || null;
  }, [merchants, currentMerchantId]);

  const switchMerchant = useCallback((merchant: Merchant) => {
    setCurrentMerchantId(merchant.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_merchant_id', merchant.id);
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      merchants: merchants || [],
      currentMerchant,
      isLoading,
      isValidating,
      error,
      isEmpty: !isLoading && !merchants?.length,
      switchMerchant,
      refetch: revalidate,
    }),
    [merchants, currentMerchant, isLoading, isValidating, error, switchMerchant, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching a single merchant by ID
 * Uses SWR for caching and automatic revalidation
 */
export function useMerchant(merchantId: string | undefined) {
  const {
    data: merchant,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    merchantId ? ['merchant', merchantId] : null,
    () => fetchMerchant(merchantId),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      merchant: merchant || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [merchant, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

/**
 * Hook for merchant mutations (create, update, delete)
 * Includes optimistic updates and automatic cache revalidation
 */
export function useMerchantMutations() {
  const { user } = useAuthContext();
  const userId = user?.id;
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new merchant
   */
  const createMerchant = useCallback(
    async (data: {
      store_name: string;
      store_description?: string;
      business_type?: 'individual' | 'company' | 'dao';
      support_email?: string;
      support_url?: string;
      logo_url?: string;
      brand_color?: string;
    }) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        setIsCreating(true);

        // Create merchant
        const newMerchant = await createMerchantAction({
          user_id: userId,
          ...data,
        });

        // Revalidate merchants list
        await mutate(['merchants', userId]);

        return newMerchant;
      } catch (error) {
        console.error('[createMerchant] Error:', error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [userId]
  );

  /**
   * Update an existing merchant
   */
  const updateMerchant = useCallback(
    async (
      merchantId: string,
      data: {
        store_name?: string;
        store_description?: string;
        business_type?: 'individual' | 'company' | 'dao';
        support_email?: string;
        support_url?: string;
        logo_url?: string;
        brand_color?: string;
      }
    ) => {
      try {
        setIsUpdating(true);

        // Optimistic update
        mutate(
          ['merchant', merchantId],
          (currentData: Merchant | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, ...data } as Merchant;
          },
          { revalidate: false }
        );

        // Update merchant
        const updatedMerchant = await updateMerchantAction(merchantId, data);

        // Revalidate cache
        await Promise.all([
          mutate(['merchant', merchantId]),
          mutate(['merchants', userId]),
        ]);

        return updatedMerchant;
      } catch (error) {
        // Rollback on error
        await mutate(['merchant', merchantId]);
        console.error('[updateMerchant] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [userId]
  );

  /**
   * Delete a merchant
   */
  const deleteMerchant = useCallback(
    async (merchantId: string) => {
      try {
        setIsDeleting(true);

        // Optimistic update - remove from list
        mutate(
          ['merchants', userId],
          async (currentData: Merchant[] | undefined) => {
            if (!currentData) return currentData;
            return currentData.filter((m) => m.id !== merchantId);
          },
          { revalidate: false }
        );

        // Delete merchant
        await deleteMerchantAction(merchantId);

        // Revalidate cache
        await mutate(['merchants', userId]);
      } catch (error) {
        // Rollback on error
        await mutate(['merchants', userId]);
        console.error('[deleteMerchant] Error:', error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [userId]
  );

  /**
   * Update merchant status
   */
  const updateStatus = useCallback(
    async (merchantId: string, status: MerchantStatus) => {
      try {
        setIsUpdating(true);

        // Optimistic update
        mutate(
          ['merchant', merchantId],
          (currentData: Merchant | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, status } as Merchant;
          },
          { revalidate: false }
        );

        // Update status
        const updatedMerchant = await updateMerchantStatusAction(merchantId, status);

        // Revalidate cache
        await Promise.all([
          mutate(['merchant', merchantId]),
          mutate(['merchants', userId]),
        ]);

        return updatedMerchant;
      } catch (error) {
        // Rollback on error
        await mutate(['merchant', merchantId]);
        console.error('[updateStatus] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [userId]
  );

  const memoizedValue = useMemo(
    () => ({
      createMerchant,
      updateMerchant,
      deleteMerchant,
      updateStatus,
      isCreating,
      isUpdating,
      isDeleting,
      isMutating: isCreating || isUpdating || isDeleting,
    }),
    [createMerchant, updateMerchant, deleteMerchant, updateStatus, isCreating, isUpdating, isDeleting]
  );

  return memoizedValue;
}
