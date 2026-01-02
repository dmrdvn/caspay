'use server';

import type {
  SubscriptionPlan,
  SubscriptionPlanCreateInput,
  SubscriptionPlanUpdateInput,
} from 'src/types/subscription';

import { createClient } from 'src/lib/supabase';

// ----------------------------------------------------------------------

/**
 * Get all subscription plans for a specific merchant
 */
export async function getSubscriptionPlansByMerchant(
  merchantId: string
): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error(error.message);
  }

  return data as SubscriptionPlan[];
}

/**
 * Get a single subscription plan by ID
 */
export async function getSubscriptionPlanById(
  planId: string
): Promise<SubscriptionPlan | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching subscription plan:', error);
    throw new Error(error.message);
  }

  return data as SubscriptionPlan;
}

/**
 * Create a new subscription plan
 */
export async function createSubscriptionPlan(
  input: SubscriptionPlanCreateInput
): Promise<SubscriptionPlan> {
  const supabase = await createClient();

  // Generate unique plan_id if not provided
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const planId = input.plan_id || `plan_${timestamp}_${random}`;

  const planData = {
    merchant_id: input.merchant_id, // Foreign key (UUID) for Supabase relations
    plan_id: planId,
    name: input.name,
    description: input.description || null,
    price: input.price,
    currency: input.currency || 'USD',
    token_address: input.token_address || 'NATIVE',
    interval: input.interval,
    interval_count: input.interval_count ?? 1,
    trial_days: input.trial_days ?? 0,
    features: input.features || null,
    metadata: input.metadata || null,
    active: input.active ?? true,
  };

  const { data, error } = await supabase
    .from('subscription_plans')
    .insert(planData)
    .select(`
      *,
      merchant:merchants!inner(merchant_id)
    `)
    .single();

  if (error) {
    console.error('Error creating subscription plan:', error);
    throw new Error(error.message);
  }

  // Step 2: Write to blockchain contract
  try {
    // Dynamic import to keep contract code server-side only
    const { createSubscriptionPlan: createPlanOnChain, getIntervalValue } = await import('src/lib/api/contract-service');
    
    // Merchant'ın custom merchant_id'si zaten data'da var (JOIN ile)
    const merchantCustomId = (data as any).merchant?.merchant_id;
    
    if (!merchantCustomId) {
      throw new Error('Merchant custom ID not found');
    }
    
    console.log('[createSubscriptionPlan] Registering on blockchain...', {
      planId: data.plan_id, // Custom plan_id
      merchantCustomId, // MERCH_xxx
      price: data.price, // Orijinal price
      interval: data.interval
    });
    
    // Interval enum: weekly=0, monthly=1, yearly=2
    const intervalEnum = getIntervalValue(data.interval as 'weekly' | 'monthly' | 'yearly');
    
    const deployHash = await createPlanOnChain(
      merchantCustomId, // MERCH_xxx - contract için
      data.plan_id, // Custom plan_id - NOT data.id!
      data.price.toString(), // Orijinal price as string - NO conversion!
      intervalEnum,
      data.interval_count,
      data.trial_days
    );
    
    console.log('[createSubscriptionPlan] Blockchain registration successful:', deployHash);
  } catch (contractError: any) {
    console.error('[createSubscriptionPlan] Blockchain registration failed:', contractError);
    // Contract hatası kritik değil, plan Supabase'de oluşturuldu
  }

  return data as SubscriptionPlan;
}

/**
 * Update a subscription plan
 */
export async function updateSubscriptionPlan(
  planId: string,
  input: SubscriptionPlanUpdateInput
): Promise<SubscriptionPlan> {
  const supabase = await createClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  // Only include fields that are provided
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.token_address !== undefined) updateData.token_address = input.token_address;
  if (input.interval !== undefined) updateData.interval = input.interval;
  if (input.interval_count !== undefined) updateData.interval_count = input.interval_count;
  if (input.trial_days !== undefined) updateData.trial_days = input.trial_days;
  if (input.features !== undefined) updateData.features = input.features;
  if (input.metadata !== undefined) updateData.metadata = input.metadata;
  if (input.active !== undefined) updateData.active = input.active;

  const { data, error } = await supabase
    .from('subscription_plans')
    .update(updateData)
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription plan:', error);
    throw new Error(error.message);
  }

  return data as SubscriptionPlan;
}

/**
 * Delete a subscription plan (soft delete by setting active = false)
 */
export async function deleteSubscriptionPlan(planId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('subscription_plans')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', planId);

  if (error) {
    console.error('Error deleting subscription plan:', error);
    throw new Error(error.message);
  }
}

/**
 * Hard delete a subscription plan (permanent)
 * Warning: This will fail if there are active subscriptions using this plan
 */
export async function hardDeleteSubscriptionPlan(planId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('subscription_plans').delete().eq('id', planId);

  if (error) {
    console.error('Error hard deleting subscription plan:', error);
    throw new Error(error.message);
  }
}

/**
 * Toggle subscription plan active status
 */
export async function toggleSubscriptionPlanStatus(
  planId: string
): Promise<SubscriptionPlan> {
  const supabase = await createClient();

  // First get current status
  const { data: currentPlan, error: fetchError } = await supabase
    .from('subscription_plans')
    .select('active')
    .eq('id', planId)
    .single();

  if (fetchError) {
    console.error('Error fetching subscription plan:', fetchError);
    throw new Error(fetchError.message);
  }

  // Toggle status
  const { data, error } = await supabase
    .from('subscription_plans')
    .update({
      active: !currentPlan.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling subscription plan status:', error);
    throw new Error(error.message);
  }

  // Step 3: Update status on blockchain
  try {
    // Dynamic import to keep contract code server-side only
    const { updatePlanStatus: updatePlanStatusOnChain } = await import('src/lib/api/contract-service');
    
    console.log('[toggleSubscriptionPlanStatus] Updating on blockchain...', {
      planId: data.id,
      active: data.active
    });
    
    const deployHash = await updatePlanStatusOnChain(
      data.id,
      data.active
    );
    
    console.log('[toggleSubscriptionPlanStatus] Blockchain update successful:', deployHash);
  } catch (contractError: any) {
    console.error('[toggleSubscriptionPlanStatus] Blockchain update failed:', contractError);
    // Contract hatası kritik değil
  }

  return data as SubscriptionPlan;
}

/**
 * Get subscription plan statistics for a merchant
 */
export async function getSubscriptionPlanStats(merchantId: string) {
  const supabase = await createClient();

  const { data: plans, error } = await supabase
    .from('subscription_plans')
    .select('active, price, interval')
    .eq('merchant_id', merchantId);

  if (error) {
    console.error('Error fetching subscription plan stats:', error);
    throw new Error(error.message);
  }

  const activePlans = plans.filter((p) => p.active).length;
  const totalPlans = plans.length;
  
  // Count by interval
  const monthly = plans.filter((p) => p.interval === 'monthly').length;
  const yearly = plans.filter((p) => p.interval === 'yearly').length;
  const weekly = plans.filter((p) => p.interval === 'weekly').length;

  // Calculate average price by interval
  const avgMonthlyPrice = plans
    .filter((p) => p.interval === 'monthly')
    .reduce((sum, p) => sum + Number(p.price), 0) / (monthly || 1);
  
  const avgYearlyPrice = plans
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
}
