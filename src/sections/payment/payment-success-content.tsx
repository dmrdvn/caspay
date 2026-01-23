import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import type { FulfillmentMetadata } from 'src/types/paylink';

import { Iconify } from 'src/components/iconify';

type Props = {
  fulfillmentMetadata: FulfillmentMetadata | null;
};

export function PaymentSuccessContent({ fulfillmentMetadata }: Props) {
  if (!fulfillmentMetadata || fulfillmentMetadata.fulfillment_type === 'none') {
    return null;
  }

  const fulfillmentType = fulfillmentMetadata.fulfillment_type;

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
                Download link expires in {fulfillmentMetadata.digital_download.expires_hours} hours
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
                Expires: {new Date(fulfillmentMetadata.coupon_voucher.expires_at).toLocaleDateString()}
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
                Access valid for {fulfillmentMetadata.content_access.access_duration_days} days
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" variant="outlined" sx={{ py: 1 }}>
              <Typography variant="caption">
                Lifetime access granted
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
}
