import type { BoxProps } from '@mui/material/Box';
import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type TopItem = {
  id: string;
  name: string;
  type: 'product' | 'subscription_plan';
  price: number;
  sales_count: number;
  total_revenue: number;
  image_url: string | null;
};

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: TopItem[];
};

export function MerchantTopItems({ title, subheader, list, sx, ...other }: Props) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Scrollbar sx={{ minHeight: 384 }}>
        <Box
          sx={{
            p: 3,
            gap: 3,
            minWidth: 360,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {list.length > 0 ? (
            list.map((item) => <TopItemRow key={item.id} item={item} />)
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No products or subscription plans yet
              </Typography>
            </Box>
          )}
        </Box>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

type TopItemRowProps = BoxProps & {
  item: TopItem;
};

function TopItemRow({ item, sx, ...other }: TopItemRowProps) {
  const isSubscription = item.type === 'subscription_plan';

  return (
    <Box
      sx={[{ gap: 2, display: 'flex', alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Avatar
        variant="rounded"
        src={item.image_url || '/logo/logo-single.svg'}
        sx={{
          p: 1,
          width: 48,
          height: 48,
          bgcolor: 'background.neutral',
        }}
      />

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{
            mb: 0.5,
            gap: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" noWrap>
            {item.name}
          </Typography>

          <Label color={isSubscription ? 'info' : 'success'} sx={{ height: 20 }}>
            {isSubscription ? 'Subscription' : 'Product'}
          </Label>
        </Box>

        <Box
          sx={{
            gap: 2,
            display: 'flex',
            alignItems: 'center',
            typography: 'caption',
            color: 'text.secondary',
          }}
        >
          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify width={16} icon="solar:tag-price-bold" sx={{ color: 'text.disabled' }} />
            {fCurrency(item.price)}
          </Box>

          <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
            <Iconify width={16} icon="solar:cart-check-bold" sx={{ color: 'text.disabled' }} />
            {fShortenNumber(item.sales_count)} sales
          </Box>

          {item.total_revenue > 0 && (
            <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
              <Iconify width={16} icon="solar:dollar-bold" sx={{ color: 'text.disabled' }} />
              {fCurrency(item.total_revenue)}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
