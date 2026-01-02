import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CasperSignInView } from 'src/auth/view/casper';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Sign in | Casper Wallet - ${CONFIG.appName}` };

export default function Page() {
  return <CasperSignInView />;
}
