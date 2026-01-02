import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OverviewMerchantView } from 'src/sections/overview/merchant/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewMerchantView />;
}
