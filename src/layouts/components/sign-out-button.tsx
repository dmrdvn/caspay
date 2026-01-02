import type { ButtonProps } from '@mui/material/Button';

import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';
import { signOutFromSupabase } from 'src/auth/context/casper/action';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      // Clear local storage first
      await signOutFromSupabase();
      
      // Disconnect Casper Wallet (this will trigger handleDisconnected event)
      if (typeof window !== 'undefined' && (window as any).CasperWalletProvider) {
        try {
          const provider = (window as any).CasperWalletProvider({ timeout: 30 * 60 * 1000 });
          await provider.disconnectFromSite();
        } catch (walletError) {
          console.warn('Wallet disconnect error (might be already disconnected):', walletError);
        }
      }
      
      // Refresh session to clear user state
      await checkUserSession?.();

      onClose?.();
      
      // Force redirect to sign-in page
      router.replace(CONFIG.auth.redirectPath);
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [checkUserSession, onClose, router]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
    >
      Logout
    </Button>
  );
}
