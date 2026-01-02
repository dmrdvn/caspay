'use client';

import type { SWRConfiguration } from 'swr';
import type {
  SubscriptionPlan,
  SubscriptionPlanCreateInput,
  SubscriptionPlanUpdateInput,
} from 'src/types/subscription';

import useSWR, { mutate } from 'swr';
import { useMemo, useState, useCallback } from 'react';

import { supabase } from 'src/lib/supabase';
import {
  createSubscriptionPlan as createSubscriptionPlanAction,
  updateSubscriptionPlan as updateSubscriptionPlanAction,
  deleteSubscriptionPlan as deleteSubscriptionPlanAction,
  toggleSubscriptionPlanStatus as toggleSubscriptionPlanStatusAction,
} from 'src/actions/subscription-plan';

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
 * Fetch all subscription plans for a specific merchant
 */
async function fetchSubscriptionPlans(
  merchantId: string | undefined
): Promise<SubscriptionPlan[]> {
  if (!merchantId) return [];

  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as SubscriptionPlan[];
  } catch (error) {
    console.error('[fetchSubscriptionPlans] Error:', error);
    throw error;
  }
}

/**
 * Fetch a single subscription plan by ID
 */
async function fetchSubscriptionPlan(
  planId: string | undefined
): Promise<SubscriptionPlan | null> {
  if (!planId) return null;

  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;

    return data as SubscriptionPlan;
  } catch (error) {
    console.error('[fetchSubscriptionPlan] Error:', error);
    throw error;
  }
}

/**
 * Fetch subscription plan statistics for a merchant
 */
