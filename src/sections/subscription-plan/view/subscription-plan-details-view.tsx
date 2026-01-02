'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMerchants, useSubscriptionPlans } from 'src/hooks';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function SubscriptionPlanDetailsView({ id }: Props) {
  const { currentMerchant } = useMerchants();
  const { plans, isLoading } = useSubscriptionPlans(currentMerchant?.id);
  
  const plan = plans?.find((p) => p.id === id);

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="Loading..."
          description="Please wait while we load the plan details"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  if (!plan) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="Plan not found"
          description="The subscription plan you are looking for does not exist"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const intervalLabel = {
    weekly: 'Week',
    monthly: 'Month',
    yearly: 'Year',
  }[plan.interval];

  // Get currency display info
  const getCurrencyDisplay = () => {
    if (plan.currency === 'CSPR') {
      return { price: plan.price.toString(), symbol: 'CSPR' };
    }
    // For USDT, USDC - show only formatted price (with $), no currency code after
    return { price: fCurrency(plan.price), symbol: '' };
  };

  const { price, symbol } = getCurrencyDisplay();

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Plan Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscription Plans', href: paths.dashboard.subscription.root },
          { name: plan.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 4 }}>
            {/* Header */}
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h4">{plan.name}</Typography>
                <Label color={plan.active ? 'success' : 'error'} variant="soft" sx={{ px: 2, py: 1 }}>
                  {plan.active ? 'Active' : 'Inactive'}
                </Label>
              </Stack>

              {/* Plan ID */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  width: 'fit-content',
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  border: (theme) => `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                  Plan ID:
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                  {plan.plan_id}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(plan.plan_id);
                    toast.success('Plan ID copied!');
                  }}
                  sx={{ 
                    p: 0.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <Iconify icon="solar:copy-bold" width={14} />
                </IconButton>
              </Box>

              {plan.description && (
                <Typography variant="body2" color="text.secondary">
                  {plan.description}
                </Typography>
              )}

              <Divider />

              {/* Pricing Section */}
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Pricing
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                  <Typography variant="h2" color="primary.main">
                    {price}
                  </Typography>
                  {symbol && (
                    <Typography variant="h6" color="text.secondary">
                      {symbol} / {intervalLabel}
                    </Typography>
                  )}
                  {!symbol && (
                    <Typography variant="h6" color="text.secondary">
                      / {intervalLabel}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Details Grid */}
              <Grid container spacing={3}>
                {/* Billing Interval */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:calendar-bold" width={20} color="info.main" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Billing Interval
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {intervalLabel}ly
                    </Typography>
                  </Stack>
                </Grid>

                {/* Trial Period */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:gift-bold" width={20} color="warning.main" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Trial Period
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {plan.trial_days > 0 ? `${plan.trial_days} days` : 'No trial'}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Payment Token */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:wallet-bold" width={20} color="success.main" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Payment Token
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {plan.currency}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Token Contract */}
                <Grid size={{ xs: 12 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:code-bold" width={20} color="secondary.main" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Token Contract Address
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                    >
                      {plan.token_address}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Created At */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {fDateTime(plan.created_at)}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Updated At */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {fDateTime(plan.updated_at)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
