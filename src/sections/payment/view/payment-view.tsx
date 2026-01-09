'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';

import type { PayLinkWithProduct } from 'src/types/paylink';

import { usePaymentMutations } from 'src/hooks/use-payment';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

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
  const { createPendingPayment, cancelPendingPayment } = usePaymentMutations();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [redirectCountdown, setRedirectCountdown] = useState(10); // 10 seconds for redirect
  const [totalReceived, setTotalReceived] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string>('');

  // Cleanup polling on unmount
  useEffect(
    () => () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    },
    [pollingInterval]
  );

  // Countdown timer for payment expiration
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

  // Redirect countdown after successful payment
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
        console.log('[pollForPayment] Checking blockchain for payment:', paymentId);
        
        const { verifyPendingPayments } = await import('src/actions/payment');
        await verifyPendingPayments();
        
        const { checkPaymentStatus } = await import('src/actions/payment');
        const result = await checkPaymentStatus(paymentId);

        console.log('[pollForPayment] Status after verification:', result);

        if (result.status === 'confirmed') {
          console.log('✅ Payment confirmed! Starting redirect countdown...');
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
              console.log('✅ Payment confirmed via Realtime!');
              setPaymentStatus('success');
              setRedirectCountdown(10);
              setTransactionHash(payload.new.transaction_hash || '');
              
              // Stop polling if active
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

      // Create pending payment via action
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
    if (!pendingPayment) return;

    try {
      const result = await cancelPendingPayment(pendingPayment.id);
      
      if (result.success) {
        console.log('[handleCancelPayment] Payment cancelled successfully');
      } else {
        console.error('[handleCancelPayment] Cancel failed:', result.error);
      }

      handleCloseDialog();
    } catch (err) {
      console.error('[handleCancelPayment] Error:', err);
      handleCloseDialog();
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
            label="Testnet Mode"
            size="small"
            color="warning"
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
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={dialogOpen}
              startIcon={<Iconify icon="solar:wallet-bold" />}
              onClick={handleStartPayment}
            >
              {paylink.custom_button_text || 'Pay with Crypto'}
            </Button>
          )}

          {paylink.payment_methods.includes('fiat') && (
            <Box sx={{ position: 'relative' }}>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                disabled
                startIcon={<Iconify icon="solar:dollar-bold" />}
              >
                Pay with Card
              </Button>
              <Chip
                label="Coming Soon"
                size="small"
                color="warning"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 20,
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              />
            </Box>
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

      {/* Payment Dialog - Optimized Design */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="h5">
                {paymentStatus === 'waiting' && 'Waiting for Payment'}
                {paymentStatus === 'success' && 'Payment Confirmed!'}
                {paymentStatus === 'failed' && 'Payment Timeout'}
              </Typography>
              {paymentStatus === 'waiting' && (
                <Typography variant="caption" color="text.secondary">
                  Time remaining: {Math.floor(countdown / 60)}m {String(countdown % 60).padStart(2, '0')}s
                </Typography>
              )}
              {paymentStatus === 'partial' && (
                <Alert severity="warning" sx={{ mt: 1, width: '100%' }}>
                  <Typography variant="caption">
                    Partial payment received: {totalReceived.toFixed(2)} / {paylink.product.price} CSPR
                    <br />
                    Please send remaining: {(paylink.product.price - totalReceived).toFixed(2)} CSPR
                  </Typography>
                </Alert>
              )}
              {paymentStatus === 'success' && (
                <Typography variant="caption" color="success.main">
                  Transaction verified on blockchain
                </Typography>
              )}
              {/* Amount Badge */}
              <Box
                sx={{
                  mt: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'primary.lighter',
                  border: (theme) => `1px solid ${theme.palette.primary.main}`,
                }}
              >
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {fCurrency(paylink.product.price)} {paylink.product.currency}
                </Typography>
              </Box>
            </Stack>

            {/* Status Animation - Always visible */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 110,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {/* Left: Customer */}
              <Stack alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: paymentStatus === 'success' ? 'success.lighter' : 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: paymentStatus === 'waiting' || paymentStatus === 'partial' ? 'pulse 2s ease-in-out infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
                      '50%': { transform: 'scale(1.05)', opacity: 1 },
                    },
                  }}
                >
                  <Iconify 
                    icon={paymentStatus === 'success' ? 'solar:check-circle-bold' : 'solar:user-id-bold'} 
                    width={32} 
                    sx={{ color: paymentStatus === 'success' ? 'success.main' : 'grey.600' }} 
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  You
                </Typography>
              </Stack>

              {paymentStatus !== 'success' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 32,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      animation: paymentStatus === 'waiting' || paymentStatus === 'partial' ? 'moveRight 1.5s ease-in-out infinite' : 'none',
                      '@keyframes moveRight': {
                        '0%': { transform: 'translateX(-30px)', opacity: 0 },
                        '50%': { opacity: 1 },
                        '100%': { transform: 'translateX(30px)', opacity: 0 },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      animation: paymentStatus === 'waiting' || paymentStatus === 'partial' ? 'moveRight 1.5s ease-in-out infinite 0.5s' : 'none',
                    }}
                  />
                </Box>
              )}
              
              <Stack alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: paymentStatus === 'success' ? 'success.lighter' : 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: paymentStatus === 'waiting' || paymentStatus === 'partial' ? 'pulse 2s ease-in-out infinite 0.5s' : 'none',
                  }}
                >
                  <Iconify 
                    icon={paymentStatus === 'success' ? 'solar:check-circle-bold' : 'solar:wallet-bold'} 
                    width={32} 
                    sx={{ color: paymentStatus === 'success' ? 'success.main' : 'grey.600' }} 
                  />
                </Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    fontWeight: 500,
                    maxWidth: 100,
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {paylink.merchant.store_name}
                </Typography>
              </Stack>
            </Box>
          
            <Divider />
          
            {/* Payment Details - Compact */}
            <Stack spacing={2}>
              {pendingPayment && paymentStatus !== 'success' && (
                <Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: 'primary.lighter',
                      border: (theme) => `1px solid ${theme.palette.primary.main}`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Transfer ID
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: 'monospace',
                        letterSpacing: '0.2em',
                        fontWeight: 700,
                        color: 'primary.main',
                      }}
                    >
                      {pendingPayment.unique_payment_id}
                    </Typography>
                  </Box>
                </Box>
              )}
          
              {/* Wallet Address */}
              <Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                      Recipient Address
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                      }}
                    >
                      {paylink.wallet_address}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    sx={{ minWidth: 'auto', p: 0.5 }}
                    onClick={handleCopyAddress}
                  >
                    <Iconify icon="solar:copy-bold" width={16} />
                  </Button>
                </Box>
              </Box>

              {/* Transaction Hash - Only show when success */}
              {paymentStatus === 'success' && transactionHash && (
                <Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'success.lighter',
                      border: (theme) => `1px solid ${theme.palette.success.main}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Transaction Hash
                    </Typography>
                    <Box
                      component="a"
                      href={`https://testnet.cspr.live/deploy/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'block',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          fontSize: '0.7rem',
                          color: 'success.dark',
                          fontWeight: 600,
                        }}
                      >
                        {transactionHash}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Iconify icon="solar:link-bold" width={14} sx={{ color: 'success.main' }} />
                      <Typography variant="caption" sx={{ color: 'success.main', fontSize: '0.65rem' }}>
                        View on Casper Testnet Explorer
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              )}
          
              {/* Instructions - Only show when waiting/partial */}
              {paymentStatus !== 'success' && (
                <Alert severity="info" sx={{ py: 1 }}>
                  <Typography variant="caption">
                    1. Open Casper Wallet → 2. Enter Transfer ID in memo → 3. Send exact amount
                  </Typography>
                </Alert>
              )}
            </Stack>
          
            {/* Action Button */}
            {paymentStatus === 'success' ? (
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={handleCloseDialog}
              >
                Close
              </Button>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={handleCancelPayment}
                disabled={paymentStatus === 'failed'}
              >
                Cancel Payment
              </Button>
            )}

          </Stack>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
