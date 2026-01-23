'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import type { PayLinkWithProduct } from 'src/types/paylink';

import { Iconify } from 'src/components/iconify';

type Props = {
  open: boolean;
  paylink: PayLinkWithProduct;
  onClose: () => void;
};

export function FiatPaymentDialog({ open, paylink, onClose }: Props) {
  const handleBuyWithCard = () => {
    const url = new URL('https://simpleswap.io/buy-crypto');
    url.searchParams.set('ticker_to', 'cspr');
    url.searchParams.set('amount_to', paylink.product.price.toString());
    url.searchParams.set('address_to', paylink.wallet_address);
    
    window.open(url.toString(), '_blank');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2.5 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Buy Crypto with Card</Typography>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon={'eva:close-fill' as any} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'primary.lighter',
              border: (theme) => `1px dashed ${theme.palette.primary.main}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ color: 'primary.main', mb: 1, fontWeight: 700 }}>
              {paylink.product.price} CSPR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Payment amount
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ width: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon={'solar:card-bold' as any} width={20} color="success.main" />
              <Typography variant="body2">Visa, Mastercard, Google Pay</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:shield-check-bold" width={20} color="success.main" />
              <Typography variant="body2">Secure payment processing</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:clock-circle-bold" width={20} color="success.main" />
              <Typography variant="body2">Fast delivery (~5-10 minutes)</Typography>
            </Stack>
          </Stack>

          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled
            startIcon={<Iconify icon={'solar:card-bold' as any} />}
            onClick={handleBuyWithCard}
          >
            Continue to Payment (Soon)
          </Button>

          <Button
            fullWidth
            size="large"
            variant="contained"
            color="inherit"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
