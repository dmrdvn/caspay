'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MerchantCreateEditForm } from '../merchant-create-edit-form';

// ----------------------------------------------------------------------

export function MerchantCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Create a new merchant"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Merchant', href: paths.dashboard.merchant.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <MerchantCreateEditForm />
    </DashboardContent>
  );
}
