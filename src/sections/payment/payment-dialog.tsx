import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';

import type { PayLinkWithProduct, FulfillmentMetadata } from 'src/types/paylink';

import { Iconify } from 'src/components/iconify';

import { PaymentSuccessContent } from './payment-success-content';

type PaymentStatus = 'idle' | 'waiting' | 'verifying' | 'success' | 'failed' | 'partial';

type PendingPayment = {
  id: string;
  unique_payment_id: string;
  expected_amount: number;
  expected_currency: string;
  recipient_address: string;
};

type Props = {
  open: boolean;
  paylink: PayLinkWithProduct;
  paymentStatus: PaymentStatus;
  pendingPayment: PendingPayment | null;
  countdown: number;
  redirectCountdown: number;
  totalReceived: number;
  transactionHash: string;
  onClose: () => void;
  onCancel: () => void;
  onCopyAddress: () => void;
};

export function PaymentDialog({
  open,
  paylink,
  paymentStatus,
  pendingPayment,
  countdown,
  redirectCountdown,
  totalReceived,
  transactionHash,
  onClose,
  onCancel,
  onCopyAddress,
}: Props) {

  const fulfillmentMetadata = paylink.metadata as FulfillmentMetadata | null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
        
            {paymentStatus !== 'success' && (
              <>
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
                      onClick={onCopyAddress}
                    >
                      <Iconify icon="solar:copy-bold" width={16} />
                    </Button>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ py: 1 }}>
                  <Typography variant="caption">
                    1. Open Casper Wallet → 2. Enter Transfer ID in memo → 3. Send exact amount
                  </Typography>
                </Alert>
              </>
            )}
          </Stack>
        
          {paymentStatus === 'success' && <PaymentSuccessContent fulfillmentMetadata={fulfillmentMetadata} />}

          {paymentStatus === 'success' ? (
            <Stack spacing={2}>
              {paylink.custom_success_url && fulfillmentMetadata?.redirect_delay !== undefined && (
                <Alert severity="info" variant="outlined" sx={{ py: 1 }}>
                  <Typography variant="body2">
                    Redirecting in {redirectCountdown} seconds...
                  </Typography>
                </Alert>
              )}
              
              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={onClose}
                  sx={{ flex: 1 }}
                >
                  Close
                </Button>
                
                {transactionHash && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<Iconify icon="solar:link-bold" />}
                    href={`https://${paylink.network === 'mainnet' ? '' : 'testnet.'}cspr.live/deploy/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ flex: 1 }}
                  >
                    View on Explorer
                  </Button>
                )}
              </Stack>
            </Stack>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={onCancel}
              disabled={paymentStatus === 'failed'}
            >
              Cancel Payment
            </Button>
          )}

        </Stack>
      </DialogContent>
    </Dialog>
  );
}
