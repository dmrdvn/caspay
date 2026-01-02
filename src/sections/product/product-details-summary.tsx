import type { Product } from 'src/types/product';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  product: Product;
};

export function ProductDetailsSummary({ product, ...other }: Props) {
  const {
    name,
    price,
    currency,
    token_address,
    stock,
    track_inventory,
    active,
    created_at,
    updated_at,
  } = product;

  const renderPrice = () => (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
      <Typography variant="h3">
        {currency === 'USD' ? '$' : ''}
        {fCurrency(price)}
        {currency === 'CSPR' ? ' CSPR' : ''}
      </Typography>
      <Chip
        label={currency}
        size="small"
        color={currency === 'CSPR' ? 'primary' : 'default'}
        variant="outlined"
      />
    </Box>
  );

  const renderStatus = () => (
    <Label color={active ? 'success' : 'error'} variant="soft">
      {active ? 'Active' : 'Inactive'}
    </Label>
  );

  const renderInventory = () => {
    if (!track_inventory) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:infinite-bold" width={20} color="success.main" />
          <Typography variant="body2" color="text.secondary">
            Inventory tracking disabled
          </Typography>
        </Box>
      );
    }

    const stockValue = stock || 0;
    const stockStatus = stockValue === 0 ? 'error' : stockValue <= 10 ? 'warning' : 'success';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify
          icon="solar:box-bold"
          width={20}
          color={`${stockStatus}.main`}
        />
        <Typography variant="body2" color={`${stockStatus}.main`}>
          {stockValue === 0 ? 'Out of stock' : `${stockValue} in stock`}
          {stockValue <= 10 && stockValue > 0 && ' (Low stock)'}
        </Typography>
      </Box>
    );
  };

  const renderBlockchainInfo = () => (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Token Address
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            wordBreak: 'break-all',
            bgcolor: 'background.neutral',
            p: 1.5,
            borderRadius: 1,
          }}
        >
          {token_address}
        </Typography>
      </Box>

      {token_address === 'NATIVE' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:shield-check-bold" width={20} color="success.main" />
          <Typography variant="caption" color="text.secondary">
            Native Casper Network token
          </Typography>
        </Box>
      )}

      {token_address !== 'NATIVE' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:document-text-bold" width={20} color="info.main" />
          <Typography variant="caption" color="text.secondary">
            CEP-18 Token Contract
          </Typography>
        </Box>
      )}
    </Stack>
  );

  const renderDates = () => (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Created:
        </Typography>
        <Typography variant="caption">{fDateTime(created_at)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Updated:
        </Typography>
        <Typography variant="caption">{fDateTime(updated_at)}</Typography>
      </Box>
    </Stack>
  );

  return (
    <Stack spacing={3} sx={{ pt: 3 }} {...other}>
      <Stack spacing={2} alignItems="flex-start">
        {renderStatus()}

        <Typography variant="h4">{name}</Typography>

        {renderPrice()}
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack spacing={2.5}>
        <Typography variant="subtitle2">Inventory</Typography>
        {renderInventory()}
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack spacing={2.5}>
        <Typography variant="subtitle2">Blockchain Payment</Typography>
        {renderBlockchainInfo()}
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderDates()}
    </Stack>
  );
}
