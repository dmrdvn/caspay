'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  status: 'idle' | 'connecting' | 'signing' | 'sending' | 'confirming' | 'success' | 'error';
  deployHash?: string;
  error?: string;
  onClose?: () => void;
};

const STATUS_CONFIG: Record<string, any> = {
  idle: {
    icon: 'solar:wallet-bold-duotone',
    title: 'Ready',
    description: 'Click to start payment...',
    color: 'text.secondary',
  },
  connecting: {
    icon: 'solar:wallet-bold-duotone',
    title: 'Connecting Wallet',
    description: 'Please connect your Casper Wallet...',
    color: 'info.main',
  },
  signing: {
    icon: 'solar:pen-bold-duotone',
    title: 'Awaiting Signature',
    description: 'Please sign the transaction in your wallet...',
    color: 'warning.main',
  },
  sending: {
    icon: 'solar:rocket-2-bold-duotone',
    title: 'Sending Transaction',
    description: 'Broadcasting to Casper Network...',
    color: 'primary.main',
  },
  confirming: {
    icon: 'solar:hourglass-bold-duotone',
    title: 'Confirming Transaction',
    description: 'Waiting for blockchain confirmation...',
    color: 'secondary.main',
  },
  success: {
    icon: 'solar:check-circle-bold-duotone',
    title: 'Payment Successful!',
    description: 'Your payment has been confirmed on-chain.',
    color: 'success.main',
  },
  error: {
    icon: 'solar:danger-bold-duotone',
    title: 'Payment Failed',
    description: 'Please try again or contact support.',
    color: 'error.main',
  },
};

export function PaymentDialog({ open, status, deployHash, error, onClose }: Props) {
  const config = STATUS_CONFIG[status];
  const isLoading = ['connecting', 'signing', 'sending', 'confirming'].includes(status);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 4,
        },
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${config.color}`,
            color: 'white',
            opacity: 0.9,
          }}
        >
          {isLoading ? (
            <CircularProgress size={40} sx={{ color: 'white' }} />
          ) : (
            <Iconify icon={config.icon as any} width={48} />
          )}
        </Box>

        <Stack spacing={1} alignItems="center">
          <Typography variant="h5">{config.title}</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {error || config.description}
          </Typography>
        </Stack>

        {isLoading && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        )}

        {deployHash && (
          <Box
            sx={{
              p: 2,
              width: '100%',
              borderRadius: 2,
              bgcolor: 'background.neutral',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Transaction Hash
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                fontSize: '0.75rem',
              }}
            >
              {deployHash}
            </Typography>
          </Box>
        )}

        {status === 'success' && onClose && (
          <Box sx={{ pt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Redirecting in 3 seconds...
            </Typography>
          </Box>
        )}
      </Stack>
    </Dialog>
  );
}
