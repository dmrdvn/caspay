'use server';

import type {
  Merchant,
  MerchantStatus,
  CreateMerchantData,
  UpdateMerchantData,
} from 'src/types/merchant';

import { supabase } from 'src/lib/supabase';


// ----------------------------------------------------------------------

/**
 * Create a new merchant
 */
export async function createMerchant(data: CreateMerchantData): Promise<Merchant> {
  try {
    // Get user's wallet address from user_profiles
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

    // Generate a unique merchant_id
    const merchantId = `MERCH_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const { data: merchant, error } = await supabase
      .from('merchants')
      .insert([
        {
          merchant_id: merchantId,
          user_id: data.user_id,
          wallet_address: userProfile.public_key, // Use Casper Wallet address
          store_name: data.store_name,
          store_description: data.store_description || null,
          business_type: data.business_type || 'company',
          support_email: data.support_email || null,
          support_url: data.support_url || null,
          logo_url: data.logo_url || null,
          brand_color: data.brand_color || '#1890FF',
          status: 'pending', // Will be 'active' after Casper contract deployment
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[createMerchant] Error:', error);
      throw new Error(error.message);
    }

    // Step 2: Write to blockchain contract
    try {
      // Dynamic import to keep contract code server-side only
      const { registerMerchant: registerMerchantOnChain } = await import('src/lib/api/contract-service');
      
      console.log('[createMerchant] Registering on blockchain...', {
        merchantId: merchant.merchant_id,
        walletAddress: userProfile.public_key
      });
      
      const deployHash = await registerMerchantOnChain(
        merchant.merchant_id, // Custom merchant_id kullan (NOT merchant.id)
        userProfile.public_key
      );
      
      console.log('[createMerchant] Blockchain registration successful:', deployHash);
      
      // Deploy hash'i kaydet (opsiyonel)
      await supabase
        .from('merchants')
        .update({ 
          status: 'active',
          // deploy_hash: deployHash // Eğer merchants tablosunda deploy_hash kolonu varsa
        })
        .eq('id', merchant.id);
        
      merchant.status = 'active';
    } catch (contractError: any) {
      console.error('[createMerchant] Blockchain registration failed:', contractError);
      // Contract hatasında merchant'i pending bırak, sonra retry edilebilir
      // Şimdilik sadece log at, hata fırlatma
    }

    return merchant as Merchant;
  } catch (error: any) {
    console.error('[createMerchant] Error:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Update an existing merchant
 */
export async function updateMerchant(
  merchantId: string,
  data: UpdateMerchantData
): Promise<Merchant> {
  try {
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

// ----------------------------------------------------------------------

/**
 * Delete a merchant
 */
export async function deleteMerchant(merchantId: string): Promise<void> {
  try {
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

// ----------------------------------------------------------------------

/**
 * Update merchant status
 */
export async function updateMerchantStatus(
  merchantId: string,
  status: MerchantStatus
): Promise<Merchant> {
  try {
    const { data: merchant, error } = await supabase
      .from('merchants')
      .update({ status })
      .eq('id', merchantId)
      .select()
      .single();

    if (error) {
      console.error('[updateMerchantStatus] Error:', error);
      throw new Error(error.message);
    }

    // Step 2: Write to blockchain contract
    try {
      // Dynamic import to keep contract code server-side only
      const { updateMerchantStatus: updateMerchantStatusOnChain } = await import('src/lib/api/contract-service');
      
      // Status enum: Active=0, Suspended=1, Closed=2, Pending=3
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
        merchant.merchant_id, // Custom merchant_id kullan
        statusEnum
      );
      
      console.log('[updateMerchantStatus] Blockchain update successful:', deployHash);
    } catch (contractError: any) {
      console.error('[updateMerchantStatus] Blockchain update failed:', contractError);
      // Contract hatası kritik değil, Supabase'de değişiklik yapıldı
    }

    return merchant as Merchant;
  } catch (error: any) {
    console.error('[updateMerchantStatus] Error:', error);
    throw error;
  }
}
