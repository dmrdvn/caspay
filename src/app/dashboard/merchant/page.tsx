'use client';


import { useMerchants } from 'src/hooks/use-merchants';

import { MerchantDetailsView } from 'src/sections/merchant/view';

// ----------------------------------------------------------------------


export default function Page() {
  const { currentMerchant } = useMerchants();

  if (!currentMerchant) {
    return null; 
  }

  return <MerchantDetailsView id={currentMerchant.id} />;
}
