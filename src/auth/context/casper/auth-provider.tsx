'use client';

import type { AuthState } from '../../types';

import { useSetState } from 'minimal-shared/hooks';
import { useRef, useMemo, useEffect, useCallback } from 'react';

import { AuthContext } from '../auth-context';
import { syncUserToSupabase, signOutFromSupabase, getUserFromSupabase } from './action';

// ----------------------------------------------------------------------

// Casper Wallet Event Types
const CasperWalletEventTypes = {
  Connected: 'casper-wallet:connected',
  Disconnected: 'casper-wallet:disconnected',
  ActiveKeyChanged: 'casper-wallet:activeKeyChanged',
  Locked: 'casper-wallet:locked',
  Unlocked: 'casper-wallet:unlocked',
  TabChanged: 'casper-wallet:tabChanged',
};

// Local storage keys
const STORAGE_KEYS = {
  PUBLIC_KEY: 'casper_public_key',
  USER: 'casper_user',
};

// Casper Wallet State type
type CasperWalletState = {
  isLocked: boolean;
  isConnected: boolean | undefined;
  activeKey: string | undefined;
};

// ----------------------------------------------------------------------

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

  // Get Casper Wallet Provider
  const getProvider = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const CasperWalletProvider = (window as any).CasperWalletProvider;
    if (!CasperWalletProvider) {
      return null;
    }

    if (!providerRef.current) {
      providerRef.current = CasperWalletProvider({ timeout: 30 * 60 * 1000 });
    }

    return providerRef.current;
  }, []);

  // Check if wallet extension is available
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const checkWallet = () => {
      if ((window as any).CasperWalletProvider) {
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkWallet()) return undefined;


    const interval = setInterval(() => {
      if (checkWallet()) {
        clearInterval(interval);
      }
    }, 500);


    const timeout = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Check existing session
  const checkUserSession = useCallback(async () => {
    try {
      setState({ loading: true });

      // Check local storage for existing session
      const storedPublicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);

      if (storedPublicKey) {
        const user = await getUserFromSupabase(storedPublicKey);

        if (user) {
          sessionCheckedRef.current = true;
          setState({
            user: {
              ...user,
              displayName: user.displayName || `${user.publicKey.slice(0, 8)}...`,
              role: user.role ?? 'merchant',
            },
            loading: false,
          });
          return;
        }
      }

      // Check wallet connection
      const provider = getProvider();
      if (provider) {
        try {
          const isConnected = await provider.isConnected();
          if (isConnected) {
            const activeKey = await provider.getActivePublicKey();
            if (activeKey) {
              const user = await syncUserToSupabase(activeKey, '', 'casper-wallet');

              localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, activeKey);
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

              sessionCheckedRef.current = true;
              setState({
                user: {
                  ...user,
                  displayName: user?.displayName || `${user?.publicKey.slice(0, 8)}...`,
                  role: user?.role ?? 'merchant',
                },
                loading: false,
              });
              return;
            }
          }
        } catch (err: any) {
          // Error code 1: wallet locked, code 2: not connected
          console.warn('Wallet check error:', err.message || err);
        }
      }

      sessionCheckedRef.current = true;
      setState({ user: null, loading: false });
    } catch (error) {
      console.error('checkUserSession error:', error);
      sessionCheckedRef.current = true;
      setState({ user: null, loading: false });
    }
  }, [getProvider, setState]);

  // Handle Casper Wallet events
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleConnected = async (event: any) => {
      try {
        const walletState: CasperWalletState = JSON.parse(event.detail);
        if (walletState.activeKey) {
          const user = await syncUserToSupabase(walletState.activeKey, '', 'casper-wallet');

          localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, walletState.activeKey);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

          setState({
            user: {
              ...user,
              displayName: user?.displayName || `${user?.publicKey.slice(0, 8)}...`,
              role: user?.role ?? 'merchant',
            },
            loading: false,
          });
        }
      } catch (error) {
        console.error('handleConnected error:', error);
        setState({ loading: false });
      }
    };

    const handleDisconnected = () => {
      localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEY);
      localStorage.removeItem(STORAGE_KEYS.USER);
      signOutFromSupabase();
      setState({ user: null, loading: false });
    };

    const handleActiveKeyChanged = async (event: any) => {
      try {
        const walletState: CasperWalletState = JSON.parse(event.detail);
        if (walletState.activeKey && walletState.isConnected) {
          const user = await syncUserToSupabase(walletState.activeKey, '', 'casper-wallet');

          localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, walletState.activeKey);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

          setState({
            user: {
              ...user,
              displayName: user?.displayName || `${user?.publicKey.slice(0, 8)}...`,
              role: user?.role ?? 'merchant',
            },
            loading: false,
          });
        }
      } catch (error) {
        console.error('handleActiveKeyChanged error:', error);
      }
    };

    const handleLocked = () => {
      // Don't clear user data when locked, just note the state
      console.log('Wallet locked');
    };

    const handleUnlocked = () => {
      // Re-check session when unlocked
      sessionCheckedRef.current = false; // Allow re-check after unlock
      checkUserSession();
    };

    // Add event listeners
    window.addEventListener(CasperWalletEventTypes.Connected, handleConnected);
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleDisconnected);
    window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleActiveKeyChanged);
    window.addEventListener(CasperWalletEventTypes.Locked, handleLocked);
    window.addEventListener(CasperWalletEventTypes.Unlocked, handleUnlocked);

    return () => {
      window.removeEventListener(CasperWalletEventTypes.Connected, handleConnected);
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleDisconnected);
      window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleActiveKeyChanged);
      window.removeEventListener(CasperWalletEventTypes.Locked, handleLocked);
      window.removeEventListener(CasperWalletEventTypes.Unlocked, handleUnlocked);
    };
  }, [setState, checkUserSession]);

  // Initialize on mount - check session immediately, no delay!
  useEffect(() => {
    if (!sessionCheckedRef.current) {
      checkUserSession();
    }
  }, [checkUserSession]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            id: state.user.id,
            displayName: state.user.displayName || 'Casper User',
            role: state.user.role ?? 'merchant',
          }
        : null,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      checkUserSession,
    }),
    [state.user, status, checkUserSession]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}

// Re-export for backwards compatibility
export { CasperAuthProvider as AuthProvider };
