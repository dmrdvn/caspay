import type { Dayjs } from 'dayjs';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { SelectChangeEvent } from '@mui/material/Select';

import dayjs from 'dayjs';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formHelperTextClasses } from '@mui/material/FormHelperText';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TransactionFilters = {
  name: string;
  paymentType: 'all' | 'product' | 'subscription';
  subscriptionStatus: 'all' | 'active' | 'expired';
  startDate: Date | null;
  endDate: Date | null;
};

type Props = {
  filters: UseSetStateReturn<TransactionFilters>;
  dateError: boolean;
  onResetPage: () => void;
};

export function TransactionTableToolbar({ filters, onResetPage, dateError }: Props) {
  const { state: currentFilters, setState: updateFilters } = filters;

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      updateFilters({ name: event.target.value });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: Dayjs | null) => {
      onResetPage();
      updateFilters({ startDate: newValue ? newValue.toDate() : null });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Dayjs | null) => {
      onResetPage();
      updateFilters({ endDate: newValue ? newValue.toDate() : null });
    },
    [onResetPage, updateFilters]
  );

  const handleFilterPaymentType = useCallback(
    (event: SelectChangeEvent<typeof currentFilters.paymentType>) => {
      const value = event.target.value as typeof currentFilters.paymentType;
      onResetPage();
      updateFilters({ paymentType: value });
    },
    [onResetPage, updateFilters, currentFilters]
  );

  const handleFilterSubscriptionStatus = useCallback(
    (event: SelectChangeEvent<typeof currentFilters.subscriptionStatus>) => {
      const value = event.target.value as typeof currentFilters.subscriptionStatus;
      onResetPage();
      updateFilters({ subscriptionStatus: value });
    },
    [onResetPage, updateFilters, currentFilters]
  );

  return (
    <Box
        sx={{
          p: 2.5,
          gap: 2,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        <FormControl>
          <InputLabel>Payment Type</InputLabel>

          <Select
            value={currentFilters.paymentType}
            onChange={handleFilterPaymentType}
            input={<OutlinedInput label="Payment Type" />}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="product">Products</MenuItem>
            <MenuItem value="subscription">Subscriptions</MenuItem>
          </Select>
        </FormControl>

        {/* Show subscription status filter only when subscription is selected */}
        {currentFilters.paymentType === 'subscription' && (
          <FormControl>
            <InputLabel>Subscription Status</InputLabel>

            <Select
              value={currentFilters.subscriptionStatus}
              onChange={handleFilterSubscriptionStatus}
              input={<OutlinedInput label="Subscription Status" />}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>
        )}

        <DatePicker
          label="Start date"
          value={currentFilters.startDate ? dayjs(currentFilters.startDate) : null}
          onChange={handleFilterStartDate}
          slotProps={{ textField: { fullWidth: true } }}
        />

        <DatePicker
          label="End date"
          value={currentFilters.endDate ? dayjs(currentFilters.endDate) : null}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              fullWidth: true,
              error: dateError,
              helperText: dateError ? 'End date must be later than start date' : null,
            },
          }}
          sx={{
            [`& .${formHelperTextClasses.root}`]: {
              bottom: { md: -40 },
              position: { md: 'absolute' },
            },
          }}
        />

        <OutlinedInput
          value={currentFilters.name}
          onChange={handleFilterName}
          placeholder="Search wallet address or transaction..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ height: 56 }}
        />
      </Box>
  );
}
