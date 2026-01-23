'use client';


import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';

import { useMerchant } from 'src/hooks/use-merchants';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function MerchantDetailsView({ id }: Props) {
  const { merchant, isLoading, error } = useMerchant(id);

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading merchant...
          </Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (error || !merchant) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            {error || 'Merchant not found'}
          </Typography>
        </Box>
      </DashboardContent>
    );
  }
  const renderToolbar = () => (
    <Box sx={{ mb: { xs: 3, md: 5 } }}>
      <CustomBreadcrumbs
        heading="Merchant Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Merchant' },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:link-bold" />}
              href={paths.dashboard.merchant.integrations(merchant.id)}
            >
              API Integration
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
              href={paths.dashboard.merchant.edit(merchant.id)}
            >
              Edit
            </Button>
          </Stack>
        }
        sx={{ mb: 0 }}
      />
    </Box>
  );

  const renderBasicInfo = () => (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            alt={merchant.store_name}
            src={merchant.logo_url || undefined}
            sx={{ width: 64, height: 64 }}
          >
            {merchant.store_name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h4">{merchant.store_name}</Typography>
              <Label
                color={
                  merchant.status === 'active'
                    ? 'success'
                    : merchant.status === 'pending'
                      ? 'warning'
                      : 'error'
                }
                sx={{ textTransform: 'capitalize' }}
              >
                {merchant.status}
              </Label>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                {merchant.merchant_id}
              </Typography>
              <Tooltip title="Copy Merchant ID">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (merchant.merchant_id) {
                      navigator.clipboard.writeText(merchant.merchant_id);
                    }
                  }}
                >
                  <Iconify icon="solar:copy-bold" width={16} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {merchant.store_description && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Description
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                {merchant.store_description}
              </Typography>
            </Box>
          </>
        )}

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            {
              label: 'Business Type',
              value: merchant.business_type,
              icon: <Iconify icon="solar:buildings-2-bold" />,
            },
            {
              label: 'Support Email',
              value: merchant.support_email,
              icon: <Iconify icon="solar:letter-bold" />,
            },
            {
              label: 'Support URL',
              value: merchant.support_url,
              icon: <Iconify icon="solar:link-bold" />,
            },
            {
              label: 'Brand Color',
              value: merchant.brand_color,
              icon: (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    bgcolor: merchant.brand_color,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                />
              ),
            },
          ].map((item) => (
            <Box key={item.label} sx={{ gap: 1.5, display: 'flex' }}>
              {item.icon}
              <ListItemText
                primary={item.label}
                secondary={item.value}
                slotProps={{
                  primary: {
                    sx: { typography: 'body2', color: 'text.secondary' },
                  },
                  secondary: {
                    sx: { mt: 0.5, color: 'text.primary', typography: 'subtitle2' },
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Stack>
    </Card>
  );

  const renderBlockchainInfo = () => (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Blockchain Information
        </Typography>
        <Chip 
          label={merchant.network || 'testnet'}
          size="small"
          color={merchant.network === 'mainnet' ? 'primary' : 'warning'}
          sx={{
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        />
      </Box>

      <Stack spacing={2.5}>
        {/* Owner Wallet Address */}
        <Box>
          <Box sx={{ gap: 1.5, display: 'flex', alignItems: 'flex-start' }}>
            <Iconify icon="solar:wallet-bold" sx={{ mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Owner Wallet Address
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {merchant.wallet_address}
                </Typography>
                <Tooltip title="Copy address">
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (merchant.wallet_address) {
                        navigator.clipboard.writeText(merchant.wallet_address);
                      }
                    }}
                  >
                    <Iconify icon="solar:copy-bold" width={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Transaction Hash */}
        <Box>
          <Box sx={{ gap: 1.5, display: 'flex', alignItems: 'flex-start' }}>
            <Iconify icon="solar:code-circle-bold" sx={{ mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Transaction Hash
              </Typography>
              {merchant.transaction_hash ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    {merchant.transaction_hash}
                  </Typography>
                  <Tooltip title="Copy transaction hash">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (merchant.transaction_hash) {
                          navigator.clipboard.writeText(merchant.transaction_hash);
                        }
                      }}
                    >
                      <Iconify icon="solar:copy-bold" width={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'warning.lighter',
                    border: (theme) => `1px dashed ${theme.palette.warning.main}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'warning.darker', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="solar:clock-circle-bold" width={14} />
                    Not registered on blockchain yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {merchant.contract_deployed_at && (
          <>
            <Divider />
            <Box sx={{ gap: 1.5, display: 'flex' }}>
              <Iconify icon="solar:calendar-bold" />
              <ListItemText
                primary="Deployed At"
                secondary={new Date(merchant.contract_deployed_at).toLocaleString()}
                slotProps={{
                  primary: {
                    sx: { typography: 'body2', color: 'text.secondary' },
                  },
                  secondary: {
                    sx: { mt: 0.5, color: 'text.primary', typography: 'subtitle2' },
                  },
                }}
              />
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );

  const renderDocumentation = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Documentation & Resources
      </Typography>

      <Stack spacing={2}>
        {[
          {
            label: 'API Documentation',
            icon: <Iconify icon="solar:book-bold" />,
            href: 'https://docs.caspay.link/docs/api-reference/',
          },
          {
            label: 'Integration Guide',
            icon: <Iconify icon="solar:code-bold" />,
            href: 'https://docs.caspay.link/docs/guides/products/',
          },
          {
            label: 'Webhook Events',
            icon: <Iconify icon="solar:notification-bold" />,
            href: 'https://docs.caspay.link/docs/guides/webhooks/',
          },
          {
            label: 'SDK & Libraries',
            icon: <Iconify icon="solar:programming-bold" />,
            href: 'https://docs.caspay.link/docs/sdk/javascript/',
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            underline="none"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 1,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {item.icon}
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {item.label}
            </Typography>
            <Iconify
              icon="solar:alt-arrow-right-bold"
              sx={{ ml: 'auto', color: 'text.secondary' }}
              width={16}
            />
          </Link>
        ))}
      </Stack>
    </Card>
  );

  return (
    <DashboardContent maxWidth="xl">
      {renderToolbar()}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {renderBasicInfo()}
            {renderBlockchainInfo()}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {renderDocumentation()}
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
