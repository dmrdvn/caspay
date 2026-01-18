'use client';

import type { Merchant } from 'src/types/merchant';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useMerchantMutations } from 'src/hooks/use-merchants';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type MerchantFormSchema = z.infer<typeof MerchantSchema>;

export const MerchantSchema = z.object({
  store_name: z.string().min(1, { message: 'Store name is required' }),
  store_description: z.string().optional(),
  business_type: z.enum(['individual', 'company', 'dao']).default('company'),
  support_email: z.string().email().optional().or(z.literal('')),
  support_url: z.string().url().optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
  brand_color: z.string().regex(/^#([A-Fa-f0-9]{6})$/).optional(),
});

// ----------------------------------------------------------------------

type Props = {
  currentMerchant?: Partial<Merchant>;
};

export function MerchantCreateEditForm({ currentMerchant }: Props) {
  const router = useRouter();
  const { createMerchant, updateMerchant, isCreating, isUpdating } = useMerchantMutations();

  const openBasic = useBoolean(true);
  const openBranding = useBoolean(true);

  const defaultValues: MerchantFormSchema = {
    store_name: currentMerchant?.store_name || '',
    store_description: currentMerchant?.store_description || '',
    business_type: currentMerchant?.business_type || 'company',
    support_email: currentMerchant?.support_email || '',
    support_url: currentMerchant?.support_url || '',
    logo_url: currentMerchant?.logo_url || '',
    brand_color: currentMerchant?.brand_color || '#1890FF',
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(MerchantSchema),
    defaultValues,
  });

  const {
    handleSubmit,
  } = methods;

  const isMutating = isCreating || isUpdating;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentMerchant?.id) {
        // Update existing merchant
        await updateMerchant(currentMerchant.id, {
          store_name: data.store_name,
          store_description: data.store_description || undefined,
          business_type: data.business_type,
          support_email: data.support_email || undefined,
          support_url: data.support_url || undefined,
          logo_url: data.logo_url || undefined,
          brand_color: data.brand_color,
        });
        toast.success('Merchant updated successfully!');
      } else {
        // Create new merchant
        await createMerchant({
          store_name: data.store_name,
          store_description: data.store_description || undefined,
          business_type: data.business_type,
          support_email: data.support_email || undefined,
          support_url: data.support_url || undefined,
          logo_url: data.logo_url || undefined,
          brand_color: data.brand_color,
        });
        toast.success('Merchant created successfully!');
      }

      router.push(paths.dashboard.merchant.root);
    } catch (error: any) {
      console.error('[MerchantCreateEditForm] Error:', error);
      toast.error(error.message || 'Something went wrong!');
    }
  });

  const renderCollapseButton = (value: boolean, onToggle: () => void) => (
    <IconButton onClick={onToggle}>
      <Iconify icon={value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'} />
    </IconButton>
  );

  const renderBasicInfo = () => (
    <Card>
      <CardHeader
        title="Basic Information"
        subheader="Store name, description, business details..."
        action={renderCollapseButton(openBasic.value, openBasic.onToggle)}
        sx={{ mb: 3 }}
      />

      <Collapse in={openBasic.value}>
        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Store Name</Typography>
            <Field.Text name="store_name" placeholder="Ex: My Awesome Store" />
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Description</Typography>
            <Field.Text
              name="store_description"
              placeholder="Brief description of your store..."
              multiline
              rows={4}
            />
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Business Type</Typography>
            <Field.Select name="business_type">
              <MenuItem value="individual">Individual</MenuItem>
              <MenuItem value="company">Company</MenuItem>
              <MenuItem value="dao">DAO</MenuItem>
            </Field.Select>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Support Email</Typography>
              <Field.Text name="support_email" placeholder="support@example.com" type="email" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Support URL</Typography>
              <Field.Text name="support_url" placeholder="https://example.com/support" />
            </Stack>
          </Box>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderBranding = () => (
    <Card>
      <CardHeader
        title="Branding"
        subheader="Logo and brand colors..."
        action={renderCollapseButton(openBranding.value, openBranding.onToggle)}
        sx={{ mb: 3 }}
      />

      <Collapse in={openBranding.value}>
        <Divider />

        <Stack spacing={3} sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Logo URL</Typography>
              <Field.Text name="logo_url" placeholder="https://example.com/logo.png" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Brand Color</Typography>
              <Field.Text 
                name="brand_color" 
                placeholder="#1890FF"
                type="color"
                slotProps={{
                  input: {
                    sx: { height: 56, cursor: 'pointer' }
                  }
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Collapse>
    </Card>
  );

  const renderActions = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
      <Button
        variant="outlined"
        size="large"
        color="inherit"
        onClick={() => router.push(paths.dashboard.merchant.root)}
      >
        Cancel
      </Button>

      <Button type="submit" variant="contained" size="large" loading={isMutating}>
        {!currentMerchant ? 'Create Merchant' : 'Save Changes'}
      </Button>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={{ xs: 3, md: 5 }}>
        {renderBasicInfo()}
        {renderBranding()}
        {renderActions()}
      </Stack>
    </Form>
  );
}
