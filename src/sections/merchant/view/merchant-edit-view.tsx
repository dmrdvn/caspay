'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useMerchant } from 'src/hooks/use-merchants';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MerchantCreateEditForm } from '../merchant-create-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function MerchantEditView({ id }: Props) {
  const { merchant, isLoading, error } = useMerchant(id);

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading merchant...
          </Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (error || !merchant) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            {error || 'Merchant not found'}
          </Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.merchant.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Merchant', href: paths.dashboard.merchant.root },
          { name: merchant.store_name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <MerchantCreateEditForm currentMerchant={merchant} />
    </DashboardContent>
  );
}
