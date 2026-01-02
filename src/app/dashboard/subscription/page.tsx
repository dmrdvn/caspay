import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SubscriptionPlanListView } from 'src/sections/subscription-plan/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Subscription plans | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <SubscriptionPlanListView />;
}
