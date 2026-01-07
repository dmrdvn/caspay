'use client';

import { paths } from 'src/routes/paths';

import { useMerchants } from 'src/hooks';
import { usePayLink } from 'src/hooks/use-paylinks';
import { DashboardContent } from 'src/layouts/dashboard';

import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PayLinkEditForm } from '../paylink-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function PayLinkEditView({ id }: Props) {
  const { currentMerchant } = useMerchants();
  const { paylink, isLoading } = usePayLink(id, currentMerchant?.id);

  if (!currentMerchant) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="No merchant selected"
          description="Please select a merchant to edit PayLinks"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="Loading..."
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  if (!paylink) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent
          filled
          title="PayLink not found"
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Edit PayLink"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'PayLinks', href: paths.dashboard.payLink.root },
          { name: paylink.slug },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PayLinkEditForm paylink={paylink} merchantId={currentMerchant.id} />
    </DashboardContent>
  );
}
