'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Chip, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip } from '@mui/material';
import { Iconify } from 'src/components/iconify';
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

export default function APIReferencePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
        API Reference
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Complete REST API documentation for CasPay
      </Typography>

      {/* Base URL */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Base URL
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
          <CardContent>
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <CopyButton text="https://api.caspaylink.com/v1" />
            </Box>
            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
              https://api.caspaylink.com/v1
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Authentication */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Authentication
        </Typography>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              All API requests require authentication using your API key in the Authorization header:
            </Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
              <CardContent>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <CopyButton text="Authorization: Bearer your_api_key" />
                </Box>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  Authorization: Bearer your_api_key
                </Typography>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Box>

      {/* Endpoints */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Endpoints
        </Typography>

        {/* Payments */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Iconify icon="solar:wallet-money-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
              <Typography variant="h5">Payments</Typography>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Create Payment */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip label="POST" color="success" size="small" />
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  /payments
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a new payment request
              </Typography>
              <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
                <CardContent>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`{
  "productId": "prod_123",
  "amount": 100,
  "currency": "CSPR",
  "customerEmail": "customer@example.com"
}`}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Get Payment */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip label="GET" color="info" size="small" />
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  /payments/:id
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Retrieve payment details by ID
              </Typography>
            </Box>

            {/* List Payments */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip label="GET" color="info" size="small" />
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  /payments
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                List all payments with pagination
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Iconify icon="solar:calendar-bold" width={32} sx={{ color: 'success.main' }} />
              <Typography variant="h5">Subscriptions</Typography>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Create Subscription */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip label="POST" color="success" size="small" />
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  /subscriptions
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a new subscription
              </Typography>
              <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`{
  "planId": "plan_123",
  "customerWallet": "0x...",
  "startDate": "2024-01-01"
}`}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Cancel Subscription */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip label="DELETE" color="error" size="small" />
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  /subscriptions/:id
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Cancel an active subscription
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Iconify icon="solar:bell-bing-bold-duotone" width={32} sx={{ color: 'warning.main' }} />
              <Typography variant="h5">Webhooks</Typography>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Register Webhook */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Chip label="POST" color="success" size="small" />
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  /webhooks
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Register a webhook endpoint
              </Typography>
              <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`{
  "url": "https://yourdomain.com/webhook",
  "events": ["payment.completed", "subscription.created"]
}`}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Response Codes */}
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Response Codes
        </Typography>
        <TableContainer component={Card} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><Chip label="200" color="success" size="small" /></TableCell>
                <TableCell>Success</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="201" color="success" size="small" /></TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="400" color="warning" size="small" /></TableCell>
                <TableCell>Bad Request</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="401" color="error" size="small" /></TableCell>
                <TableCell>Unauthorized</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="404" color="error" size="small" /></TableCell>
                <TableCell>Not Found</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Chip label="500" color="error" size="small" /></TableCell>
                <TableCell>Internal Server Error</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
