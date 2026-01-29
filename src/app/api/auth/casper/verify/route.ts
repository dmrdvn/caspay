import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCasperSignature, formatAuthMessage } from 'src/lib/auth/casper-signature';
import { createSupabaseSession } from 'src/lib/auth/supabase-auth-admin';
import { supabaseAdmin } from 'src/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicKey, signature, nonce, walletProvider = 'casper_wallet', accountHash } = body;

    if (!publicKey || !signature || !nonce) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = formatAuthMessage(publicKey, nonce);
    const verification = await verifyCasperSignature(message, signature, publicKey);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Invalid signature' },
        { status: 401 }
      );
    }

    const session = await createSupabaseSession({
      publicKey,
      walletProvider,
      accountHash: accountHash || publicKey,
    });

    let { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, auth_user_id, public_key, account_hash, wallet_provider')
      .eq('public_key', publicKey)
      .maybeSingle();

    if (!profile) {
      const { data: profileById } = await supabaseAdmin
        .from('user_profiles')
        .select('id, auth_user_id, public_key, account_hash, wallet_provider')
        .eq('id', session.user.id)
        .maybeSingle();
      profile = profileById;
    }

    if (!profile) {
      const { data: profileByAuth } = await supabaseAdmin
        .from('user_profiles')
        .select('id, auth_user_id, public_key, account_hash, wallet_provider')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      profile = profileByAuth;
    }

    if (!profile) {
      const userId = session.user.id;
      const { error: insertError } = await supabaseAdmin.from('user_profiles').insert({
        id: userId,
        auth_user_id: userId,
        public_key: publicKey,
        email: session.user.email,
        account_hash: accountHash || publicKey,
        wallet_provider: walletProvider,
      });

      if (insertError) {
        console.error('[Verify] Profile insert error:', insertError);
        throw insertError;
      }
    } else {
      const updates: any = {};
      if (!profile.auth_user_id) {
        updates.auth_user_id = session.user.id;
      }
      if (!profile.public_key) {
        updates.public_key = publicKey;
      }
      if (!profile.account_hash) {
        updates.account_hash = accountHash || publicKey;
      }
      if (!profile.wallet_provider) {
        updates.wallet_provider = walletProvider;
      }
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update(updates)
          .eq('id', profile.id);
        
        if (updateError) {
          console.error('[Verify] Profile update error:', updateError);
          throw updateError;
        }
      }
    }

    const cookieStore = await cookies();
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    };

    cookieStore.set('sb-access-token', session.access_token, cookieOptions);
    cookieStore.set('sb-refresh-token', session.refresh_token, cookieOptions);

    return NextResponse.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
    });
  } catch (error: any) {
    console.error('[Verify] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
