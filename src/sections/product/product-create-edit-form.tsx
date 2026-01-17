import type { Product } from 'src/types/product';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { useProductMutations } from 'src/hooks/use-products';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Token/Currency options for payment
const CURRENCY_OPTIONS = [
  { 
    value: 'CSPR', 
    label: 'CSPR (Casper)', 
    description: 'Native Casper Network token',
    tokenAddress: 'hash-de04671ba6226ecbb4c4e09c256459d2dec2d7dab305b5e57825894c07607069',
    symbol: 'CSPR'
  },
  {
    value: 'USDT',
    label: 'USDT (Tether)',
    description: 'Stablecoin pegged to USD',
    tokenAddress: 'hash-c7eb734f98e6bd9bb814e63d0d375cc2fcf2d7e8a1eb8699a3e4b7427d18bde4',
    symbol: '$'
  },
  {
    value: 'USDC',
    label: 'USDC (USD Coin)',
    description: 'Stablecoin by Circle',
    tokenAddress: 'hash-8a8c72b9f4e3c1d0b5a6f7e8d9c0b1a2f3e4d5c6b7a8',
    symbol: '$'
  },
  {
    value: 'CUSTOM',
    label: 'Custom Token',
    description: 'Enter custom CEP-18 token address',
    tokenAddress: '',
    symbol: ''
  },
];

// ----------------------------------------------------------------------

export type ProductFormSchemaType = z.infer<typeof ProductFormSchema>;

