'use client';

import { paths } from 'src/routes/paths';

import { useMerchants } from 'src/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductCreateEditForm } from '../product-create-edit-form';

// ----------------------------------------------------------------------

export function ProductCreateView() {
  const { currentMerchant } = useMerchants();

  if (!currentMerchant) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="No merchant selected"
          description="Please select a merchant from the top menu to create products"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Create a new product"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: currentMerchant.store_name },
          { name: 'Products', href: paths.dashboard.product.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductCreateEditForm merchantId={currentMerchant.id} />
    </DashboardContent>
  );
}
