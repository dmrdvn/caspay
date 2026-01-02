import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TransactionListView } from 'src/sections/transaction/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Transactions | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <TransactionListView />;
}
