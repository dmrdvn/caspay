import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PayLinkListView } from 'src/sections/paylink/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `PayLinks | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PayLinkListView />;
}
