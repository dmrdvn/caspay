import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getProductById } from 'src/actions/product';

import { ProductDetailsView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Product details | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getProductById(id);

  return <ProductDetailsView product={product || undefined} />;
}
