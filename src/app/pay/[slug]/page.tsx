import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { getPayLinkBySlug, trackPayLinkEvent } from 'src/actions/paylink';

import { PaymentView } from 'src/sections/payment/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { 
  title: `Payment - ${CONFIG.appName}`,
  description: 'Complete your payment securely',
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paylink = await getPayLinkBySlug(slug);

  // Track view event (fire and forget)
  if (paylink) {
    trackPayLinkEvent(paylink.id, 'view').catch((error) => {
      console.error('[PayLink] Failed to track view:', error);
    });
  }

  return <PaymentView paylink={paylink} />;
}
