import type { Product } from 'src/types/product';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Fab, { fabClasses } from '@mui/material/Fab';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';

// import { useCheckoutContext } from '../checkout/context'; // TODO: Implement checkout context

// ----------------------------------------------------------------------

type Props = {
  product: Product;
  detailsHref: string;
};

export function ProductItem({ product, detailsHref }: Props) {
  // const { onAddToCart } = useCheckoutContext(); // TODO: Implement checkout context
  const onAddToCart = (cartProduct: any) => {
    console.log('Add to cart:', cartProduct);
    // TODO: Implement cart functionality
  };

  const { id, name, price, image_url, stock, active } = product;

  const handleAddCart = async () => {
    const newProduct = {
      id,
      name,
      coverUrl: image_url || '',
      available: stock || 0,
      price,
      colors: ['#000000'], // Default color for CasPay products
      size: 'default',
      quantity: 1,
    };
    try {
      onAddToCart(newProduct);
    } catch (error) {
      console.error(error);
    }
  };

  const renderLabels = () =>
    !active && (
      <Box
        sx={{
          gap: 1,
          top: 16,
          zIndex: 9,
          right: 16,
          display: 'flex',
          position: 'absolute',
          alignItems: 'center',
        }}
      >
        <Label variant="filled" color="default">
          Inactive
        </Label>
      </Box>
    );

  const renderImage = () => (
    <Box sx={{ position: 'relative', p: 1 }}>
      {!!stock && stock > 0 && active && (
        <Fab
          size="medium"
          color="warning"
          onClick={handleAddCart}
          sx={[
            (theme) => ({
              right: 16,
              zIndex: 9,
              bottom: 16,
              opacity: 0,
              position: 'absolute',
              transform: 'scale(0)',
              transition: theme.transitions.create(['opacity', 'transform'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
            }),
          ]}
        >
          <Iconify icon="solar:cart-plus-bold" width={24} />
        </Fab>
      )}

      <Tooltip
        title={!stock || stock === 0 ? 'Out of stock' : !active ? 'Inactive' : ''}
        placement="bottom-end"
      >
        <Image
          alt={name}
          src={image_url || ''}
          ratio="1/1"
          sx={{
            borderRadius: 1.5,
            ...((!stock || stock === 0 || !active) && {
              opacity: 0.48,
              filter: 'grayscale(1)',
            }),
          }}
        />
      </Tooltip>
    </Box>
  );

  const renderContent = () => (
    <Stack spacing={2.5} sx={{ p: 3, pt: 2 }}>
      <Link component={RouterLink} href={detailsHref} color="inherit" variant="subtitle2" noWrap>
        {name}
      </Link>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
          {product.currency === 'USD' ? 'USD' : 'CSPR'}
        </Box>

        <Box sx={{ gap: 0.5, display: 'flex', typography: 'subtitle1' }}>
          <Box component="span">
            {product.currency === 'USD' ? '$' : ''}
            {fCurrency(price)}
            {product.currency === 'CSPR' ? ' CSPR' : ''}
          </Box>
        </Box>
      </Box>

      {stock !== null && stock !== undefined && (
        <Box sx={{ typography: 'caption', color: stock > 0 ? 'success.main' : 'error.main' }}>
          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
        </Box>
      )}
    </Stack>
  );

  return (
    <Card
      sx={{
        '&:hover': {
          [`& .${fabClasses.root}`]: { opacity: 1, transform: 'scale(1)' },
        },
      }}
    >
      {renderLabels()}
      {renderImage()}
      {renderContent()}
    </Card>
  );
}
