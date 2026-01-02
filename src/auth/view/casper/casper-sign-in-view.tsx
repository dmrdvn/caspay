'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { SvgColor } from 'src/components/svg-color';

import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

export function CasperSignInView() {
  const router = useRouter();
  const { loading, authenticated, checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAvailable, setWalletAvailable] = useState(false);

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
        setWalletAvailable(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkWallet()) return undefined;

    // Check periodically
    const interval = setInterval(() => {
      if (checkWallet()) {
        clearInterval(interval);
      }
    }, 500);

    // Stop after 10 seconds
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (authenticated) {
      router.push(paths.dashboard.root);
    }
  }, [authenticated, router]);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);

      const provider = getProvider();

      if (!provider) {
        setErrorMessage(
          'Casper Wallet uzantısı bulunamadı. Lütfen Casper Wallet uzantısını yükleyin.'
        );
        return;
      }

      // Request connection
      const connected = await provider.requestConnection();

      if (connected) {
        // Connection successful, refresh session
        await checkUserSession?.();
      } else {
        setErrorMessage('Bağlantı reddedildi.');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);

      if (error.code === 1) {
        setErrorMessage('Cüzdan kilitli. Lütfen Casper Wallet uzantısını açın ve kilidini açın.');
      } else {
        setErrorMessage(error.message || 'Cüzdan bağlantısı başarısız oldu');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const renderWalletOptions = () => (
    <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
      <Button
        fullWidth
        size="large"
        variant="contained"
        onClick={handleConnectWallet}
        disabled={isConnecting || loading || !walletAvailable}
        startIcon={
          isConnecting || loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SvgColor src="/assets/icons/casper-wallet.svg" sx={{ width: 24, height: 24 }} />
          )
        }
        sx={{
          bgcolor: 'primary.main',
          py: 1.5,
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        {isConnecting || loading
          ? 'Bağlanıyor...'
          : walletAvailable
            ? 'Casper Wallet ile Bağlan'
            : 'Cüzdan Aranıyor...'}
      </Button>

      {!walletAvailable && (
        <Alert severity="warning">
          Casper Wallet uzantısı bulunamadı.{' '}
          <a
            href="https://www.casperwallet.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', fontWeight: 'bold' }}
          >
            Buradan indirin
          </a>
        </Alert>
      )}

      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
        Desteklenen cüzdan:
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <WalletBadge name="Casper Wallet" active />
      </Box>
    </Box>
  );

  return (
    <>
      <FormHead
        title="CasPay'e Hoş Geldiniz"
        description="Casper wallet'ınızı bağlayarak merchant dashboard'a erişin"
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          CasPay, Casper Network üzerinde ödeme kabul etmenizi ve abonelik yönetmenizi sağlar.
          Başlamak için wallet&apos;ınızı bağlayın.
        </Alert>
      </Box>

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {renderWalletOptions()}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Bağlanarak, Kullanım Şartları ve Gizlilik Politikasını kabul etmiş olursunuz.
        </Typography>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

type WalletBadgeProps = {
  name: string;
  active?: boolean;
};

function WalletBadge({ name, active }: WalletBadgeProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        bgcolor: active ? 'primary.lighter' : 'background.neutral',
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: active ? 'primary.main' : 'text.secondary', fontWeight: active ? 600 : 400 }}
      >
        {name}
      </Typography>
    </Box>
  );
}
