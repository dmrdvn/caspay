'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { fNumber } from 'src/utils/format-number';

import type { PayLinkWithProduct, FulfillmentMetadata } from 'src/types/paylink';
import type { PopularCurrency, SimpleSwapExchange, SimpleSwapRange } from 'src/types/simpleswap';

import { useSimpleSwap } from 'src/hooks/use-simpleswap';

import { Iconify } from 'src/components/iconify';

import { PaymentSuccessContent } from './payment-success-content';

type Props = {
  open: boolean;
  paylink: PayLinkWithProduct;
  onClose: () => void;
  onSuccess?: (exchange: SimpleSwapExchange) => void;
};

type Step = 'select_coin' | 'enter_amount' | 'waiting_deposit' | 'processing' | 'success' | 'failed';

const STATUS_MAP: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'error' }> = {
  waiting: { label: 'Waiting for deposit', color: 'warning' },
  confirming: { label: 'Confirming transaction', color: 'info' },
  exchanging: { label: 'Exchanging...', color: 'info' },
  sending: { label: 'Sending CSPR', color: 'info' },
  finished: { label: 'Completed', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
  refunded: { label: 'Refunded', color: 'warning' },
  expired: { label: 'Expired', color: 'error' },
};

export function BridgePaymentDialog({ open, paylink, onClose, onSuccess }: Props) {
  const {
    isLoading,
    error,
    estimate,
    range,
    exchange,
    currencies,
    getEstimate,
    getRange,
    createExchange,
    checkExchangeStatus,
    calculateRequired,
    clearState,
  } = useSimpleSwap();

  const [step, setStep] = useState<Step>('select_coin');
  const [selectedCurrency, setSelectedCurrency] = useState<PopularCurrency | null>(null);
  const [amount, setAmount] = useState('');
  const [requiredAmount, setRequiredAmount] = useState<string | null>(null);
  const [minAmount, setMinAmount] = useState<string | null>(null);
  const [currencyRanges, setCurrencyRanges] = useState<Record<string, SimpleSwapRange>>({});
  const [rangesLoading, setRangesLoading] = useState(false);
  const [isFixedRate, setIsFixedRate] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isCreatingExchange, setIsCreatingExchange] = useState(false);

  const targetAmount = paylink.product.price;

  useEffect(() => {
    if (!open) {
      setStep('select_coin');
      setSelectedCurrency(null);
      setAmount('');
      setRequiredAmount(null);
      setMinAmount(null);
      setCurrencyRanges({});
      setIsCreatingExchange(false);
      clearState();
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [open, clearState, pollingInterval]);

  useEffect(() => {
    if (open && step === 'select_coin' && currencies.length > 0 && Object.keys(currencyRanges).length === 0) {
      setRangesLoading(true);
      
      Promise.all(
        currencies.map(async (currency) => {
          try {
            const rangeResult = await getRange(currency);
            if (rangeResult) {
              return { key: `${currency.ticker}-${currency.network}`, range: rangeResult };
            }
          } catch (err) {
            console.error(`Failed to get range for ${currency.ticker}:`, err);
          }
          return null;
        })
      ).then((results) => {
        const ranges: Record<string, SimpleSwapRange> = {};
        results.forEach((result) => {
          if (result) {
            ranges[result.key] = result.range;
          }
        });
        setCurrencyRanges(ranges);
        setRangesLoading(false);
      });
    }
  }, [open, step, currencies, currencyRanges, getRange]);

  useEffect(() => () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  }, [pollingInterval]);

  useEffect(() => {
    if (!selectedCurrency || !step || step !== 'enter_amount') return undefined;

    const updateRateData = async () => {
      const rangeResult = await getRange(selectedCurrency, isFixedRate);
      if (rangeResult && amount) {
        const numAmount = parseFloat(amount);
        if (!Number.isNaN(numAmount) && numAmount > 0) {
          await getEstimate(selectedCurrency, amount, rangeResult, isFixedRate);
        }
      }
    };

    const timeoutId = setTimeout(updateRateData, 300);

    return () => clearTimeout(timeoutId);
  }, [isFixedRate, amount, getEstimate, getRange, selectedCurrency, step]);

  const handleSelectCurrency = useCallback(
    async (currency: PopularCurrency) => {
      setSelectedCurrency(currency);
      setStep('enter_amount');

      const rangeResult = await getRange(currency, isFixedRate);

      if (!rangeResult) {
        setStep('select_coin');
        return;
      }

      const result = await calculateRequired(currency, targetAmount, isFixedRate);
      if (result) {
        setRequiredAmount(result.amount);
        setAmount(result.amount);
        setMinAmount(result.minAmount);
        await getEstimate(currency, result.amount, rangeResult, isFixedRate);
      }
    },
    [getRange, calculateRequired, getEstimate, targetAmount, isFixedRate]
  );

  const handleAmountChange = useCallback(
    async (value: string) => {
      setAmount(value);
      
      if (!selectedCurrency || !value || parseFloat(value) <= 0) {
        return;
      }

      const numValue = parseFloat(value);
      if (range?.max && numValue > parseFloat(range.max)) {
        return;
      }

      await getEstimate(selectedCurrency, value, range, isFixedRate);
    },
    [selectedCurrency, getEstimate, range, isFixedRate]
  );

  const handleCreateExchange = useCallback(async () => {
    if (!selectedCurrency || !amount || isCreatingExchange) return;

    const numAmount = parseFloat(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    const safeMin = minAmount ? parseFloat(minAmount) : (range ? parseFloat(range.min) * 1.05 : 0);
    if (numAmount < safeMin) {
      return;
    }

    setIsCreatingExchange(true);

    const result = await createExchange(
      selectedCurrency,
      amount,
      paylink.wallet_address,
      isFixedRate
    );

    if (!result) {
      setIsCreatingExchange(false);
      setStep('failed');
      return;
    }

    setIsCreatingExchange(false);
    setStep('waiting_deposit');

    const interval = setInterval(async () => {
      const status = await checkExchangeStatus(result.id);
      if (status) {
        if (status.status === 'finished') {
          clearInterval(interval);
          setPollingInterval(null);
          setStep('success');
          onSuccess?.(status);
        } else if (['failed', 'refunded', 'expired'].includes(status.status)) {
          clearInterval(interval);
          setPollingInterval(null);
          setStep('failed');
        } else if (['confirming', 'exchanging', 'sending'].includes(status.status)) {
          setStep('processing');
        }
      }
    }, 10000);

    setPollingInterval(interval);
  }, [selectedCurrency, amount, minAmount, range, paylink.wallet_address, createExchange, checkExchangeStatus, onSuccess, isFixedRate, isCreatingExchange]);

  const handleCopyAddress = useCallback(() => {
    if (exchange?.addressFrom) {
      navigator.clipboard.writeText(exchange.addressFrom);
    }
  }, [exchange]);

  const handleBack = useCallback(() => {
    if (step === 'enter_amount') {
      setStep('select_coin');
      setSelectedCurrency(null);
      setAmount('');
      setRequiredAmount(null);
      setMinAmount(null);
      clearState();
    }
  }, [step, clearState]);

  const renderCoinSelection = () => (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Select the cryptocurrency you want to pay with
      </Typography>

      {rangesLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
        }}
      >
        {currencies.map((currency) => {
          const currencyKey = `${currency.ticker}-${currency.network}`;
          const currencyRange = currencyRanges[currencyKey];
          
          return (
            <Button
              key={currencyKey}
              variant="outlined"
              onClick={() => handleSelectCurrency(currency)}
              sx={{
                py: 1.5,
                px: 2,
                position: 'relative',
                justifyContent: 'flex-start',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: 1 }}>
                <Iconify icon={currency.icon as any} width={28} />
                <Box textAlign="left">
                  <Typography variant="subtitle2">{currency.ticker.toUpperCase()}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currency.name}
                  </Typography>
                </Box>
              </Stack>
              
              {currencyRange && (
                <Chip
                  label={`Min: ${parseFloat(currencyRange.min).toFixed(6)}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    bgcolor: 'background.neutral',
                    color: 'text.secondary',
                    '& .MuiChip-label': {
                      px: 0.75,
                    },
                  }}
                />
              )}
            </Button>
          );
        })}
      </Box>
    </Stack>
  );

  const renderAmountInput = () => (
    <Stack spacing={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" onClick={handleBack}>
          <Iconify icon={'eva:arrow-back-fill' as any} />
        </IconButton>
        <Iconify icon={(selectedCurrency?.icon || 'solar:coin-bold') as any} width={24} />
        <Typography variant="subtitle1">
          Pay with {selectedCurrency?.name}
        </Typography>
      </Stack>

      <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Amount to pay
          </Typography>
          <Typography variant="h5">
            {fNumber(targetAmount)} CSPR
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: 'background.neutral',
          borderRadius: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Exchange Rate Type
        </Typography>
        <RadioGroup
          value={isFixedRate ? 'fixed' : 'floating'}
          onChange={(e) => setIsFixedRate(e.target.value === 'fixed')}
        >
          <FormControlLabel
            value="floating"
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Floating rate
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lower minimum. Amount may change due to market volatility.
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="fixed"
            control={<Radio size="small" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Fixed rate
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Higher minimum. Amount is fixed and protected from volatility.
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Box>

      <TextField
        fullWidth
        type="number"
        label={`Amount in ${selectedCurrency?.ticker.toUpperCase()}`}
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {selectedCurrency?.ticker.toUpperCase()}
            </InputAdornment>
          ),
        }}
        helperText={
          range
            ? `Min: ${range.min} ${selectedCurrency?.ticker.toUpperCase()}${range.max ? ` | Max: ${range.max}` : ''}`
            : ''
        }
      />

      {estimate && (
        <Stack spacing={1.5}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.neutral',
              borderRadius: 1.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Merchant will receive
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                ≈ {fNumber(parseFloat(estimate.estimatedAmount))} CSPR
              </Typography>
            </Stack>
          </Box>

          <Alert severity="warning" icon={false} sx={{ py: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ⚠️ Only the exact amount sent will be exchanged. Extra amounts cannot be refunded.
            </Typography>
          </Alert>
        </Stack>
      )}

      {requiredAmount && amount !== requiredAmount && (
        <Alert severity="info" sx={{ py: 0.5 }}>
          <Typography variant="caption">
            Recommended amount: {requiredAmount} {selectedCurrency?.ticker.toUpperCase()} to receive {fNumber(targetAmount)} CSPR
          </Typography>
        </Alert>
      )}

      {(() => {
        const safeMin = minAmount ? parseFloat(minAmount) : (range ? parseFloat(range.min) * 1.005 : 0);
        const isBelowMin = amount && parseFloat(amount) < safeMin;
        return isBelowMin ? (
          <Alert severity="error" sx={{ py: 0.5 }}>
            <Typography variant="caption">
              Minimum amount is {safeMin.toFixed(6)} {selectedCurrency?.ticker.toUpperCase()}
            </Typography>
          </Alert>
        ) : null;
      })()}

      {range?.max && amount && parseFloat(amount) > parseFloat(range.max) && (
        <Alert severity="error" sx={{ py: 0.5 }}>
          <Typography variant="caption">
            Maximum amount is {parseFloat(range.max).toFixed(6)} {selectedCurrency?.ticker.toUpperCase()}
          </Typography>
        </Alert>
      )}

      <Button
        fullWidth
        size="large"
        variant="contained"
        disabled={
          isCreatingExchange ||
          !amount ||
          !estimate ||
          Boolean((() => {
            const safeMin = minAmount ? parseFloat(minAmount) : (range ? parseFloat(range.min) * 1.005 : 0);
            const numAmount = parseFloat(amount);
            if (numAmount < safeMin) return true;
            if (range?.max && numAmount > parseFloat(range.max)) return true;
            return false;
          })())
        }
        onClick={handleCreateExchange}
        startIcon={isCreatingExchange ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isCreatingExchange ? 'Creating exchange...' : 'Continue'}
      </Button>
    </Stack>
  );

  const renderWaitingDeposit = () => (
    <Stack spacing={3} alignItems="center">
      <Avatar sx={{ width: 64, height: 64, bgcolor: 'warning.lighter' }}>
        <Iconify icon="solar:clock-circle-bold" width={36} color="warning.main" />
      </Avatar>

      <Typography variant="h6" textAlign="center">
        Waiting for your deposit
      </Typography>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Send exactly the amount below to complete the exchange
      </Typography>

      <Box sx={{ width: 1, p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Amount to send
            </Typography>
            <Typography variant="h5" color="warning.main">
              {exchange?.amountFrom} {selectedCurrency?.ticker.toUpperCase()}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Send to this address
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                }}
              >
                {exchange?.addressFrom}
              </Typography>
              <IconButton size="small" onClick={handleCopyAddress}>
                <Iconify icon="solar:copy-bold" width={18} />
              </IconButton>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              You will receive approximately
            </Typography>
            <Typography variant="subtitle1" color="success.main">
              ~{fNumber(parseFloat(exchange?.amountTo || '0'))} CSPR
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Chip
        label={STATUS_MAP[exchange?.status || 'waiting']?.label || 'Processing'}
        color={STATUS_MAP[exchange?.status || 'waiting']?.color || 'info'}
        variant="soft"
      />

      <Typography variant="caption" color="text.secondary" textAlign="center">
        Exchange ID: {exchange?.id}
      </Typography>
    </Stack>
  );

  const renderProcessing = () => (
    <Stack spacing={3} alignItems="center">
      <Box sx={{ width: 1 }}>
        <LinearProgress />
      </Box>

      <Avatar sx={{ width: 64, height: 64, bgcolor: 'info.lighter' }}>
        <Iconify icon="solar:refresh-bold" width={36} color="info.main" />
      </Avatar>

      <Typography variant="h6" textAlign="center">
        Exchange in progress
      </Typography>

      <Chip
        label={STATUS_MAP[exchange?.status || 'exchanging']?.label || 'Processing'}
        color={STATUS_MAP[exchange?.status || 'exchanging']?.color || 'info'}
        variant="soft"
      />

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Your {selectedCurrency?.ticker.toUpperCase()} is being exchanged to CSPR.
        This may take a few minutes.
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Exchange ID: {exchange?.id}
      </Typography>
    </Stack>
  );

  const renderSuccess = () => {
    const fulfillmentMetadata = paylink.metadata as FulfillmentMetadata | null;
    const explorerUrl = paylink.network === 'mainnet' 
      ? 'https://cspr.live' 
      : 'https://testnet.cspr.live';
    const txUrl = exchange?.txTo ? `${explorerUrl}/deploy/${exchange.txTo}` : null;

    return (
      <Stack spacing={3} alignItems="center">
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'success.lighter' }}>
          <Iconify icon="solar:check-circle-bold" width={48} sx={{ color: 'success.main' }} />
        </Avatar>

        <Typography variant="h5" textAlign="center">
          Exchange Completed!
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Your payment has been successfully processed
        </Typography>

        <Box 
          sx={{ 
            width: 1, 
            p: 3, 
            borderRadius: 2, 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.08)',
            border: (theme) => `1px dashed ${theme.palette.success.main}`,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Amount paid
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={0.5}>
                <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                  {fNumber(parseFloat(exchange?.amountTo || '0'))}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 600 }}>
                  CSPR
                </Typography>
              </Stack>
            </Stack>
            {exchange?.txTo && txUrl && (
              <>
                <Divider sx={{ borderStyle: 'dashed', borderColor: 'success.light', opacity: 0.4 }} />
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        letterSpacing: '0.5px'
                      }}
                    >
                      Transaction Hash
                    </Typography>
                    <Link
                      href={txUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      View on Explorer
                      <Iconify icon={'solar:arrow-right-up-linear' as any} width={14} />
                    </Link>
                  </Stack>
                  <Box sx={{ 
                      display: 'block',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: 'text.primary',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(145, 158, 171, 0.08)',
                      p: 1.5,
                      pt: 2,
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      textDecoration: 'none',
                    }}
                  >
                    {exchange.txTo}
                  </Box>
                </Box>
              </>
            )}
          </Stack>
        </Box>

        <Box sx={{ width: 1 }}>
          <PaymentSuccessContent fulfillmentMetadata={fulfillmentMetadata} />
        </Box>

        <Button fullWidth size="large" variant="contained" color="success" onClick={onClose}>
          Close
        </Button>
      </Stack>
    );
  };

  const renderFailed = () => (
    <Stack spacing={3} alignItems="center">
      <Avatar sx={{ width: 80, height: 80, bgcolor: 'error.lighter' }}>
        <Iconify icon="solar:close-circle-bold" width={48} color="error.main" />
      </Avatar>

      <Typography variant="h5" textAlign="center">
        Exchange Failed
      </Typography>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        {exchange?.status === 'refunded'
          ? 'Your funds have been refunded to your wallet'
          : 'Something went wrong with the exchange'}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Exchange ID: {exchange?.id}
      </Typography>

      <Button fullWidth variant="contained" onClick={onClose}>
        Close
      </Button>
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={step === 'processing' ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2.5 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Pay with Another Chain</Typography>
          {step !== 'processing' && (
            <IconButton size="small" onClick={onClose}>
              <Iconify icon={'eva:close-fill' as any} />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'select_coin' && renderCoinSelection()}
        {step === 'enter_amount' && renderAmountInput()}
        {step === 'waiting_deposit' && renderWaitingDeposit()}
        {step === 'processing' && renderProcessing()}
        {step === 'success' && renderSuccess()}
        {step === 'failed' && renderFailed()}
      </DialogContent>

      {step === 'select_coin' && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ width: 1 }}>
            <Iconify icon="solar:shield-check-bold" width={16} color="text.disabled" />
            <Typography variant="caption" color="text.disabled">
              Powered by Casper Network
            </Typography>
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  );
}
