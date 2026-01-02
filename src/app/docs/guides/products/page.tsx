'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Alert } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export default function ProductsGuidePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
        Products Guide
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
        Create and manage products for one-time payments
      </Typography>

      {/* What is a Product */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          What is a Product?
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1">
              A product represents a one-time purchasable item or service in CasPay. 
              Each product has a unique ID, name, description, and price in CSPR.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Creating Products */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Creating a Product
        </Typography>
        <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 3 }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`const product = await caspay.products.create({
  name: 'Premium Course',
  description: 'Full access to all course materials',
  price: 100000000000, // 100 CSPR in motes
  currency: 'CSPR',
  metadata: {
    sku: 'COURSE-001',
    category: 'education'
  }
});`}
            </Typography>
          </CardContent>
        </Card>
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
          Prices are stored in motes (1 CSPR = 1,000,000,000 motes)
        </Alert>
      </Box>

      {/* Product Properties */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Product Properties
        </Typography>
        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>name</Typography>
              <Typography variant="body2" color="text.secondary">
                Product display name (required)
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>description</Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed product description (optional)
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>price</Typography>
              <Typography variant="body2" color="text.secondary">
                Price in smallest currency unit - motes (required)
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>metadata</Typography>
              <Typography variant="body2" color="text.secondary">
                Custom key-value pairs for additional data (optional)
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Managing Products */}
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Managing Products
        </Typography>
        <Stack spacing={3}>
          {/* Update */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Update Product</Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white' }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`await caspay.products.update('prod_123', {
  price: 150000000000, // 150 CSPR
  description: 'Updated description'
});`}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Delete */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Delete Product</Typography>
            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', mb: 2 }}>
              <CardContent>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  await caspay.products.delete('prod_123');
                </Typography>
              </CardContent>
            </Card>
            <Alert severity="warning" icon={<Iconify icon="solar:danger-bold" />}>
              Deleting a product is permanent and cannot be undone
            </Alert>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
