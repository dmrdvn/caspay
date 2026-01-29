import { supabaseAdmin } from 'src/lib/supabase';

export interface CreateSessionData {
  publicKey: string;
  walletProvider: 'casper_wallet' | 'casper_click';
  accountHash: string;
}

export async function createSupabaseSession(data: CreateSessionData) {
  try {
    const email = `${data.publicKey.slice(0, 16)}@caspay.wallet`;

    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    let existingUser = users.users.find(u => u.email === email);

    if (!existingUser) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          public_key: data.publicKey,
          wallet_provider: data.walletProvider,
          account_hash: data.accountHash,
        },
      });

      if (createError) throw createError;
      existingUser = newUser.user;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          public_key: data.publicKey,
          wallet_provider: data.walletProvider,
          account_hash: data.accountHash,
        },
      });
    }

    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
      });

    if (sessionError) throw sessionError;

    const hashed_token = sessionData.properties.hashed_token;

    const { data: session, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      type: 'recovery',
      token_hash: hashed_token,
    });

    if (verifyError) throw verifyError;

    return {
      access_token: session.session!.access_token,
      refresh_token: session.session!.refresh_token,
      user: {
        id: existingUser!.id,
        email,
        public_key: data.publicKey,
        wallet_provider: data.walletProvider,
      },
    };
  } catch (error: any) {
    console.error('[createSupabaseSession] Error:', error);
    throw new Error(error?.message || 'Failed to create session');
  }
}