export const ProductFormSchema = z.object({
  // Required fields
  name: z.string().min(1, { message: 'Product name is required' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be greater than 0' }),
  currency: z.enum(['CSPR', 'USDT', 'USDC', 'CUSTOM'], { message: 'Currency is required' }),
  token_address: z.string().min(1, { message: 'Token address is required' }),
  
  // Optional fields
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
  track_inventory: z.boolean().optional(),
  active: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  
  // Payment acceptance fields
  accept_payment: z.boolean().optional(),
  payment_wallet_address: z.string().optional(),
});

// ----------------------------------------------------------------------

type Props = {
  merchantId: string;
  currentProduct?: Product;
};

export function ProductCreateEditForm({ merchantId, currentProduct }: Props) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { createProduct, updateProduct, isCreating, isUpdating } = useProductMutations(merchantId);

  const openDetails = useBoolean(true);
  const openPricing = useBoolean(true);
  const openPayment = useBoolean(true);
  const openPaymentInfo = useBoolean(false);
  const openInventory = useBoolean(false); // Collapsed by default

  const [customTokenAddress, setCustomTokenAddress] = useState('');

  const defaultValues: ProductFormSchemaType = {
    // Required fields
    name: currentProduct?.name || '',
    price: currentProduct?.price || 0,
    currency: (currentProduct?.currency as 'CSPR' | 'USDT' | 'USDC' | 'CUSTOM') || 'CSPR',
    token_address: currentProduct?.token_address || 'hash-de04671ba6226ecbb4c4e09c256459d2dec2d7dab305b5e57825894c07607069',
    
    // Optional fields
    description: currentProduct?.description || '',
    image_url: currentProduct?.image_url || '',
    images: currentProduct?.images || [],
    stock: currentProduct?.stock ?? null,
    track_inventory: currentProduct?.track_inventory ?? false,
    active: currentProduct?.active ?? true,
    metadata: currentProduct?.metadata || {},
    
    // Payment acceptance fields (default to user's wallet if accepting payment)
    accept_payment: currentProduct?.accept_payment ?? false,
    payment_wallet_address: currentProduct?.payment_wallet_address || user?.publicKey || '',
  };

  const methods = useForm({
    resolver: zodResolver(ProductFormSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentProduct) {
        // Update existing product
        await updateProduct(currentProduct.id, {
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          token_address: data.token_address,
          image_url: data.image_url || undefined,
          images: data.images && data.images.length > 0 ? data.images : undefined,
          stock: data.stock ?? undefined,
          track_inventory: data.track_inventory,
          active: data.active,
          metadata: data.metadata,
          accept_payment: data.accept_payment,
          payment_wallet_address: data.accept_payment ? data.payment_wallet_address : undefined,
        });
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        await createProduct({
          merchant_id: merchantId,
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          token_address: data.token_address,
          image_url: data.image_url || undefined,
          images: data.images && data.images.length > 0 ? data.images : undefined,
          stock: data.stock ?? undefined,
          track_inventory: data.track_inventory,
          active: data.active,
          metadata: data.metadata,
          accept_payment: data.accept_payment,
          payment_wallet_address: data.accept_payment ? data.payment_wallet_address : undefined,
        });
        toast.success('Product created successfully!');
        reset();
      }
      router.push(paths.dashboard.product.root);
    } catch (error) {
      console.error('Product form error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    }
  });

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = [...(values.images || [])];
      newImages.splice(index, 1);
      setValue('images', newImages);
    },
    [setValue, values.images]
  );

  const handleAddImage = useCallback(
    (url: string) => {
      const newImages = [...(values.images || []), url];
      setValue('images', newImages);
    },
    [setValue, values.images]
  );

  const renderCollapseButton = (value: boolean, onToggle: () => void) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  const renderDetails = () => (
    <Card>
      <CardHeader
        title="Product Details"
        subheader="Name, description, and images (optional)"
        action={renderCollapseButton(openDetails.value, openDetails.onToggle)}
        sx={{ mb: 3 }}
      />

      <Collapse in={openDetails.value}>
        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <Field.Text 
            name="name" 
            label="Product Name *" 
            placeholder="Premium Headphones" 
          />

          <Field.Text
            name="description"
            label="Description (Optional)"
            multiline
            rows={4}
            placeholder="Describe your product..."
          />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Primary Image URL (Optional)</Typography>
            <Field.Text
              name="image_url"
              label="Image URL"
              placeholder="https://example.com/image.jpg"
            />
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Additional Images (Optional)</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Add additional product images (URLs)
            </Typography>
            {values.images?.map((img, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Image {index + 1}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 0.5,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    {img}
                  </Typography>
                </Box>
                <IconButton onClick={() => handleRemoveImage(index)} color="error">
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            ))}
            <Button
              size="small"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) handleAddImage(url);
              }}
            >
              Add Image URL
            </Button>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderPricing = () => {
    const selectedCurrency = CURRENCY_OPTIONS.find(opt => opt.value === values.currency);
    const isCustomToken = values.currency === 'CUSTOM';
    const tokenAddress = isCustomToken ? values.token_address : (selectedCurrency?.tokenAddress || '');
    const currencySymbol = selectedCurrency?.symbol || '$';

    return (
      <Card>
        <CardHeader
          title="Pricing & Payment"
          subheader="Set product price and payment token"
          action={renderCollapseButton(openPricing.value, openPricing.onToggle)}
          sx={{ mb: 3 }}
        />

        <Collapse in={openPricing.value}>
          <Divider />

          <Stack spacing={3} sx={{ p: 3 }}>
            {/* Price Input */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Price *</Typography>
              <Field.Text
                name="price"
                placeholder="0.00"
                type="number"
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box component="span" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                          {currencySymbol}
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            {/* Currency/Token Selection */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Payment Token *</Typography>
              <Field.Select
                name="currency"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                onChange={(e) => {
                  const newCurrency = e.target.value;
                  setValue('currency', newCurrency as any);
                  
                  // Auto-set token address based on currency
                  const option = CURRENCY_OPTIONS.find(opt => opt.value === newCurrency);
                  if (option && option.tokenAddress) {
                    setValue('token_address', option.tokenAddress);
                  } else if (newCurrency === 'CUSTOM') {
                    setValue('token_address', customTokenAddress || '');
                  }
                }}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Field.Select>
            </Stack>

            {/* Custom Token Address Input */}
            {isCustomToken && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Custom Token Contract Hash *</Typography>
                <TextField
                  value={customTokenAddress}
                  onChange={(e) => {
                    setCustomTokenAddress(e.target.value);
                    setValue('token_address', e.target.value);
                  }}
                  placeholder="hash-..."
                  helperText="Enter the CEP-18 token contract hash"
                  fullWidth
                  slotProps={{
                    input: {
                      sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
                    },
                  }}
                />
              </Stack>
            )}

            {/* Token Address Display (Read-only) */}
            {!isCustomToken && tokenAddress && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Token Address
                  <Typography component="span" variant="caption" color="text.secondary">
                    (Copy to add to your wallet)
                  </Typography>
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    border: (theme) => `1px dashed ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.8125rem', 
                        wordBreak: 'break-all',
                        color: 'text.primary'
                      }}
                    >
                      {tokenAddress}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(tokenAddress);
                      toast.success('Token address copied!');
                    }}
                    sx={{ 
                      flexShrink: 0,
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      }
                    }}
                  >
                    <Iconify icon="solar:copy-bold" width={18} />
                  </IconButton>
                </Box>
              </Stack>
            )}
          </Stack>
        </Collapse>
      </Card>
    );
  };

  const renderInventory = () => (
    <Card>
      <CardHeader
        title="Inventory"
        subheader="Stock and inventory tracking"
        action={renderCollapseButton(openInventory.value, openInventory.onToggle)}
        sx={{ mb: 3 }}
      />

      <Collapse in={openInventory.value}>
        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={values.track_inventory}
                onChange={(e) => setValue('track_inventory', e.target.checked)}
              />
            }
            label="Track Inventory"
          />

          {values.track_inventory && (
            <Field.Text
              name="stock"
              label="Stock Quantity"
              placeholder="0"
              type="number"
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          )}

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {values.track_inventory
              ? 'Stock will be automatically decreased when customers make purchases'
              : 'Inventory tracking is disabled for this product'}
          </Typography>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderPaymentAcceptance = () => (
    <>
      <Card>
        <CardHeader
          title="Payment Acceptance"
          subheader="Accept payments directly to your wallet"
          action={renderCollapseButton(openPayment.value, openPayment.onToggle)}
          sx={{ mb: 3 }}
        />

        <Collapse in={openPayment.value}>
          <Divider />

          <Stack spacing={3} sx={{ p: 3 }}>
            <Alert severity="info">
              By default, CasPay tracks payments and writes them to blockchain. 
              Enable this option if you want to receive payments directly to your wallet.{' '}
              <Box
                component="span"
                onClick={openPaymentInfo.onTrue}
                sx={{
                  color: 'info.main',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    color: 'info.dark',
                  },
                }}
              >
                Click for details
              </Box>
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={values.accept_payment}
                  onChange={(e) => {
                    setValue('accept_payment', e.target.checked);
                    if (e.target.checked && !values.payment_wallet_address) {
                      setValue('payment_wallet_address', user?.publicKey || '');
                    }
                  }}
                />
              }
              label="Accept Payments Directly"
            />

            {values.accept_payment && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">
                  Payment Wallet Address
                </Typography>
                <TextField
                  value={values.payment_wallet_address}
                  disabled
                  fullWidth
                  helperText="Connected wallet address (currently non-editable)"
                  slotProps={{
                    input: {
                      sx: { 
                        fontFamily: 'monospace', 
                        fontSize: '0.875rem',
                        bgcolor: 'action.hover',
                      },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify icon="solar:wallet-bold" width={20} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            )}
          </Stack>
        </Collapse>
      </Card>

      {/* Payment Info Dialog */}
      <Dialog
        open={openPaymentInfo.value}
        onClose={openPaymentInfo.onFalse}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Payment Integration Options</Typography>
            <IconButton onClick={openPaymentInfo.onFalse} size="small">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            {/* Tracking Only */}
            <Card
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
              }}
            >
              <Stack spacing={2.5} height="100%">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'background.neutral',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:document-text-bold-duotone" width={28} sx={{ color: 'text.secondary' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6">Payment Tracking</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Track & Manage
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack spacing={1.5} sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Payment notification via SDK integration
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Transaction recorded on blockchain
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Invoicing and financial management
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Analytics and reporting tools
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    💡 Best for: Businesses handling payments externally but want blockchain tracking and analytics
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Direct Payment */}
            <Card
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
              }}
            >
              <Stack spacing={2.5} height="100%">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'background.neutral',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:wallet-money-bold-duotone" width={28} sx={{ color: 'text.secondary' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6">Direct Payment</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Receive & Manage
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <Stack spacing={1.5} sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Crypto payments to your connected wallet
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Transaction recorded on blockchain
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Invoicing and financial management
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Analytics and reporting tools
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    💡 Best for: Businesses ready to accept crypto payments directly through CasPay
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 3, pb: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={openPaymentInfo.onFalse}
              fullWidth
            >
              Close
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );

  const renderActions = () => (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <FormControlLabel
        label="Active"
        control={
          <Switch
            checked={values.active}
            onChange={(e) => setValue('active', e.target.checked)}
            slotProps={{ input: { id: 'active-switch' } }}
          />
        }
        sx={{ pl: 3, flexGrow: 1 }}
      />

      <Button
        variant="outlined"
        size="large"
        onClick={() => router.push(paths.dashboard.product.root)}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        variant="contained"
        size="large"
        loading={isSubmitting || isCreating || isUpdating}
      >
        {!currentProduct ? 'Create Product' : 'Save Changes'}
      </Button>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={{ xs: 3, md: 5 }}>
        {renderDetails()}
        {renderPricing()}
        {renderPaymentAcceptance()}
        {renderInventory()}
        {renderActions()}
      </Stack>
    </Form>
  );
}
