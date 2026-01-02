import type { GridCellParams } from '@mui/x-data-grid';
import type { LinearProgressProps } from '@mui/material/LinearProgress';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fTime, fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type ParamsProps = {
  params: GridCellParams;
};

export function RenderCellPrice({
  params,
  price,
  currency,
}: ParamsProps & { price?: number; currency?: string }) {
  const displayPrice = price ?? params.row.price;
  const displayCurrency = currency ?? params.row.currency ?? 'USD';
  const symbol = displayCurrency === 'USD' ? '$' : displayCurrency === 'CSPR' ? 'CSPR ' : '';

  return `${symbol}${fCurrency(displayPrice)}`;
}

export function RenderCellPublish({
  params,
  publish,
}: ParamsProps & { publish?: string }) {
  const status = publish ?? params.row.publish ?? (params.row.active ? 'active' : 'inactive');
  const isActive = status === 'published' || status === 'active';

  return (
    <Label variant="soft" color={isActive ? 'success' : 'default'}>
      {status}
    </Label>
  );
}

export function RenderCellCreatedAt({ params }: ParamsProps) {
  const dateField = params.row.createdAt || params.row.created_at;

  return (
    <Box sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
      <span>{fDate(dateField)}</span>
      <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {fTime(dateField)}
      </Box>
    </Box>
  );
}

export function RenderCellStock({
  params,
  inventoryType,
}: ParamsProps & { inventoryType?: string }) {
  const stockType =
    inventoryType ??
    params.row.inventoryType ??
    (params.row.track_inventory
      ? params.row.stock && params.row.stock > 0
        ? params.row.stock > 10
          ? 'in_stock'
          : 'low_stock'
        : 'out_of_stock'
      : 'in_stock');

  const color: LinearProgressProps['color'] =
    (stockType === 'out_of_stock' && 'error') ||
    (stockType === 'low_stock' && 'warning') ||
    'success';

  const stockValue = params.row.stock ?? params.row.available ?? 0;
  const maxStock = params.row.quantity ?? 100;
  const percentage = maxStock > 0 ? (stockValue * 100) / maxStock : 0;

  const displayText =
    stockType === 'out_of_stock'
      ? 'Out of stock'
      : stockType === 'low_stock'
        ? `${stockValue} (Low stock)`
        : `${stockValue} In stock`;

  return (
    <Box sx={{ width: 1, typography: 'caption', color: 'text.secondary' }}>
      <LinearProgress
        color={color}
        variant="determinate"
        value={percentage}
        sx={[{ mb: 1, width: 80, height: 6 }]}
      />
      {displayText}
    </Box>
  );
}

export function RenderCellProduct({
  params,
  href,
  coverUrl,
}: ParamsProps & { href: string; coverUrl?: string }) {
  const imageUrl = coverUrl ?? params.row.coverUrl ?? params.row.image_url;
  const category = params.row.category ?? params.row.currency ?? 'Product';

  return (
    <Box
      sx={{
        py: 2,
        gap: 2,
        width: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Avatar
        alt={params.row.name}
        src={imageUrl}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      >
        {!imageUrl && params.row.name?.charAt(0).toUpperCase()}
      </Avatar>

      <ListItemText
        primary={
          <Link component={RouterLink} href={href} color="inherit">
            {params.row.name}
          </Link>
        }
        secondary={category}
        slotProps={{
          primary: { noWrap: true },
          secondary: { sx: { color: 'text.disabled' } },
        }}
      />
    </Box>
  );
}
