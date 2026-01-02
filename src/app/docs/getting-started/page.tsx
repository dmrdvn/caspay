'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Alert, IconButton, Tooltip } from '@mui/material';
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

export default function GettingStartedPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
        Getting Started
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Integrate CasPay into your application in 5 minutes
      </Typography>

      {/* About CasPay */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          What is CasPay?
        </Typography>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" paragraph>
              CasPay is a modern payment gateway built on the Casper Network blockchain. It enables businesses to accept cryptocurrency payments securely and efficiently with support for both one-time payments and recurring subscriptions.
            </Typography>
            <Typography variant="body1" paragraph>
              Key features:
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Blockchain-Powered</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Built on Casper Network for secure, transparent, and immutable transactions
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Easy Integration</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Simple SDK and REST API with comprehensive documentation and examples
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Flexible Payment Options</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Support for one-time payments, subscriptions, and custom billing intervals
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Real-time Webhooks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stay synchronized with payment events through secure webhook notifications
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Prerequisites */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Prerequisites
        </Typography>
        <Stack spacing={2}>
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
            You need a CasPay merchant account. Sign up at <a href="https://caspay.link/dashboard">caspay.link/dashboard</a>
          </Alert>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Iconify icon="solar:key-bold" width={32} sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6">API Key</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get your API key from merchant page 
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Iconify icon="solar:wallet-money-bold-duotone" width={32} sx={{ color: 'success.main' }} />
                  <Box>
                    <Typography variant="h6">Casper Wallet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Users need Casper wallet extension
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>

      {/* Installation */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Installation
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 3, position: 'relative' }}>
          <CardContent>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton text="npm install @caspay/sdk" />
            </Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
              # Via npm
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
              npm install @caspay/sdk
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
          <CardContent>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton text='<script src="https://cdn.jsdelivr.net/npm/@caspay/sdk"></script>' />
            </Box>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
              # Via CDN
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
              {'<script src="https://cdn.jsdelivr.net/npm/@caspay/sdk"></script>'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Start */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Start
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
          <CardContent>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton text={`import CasPay from '@caspay/sdk';

// Initialize
const caspay = new CasPay({
  apiKey: 'your_api_key',
  environment: 'testnet'
});

// Create payment
const payment = await caspay.payments.create({
  productId: 'prod_123',
  amount: 100,
  currency: 'CSPR'
});`} />
            </Box>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`import CasPay from '@caspay/sdk';

// Initialize
const caspay = new CasPay({
  apiKey: 'your_api_key',
  environment: 'testnet'
});

// Create payment
const payment = await caspay.payments.create({
  productId: 'prod_123',
  amount: 100,
  currency: 'CSPR'
});`}
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
          <Card variant="outlined" component={RouterLink} href="/docs/api-reference" sx={{ '&:hover': { borderColor: 'primary.main' }, cursor: 'pointer', textDecoration: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:code-bold" width={24} sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">API Reference</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete API documentation with examples
                  </Typography>
                </Box>
                <Iconify icon="solar:alt-arrow-right-bold" />
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" component={RouterLink} href="/docs/sdk/javascript" sx={{ '&:hover': { borderColor: 'primary.main' }, cursor: 'pointer', textDecoration: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:programming-bold" width={24} sx={{ color: 'success.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">JavaScript SDK</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detailed SDK documentation and usage
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
