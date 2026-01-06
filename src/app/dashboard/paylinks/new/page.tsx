import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PayLinkCreateView } from 'src/sections/paylink/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Create PayLink - ${CONFIG.appName}` };

export default function Page() {
  return <PayLinkCreateView />;
}
