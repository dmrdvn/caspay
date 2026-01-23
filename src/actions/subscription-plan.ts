'use server';

import type {
  SubscriptionPlan,
  SubscriptionPlanCreateInput,
  SubscriptionPlanUpdateInput,
} from 'src/types/subscription';

import { supabase } from 'src/lib/supabase';

export async function getSubscriptionPlansByMerchant(
  merchantId: string
): Promise<SubscriptionPlan[]> {
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

export async function getSubscriptionPlanById(
  planId: string
): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching subscription plan:', error);
    throw new Error(error.message);
  }

  return data as SubscriptionPlan;
}

export async function createSubscriptionPlan(
  input: SubscriptionPlanCreateInput
): Promise<SubscriptionPlan> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const planId = input.plan_id || `plan_${timestamp}_${random}`;

  const planData = {
    merchant_id: input.merchant_id,
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
      merchant:merchants!inner(merchant_id, network)
    `)
    .single();

  if (error) {
    console.error('Error creating subscription plan:', error);
    throw new Error(error.message);
  }

  try {
    const { createSubscriptionPlan: createPlanOnChain, getIntervalValue } = await import('src/lib/api/contract-service');
    
    const merchantCustomId = (data as any).merchant?.merchant_id;
    const merchantNetwork = (data as any).merchant?.network || 'testnet';
    
    if (!merchantCustomId) {
      throw new Error('Merchant custom ID not found');
    }
    
    console.log('[createSubscriptionPlan] Registering on blockchain...', {
      planId: data.plan_id,
      merchantCustomId,
      price: data.price,
      interval: data.interval,
      network: merchantNetwork
    });
    
    const intervalEnum = getIntervalValue(data.interval as 'weekly' | 'monthly' | 'yearly');
    
    const deployHash = await createPlanOnChain(
      merchantCustomId,
      data.plan_id,
      data.price.toString(),
      intervalEnum,
      data.interval_count,
      data.trial_days,
      merchantNetwork
    );
    
    console.log('[createSubscriptionPlan] Blockchain registration successful:', deployHash);
    
    await supabase
      .from('subscription_plans')
      .update({ transaction_hash: deployHash })
      .eq('id', data.id);
    
    (data as any).transaction_hash = deployHash;
  } catch (contractError: any) {
    console.error('[createSubscriptionPlan] Blockchain registration failed:', contractError);
  }

  return data as SubscriptionPlan;
}

export async function updateSubscriptionPlan(
  planId: string,
  input: SubscriptionPlanUpdateInput
): Promise<SubscriptionPlan> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

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

export async function deleteSubscriptionPlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('subscription_plans')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', planId);

  if (error) {
    console.error('Error deleting subscription plan:', error);
    throw new Error(error.message);
  }
}

export async function hardDeleteSubscriptionPlan(planId: string): Promise<void> {

  const { error } = await supabase.from('subscription_plans').delete().eq('id', planId);

  if (error) {
    console.error('Error hard deleting subscription plan:', error);
    throw new Error(error.message);
  }
}

export async function toggleSubscriptionPlanStatus(
  planId: string
): Promise<SubscriptionPlan> {

  const { data: currentPlan, error: fetchError } = await supabase
    .from('subscription_plans')
    .select('active, merchant:merchants(network)')
    .eq('id', planId)
    .single();

  if (fetchError) {
    console.error('Error fetching subscription plan:', fetchError);
    throw new Error(fetchError.message);
  }

  const { data, error } = await supabase
    .from('subscription_plans')
    .update({
      active: !currentPlan.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId)
    .select('*, merchant:merchants(network)')
    .single();

  if (error) {
    console.error('Error toggling subscription plan status:', error);
    throw new Error(error.message);
  }

  try {

    const { updatePlanStatus: updatePlanStatusOnChain } = await import('src/lib/api/contract-service');
    
    console.log('[toggleSubscriptionPlanStatus] Updating on blockchain...', {
      planId: data.id,
      active: data.active
    });
    
    const deployHash = await updatePlanStatusOnChain(
      data.id,
      data.active,
      (data as any).merchant?.network || 'testnet'
    );
    
    console.log('[toggleSubscriptionPlanStatus] Blockchain update successful:', deployHash);
  } catch (contractError: any) {
    console.error('[toggleSubscriptionPlanStatus] Blockchain update failed:', contractError);

  }

  return data as SubscriptionPlan;
}

export async function getSubscriptionPlanStats(merchantId: string) {

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

  const monthly = plans.filter((p) => p.interval === 'monthly').length;
  const yearly = plans.filter((p) => p.interval === 'yearly').length;
  const weekly = plans.filter((p) => p.interval === 'weekly').length;

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
