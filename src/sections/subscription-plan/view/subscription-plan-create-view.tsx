'use client';

import type { SubscriptionPlanCreateInput } from 'src/types/subscription';

import { useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMerchants, useSubscriptionPlanMutations } from 'src/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SubscriptionPlanCreateEditForm } from '../subscription-plan-create-edit-form';

// ----------------------------------------------------------------------

export function SubscriptionPlanCreateView() {
  const router = useRouter();
  const { currentMerchant } = useMerchants();
  const { createPlan } = useSubscriptionPlanMutations(currentMerchant?.id);

  const handleSubmit = useCallback(
    async (data: Omit<SubscriptionPlanCreateInput, 'merchant_id'>) => {
      if (!currentMerchant?.id) {
        throw new Error('No merchant selected');
      }

      await createPlan({
        ...data,
        merchant_id: currentMerchant.id,
      });

      router.push(paths.dashboard.subscription.root);
    },
    [createPlan, currentMerchant, router]
  );
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Create a new subscription plan"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscriptions', href: paths.dashboard.subscription.root },
          { name: 'New plan' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <SubscriptionPlanCreateEditForm onSubmit={handleSubmit} />
    </DashboardContent>
  );
}
