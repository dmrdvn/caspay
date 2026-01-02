'use client';


import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMerchants, useSubscriptionPlans, useSubscriptionPlanMutations } from 'src/hooks';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SubscriptionPlanList } from '../subscription-plan-list';

// ----------------------------------------------------------------------

export function SubscriptionPlanListView() {
  const { currentMerchant } = useMerchants();
  const { plans, isLoading } = useSubscriptionPlans(currentMerchant?.id);
  const { deletePlan } = useSubscriptionPlanMutations(currentMerchant?.id);

  const handleDeletePlan = useCallback(
    async (planId: string) => {
      try {
        await deletePlan(planId);
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    },
    [deletePlan]
  );

  const notFound = !isLoading && !plans.length;

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Subscription Plans"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Subscription Plans', href: paths.dashboard.subscription.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.subscription.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Plan
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {notFound && <EmptyContent filled title="No plans found" sx={{ py: 10 }} />}

      <SubscriptionPlanList plans={plans} onDeletePlan={handleDeletePlan} />
    </DashboardContent>
  );
}
