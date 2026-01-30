'use client';

import type { AuthState } from '../../types';
import { useSetState } from 'minimal-shared/hooks';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import { AuthContext } from '../auth-context';
import { supabase } from 'src/lib/supabase';

type Props = {
  children: React.ReactNode;
};

export function CasperAuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({
    user: null,
    loading: true,
  });

  const sessionCheckedRef = useRef(false);
  const providerRef = useRef<any>(null);

  const getProvider = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const CasperWalletProvider = (window as any).CasperWalletProvider;
    if (!CasperWalletProvider) return null;
    if (!providerRef.current) {
      providerRef.current = CasperWalletProvider({ timeout: 30 * 60 * 1000 });
    }
    return providerRef.current;
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single();

        if (error) {
          console.error('[checkSession] Profile fetch error:', error);
          setState({ user: null, loading: false });
          return;
        }

        if (profile) {
          setState({
            user: {
              id: profile.id,
              publicKey: profile.public_key,
              accountHash: profile.account_hash,
              walletProvider: profile.wallet_provider,
              email: profile.email,
              displayName: profile.full_name,
              avatarUrl: profile.avatar_url,
              role: 'merchant',
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            },
            loading: false,
          });
        } else {
          setState({ user: null, loading: false });
        }
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('[checkSession] Error:', error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  const signInWithCasper = useCallback(async () => {
    try {
      setState({ loading: true });

      const provider = getProvider();
      if (!provider) {
        throw new Error('Casper Wallet not found');
      }

      const connected = await provider.isConnected();
      if (!connected) {
        await provider.requestConnection();
      }

      const publicKey = await provider.getActivePublicKey();
      const accountHash = await provider.getActiveAccountHash?.() || publicKey;

      const challengeRes = await fetch(`/api/auth/casper/challenge?publicKey=${publicKey}`);
      const { nonce, message } = await challengeRes.json();

      const signatureResponse = await provider.signMessage(message, publicKey);
      let signature = signatureResponse.signature;

      if (signature instanceof Uint8Array) {
        signature = Buffer.from(signature).toString('hex');
      } else if (typeof signature === 'object' && signature.data) {
        signature = Buffer.from(signature.data).toString('hex');
      } else if (typeof signature !== 'string') {
        signature = String(signature);
      }

      const verifyRes = await fetch('/api/auth/casper/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey,
          signature,
          nonce,
          walletProvider: 'casper_wallet',
          accountHash,
        }),
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.error || 'Authentication failed');
      }

      const { access_token, refresh_token } = await verifyRes.json();

      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      await checkSession();

      return true;
    } catch (error: any) {
      console.error('[signInWithCasper] Error:', error);
      setState({ loading: false });
      throw error;
    }
  }, [getProvider, setState, checkSession]);

  const signOut = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/casper/logout', { method: 'POST' });
      const data = await response.json();
      
      await supabase.auth.signOut();
      setState({ user: null, loading: false });
      
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (error) {
      console.error('[signOut] Error:', error);
    }
  }, [setState]);

  useEffect(() => {
    if (sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkSession();
      } else {
        setState({ user: null, loading: false });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkSession, setState]);

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      authenticated: !!state.user,
      unauthenticated: !state.user && !state.loading,
      checkUserSession: checkSession,
      signInWithCasper,
      signOut,
    }),
    [state.user, state.loading, checkSession, signInWithCasper, signOut]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
