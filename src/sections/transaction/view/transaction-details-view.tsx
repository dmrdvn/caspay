'use client';

import type { TransactionItem } from 'src/actions/transaction';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TransactionDetails } from '../transaction-details';

// ----------------------------------------------------------------------

type Props = {
  transaction?: TransactionItem;
};

export function TransactionDetailsView({ transaction }: Props) {
  const displayId = transaction?.invoice_number || `#${transaction?.id?.slice(0, 8)}`;

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading={displayId}
        backHref={paths.dashboard.transaction.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Transactions', href: paths.dashboard.transaction.root },
          { name: displayId },
        ]}
        sx={{ mb: 3 }}
      />

      <TransactionDetails transaction={transaction} />
    </DashboardContent>
  );
}
