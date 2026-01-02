'use client';

import type { SubscriptionPlanUpdateInput } from 'src/types/subscription';

import { useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMerchants, useSubscriptionPlans, useSubscriptionPlanMutations } from 'src/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SubscriptionPlanCreateEditForm } from '../subscription-plan-create-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function SubscriptionPlanEditView({ id }: Props) {
  const router = useRouter();
  const { currentMerchant } = useMerchants();
  const { plans } = useSubscriptionPlans(currentMerchant?.id);
  const { updatePlan } = useSubscriptionPlanMutations(currentMerchant?.id);

  const currentPlan = plans?.find((plan) => plan.id === id);

  const handleSubmit = useCallback(
    async (data: SubscriptionPlanUpdateInput) => {
      if (!currentPlan?.id) {
        throw new Error('Plan not found');
      }

      await updatePlan(currentPlan.id, data);
      router.push(paths.dashboard.subscription.root);
    },
    [updatePlan, currentPlan, router]
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Edit subscription plan"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscriptions', href: paths.dashboard.subscription.root },
          { name: currentPlan?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <SubscriptionPlanCreateEditForm currentPlan={currentPlan} onSubmit={handleSubmit} />
    </DashboardContent>
  );
}
