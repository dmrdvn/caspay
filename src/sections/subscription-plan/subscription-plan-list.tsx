import type { SubscriptionPlan } from 'src/types/subscription';

import Grid from '@mui/material/Grid';

import { paths } from 'src/routes/paths';

import { SubscriptionPlanItem } from './subscription-plan-item';

// ----------------------------------------------------------------------

type Props = {
  plans: SubscriptionPlan[];
  onDeletePlan?: (planId: string) => void;
};

export function SubscriptionPlanList({ plans, onDeletePlan }: Props) {
  return (
    <Grid container spacing={3}>
      {plans.map((plan) => (
        <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <SubscriptionPlanItem
            plan={plan}
            editHref={paths.dashboard.subscription.edit(plan.id)}
            detailsHref={paths.dashboard.subscription.details(plan.id)}
            onDelete={() => onDeletePlan?.(plan.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