async function fetchSubscriptionPlanStats(merchantId: string | undefined) {
  if (!merchantId) return null;

  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('active, price, interval')
      .eq('merchant_id', merchantId);

    if (error) throw error;

    const activePlans = plans.filter((p) => p.active).length;
    const totalPlans = plans.length;

    const monthly = plans.filter((p) => p.interval === 'monthly').length;
    const yearly = plans.filter((p) => p.interval === 'yearly').length;
    const weekly = plans.filter((p) => p.interval === 'weekly').length;

    const avgMonthlyPrice =
      plans
        .filter((p) => p.interval === 'monthly')
        .reduce((sum, p) => sum + Number(p.price), 0) / (monthly || 1);

    const avgYearlyPrice =
      plans
        .filter((p) => p.interval === 'yearly')
        .reduce((sum, p) => sum + Number(p.price), 0) / (yearly || 1);

    return {
      total: totalPlans,
      active: activePlans,
      inactive: totalPlans - activePlans,
      byInterval: {
        monthly,
        yearly,
        weekly,
      },
      averagePricing: {
        monthly: avgMonthlyPrice,
        yearly: avgYearlyPrice,
      },
    };
  } catch (error) {
    console.error('[fetchSubscriptionPlanStats] Error:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching all subscription plans for a merchant
 * Uses SWR for caching and automatic revalidation
 */
export function useSubscriptionPlans(merchantId: string | null | undefined) {
  const {
    data: plans,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    merchantId ? ['subscription-plans', merchantId] : null,
    () => fetchSubscriptionPlans(merchantId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      plans: plans || [],
      isLoading,
      isValidating,
      error,
      isEmpty: !isLoading && !plans?.length,
      refetch: revalidate,
    }),
    [plans, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching a single subscription plan by ID
 * Uses SWR for caching and automatic revalidation
 */
export function useSubscriptionPlan(planId: string | null | undefined) {
  const {
    data: plan,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    planId ? ['subscription-plan', planId] : null,
    () => fetchSubscriptionPlan(planId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      plan: plan || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [plan, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

/**
 * Hook for fetching subscription plan statistics for a merchant
 * Uses SWR for caching and automatic revalidation
 */
export function useSubscriptionPlanStats(merchantId: string | null | undefined) {
  const {
    data: stats,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    merchantId ? ['subscription-plan-stats', merchantId] : null,
    () => fetchSubscriptionPlanStats(merchantId || undefined),
    SWR_OPTIONS
  );

  const memoizedValue = useMemo(
    () => ({
      stats: stats || null,
      isLoading,
      isValidating,
      error,
      refetch: revalidate,
    }),
    [stats, isLoading, isValidating, error, revalidate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

/**
 * Hook for subscription plan mutations (create, update, delete)
 * Includes optimistic updates and automatic cache revalidation
 */
export function useSubscriptionPlanMutations(merchantId: string | null | undefined) {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Create a new subscription plan
   * Merchant ownership is verified via currentMerchant from cache
   */
  const createPlan = useCallback(
    async (data: SubscriptionPlanCreateInput) => {
      if (!merchantId) {
        throw new Error('Merchant ID is required');
      }

      try {
        setIsCreating(true);

        // Create plan
        const newPlan = await createSubscriptionPlanAction({
          ...data,
          merchant_id: merchantId,
        });

        // Revalidate plans list and stats
        await Promise.all([
          mutate(['subscription-plans', merchantId]),
          mutate(['subscription-plan-stats', merchantId]),
        ]);

        return newPlan;
      } catch (error) {
        console.error('[createPlan] Error:', error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [merchantId]
  );

  /**
   * Update an existing subscription plan
   */
  const updatePlan = useCallback(
    async (planId: string, data: SubscriptionPlanUpdateInput) => {
      try {
        setIsUpdating(true);

        // Optimistic update
        mutate(
          ['subscription-plan', planId],
          (currentData: SubscriptionPlan | undefined) => {
            if (!currentData) return currentData;
            return { ...currentData, ...data } as SubscriptionPlan;
          },
          { revalidate: false }
        );

        // Update plan
        const updatedPlan = await updateSubscriptionPlanAction(planId, data);

        // Revalidate cache
        await Promise.all([
          mutate(['subscription-plan', planId]),
          mutate(['subscription-plans', merchantId]),
          mutate(['subscription-plan-stats', merchantId]),
        ]);

        return updatedPlan;
      } catch (error) {
        // Rollback on error
        await mutate(['subscription-plan', planId]);
        console.error('[updatePlan] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [merchantId]
  );

  /**
   * Delete a subscription plan (soft delete)
   */
  const deletePlan = useCallback(
    async (planId: string) => {
      try {
        setIsDeleting(true);

        // Optimistic update - remove from list
        mutate(
          ['subscription-plans', merchantId],
          async (currentData: SubscriptionPlan[] | undefined) => {
            if (!currentData) return currentData;
            return currentData.filter((p) => p.id !== planId);
          },
          { revalidate: false }
        );

        // Delete plan
        await deleteSubscriptionPlanAction(planId);

        // Revalidate cache
        await Promise.all([
          mutate(['subscription-plans', merchantId]),
          mutate(['subscription-plan-stats', merchantId]),
        ]);
      } catch (error) {
        // Rollback on error
        await mutate(['subscription-plans', merchantId]);
        console.error('[deletePlan] Error:', error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [merchantId]
  );

  /**
   * Toggle subscription plan active status
   */
  const toggleStatus = useCallback(
    async (planId: string) => {
      try {
        setIsUpdating(true);

        // Toggle status
        const updatedPlan = await toggleSubscriptionPlanStatusAction(planId);

        // Revalidate cache
        await Promise.all([
          mutate(['subscription-plan', planId]),
          mutate(['subscription-plans', merchantId]),
          mutate(['subscription-plan-stats', merchantId]),
        ]);

        return updatedPlan;
      } catch (error) {
        console.error('[toggleStatus] Error:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [merchantId]
  );

  const memoizedValue = useMemo(
    () => ({
      createPlan,
      updatePlan,
      deletePlan,
      toggleStatus,
      isCreating,
      isUpdating,
      isDeleting,
      isMutating: isCreating || isUpdating || isDeleting,
    }),
    [createPlan, updatePlan, deletePlan, toggleStatus, isCreating, isUpdating, isDeleting]
  );

  return memoizedValue;
}
