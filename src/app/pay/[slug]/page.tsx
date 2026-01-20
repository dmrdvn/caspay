import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { getPayLinkBySlug, trackPayLinkEvent } from 'src/actions/paylink';

import { PaymentView } from 'src/sections/payment/view';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const paylink = await getPayLinkBySlug(slug);

  const baseUrl =
    CONFIG.serverUrl ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://caspay.link';
  const defaultTitle = `Secure Payment on Casper Network - ${CONFIG.appName}`;
  const defaultDescription = 'Complete your payment securely with CasPay on Casper Network. Fast, secure CSPR payments with Casper Wallet integration.';

  if (!paylink) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        type: 'website',
        url: `/pay/${slug}`,
        siteName: CONFIG.appName,
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: defaultTitle,
        description: defaultDescription,
        creator: '@caspay',
      },
    };
  }

  const product = (paylink as any).product;
  const merchant = (paylink as any).merchant;

  const price = product?.price;
  const currency = product?.currency || 'CSPR';
  const productName = product?.name || 'Product';
  const merchantName = merchant?.store_name || 'CasPay merchant';

  const title = price
    ? `CasPay: Pay ${price} ${currency} for "${productName}" - Secure Payment`
    : `CasPay: Pay for "${productName}" - Secure Casper Payment`;

  const description = `Pay securely with CasPay on Casper Network. Merchant: ${merchantName}. Complete your payment with CSPR using Casper Wallet integration.`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/pay/${slug}`,
      siteName: CONFIG.appName,
      locale: 'en_US',
      images: [
        {
          url: `/pay/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Pay ${price} ${currency} for ${productName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@caspay',
      images: [`/pay/${slug}/twitter-image`],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paylink = await getPayLinkBySlug(slug);

  if (paylink) {
    trackPayLinkEvent(paylink.id, 'view').catch((error) => {
      console.error('[PayLink] Failed to track view:', error);
    });
  }

  return <PaymentView paylink={paylink} />;
}
