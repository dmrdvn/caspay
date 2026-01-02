'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Alert, Divider, IconButton, Tooltip } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useState } from 'react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy'}>
      <IconButton onClick={handleCopy} size="small" sx={{ color: 'inherit' }}>
        <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={18} />
      </IconButton>
    </Tooltip>
  );
}

export default function JavaScriptSDKPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
        JavaScript SDK
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Complete guide to CasPay JavaScript SDK
      </Typography>

      {/* Installation */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Installation
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
              npm install @caspay/sdk
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Initialization */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Initialization
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`import CasPay from '@caspay/sdk';

const caspay = new CasPay({
  apiKey: 'your_api_key',
  environment: 'testnet', // or 'mainnet'
  onSuccess: (payment) => {
    console.log('Payment successful:', payment);
  },
  onError: (error) => {
    console.error('Payment failed:', error);
  }
});`}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Payment Methods */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Payment Methods
        </Typography>

        {/* Create Payment */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Create Payment
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const payment = await caspay.payments.create({
  productId: 'prod_123',
  amount: 100,
  currency: 'CSPR',
  metadata: {
    orderId: 'order_456',
    customField: 'value'
  }
});`}
              </Typography>
            </CardContent>
          </Card>
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
            Amount is in smallest unit (motes for CSPR). 1 CSPR = 1,000,000,000 motes
          </Alert>
        </Box>

        {/* Get Payment */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Get Payment
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const payment = await caspay.payments.get('payment_id');
console.log(payment.status); // 'pending', 'completed', 'failed'`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* List Payments */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            List Payments
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const payments = await caspay.payments.list({
  limit: 10,
  offset: 0,
  status: 'completed'
});`}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Subscription Methods */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Subscription Methods
        </Typography>

        {/* Create Subscription */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Create Subscription
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const subscription = await caspay.subscriptions.create({
  planId: 'plan_123',
  customerWallet: '0x...',
  startDate: '2024-01-01'
});`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Cancel Subscription */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Cancel Subscription
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`await caspay.subscriptions.cancel('subscription_id');`}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Event Handling */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Event Handling
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// Listen to payment events
caspay.on('payment.completed', (payment) => {
  console.log('Payment completed:', payment);
});

caspay.on('payment.failed', (error) => {
  console.error('Payment failed:', error);
});

// Remove listener
caspay.off('payment.completed', handler);`}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Error Handling */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Error Handling
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
          <CardContent>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton text={`try {
  const payment = await caspay.payments.create({
    productId: 'prod_123',
    amount: 100
  });
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.error('User has insufficient balance');
  } else if (error.code === 'WALLET_NOT_CONNECTED') {
    console.error('Please connect your wallet');
  } else {
    console.error('Payment error:', error.message);
  }
}`} />
            </Box>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`try {
  const payment = await caspay.payments.create({
    productId: 'prod_123',
    amount: 100
  });
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    console.error('User has insufficient balance');
  } else if (error.code === 'WALLET_NOT_CONNECTED') {
    console.error('Please connect your wallet');
  } else {
    console.error('Payment error:', error.message);
  }
}`}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      {/* Next Steps */}
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Next Steps
        </Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card variant="outlined" component={RouterLink} href="/docs/guides/products" sx={{ '&:hover': { borderColor: 'primary.main' }, cursor: 'pointer', textDecoration: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:box-bold" width={24} sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Products Guide</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Learn how to create and manage products
                  </Typography>
                </Box>
                <Iconify icon="solar:alt-arrow-right-bold" />
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" component={RouterLink} href="/docs/guides/subscriptions" sx={{ '&:hover': { borderColor: 'primary.main' }, cursor: 'pointer', textDecoration: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:calendar-bold" width={24} sx={{ color: 'success.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Subscriptions Guide</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set up recurring payments
                  </Typography>
                </Box>
                <Iconify icon="solar:alt-arrow-right-bold" />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
