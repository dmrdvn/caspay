'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fCurrency } from 'src/utils/format-number';

import type { PayLinkWithProduct } from 'src/types/paylink';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

type Props = {
  paylink: PayLinkWithProduct | null;
};

export function PaymentView({ paylink }: Props) {
  const [paying, setPaying] = useState(false);

  const handleWalletPayment = async () => {
    setPaying(true);
    try {
      alert('Wallet payment - Casper Signer integration');
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setPaying(false);
    }
  };

  const handleFiatPayment = async () => {
    setPaying(true);
    try {
      alert('Fiat payment - Transak/Ramp integration');
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setPaying(false);
    }
  };

  if (!paylink) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <EmptyContent
          filled
          title="Payment Link Not Found"
          description="Invalid or expired link"
        />
      </Container>
    );
  }

  const { product, merchant } = paylink;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, md: 10 } }}>
      <Card sx={{ p: { xs: 3, md: 5 } }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar src={merchant.logo_url || undefined} sx={{ width: 56, height: 56 }}>
            {merchant.store_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{merchant.store_name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Powered by CasPay
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={3} sx={{ mb: 4 }}>
          {product.image_url && (
            <Box
              component="img"
              src={product.image_url}
              sx={{ width: 1, height: 240, objectFit: 'cover', borderRadius: 2 }}
            />
          )}

          <Box>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            {product.description && (
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="h3">
                {fCurrency(product.price)} {product.currency}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {paylink.custom_message && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              border: (theme) => `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2">{paylink.custom_message}</Typography>
          </Box>
        )}

        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">
            Choose Payment Method
          </Typography>

          {paylink.payment_methods.includes('wallet') && (
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              loading={paying}
              startIcon={<Iconify icon="solar:wallet-bold" />}
              onClick={handleWalletPayment}
            >
              {paylink.custom_button_text || 'Pay with Casper Wallet'}
            </LoadingButton>
          )}

          {paylink.payment_methods.includes('fiat') && (
            <LoadingButton
              fullWidth
              size="large"
              variant="outlined"
              loading={paying}
              startIcon={<Iconify icon="solar:dollar-bold" />}
              onClick={handleFiatPayment}
            >
              Pay with Card
            </LoadingButton>
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{ mt: 4, color: 'text.disabled' }}
        >
          <Iconify icon="solar:shield-check-bold" width={20} />
          <Typography variant="caption">Secured by Casper Blockchain</Typography>
        </Stack>
      </Card>
    </Container>
  );
}
