'use client';

import type { TableHeadCellProps } from 'src/components/table';
import type { TransactionItem } from 'src/actions/transaction';

import { sumBy } from 'es-toolkit';
import { useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { useMerchants, useTransactions } from 'src/hooks';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { TransactionAnalytic } from '../transaction-analytic';
import { TransactionTableRow } from '../transaction-table-row';
import { TransactionTableToolbar } from '../transaction-table-toolbar';
import { TransactionTableFiltersResult } from '../transaction-table-filters-result';

// ----------------------------------------------------------------------

type TransactionFilters = {
  name: string;
  paymentType: 'all' | 'product' | 'subscription';
  subscriptionStatus: 'all' | 'active' | 'expired';
  startDate: Date | null;
  endDate: Date | null;
};

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'transaction_hash', label: 'Transaction Hash' },
  { id: 'payer_address', label: 'Customer Wallet' },
  { id: 'payment_type', label: 'Type' },
  { id: 'created_at', label: 'Date(s)' },
  { id: 'amount', label: 'Amount' },
  { id: '' },
];

// ----------------------------------------------------------------------

export function TransactionListView() {
  const theme = useTheme();

  const table = useTable({ defaultOrderBy: 'created_at' });

  // Get current merchant and transactions
  const { currentMerchant } = useMerchants();
  const { transactions: tableData } = useTransactions(currentMerchant?.id);

  const filters = useSetState<TransactionFilters>({
    name: '',
    paymentType: 'all',
    subscriptionStatus: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });


  const canReset =
    !!currentFilters.name ||
    currentFilters.paymentType !== 'all' ||
    currentFilters.subscriptionStatus !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getPaymentTypeLength = (type: 'product' | 'subscription') =>
    tableData.filter((item) => item.payment_type === type).length;

  const getPaymentTypeAmount = (type: 'product' | 'subscription') => ({
    usd: sumBy(
      tableData.filter((item) => item.payment_type === type),
      (transaction) => transaction.usd_value || 0
    ),
    token: sumBy(
      tableData.filter((item) => item.payment_type === type),
      (transaction) => transaction.amount
    )
  });

  // Get active subscriptions (subscription with future or no end date)
  const getActiveSubscriptions = () => {
    const now = new Date();
    return tableData.filter(
      (item) =>
        item.payment_type === 'subscription' &&
        (!item.subscription_end || new Date(item.subscription_end) > now)
    );
  };

  // Get expired subscriptions (subscription with past end date)
  const getExpiredSubscriptions = () => {
    const now = new Date();
    return tableData.filter(
      (item) =>
        item.payment_type === 'subscription' &&
        item.subscription_end &&
        new Date(item.subscription_end) <= now
    );
  };

  const TABS = [
    {
      value: 'all',
      label: 'All',
      color: 'default',
      count: tableData.length,
    },
    {
      value: 'product',
      label: 'Products',
      color: 'primary',
      count: getPaymentTypeLength('product'),
    },
    {
      value: 'subscription',
      label: 'Subscriptions',
      color: 'secondary',
      count: getPaymentTypeLength('subscription'),
    },
  ] as const;

  const handleFilterPaymentType = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ 
        paymentType: newValue as TransactionFilters['paymentType'],
        subscriptionStatus: 'all', // Reset subscription status when changing payment type
      });
    },
    [updateFilters, table]
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Transactions"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Transactions', href: paths.dashboard.transaction.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: { xs: 3, md: 5 } }}>
        <Scrollbar sx={{ minHeight: 108 }}>
          <Stack
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2, flexDirection: 'row' }}
          >
            <TransactionAnalytic
              title="Total"
              total={tableData.length}
              percent={100}
              priceUsd={sumBy(tableData, (t) => t.usd_value || 0)}
              priceToken={sumBy(tableData, (t) => t.amount)}
              tokenSymbol={tableData[0]?.token || 'CSPR'}
              icon="solar:bill-list-bold-duotone"
              color={theme.vars.palette.info.main}
            />

            <TransactionAnalytic
              title="Products"
              total={getPaymentTypeLength('product')}
              percent={tableData.length > 0 ? (getPaymentTypeLength('product') / tableData.length) * 100 : 0}
              priceUsd={getPaymentTypeAmount('product').usd}
              priceToken={getPaymentTypeAmount('product').token}
              tokenSymbol={tableData[0]?.token || 'CSPR'}
              icon="solar:box-bold-duotone"
              color={theme.vars.palette.primary.main}
            />

            <TransactionAnalytic
              title="Active Subscriptions"
              total={getActiveSubscriptions().length}
              percent={tableData.length > 0 ? (getActiveSubscriptions().length / tableData.length) * 100 : 0}
              priceUsd={sumBy(getActiveSubscriptions(), (t) => t.usd_value || 0)}
              priceToken={sumBy(getActiveSubscriptions(), (t) => t.amount)}
              tokenSymbol={tableData[0]?.token || 'CSPR'}
              icon="solar:check-circle-bold-duotone"
              color={theme.vars.palette.success.main}
            />

            <TransactionAnalytic
              title="Expired Subscriptions"
              total={getExpiredSubscriptions().length}
              percent={tableData.length > 0 ? (getExpiredSubscriptions().length / tableData.length) * 100 : 0}
              priceUsd={sumBy(getExpiredSubscriptions(), (t) => t.usd_value || 0)}
              priceToken={sumBy(getExpiredSubscriptions(), (t) => t.amount)}
              tokenSymbol={tableData[0]?.token || 'CSPR'}
              icon="solar:clock-circle-bold-duotone"
              color={theme.vars.palette.warning.main}
            />
          </Stack>
        </Scrollbar>
      </Card>

      <Card>
        <Tabs
          value={currentFilters.paymentType}
          onChange={handleFilterPaymentType}
          sx={{
            px: { md: 2.5 },
            boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === currentFilters.paymentType) && 'filled') ||
                    'soft'
                  }
                  color={tab.color}
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <TransactionTableToolbar
          filters={filters}
          dateError={dateError}
          onResetPage={table.onResetPage}
        />

        {canReset && (
          <TransactionTableFiltersResult
            filters={filters}
            onResetPage={table.onResetPage}
            totalResults={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
          <Scrollbar sx={{ minHeight: 444 }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={0}
                onSort={table.onSort}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <TransactionTableRow
                      key={row.id}
                      row={row}
                      detailsHref={paths.dashboard.transaction.details(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={table.dense ? 56 : 56 + 20}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  dateError: boolean;
  inputData: TransactionItem[];
  filters: TransactionFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters, dateError }: ApplyFilterProps) {
  const { name, paymentType, subscriptionStatus, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(({ invoice_number, payer_address, transaction_hash }) =>
      [invoice_number, payer_address, transaction_hash].some((field) =>
        field?.toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  if (paymentType !== 'all') {
    inputData = inputData.filter((transaction) => transaction.payment_type === paymentType);
  }

  // Filter by subscription status (only when viewing subscriptions)
  if (paymentType === 'subscription' && subscriptionStatus !== 'all') {
    const now = new Date();
    inputData = inputData.filter((transaction) => {
      const subscriptionEndDate = transaction.subscription_end ? new Date(transaction.subscription_end) : null;

      if (subscriptionStatus === 'active') {
        return !subscriptionEndDate || subscriptionEndDate > now;
      }
      if (subscriptionStatus === 'expired') {
        return subscriptionEndDate && subscriptionEndDate <= now;
      }
      return true;
    });
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((transaction) =>
        fIsBetween(transaction.created_at, startDate, endDate)
      );
    }
  }

  return inputData;
}
