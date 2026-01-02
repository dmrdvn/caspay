'use client';

import type { SubscriptionPlan, SubscriptionPlanCreateInput } from 'src/types/subscription';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Token/Currency options (same as products)
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

export const SubscriptionPlanSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().optional(),
  price: zod.coerce.number().min(0, { message: 'Price must be positive!' }),
  currency: zod.enum(['CSPR', 'USDT', 'USDC', 'CUSTOM'], { message: 'Currency is required' }),
  token_address: zod.string().min(1, { message: 'Token address is required' }),
  interval: zod.enum(['weekly', 'monthly', 'yearly']),
  interval_count: zod.coerce.number().min(1, { message: 'Interval count must be at least 1!' }),
  trial_days: zod.coerce.number().min(0, { message: 'Trial days cannot be negative!' }),
});

type Props = {
  currentPlan?: SubscriptionPlan;
  onSubmit: (data: Omit<SubscriptionPlanCreateInput, 'merchant_id'>) => Promise<void>;
};

export function SubscriptionPlanCreateEditForm({ currentPlan, onSubmit }: Props) {
  const router = useRouter();
  const [customTokenAddress, setCustomTokenAddress] = useState('');

  const defaultValues = useMemo(
    () => ({
      name: currentPlan?.name || '',
      description: currentPlan?.description || '',
      price: currentPlan?.price || 0,
      currency: (currentPlan?.currency as 'CSPR' | 'USDT' | 'USDC' | 'CUSTOM') || 'CSPR',
      token_address: currentPlan?.token_address || 'hash-de04671ba6226ecbb4c4e09c256459d2dec2d7dab305b5e57825894c07607069',
      interval: currentPlan?.interval || 'monthly' as const,
      interval_count: currentPlan?.interval_count || 1,
      trial_days: currentPlan?.trial_days || 0,
    }),
    [currentPlan]
  );

  const methods = useForm({
    resolver: zodResolver(SubscriptionPlanSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      router.push(paths.dashboard.subscription.root);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={handleFormSubmit}>
      <Stack spacing={3}>
        {/* Basic Information */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Basic Information
          </Typography>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text name="name" label="Plan Name" required />
            <Field.Select name="interval" label="Billing Interval" required>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Field.Select>

            <Field.Text
              name="description"
              label="Description"
              multiline
              rows={4}
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>
        </Card>

        {/* Pricing & Payment */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Pricing & Payment
          </Typography>
          <Stack spacing={3}>
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
                          {(() => {
                            const selectedCurrency = CURRENCY_OPTIONS.find(opt => opt.value === values.currency);
                            return selectedCurrency?.symbol || '$';
                          })()}
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
            {values.currency === 'CUSTOM' && (
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
            {values.currency !== 'CUSTOM' && (() => {
              const selectedCurrency = CURRENCY_OPTIONS.find(opt => opt.value === values.currency);
              const tokenAddress = selectedCurrency?.tokenAddress || '';
              return tokenAddress ? (
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
              ) : null;
            })()}
          </Stack>
        </Card>

        {/* Trial Settings */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Trial Period
          </Typography>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <Field.Text
              name="trial_days"
              label="Trial Period (days)"
              type="number"
              helperText="Number of days for free trial (0 for no trial)"
            />
          </Box>
        </Card>

        {/* Hidden field - interval_count always 1 */}
        <Field.Text name="interval_count" type="hidden" sx={{ display: 'none' }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
            {currentPlan ? 'Save Changes' : 'Create Plan'}
          </LoadingButton>
        </Box>
      </Stack>
    </Form>
  );
}
