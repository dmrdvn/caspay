import type { TransactionItem } from 'src/actions/transaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { useMerchants } from 'src/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { TransactionToolbar } from './transaction-toolbar';

// ----------------------------------------------------------------------

type Props = {
  transaction?: TransactionItem;
};

export function TransactionDetails({ transaction }: Props) {
  const { currentMerchant } = useMerchants();

  if (!transaction) {
    return (
      <Card sx={{ p: 5 }}>
        <Typography variant="h6">Transaction not found</Typography>
      </Card>
    );
  }

  // Get item name and description
  const itemName = transaction.product_name || transaction.plan_name || 'N/A';
  const itemDescription = transaction.payment_type === 'subscription'
    ? `${transaction.plan_name} - ${transaction.billing_interval} billing`
    : transaction.product_name || '';

  const renderHeader = () => (
    <Box
      sx={{
        rowGap: 5,
        display: 'grid',
        alignItems: 'center',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        alt="Merchant logo"
        src={currentMerchant?.logo_url || '/logo/logo-single.svg'}
        sx={{ width: 48, height: 48, borderRadius: 1 }}
      />

      {/* Invoice Number & Type */}
      <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
        <Label
          variant="soft"
          color={transaction.payment_type === 'product' ? 'primary' : 'secondary'}
        >
          {transaction.payment_type === 'product' ? 'Product Sale' : 'Subscription'}
        </Label>

        <Typography variant="h6">
          {transaction.invoice_number || `#${transaction.id.slice(0, 8)}`}
        </Typography>
      </Stack>

      {/* Merchant Info (From) */}
      <Stack sx={{ typography: 'body2' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          From
        </Typography>
        <Typography variant="subtitle2">{currentMerchant?.store_name || 'N/A'}</Typography>
        {currentMerchant?.support_email && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentMerchant.support_email}
          </Typography>
        )}
        {currentMerchant?.support_url && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentMerchant.support_url}
          </Typography>
        )}
      </Stack>

      {/* Customer Info (To) */}
      <Stack sx={{ typography: 'body2' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          To
        </Typography>
        {transaction.metadata?.customer_name && (
          <Typography variant="body2">{transaction.metadata.customer_name}</Typography>
        )}
        {transaction.metadata?.customer_email && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {transaction.metadata.customer_email}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Wallet:
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', color: 'text.secondary', wordBreak: 'break-all' }}
          >
            {transaction.payer_address}
          </Typography>
          <Iconify
            icon="solar:copy-bold"
            width={14}
            sx={{ cursor: 'pointer', color: 'text.disabled', flexShrink: 0 }}
            onClick={() => navigator.clipboard.writeText(transaction.payer_address)}
          />
        </Box>
      </Stack>

      {/* Payment Date */}
      <Stack sx={{ typography: 'body2' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Payment Date
        </Typography>
        <Typography variant="body2">{fDate(transaction.created_at)}</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {fTime(transaction.created_at)}
        </Typography>
      </Stack>

      {/* Subscription Period (if subscription) */}
      {transaction.payment_type === 'subscription' && (
        <Stack sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Subscription Period
          </Typography>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Start:
            </Typography>
            <Typography variant="body2">
              {transaction.subscription_start ? fDate(transaction.subscription_start) : '-'}
            </Typography>
          </Box>
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              End:
            </Typography>
            <Typography variant="body2">
              {transaction.subscription_end ? fDate(transaction.subscription_end) : '-'}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );

  const renderItemDetails = () => (
    <Box sx={{ mt: 5 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Item Details
      </Typography>

      <Stack
        spacing={2}
        sx={(theme) => ({
          p: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.04),
        })}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2">{itemName}</Typography>
            {itemDescription && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {itemDescription}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6">
              {transaction.amount} {transaction.token}
            </Typography>
            {transaction.usd_value && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                ≈ {fCurrency(transaction.usd_value)}
              </Typography>
            )}
          </Box>
        </Box>

        {transaction.exchange_rate && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Exchange Rate
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              1 {transaction.token} = ${transaction.exchange_rate.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );

  const renderBlockchainInfo = () => (
    <Box sx={{ mt: 5 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Blockchain Information
      </Typography>

      <Stack
        spacing={2}
        sx={(theme) => ({
          p: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.04),
        })}
      >
        {/* Transaction Hash */}
        <Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>
            Transaction Hash
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', color: 'text.secondary', wordBreak: 'break-all' }}
            >
              {transaction.transaction_hash}
            </Typography>
            <Iconify
              icon="solar:copy-bold"
              width={16}
              sx={{ cursor: 'pointer', color: 'text.disabled', flexShrink: 0 }}
              onClick={() => navigator.clipboard.writeText(transaction.transaction_hash)}
            />
          </Box>
        </Box>

        {/* Block Height */}
        {transaction.block_height && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Block Height
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              #{transaction.block_height.toLocaleString()}
            </Typography>
          </Box>
        )}

        {/* Block Timestamp */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Block Timestamp
          </Typography>
          <Typography variant="body2">
            {fDate(transaction.block_timestamp)} {fTime(transaction.block_timestamp)}
          </Typography>
        </Box>

        {/* Explorer Link */}
        <Box sx={{ mt: 2 }}>
          <Button
            component="a"
            href={`https://testnet.cspr.live/deploy/${transaction.transaction_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<Iconify icon="solar:link-bold" />}
          >
            View on Casper Explorer
          </Button>
        </Box>
      </Stack>
    </Box>
  );

  const renderFooter = () => (
    <Box
      sx={{
        py: 3,
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <div>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          PAYMENT CONFIRMATION
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This payment has been confirmed on the Casper blockchain. Transaction is immutable and cannot be reversed.
        </Typography>
      </div>

      <Box sx={{ flexGrow: { md: 1 }, textAlign: { md: 'right' } }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Need Help?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {currentMerchant?.support_email || 'Contact merchant support'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <TransactionToolbar transaction={transaction} />

      <Card sx={{ pt: 5, px: 5 }}>
        {renderHeader()}

        <Divider sx={{ my: 5, borderStyle: 'dashed' }} />

        {renderItemDetails()}

        {renderBlockchainInfo()}

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        {renderFooter()}
      </Card>
    </>
  );
}
