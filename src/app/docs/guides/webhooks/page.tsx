'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Alert, Chip } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export default function WebhooksGuidePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
        Webhooks Guide
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Receive real-time payment notifications
      </Typography>

      {/* What are Webhooks */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          What are Webhooks?
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1">
              Webhooks allow CasPay to send real-time notifications to your server when events 
              occur, such as successful payments or subscription updates.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Setting Up Webhooks */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Setting Up Webhooks
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const webhook = await caspay.webhooks.create({
  url: 'https://yourdomain.com/webhook',
  events: [
    'payment.completed',
    'payment.failed',
    'subscription.created',
    'subscription.canceled'
  ],
  secret: 'your_webhook_secret'
});`}
            </Typography>
          </CardContent>
        </Card>
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
          Store the webhook secret securely. It&apos;s used to verify webhook signatures.
        </Alert>
      </Box>

      {/* Available Events */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Available Events
        </Typography>

        {/* Payment Events */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Payment Events</Typography>
          <Stack spacing={1}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="payment.completed" color="success" size="small" />
                  <Typography variant="body2">Payment successfully completed</Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="payment.failed" color="error" size="small" />
                  <Typography variant="body2">Payment failed or rejected</Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="payment.pending" color="warning" size="small" />
                  <Typography variant="body2">Payment is being processed</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Subscription Events */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>Subscription Events</Typography>
          <Stack spacing={1}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="subscription.created" color="success" size="small" />
                  <Typography variant="body2">New subscription created</Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="subscription.updated" color="info" size="small" />
                  <Typography variant="body2">Subscription details updated</Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="subscription.canceled" color="error" size="small" />
                  <Typography variant="body2">Subscription canceled</Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="subscription.payment_succeeded" color="success" size="small" />
                  <Typography variant="body2">Recurring payment succeeded</Typography>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label="subscription.payment_failed" color="error" size="small" />
                  <Typography variant="body2">Recurring payment failed</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>

      {/* Webhook Payload */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Webhook Payload Example
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`{
  "id": "evt_123",
  "type": "payment.completed",
  "created": 1640000000,
  "data": {
    "payment": {
      "id": "pay_123",
      "amount": 100000000000,
      "currency": "CSPR",
      "status": "completed",
      "metadata": {
        "orderId": "order_456"
      }
    }
  }
}`}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Verifying Webhooks */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Verifying Webhook Signatures
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`import crypto from 'crypto';

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return hmac === signature;
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-caspay-signature'];
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('OK');
});`}
            </Typography>
          </CardContent>
        </Card>
        <Alert severity="warning" icon={<Iconify icon="solar:danger-bold" />}>
          Always verify webhook signatures to ensure requests are from CasPay
        </Alert>
      </Box>

      {/* Best Practices */}
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Best Practices
        </Typography>
        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="start">
                <Iconify icon="solar:shield-check-bold" width={24} sx={{ color: 'success.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>Verify Signatures</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Always validate webhook signatures before processing
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="start">
                <Iconify icon="solar:clock-circle-bold-duotone" width={24} sx={{ color: 'info.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>Respond Quickly</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Return 200 OK within 5 seconds to avoid retries
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="start">
                <Iconify icon="solar:refresh-bold" width={24} sx={{ color: 'warning.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>Handle Idempotency</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use event IDs to prevent duplicate processing
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="start">
                <Iconify icon="solar:check-circle-bold-duotone" width={24} sx={{ color: 'error.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>Test Thoroughly</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use test mode webhooks before going live
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
