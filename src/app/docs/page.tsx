'use client';

import { Box, Container, Typography, Card, CardContent, Button, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

export default function DocsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
          CasPay Documentation
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Modern payment gateway built on Casper Network
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            component={RouterLink}
            href="/docs/getting-started"
            variant="contained" 
            size="large"
            startIcon={<Iconify icon="solar:rocket-2-bold-duotone" />}
          >
            Get Started
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/api-reference"
            variant="outlined" 
            size="large"
            startIcon={<Iconify icon="solar:code-bold" />}
          >
            View API
          </Button>
        </Stack>
      </Box>

      {/* Features Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 8 }}>
        <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="solar:wallet-money-bold-duotone" width={32} sx={{ color: 'primary.main', mr: 2 }} />
              <Typography variant="h5">One-time Payments</Typography>
            </Box>
            <Typography color="text.secondary">
              Accept single payments for products and services with instant blockchain confirmation
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="solar:calendar-bold" width={32} sx={{ color: 'success.main', mr: 2 }} />
              <Typography variant="h5">Subscriptions</Typography>
            </Box>
            <Typography color="text.secondary">
              Recurring billing with flexible plans and automatic payment processing
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="solar:bell-bing-bold-duotone" width={32} sx={{ color: 'warning.main', mr: 2 }} />
              <Typography variant="h5">Webhooks</Typography>
            </Box>
            <Typography color="text.secondary">
              Real-time payment notifications to keep your system synchronized
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="solar:check-circle-bold-duotone" width={32} sx={{ color: 'info.main', mr: 2 }} />
              <Typography variant="h5">Multiple SDKs</Typography>
            </Box>
            <Typography color="text.secondary">
              JavaScript, WordPress, and more platforms with easy integration
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Links */}
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Links
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Button 
            component={RouterLink}
            href="/docs/getting-started"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon="solar:book-bold" />}
          >
            Getting Started
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/api-reference"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon="solar:code-bold" />}
          >
            API Reference
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/examples"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon={"solar:code-square-bold-duotone" as any} />}
          >
            Code Examples
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/sdk/javascript"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon="solar:programming-bold" />}
          >
            JavaScript SDK
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/sdk/wordpress"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon="solar:box-bold" />}
          >
            WordPress Plugin
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/guides/products"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon="solar:widget-4-bold" />}
          >
            Products Guide
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/guides/subscriptions"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon="solar:refresh-bold" />}
          >
            Subscriptions Guide
          </Button>
          <Button 
            component={RouterLink}
            href="/docs/guides/webhooks"
            fullWidth 
            variant="outlined" 
            sx={{ py: 2, justifyContent: 'flex-start' }}
            startIcon={<Iconify icon="solar:bell-bing-bold" />}
          >
            Webhooks Guide
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
