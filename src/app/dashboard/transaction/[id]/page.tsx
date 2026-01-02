'use client';


import * as React from 'react';

import { useTransaction } from 'src/hooks';

import { TransactionDetailsView } from 'src/sections/transaction/view';

// ----------------------------------------------------------------------

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: Props) {
  const resolvedParams = React.use(params);
  const { transaction } = useTransaction(resolvedParams.id);

  return <TransactionDetailsView transaction={transaction || undefined} />;
}
