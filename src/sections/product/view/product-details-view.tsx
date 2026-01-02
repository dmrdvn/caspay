'use client';

import type { Product } from 'src/types/product';

import { useTabs } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMerchants, useProductMutations } from 'src/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { ProductDetailsToolbar } from '../product-details-toolbar';
import { ProductDetailsCarousel } from '../product-details-carousel';
import { ProductDetailsDescription } from '../product-details-description';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// ----------------------------------------------------------------------

type Props = {
  product?: Product;
};

export function ProductDetailsView({ product }: Props) {
  const tabs = useTabs('overview');
  const { currentMerchant } = useMerchants();
  const { toggleStatus } = useProductMutations(currentMerchant?.id);

  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (product) {
      setStatus(product.active ? 'active' : 'inactive');
    }
  }, [product]);

  const handleChangeStatus = useCallback(
    async (newValue: string) => {
      if (!product) return;

      const newStatus = newValue as 'active' | 'inactive';
      setStatus(newStatus);

      // Toggle if status changed
      if ((newStatus === 'active') !== product.active) {
        await toggleStatus(product.id);
      }
    },
    [product, toggleStatus]
  );

  if (!product) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="Product not found"
          description="The product you are looking for does not exist"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const renderOverview = () => (
    <Stack spacing={2.5} sx={{ p: 3 }}>
      {/* Product Name & Status */}
      <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">{product.name}</Typography>
        <Label color={product.active ? 'success' : 'error'} variant="soft">
          {product.active ? 'Active' : 'Inactive'}
        </Label>
      </Stack>

      <Divider />

      {/* Price & Currency */}
      <Stack spacing={2}>
        <Typography variant="overline" color="text.secondary">
          Pricing
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h3">
            {product.currency === 'USD' ? '$' : ''}
            {fCurrency(product.price)}
            {product.currency === 'CSPR' ? ' CSPR' : ''}
          </Typography>
          <Chip
            label={product.currency}
            size="small"
            color={product.currency === 'CSPR' ? 'primary' : 'default'}
            variant="outlined"
          />
        </Box>
      </Stack>

      <Divider />

      {/* Inventory */}
      <Stack spacing={2}>
        <Typography variant="overline" color="text.secondary">
          Inventory
        </Typography>
        {product.track_inventory ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify
              icon="solar:box-bold"
              width={20}
              color={
                !product.stock || product.stock === 0
                  ? 'error.main'
                  : product.stock <= 10
                    ? 'warning.main'
                    : 'success.main'
              }
            />
            <Typography
              variant="body2"
              color={
                !product.stock || product.stock === 0
                  ? 'error.main'
                  : product.stock <= 10
                    ? 'warning.main'
                    : 'success.main'
              }
            >
              {!product.stock || product.stock === 0
                ? 'Out of stock'
                : `${product.stock} in stock`}
              {product.stock && product.stock <= 10 && product.stock > 0 && ' (Low stock)'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:infinite-bold" width={20} color="success.main" />
            <Typography variant="body2" color="text.secondary">
              Inventory tracking disabled
            </Typography>
          </Box>
        )}
      </Stack>

      <Divider />

      {/* Blockchain Payment */}
      <Stack spacing={2}>
        <Typography variant="overline" color="text.secondary">
          Payment Method
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={product.token_address === 'NATIVE' ? 'CSPR Native' : 'CEP-18 Token'}
            size="small"
            color={product.token_address === 'NATIVE' ? 'primary' : 'secondary'}
            variant="soft"
          />
          {product.token_address === 'NATIVE' ? (
            <Typography variant="caption" color="text.secondary">
              Casper Network native token
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Custom token contract
            </Typography>
          )}
        </Box>
        
      </Stack>

      {/* Transaction Hash */}
      {product.transaction_hash && (
        <>
          <Divider />
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:link-circle-bold" width={20} color="primary.main" />
              <Typography variant="overline" color="text.secondary">
                Transaction Hash
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'background.neutral',
                p: 1.5,
                borderRadius: 1,
                '&:hover .copy-button': {
                  opacity: 1,
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  pr: 4,
                }}
              >
                {product.transaction_hash} 
                
              </Typography>
              <Box
                className="copy-button"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 8,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  borderRadius: 0.5,
                 
                }}
              >
                <Tooltip title="Copy transaction hash">
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (product.transaction_hash) {
                        navigator.clipboard.writeText(product.transaction_hash);
                      }
                    }}
                  >
                    <Iconify icon="solar:copy-bold" width={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Stack>
        </>
      )}

      <Divider />

      {/* Dates */}
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Created:
          </Typography>
          <Typography variant="caption">{fDateTime(product.created_at)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Updated:
          </Typography>
          <Typography variant="caption">{fDateTime(product.updated_at)}</Typography>
        </Box>
      </Stack>
    </Stack>
  );

  const renderDescription = () => (
    <ProductDetailsDescription description={product.description || 'No description available'} />
  );

  const renderTechnicalDetails = () => (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Product ID:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {product.product_id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Currency:
          </Typography>
          <Typography variant="body2">{product.currency}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Token Address:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {product.token_address}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Inventory Tracking:
          </Typography>
          <Typography variant="body2">
            {product.track_inventory ? 'Enabled' : 'Disabled'}
          </Typography>
        </Box>

        {product.track_inventory && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Current Stock:
            </Typography>
            <Typography variant="body2">{product.stock || 0}</Typography>
          </Box>
        )}

        {product.metadata && Object.keys(product.metadata).length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Metadata:
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {JSON.stringify(product.metadata, null, 2)}
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <ProductDetailsToolbar
        backHref={paths.dashboard.product.root}
        editHref={paths.dashboard.product.edit(product.id)}
        status={status}
        onChangeStatus={handleChangeStatus}
        statusOptions={STATUS_OPTIONS}
      />

      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* Image Section */}
        <Grid size={{ xs: 12, md: 5 }}>
          <ProductDetailsCarousel
            productName={product.name}
            images={
              product.images && product.images.length > 0
                ? product.images
                : [product.image_url || '']
            }
          />
        </Grid>

        {/* Info Tabs Section */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <Tabs
              value={tabs.value}
              onChange={tabs.onChange}
              sx={[
                (theme) => ({
                  px: 3,
                  boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
                }),
              ]}
            >
              <Tab value="overview" label="Overview" />
              <Tab value="description" label="Description" />
              <Tab value="technical" label="Technical" />
            </Tabs>

            {tabs.value === 'overview' && renderOverview()}
            {tabs.value === 'description' && renderDescription()}
            {tabs.value === 'technical' && renderTechnicalDetails()}
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
