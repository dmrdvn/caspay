'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Alert, Chip } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export default function SubscriptionsGuidePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
        Subscriptions Guide
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Set up recurring payments with subscription plans
      </Typography>

      {/* What is a Subscription */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          What is a Subscription?
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1">
              Subscriptions enable recurring payments at regular intervals. Create subscription 
              plans with daily, weekly, monthly, or yearly billing cycles.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Creating Plans */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Creating a Subscription Plan
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const plan = await caspay.plans.create({
  name: 'Pro Plan',
  description: 'Professional tier with all features',
  amount: 50000000000, // 50 CSPR
  interval: 'month', // 'day', 'week', 'month', 'year'
  intervalCount: 1, // Bill every 1 month
  trialDays: 7 // Optional 7-day trial
});`}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Billing Intervals */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Billing Intervals
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="daily" color="primary" />
                <Typography variant="body2">Bill every N days</Typography>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="weekly" color="success" />
                <Typography variant="body2">Bill every N weeks</Typography>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="monthly" color="info" />
                <Typography variant="body2">Bill every N months</Typography>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="yearly" color="warning" />
                <Typography variant="body2">Bill every N years</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Subscribe Customer */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Subscribing a Customer
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const subscription = await caspay.subscriptions.create({
  planId: 'plan_123',
  customerWallet: '0x...',
  startDate: '2024-01-01',
  metadata: {
    userId: 'user_456'
  }
});`}
            </Typography>
          </CardContent>
        </Card>
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
          Customers must approve the subscription contract to enable recurring payments
        </Alert>
      </Box>

      {/* Managing Subscriptions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Managing Subscriptions
        </Typography>
        <Stack spacing={3}>
          {/* Check Status */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Check Status</Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const sub = await caspay.subscriptions.get('sub_123');
console.log(sub.status); // 'active', 'canceled', 'past_due'`}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Pause Subscription */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Pause Subscription</Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {`await caspay.subscriptions.pause('sub_123');`}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Resume Subscription */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Resume Subscription</Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {`await caspay.subscriptions.resume('sub_123');`}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Cancel Subscription */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Cancel Subscription</Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {`await caspay.subscriptions.cancel('sub_123');`}
                </Typography>
              </CardContent>
            </Card>
            <Alert severity="warning" icon={<Iconify icon="solar:danger-bold" />}>
              Cancelled subscriptions remain active until the end of the current billing period
            </Alert>
          </Box>
        </Stack>
      </Box>

      {/* Webhooks */}
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Subscription Events
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Listen to subscription events via webhooks:
            </Typography>
            <Stack spacing={1}>
              <Chip label="subscription.created" variant="outlined" />
              <Chip label="subscription.updated" variant="outlined" />
              <Chip label="subscription.canceled" variant="outlined" />
              <Chip label="subscription.payment_succeeded" variant="outlined" />
              <Chip label="subscription.payment_failed" variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
