import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getProductById } from 'src/actions/product';

import { ProductEditView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Product edit | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getProductById(id);

  return <ProductEditView product={product || undefined} />;
}
