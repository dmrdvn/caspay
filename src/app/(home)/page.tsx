import type { Metadata } from 'next';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'CasPay - Crypto Payment Gateway for Casper Blockchain',
  description:
    'Accept cryptocurrency payments easily with CasPay. Built on Casper blockchain, secure payment processing for merchants and businesses.',
};

export default function Page() {
  return <HomeView />;
}
