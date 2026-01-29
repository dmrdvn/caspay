import type { ButtonProps } from '@mui/material/Button';

import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const router = useRouter();

  const { signOut } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).CasperWalletProvider) {
        try {
          const provider = (window as any).CasperWalletProvider({ timeout: 30 * 60 * 1000 });
          await provider.disconnectFromSite();
        } catch (walletError) {
          console.warn('Wallet disconnect error (might be already disconnected):', walletError);
        }
      }
      await signOut?.();

      onClose?.();

      router.replace(CONFIG.auth.redirectPath);
    } catch (error) {
      console.error(error);
      toast.error('Unable to logout!');
    }
  }, [onClose, router, signOut]);

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
