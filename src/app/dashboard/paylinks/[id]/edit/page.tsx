import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PayLinkEditView } from 'src/sections/paylink/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit PayLink - ${CONFIG.appName}` };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <PayLinkEditView id={id} />;
}
