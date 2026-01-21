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
  const fulfillmentType = fulfillmentMetadata?.fulfillment_type || 'none';

  const renderFulfillmentContent = () => {
    if (!fulfillmentMetadata || fulfillmentType === 'none') {
      return null;
    }

    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2.5,
          bgcolor: 'background.paper',
          border: (theme) => `2px solid ${theme.palette.divider}`,
        }}
      >
        {fulfillmentType === 'digital_download' && fulfillmentMetadata.digital_download && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.customShadows.primary,
                }}
              >
                <Iconify icon="solar:download-bold" width={20} sx={{ color: 'white' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Your Download is Ready!
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fulfillmentMetadata.digital_download.file_name || 'Digital Product'}
                </Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:download-bold" />}
              href={fulfillmentMetadata.digital_download.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ py: 1.5 }}
            >
              Download Now
            </Button>
            
            {fulfillmentMetadata.digital_download.expires_hours && fulfillmentMetadata.digital_download.expires_hours > 0 && (
              <Alert severity="warning" variant="outlined" sx={{ py: 1 }}>
                <Typography variant="body2">
                  ⏰ Download link expires in {fulfillmentMetadata.digital_download.expires_hours} hours
                </Typography>
              </Alert>
            )}
          </Stack>
        )}

        {fulfillmentType === 'license_key' && fulfillmentMetadata.license_key && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.customShadows.warning,
                }}
              >
                <Iconify icon="solar:key-bold" width={20} sx={{ color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Your License Key
              </Typography>
            </Stack>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'warning.lighter',
                border: (theme) => `2px dashed ${theme.palette.warning.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'monospace',
                  letterSpacing: '0.15em',
                  fontWeight: 700,
                  color: 'warning.darker',
                  wordBreak: 'break-all',
                }}
              >
                {fulfillmentMetadata.license_key.key}
              </Typography>
              <Button
                size="small"
                sx={{
                  minWidth: 'auto',
                  p: 0.5,
                  color: 'text.secondary',
                }}
                onClick={() => {
                  navigator.clipboard.writeText(fulfillmentMetadata.license_key!.key);
                }}
              >
                <Iconify icon="solar:copy-bold" width={20} />
              </Button>
            </Box>
            
            {fulfillmentMetadata.license_key.instructions && (
              <Alert severity="info" variant="outlined" sx={{ py: 1 }}>
                <Typography variant="caption">
                  {fulfillmentMetadata.license_key.instructions}
                </Typography>
              </Alert>
            )}
          </Stack>
        )}

        {fulfillmentType === 'service_access' && fulfillmentMetadata.service_access && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.customShadows.info,
                }}
              >
                <Iconify icon="solar:settings-bold" width={20} sx={{ color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Access Granted!
              </Typography>
            </Stack>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            {fulfillmentMetadata.service_access.username && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: 'info.lighter',
                  border: (theme) => `1px solid ${theme.palette.info.light}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Username
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'info.darker' }}>
                  {fulfillmentMetadata.service_access.username}
                </Typography>
              </Box>
            )}
            
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="info"
              startIcon={<Iconify icon="solar:link-bold" />}
              href={fulfillmentMetadata.service_access.access_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ py: 1.5 }}
            >
              Access Now
            </Button>
            
            {fulfillmentMetadata.service_access.instructions && (
              <Alert severity="info" variant="outlined" sx={{ py: 1 }}>
                <Typography variant="caption">
                  {fulfillmentMetadata.service_access.instructions}
                </Typography>
              </Alert>
            )}
          </Stack>
        )}

        {fulfillmentType === 'donation' && fulfillmentMetadata.donation && (
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) => theme.customShadows.error,
              }}
            >
              <Iconify icon="solar:heart-bold" width={24} sx={{ color: 'white' }} />
            </Box>
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Thank You for Your Donation!
              </Typography>
              {fulfillmentMetadata.donation.campaign_name && (
                <Typography variant="body2" color="text.secondary">
                  {fulfillmentMetadata.donation.campaign_name}
                </Typography>
              )}
            </Box>
            
            {fulfillmentMetadata.donation.thank_you_note && (
              <>
                <Divider sx={{ width: '100%', borderStyle: 'dashed' }} />
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'error.lighter',
                    width: '100%',
                  }}
                >
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'error.darker' }}>
                    &ldquo;{fulfillmentMetadata.donation.thank_you_note}&rdquo;
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        )}

        {fulfillmentType === 'coupon_voucher' && fulfillmentMetadata.coupon_voucher && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.customShadows.success,
                }}
              >
                <Iconify icon="solar:cart-plus-bold" width={20} sx={{ color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Your Coupon Code
              </Typography>
            </Stack>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'success.lighter',
                border: (theme) => `2px dashed ${theme.palette.success.main}`,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  fontWeight: 700,
                  color: 'success.darker',
                }}
              >
                {fulfillmentMetadata.coupon_voucher.coupon_code}
              </Typography>
            </Box>
            
            {fulfillmentMetadata.coupon_voucher.discount_info && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontWeight: 500 }}>
                {fulfillmentMetadata.coupon_voucher.discount_info}
              </Typography>
            )}
            
            {fulfillmentMetadata.coupon_voucher.expires_at && (
              <Alert severity="warning" variant="outlined" sx={{ py: 1 }}>
                <Typography variant="body2">
                  ⏰ Expires: {new Date(fulfillmentMetadata.coupon_voucher.expires_at).toLocaleDateString()}
                </Typography>
              </Alert>
            )}
          </Stack>
        )}

        {fulfillmentType === 'event_ticket' && fulfillmentMetadata.event_ticket && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.customShadows.secondary,
                }}
              >
                <Iconify icon="solar:calendar-bold" width={20} sx={{ color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Event Ticket
              </Typography>
            </Stack>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: 'secondary.lighter',
                  border: (theme) => `1px solid ${theme.palette.secondary.light}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Event
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'secondary.darker' }}>
                  {fulfillmentMetadata.event_ticket.event_name}
                </Typography>
              </Box>
              
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(fulfillmentMetadata.event_ticket.event_date).toLocaleString()}
                </Typography>
              </Box>
              
              {fulfillmentMetadata.event_ticket.venue && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Venue
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {fulfillmentMetadata.event_ticket.venue}
                  </Typography>
                </Box>
              )}
              
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'secondary.lighter',
                  border: (theme) => `2px dashed ${theme.palette.secondary.main}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Ticket Code
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'monospace',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    color: 'secondary.darker',
                  }}
                >
                  {fulfillmentMetadata.event_ticket.ticket_code}
                </Typography>
              </Box>
              
              {fulfillmentMetadata.event_ticket.additional_info && (
                <Alert severity="info" variant="outlined" sx={{ py: 1 }}>
                  <Typography variant="caption">
                    {fulfillmentMetadata.event_ticket.additional_info}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Stack>
        )}

        {fulfillmentType === 'content_access' && fulfillmentMetadata.content_access && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: (theme) => theme.customShadows.primary,
                }}
              >
                <Iconify icon="solar:book-bold" width={20} sx={{ color: 'white' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Content Access Granted
              </Typography>
            </Stack>
            
            <Divider sx={{ borderStyle: 'dashed' }} />
            
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:play-circle-bold" />}
              href={fulfillmentMetadata.content_access.content_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ py: 1.5 }}
            >
              Access Content
            </Button>
            
            {fulfillmentMetadata.content_access.access_duration_days && fulfillmentMetadata.content_access.access_duration_days > 0 ? (
              <Alert severity="info" variant="outlined" sx={{ py: 1 }}>
                <Typography variant="caption">
                  📅 Access valid for {fulfillmentMetadata.content_access.access_duration_days} days
                </Typography>
              </Alert>
            ) : (
              <Alert severity="success" variant="outlined" sx={{ py: 1 }}>
                <Typography variant="caption">
                  ♾️ Lifetime access granted
                </Typography>
              </Alert>
            )}
            
            {fulfillmentMetadata.content_access.instructions && (
              <Alert severity="info" variant="outlined" sx={{ py: 1 }}>
                <Typography variant="caption">
                  {fulfillmentMetadata.content_access.instructions}
                </Typography>
              </Alert>
            )}
          </Stack>
        )}

        {fulfillmentType === 'custom_message' && fulfillmentMetadata.custom_message && (
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (theme) => theme.customShadows.success,
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'white' }} />
            </Box>
            
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                {fulfillmentMetadata.custom_message.title}
              </Typography>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'success.lighter',
                  border: (theme) => `1px solid ${theme.palette.success.light}`,
                }}
              >
                <Typography variant="body1" color="success.darker" sx={{ whiteSpace: 'pre-wrap' }}>
                  {fulfillmentMetadata.custom_message.message}
                </Typography>
              </Box>
            </Box>
          </Stack>
        )}
      </Box>
    );
  };

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
        
          {paymentStatus === 'success' && renderFulfillmentContent()}

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
                    href={`https://testnet.cspr.live/deploy/${transactionHash}`}
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
