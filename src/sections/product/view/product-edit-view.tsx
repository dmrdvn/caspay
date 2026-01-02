'use client';

import type { Product } from 'src/types/product';

import { paths } from 'src/routes/paths';

import { useMerchants } from 'src/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductCreateEditForm } from '../product-create-edit-form';

// ----------------------------------------------------------------------

type Props = {
  product?: Product;
};

export function ProductEditView({ product }: Props) {
  const { currentMerchant } = useMerchants();

  if (!currentMerchant || !product) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title={!currentMerchant ? 'No merchant selected' : 'Product not found'}
          description={
            !currentMerchant
              ? 'Please select a merchant from the top menu'
              : 'The product you are looking for does not exist'
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Edit Product"
        backHref={paths.dashboard.product.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: currentMerchant.store_name },
          { name: 'Products', href: paths.dashboard.product.root },
          { name: product.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductCreateEditForm merchantId={currentMerchant.id} currentProduct={product} />
    </DashboardContent>
  );
}
