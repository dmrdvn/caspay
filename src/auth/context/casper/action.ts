'use client';

import type { CasperUserType } from '../../types';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

export async function syncUserToSupabase(
  publicKey: string,
  accountHash: string,
  walletProvider: string
): Promise<CasperUserType> {
  try {
    // Check if user already exists by public_key
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('public_key', publicKey)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (user doesn't exist)
      console.error('Error fetching user:', fetchError);
      throw fetchError;
    }

    if (existingUser) {
      // Update existing user's last login
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('public_key', publicKey)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }

      return {
        id: updatedUser.id,
        publicKey: updatedUser.public_key,
        accountHash: updatedUser.account_hash || accountHash,
        walletProvider: updatedUser.wallet_provider || walletProvider,
        email: updatedUser.email,
        displayName: updatedUser.full_name,
        avatarUrl: updatedUser.avatar_url,
        role: 'merchant',
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      };
    }

    // Create new user (id will be auto-generated UUID)
    const { data: newUser, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        public_key: publicKey,
        email: `${publicKey.slice(0, 8)}@caspay.wallet`,
        account_hash: accountHash,
        wallet_provider: walletProvider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      throw insertError;
    }

    return {
      id: newUser.id,
      publicKey: newUser.public_key,
      accountHash: newUser.account_hash,
      walletProvider: newUser.wallet_provider,
      email: newUser.email,
      displayName: newUser.full_name,
      avatarUrl: newUser.avatar_url,
      role: 'merchant',
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at,
    };
  } catch (error) {
    console.error('syncUserToSupabase error:', error);
    throw error;
  }
}

/**
 * Get user from Supabase by public key
 */
export async function getUserFromSupabase(publicKey: string): Promise<CasperUserType | null> {
  try {
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('public_key', publicKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw error;
    }

    return {
      id: user.id,
      publicKey: user.public_key,
      accountHash: user.account_hash,
      walletProvider: user.wallet_provider,
      email: user.email,
      displayName: user.full_name,
      avatarUrl: user.avatar_url,
      role: 'merchant',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  } catch (error) {
    console.error('getUserFromSupabase error:', error);
    return null;
  }
}

/**
 * Remove user session (local only, doesn't delete from DB)
 */
export async function signOutFromSupabase(): Promise<void> {
  // Clear any local storage if needed
  if (typeof window !== 'undefined') {
    localStorage.removeItem('casper_user');
    localStorage.removeItem('casper_public_key');
  }
}

/**
 * Update user profile in Supabase
 */
export async function updateUserProfile(
  publicKey: string,
  updates: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  }
): Promise<CasperUserType> {
  try {
    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('public_key', publicKey)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    return {
      id: updatedUser.id,
      publicKey: updatedUser.public_key,
      accountHash: updatedUser.account_hash,
      walletProvider: updatedUser.wallet_provider,
      email: updatedUser.email,
      displayName: updatedUser.full_name,
      avatarUrl: updatedUser.avatar_url,
      role: 'merchant',
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };
  } catch (error) {
    console.error('updateUserProfile error:', error);
    throw error;
  }
}
