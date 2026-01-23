'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import type { PayLinkWithProduct } from 'src/types/paylink';
import type { SimpleSwapExchange } from 'src/types/simpleswap';

import { usePaymentMutations } from 'src/hooks/use-payment';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { PaymentDialog } from '../payment-dialog';
import { BridgePaymentDialog } from '../bridge-payment-dialog';
import { FiatPaymentDialog } from '../fiat-payment-dialog';

type Props = {
  paylink: PayLinkWithProduct | null;
};

type PaymentStatus = 'idle' | 'waiting' | 'verifying' | 'success' | 'failed' | 'partial';

type PendingPayment = {
  id: string;
  unique_payment_id: string;
  expected_amount: number;
  expected_currency: string;
  recipient_address: string;
};

type PartialPayment = {
  amount: number;
  hash: string;
  timestamp: string;
};

export function PaymentView({ paylink }: Props) {
  const { createPendingPayment, cancelPendingPayment, recordBridgePayment } = usePaymentMutations();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bridgeDialogOpen, setBridgeDialogOpen] = useState(false);
  const [fiatDialogOpen, setFiatDialogOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [redirectCountdown, setRedirectCountdown] = useState(10); // 10 seconds for redirect
  const [totalReceived, setTotalReceived] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string>('');

  useEffect(
    () => () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    },
    [pollingInterval]
  );

  useEffect(() => {
    if (paymentStatus === 'waiting' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && paymentStatus === 'waiting') {
      setPaymentStatus('failed');
      if (pollingInterval) clearInterval(pollingInterval);

    }
    return undefined;
  }, [paymentStatus, countdown, pollingInterval, pendingPayment]);

  useEffect(() => {
    if (paymentStatus === 'success' && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (redirectCountdown === 0 && paymentStatus === 'success' && paylink?.custom_success_url) {
      window.location.href = paylink.custom_success_url;
    }
    return undefined;
  }, [redirectCountdown, paymentStatus, paylink]);

  const pollForPayment = useCallback(
    async (paymentId: string) => {
      try {
        
        const { verifyPendingPayments } = await import('src/actions/payment');
        await verifyPendingPayments();
        
        const { checkPaymentStatus } = await import('src/actions/payment');
        const result = await checkPaymentStatus(paymentId);

        if (result.status === 'confirmed') {
          console.log('Payment confirmed! Starting redirect countdown...');
          setPaymentStatus('success');
          setRedirectCountdown(10);
          setTransactionHash(result.transactionHash || '');
          if (pollingInterval) clearInterval(pollingInterval);
        }

        if (result.status === 'failed') {
          setPaymentStatus('failed');
          if (pollingInterval) clearInterval(pollingInterval);
        }
        
        if (result.metadata?.partial_payments) {
          const payments: PartialPayment[] = result.metadata.partial_payments;
          setTotalReceived(result.metadata.total_received || 0);
          if (payments.length > 0 && result.status === 'pending') {
            setPaymentStatus('partial');
          }
        }
      } catch (err) {
        console.error('[pollForPayment] Error:', err);
      }
    },
    [pollingInterval]
  );

  useEffect(() => {
    if (!pendingPayment || paymentStatus !== 'waiting') return;

    const setupRealtimeSubscription = async () => {
      const { supabase } = await import('src/lib/supabase');

      const channel = supabase
        .channel(`payment-${pendingPayment.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'payments',
            filter: `id=eq.${pendingPayment.id}`,
          },
          (payload: any) => {
            console.log('[Realtime] Payment update:', payload);
            
            if (payload.new.status === 'confirmed') {
              setPaymentStatus('success');
              setRedirectCountdown(10);
              setTransactionHash(payload.new.transaction_hash || '');
              
              if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
              }
            }
            
            if (payload.new.status === 'failed') {
              setPaymentStatus('failed');
              if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [pendingPayment, paymentStatus, pollingInterval]);

  const handleStartPayment = async () => {
    if (!paylink) return;

    try {
      setDialogOpen(true);
      setPaymentStatus('waiting');
      setCountdown(600);

      const result = await createPendingPayment({
        paylinkId: paylink.id,
        merchantId: paylink.merchant_id,
        productId: paylink.product_id,
        amount: paylink.product.price,
        currency: paylink.product.currency,
        walletAddress: paylink.wallet_address,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create payment');
      }

      setPendingPayment({
        id: result.data.paymentId,
        unique_payment_id: result.data.uniqueCode.toString(),
        expected_amount: paylink.product.price,
        expected_currency: paylink.product.currency,
        recipient_address: paylink.wallet_address,
      });

      const interval = setInterval(() => {
        pollForPayment(result.data!.paymentId);
      }, 10000);

      setPollingInterval(interval);
    } catch (err: any) {
      console.error('[handleStartPayment] Error:', err);
      console.error('[handleStartPayment] Error message:', err?.message);
      console.error('[handleStartPayment] Error details:', JSON.stringify(err, null, 2));
      alert(`Payment initialization failed: ${err?.message || 'Unknown error'}`);
      setPaymentStatus('failed');
    }
  };

  const handleCopyAddress = () => {
    if (paylink) {
      navigator.clipboard.writeText(paylink.wallet_address);
    }
  };

  const handleCloseDialog = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    setDialogOpen(false);
    setPaymentStatus('idle');
    setPendingPayment(null);
    setCountdown(600);
    setRedirectCountdown(10);
    setTransactionHash('');
  };

  const handleCancelPayment = async () => {
    if (!pendingPayment) {
      handleCloseDialog();
      return;
    }
    const paymentId = pendingPayment.id;

    handleCloseDialog();

    try {
      const result = await cancelPendingPayment(paymentId);
      
      if (result.success) {
        console.log('[handleCancelPayment] Payment cancelled successfully');
      } else {
        console.error('[handleCancelPayment] Cancel failed:', result.error);
      }
    } catch (err) {
      console.error('[handleCancelPayment] Error:', err);
    }
  };

  const handleBridgeSuccess = async (exchange: SimpleSwapExchange) => {
    if (!paylink) return;

    try {
  
      const fromCurrency = exchange.currencyFrom ? exchange.currencyFrom.toUpperCase() : '';
      const fromAmount = exchange.amountFrom || '';
      const fromAddress = exchange.addressFrom || '';


      const result = await recordBridgePayment({
        paylinkId: paylink.id,
        merchantId: paylink.merchant_id,
        productId: paylink.product_id,
        amount: parseFloat(exchange.amountTo),
        currency: 'CSPR',
        exchangeId: exchange.id,
        csprTxHash: exchange.txTo || null,
        fromCurrency,
        fromAmount,
        fromAddress,
      });

      if (result.success) {
        console.log('[handleBridgeSuccess] Bridge payment recorded successfully!', {
          paymentId: result.data?.paymentId,
        });
        
        if (paylink.custom_success_url) {
          console.log('[handleBridgeSuccess] Redirecting to custom success URL in 3s:', paylink.custom_success_url);
          setTimeout(() => {
            window.location.href = paylink.custom_success_url!;
          }, 3000);
        } else {
          console.log('[handleBridgeSuccess] No custom success URL configured, staying on page');
        }
      } else {
        console.error('[handleBridgeSuccess] Failed to record payment:', result.error);
      }
    } catch (err) {
      console.error('[handleBridgeSuccess] Exception occurred:', err);
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
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
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

          <Chip
            label={paylink.network === 'mainnet' ? 'Mainnet Mode' : 'Testnet Mode'}
            size="small"
            color={paylink.network === 'mainnet' ? 'success' : 'warning'}
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              borderRadius: 1,
            }}
          />
        </Stack>

        <Stack spacing={3} sx={{ mb: 4 }}>
          {product.image_url && (
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={product.image_url}
                sx={{ width: 1, height: 240, objectFit: 'cover', borderRadius: 2 }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  px: 2,
                  py: 1,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                  {fCurrency(product.price)} {product.currency}
                </Typography>
              </Box>
            </Box>
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

          {!product.image_url && (
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
          )}
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
            Payment Method
          </Typography>

          {(!paylink.payment_methods || paylink.payment_methods.length === 0) && (
            <Alert severity="warning">
              <Typography variant="caption">
                No payment methods configured for this link
              </Typography>
            </Alert>
          )}
    
          {paylink.payment_methods.includes('wallet') && (
            <Box sx={{ position: 'relative' }}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                disabled={dialogOpen}
                startIcon={<Iconify icon="solar:wallet-bold" />}
                onClick={handleStartPayment}
              >
                {paylink.custom_button_text || 'Pay Now'}
              </Button>
              <Chip
                label="~10 seconds"
                size="small"
                color="success"
                variant="filled"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 20,
                  borderRadius: 1,
                  boxShadow: 1,
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                }}
              />
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: paylink.payment_methods.filter((m) => m === 'fiat' || (m === 'bridge' && paylink.network === 'mainnet')).length > 1 ? 'repeat(2, 1fr)' : '1fr',
              },
              gap: 2,
            }}
          >
            {paylink.payment_methods.includes('fiat') && (
              <Box sx={{ position: 'relative' }}>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  disabled={dialogOpen || bridgeDialogOpen || fiatDialogOpen}
                  startIcon={<Iconify icon={'solar:card-bold' as any} />}
                  onClick={() => setFiatDialogOpen(true)}
                >
                  Pay with Card
                </Button>
                <Chip
                  label="Coming Soon"
                  size="small"
                  color="warning"
                  variant="filled"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    height: 20,
                    borderRadius: 1,
                    boxShadow: 1,
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                  }}
                />
              </Box>
            )}

            {paylink.payment_methods.includes('bridge') && paylink.network === 'mainnet' && (
              <Box sx={{ position: 'relative' }}>
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  disabled={dialogOpen || bridgeDialogOpen}
                  startIcon={<Iconify icon="solar:link-bold" />}
                  onClick={() => setBridgeDialogOpen(true)}
                >
                  Pay with Bridge
                </Button>
                <Chip
                  label="~1-2 minutes"
                  size="small"
                  color="info"
                  variant="filled"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    height: 20,
                    borderRadius: 1,
                    boxShadow: 1,
                    bgcolor: 'info.main',
                    color: 'info.contrastText',
                  }}
                />
              </Box>
            )}
          </Box>
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

      {paylink && (
        <PaymentDialog
          open={dialogOpen}
          paylink={paylink}
          paymentStatus={paymentStatus}
          pendingPayment={pendingPayment}
          countdown={countdown}
          redirectCountdown={redirectCountdown}
          totalReceived={totalReceived}
          transactionHash={transactionHash}
          onClose={handleCloseDialog}
          onCancel={handleCancelPayment}
          onCopyAddress={handleCopyAddress}
        />
      )}

      {paylink && (
        <BridgePaymentDialog
          open={bridgeDialogOpen}
          paylink={paylink}
          onClose={() => setBridgeDialogOpen(false)}
          onSuccess={handleBridgeSuccess}
        />
      )}

      {paylink && (
        <FiatPaymentDialog
          open={fiatDialogOpen}
          paylink={paylink}
          onClose={() => setFiatDialogOpen(false)}
        />
      )}
    </Container>
  );
}
