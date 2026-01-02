import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'minimal-shared/hooks';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type TransactionFilters = {
  name: string;
  paymentType: 'all' | 'product' | 'subscription';
  subscriptionStatus: 'all' | 'active' | 'expired';
  startDate: Date | null;
  endDate: Date | null;
};

type Props = {
  totalResults: number;
  onResetPage: () => void;
  sx?: SxProps<Theme>;
  filters: UseSetStateReturn<TransactionFilters>;
};

export function TransactionTableFiltersResult({
  filters,
  totalResults,
  onResetPage,
  sx,
}: Props) {
  const { state: currentFilters, setState: updateFilters, setField: updateField } = filters;

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    updateField('name', '');
  }, [onResetPage, updateField]);

  const handleRemovePaymentType = useCallback(() => {
    onResetPage();
    updateField('paymentType', 'all');
  }, [onResetPage, updateField]);

  const handleRemoveSubscriptionStatus = useCallback(() => {
    onResetPage();
    updateField('subscriptionStatus', 'all');
  }, [onResetPage, updateField]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    updateField('subscriptionStatus', 'all');
  }, [onResetPage, updateField]);

  const handleRemoveDate = useCallback(() => {
    onResetPage();
    updateFilters({ startDate: null, endDate: null });
  }, [onResetPage, updateFilters]);

  const handleReset = useCallback(() => {
    onResetPage();
    updateFilters({
      name: '',
      paymentType: 'all',
      subscriptionStatus: 'all',
      startDate: null,
      endDate: null,
    });
  }, [onResetPage, updateFilters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Payment Type:" isShow={currentFilters.paymentType !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.paymentType === 'product' ? 'Products' : 'Subscriptions'}
          onDelete={handleRemovePaymentType}
        />
      </FiltersBlock>

      <FiltersBlock label="Subscription Status:" isShow={currentFilters.paymentType === 'subscription' && currentFilters.subscriptionStatus !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.subscriptionStatus === 'active' ? 'Active' : 'Expired'}
          onDelete={handleRemoveSubscriptionStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Status:" isShow={currentFilters.subscriptionStatus !== 'all'}>
        <Chip
          {...chipProps}
          label={currentFilters.subscriptionStatus}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock
        label="Date:"
        isShow={Boolean(currentFilters.startDate && currentFilters.endDate)}
      >
        <Chip {...chipProps} label="Custom date" onDelete={handleRemoveDate} />
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!currentFilters.name}>
        <Chip {...chipProps} label={currentFilters.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
