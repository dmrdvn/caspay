'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

export default function WordPressPage() {
  const steps = [
    'Download Plugin',
    'Install & Activate',
    'Configure Settings',
    'Add Payment Button'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
        WordPress Plugin
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Accept payments on your WordPress site with CasPay
      </Typography>

      {/* Installation Steps */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Installation
        </Typography>
        <Stepper orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label} active completed={false}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Download */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          1. Download Plugin
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Download the latest version from WordPress.org or our GitHub repository:
            </Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  https://github.com/caspay/wordpress-plugin
                </Typography>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Box>

      {/* Configuration */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          2. Configuration
        </Typography>
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="start">
                <Box sx={{ minWidth: 40 }}>
                  <Iconify icon="solar:settings-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Basic Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Go to Settings → CasPay and enter your credentials:
                  </Typography>
                  <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`API Key: your_api_key
Environment: testnet or mainnet
Currency: CSPR`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Alert severity="warning" icon={<Iconify icon="solar:danger-bold" />}>
            Never share your API key publicly. Store it securely in WordPress settings.
          </Alert>
        </Stack>
      </Box>

      {/* Shortcodes */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          3. Shortcodes
        </Typography>

        {/* Payment Button */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Payment Button
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {`[caspay_button product_id="prod_123" amount="100" text="Pay with CasPay"]`}
              </Typography>
            </CardContent>
          </Card>
          <Typography variant="body2" color="text.secondary">
            Add this shortcode to any page or post to display a payment button
          </Typography>
        </Box>

        {/* Subscription Button */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Subscription Button
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {`[caspay_subscription plan_id="plan_123" text="Subscribe Now"]`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Payment History */}
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Payment History
          </Typography>
          <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
            <CardContent>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {`[caspay_history limit="10"]`}
              </Typography>
            </CardContent>
          </Card>
          <Typography variant="body2" color="text.secondary">
            Display payment history for logged-in users
          </Typography>
        </Box>
      </Box>

      {/* WooCommerce Integration */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          4. WooCommerce Integration
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="body1">
                CasPay can be integrated as a payment gateway in WooCommerce:
              </Typography>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Enable Gateway
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Go to WooCommerce → Settings → Payments and enable &quot;CasPay&quot;
                </Typography>
              </Box>
              <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
                <CardContent>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// Add to functions.php
add_filter('woocommerce_payment_gateways', 'add_caspay_gateway');
function add_caspay_gateway($gateways) {
    $gateways[] = 'WC_Gateway_CasPay';
    return $gateways;
}`}
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
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
                    Complete API documentation
                  </Typography>
                </Box>
                <Iconify icon="solar:alt-arrow-right-bold" />
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" component={RouterLink} href="/docs/guides/webhooks" sx={{ '&:hover': { borderColor: 'primary.main' }, cursor: 'pointer', textDecoration: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Iconify icon="solar:bell-bing-bold-duotone" width={24} sx={{ color: 'warning.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Webhooks Guide</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set up payment notifications
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
