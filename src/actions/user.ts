'use server';

import { createServerSupabaseClient } from 'src/lib/supabase-server';

export async function updateUserProfile(
  publicKey: string,
  data: {
    full_name?: string;
    email?: string;
    avatar_url?: string | null;
  }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const updateData: any = {};
    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('public_key', publicKey);

    if (error) {
      console.error('[updateUserProfile] Error:', error);
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[updateUserProfile] Error:', error);
    throw error;
  }
}
