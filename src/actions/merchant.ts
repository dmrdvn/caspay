'use server';

import type {
  Merchant,
  MerchantStatus,
  CreateMerchantData,
  UpdateMerchantData,
} from 'src/types/merchant';

import { createServerSupabaseClient } from 'src/lib/supabase-server';

export async function getMerchantsByUserId(userId: string): Promise<Merchant[]> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: merchantsData, error: merchantsError } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (merchantsError) throw merchantsError;

    return (merchantsData || []) as Merchant[];
  } catch (error: any) {
    console.error('[getMerchantsByUserId] Error:', error);
    throw error;
  }
}

export async function getMerchantById(merchantId: string): Promise<Merchant | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (error) throw error;

    return data as Merchant;
  } catch (error: any) {
    console.error('[getMerchantById] Error:', error);
    throw error;
  }
}

export async function createMerchant(data: CreateMerchantData): Promise<Merchant> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('public_key')
      .eq('id', data.user_id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    if (!userProfile.public_key) {
      throw new Error(
        'Casper Wallet connection required. Please connect your wallet before creating a merchant.'
      );
    }

    const merchantId = `MERCH_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const { data: merchant, error } = await supabase
      .from('merchants')
      .insert([
        {
          merchant_id: merchantId,
          user_id: data.user_id,
          wallet_address: userProfile.public_key,
          store_name: data.store_name,
          store_description: data.store_description || null,
          business_type: data.business_type || 'company',
          support_email: data.support_email || null,
          support_url: data.support_url || null,
          logo_url: data.logo_url || null,
          brand_color: data.brand_color || '#1890FF',
          network: data.network || 'testnet',
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[createMerchant] Error:', error);
      throw new Error(error.message);
    }

    try {
      const { registerMerchant: registerMerchantOnChain } = await import('src/lib/api/contract-service');
      
      const network = merchant.network || 'testnet';
      
      console.log('[createMerchant] Registering on blockchain...', {
        merchantId: merchant.merchant_id,
        walletAddress: userProfile.public_key,
        network
      });
      
      const deployHash = await registerMerchantOnChain(
        merchant.merchant_id, 
        userProfile.public_key,
        network
      );
      
      console.log('[createMerchant] Blockchain registration successful:', deployHash);
      
      await supabase
        .from('merchants')
        .update({ 
          status: 'active',
          transaction_hash: deployHash
        })
        .eq('id', merchant.id);
        
      merchant.status = 'active';
      merchant.transaction_hash = deployHash;
    } catch (contractError: any) {
      console.error('[createMerchant] Blockchain registration failed:', contractError);
    }

    return merchant as Merchant;
  } catch (error: any) {
    console.error('[createMerchant] Error:', error);
    throw error;
  }
}

export async function updateMerchant(
  merchantId: string,
  data: UpdateMerchantData
): Promise<Merchant> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: merchant, error } = await supabase
      .from('merchants')
      .update({
        store_name: data.store_name,
        store_description: data.store_description,
        business_type: data.business_type,
        support_email: data.support_email,
        support_url: data.support_url,
        logo_url: data.logo_url,
        brand_color: data.brand_color,
      })
      .eq('id', merchantId)
      .select()
      .single();

    if (error) {
      console.error('[updateMerchant] Error:', error);
      throw new Error(error.message);
    }

    return merchant as Merchant;
  } catch (error: any) {
    console.error('[updateMerchant] Error:', error);
    throw error;
  }
}

export async function deleteMerchant(merchantId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase.from('merchants').delete().eq('id', merchantId);

    if (error) {
      console.error('[deleteMerchant] Error:', error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('[deleteMerchant] Error:', error);
    throw error;
  }
}

export async function updateMerchantStatus(
  merchantId: string,
  status: MerchantStatus
): Promise<Merchant> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: merchant, error } = await supabase
      .from('merchants')
      .update({ status })
      .eq('id', merchantId)
      .select('*, network')
      .single();

    if (error) {
      console.error('[updateMerchantStatus] Error:', error);
      throw new Error(error.message);
    }

    try {
      const { updateMerchantStatus: updateMerchantStatusOnChain } = await import('src/lib/api/contract-service');
      
      const statusMap: Record<MerchantStatus, number> = {
        'active': 0,
        'suspended': 1,
        'closed': 2,
        'pending': 3,
      };
      
      const statusEnum = statusMap[status];
      
      console.log('[updateMerchantStatus] Updating on blockchain...', {
        merchantId: merchant.merchant_id,
        status,
        statusEnum
      });
      
      const deployHash = await updateMerchantStatusOnChain(
        merchant.merchant_id,
        statusEnum,
        merchant.network || 'testnet'
      );
      
      console.log('[updateMerchantStatus] Blockchain update successful:', deployHash);
    } catch (contractError: any) {
      console.error('[updateMerchantStatus] Blockchain update failed:', contractError);
    }

    return merchant as Merchant;
  } catch (error: any) {
    console.error('[updateMerchantStatus] Error:', error);
    throw error;
  }
}
