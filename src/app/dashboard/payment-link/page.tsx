import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PaymentLinkListView } from 'src/sections/payment-link/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Payment Links | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PaymentLinkListView />;
}
