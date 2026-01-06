'use client';

import { paths } from 'src/routes/paths';

import { useMerchants } from 'src/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PayLinkCreateForm } from 'src/sections/paylink/paylink-create-form';

// ----------------------------------------------------------------------

export function PayLinkCreateView() {
  const { currentMerchant } = useMerchants();

  if (!currentMerchant) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="No merchant selected"
          description="Please select a merchant to create PayLinks"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Create PayLink"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'PayLinks', href: paths.dashboard.payLink.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PayLinkCreateForm merchantId={currentMerchant.id} />
    </DashboardContent>
  );
}
