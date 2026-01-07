import type { TransactionItem } from 'src/types/transaction';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: TransactionItem;
  detailsHref: string;
};

export function TransactionTableRow({ row, detailsHref }: Props) {
  const menuActions = usePopover();

  // Format wallet address (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get item name (product or subscription)
  const itemName = row.product_name || row.plan_name || 'N/A';

  // Format amount with token
  const formatAmount = () => {
    if (row.usd_value) {
      return `${fCurrency(row.usd_value)} (${row.amount} ${row.token})`;
    }
    return `${row.amount} ${row.token}`;
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={detailsHref} onClick={menuActions.onClose}>
            <Iconify icon="solar:eye-bold" />
            View Details
          </MenuItem>
        </li>

        {row.transaction_hash && (
          <li>
            <MenuItem
              component="a"
              href={`https://testnet.cspr.live/deploy/${row.transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={menuActions.onClose}
            >
              <Iconify icon="solar:link-bold" />
              View on Explorer
            </MenuItem>
          </li>
        )}

        {row.invoice_url && (
          <li>
            <MenuItem
              component="a"
              href={row.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={menuActions.onClose}
            >
              <Iconify icon="solar:download-bold" />
              Download Invoice
            </MenuItem>
          </li>
        )}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <TableRow hover>
        {/* Transaction Hash + Invoice Info */}
        <TableCell>
          <Link
            component={RouterLink}
            href={detailsHref}
            color="inherit"
            sx={{ typography: 'body2', fontFamily: 'monospace' }}
          >
            {formatAddress(row.transaction_hash)}
          </Link>
          {row.invoice_number && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Box
                component="span"
                sx={{ typography: 'caption', color: 'text.disabled', fontFamily: 'monospace' }}
              >
                {row.invoice_number}
              </Box>
              {row.invoice_url && (
                <Box
                  component="a"
                  href={row.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'primary.main',
                    typography: 'caption',
                  }}
                >
                  <Iconify icon="solar:document-text-bold" width={14} />
                </Box>
              )}
            </Box>
          )}
        </TableCell>

        {/* Customer Wallet */}
        <TableCell>
          <Box
            sx={{
              typography: 'body2',
              fontFamily: 'monospace',
              color: 'text.secondary',
            }}
          >
            {formatAddress(row.payer_address)}
          </Box>
        </TableCell>

        {/* Type + Item Name */}
        <TableCell>
          <Label
            variant="soft"
            color={row.payment_type === 'product' ? 'primary' : 'secondary'}
          >
            {row.payment_type === 'product' ? 'Product' : 'Subscription'}
          </Label>
          <Box sx={{ typography: 'caption', color: 'text.disabled', mt: 0.5 }}>
            {itemName}
          </Box>
        </TableCell>

        {/* Date(s) */}
        <TableCell>
          {row.payment_type === 'product' ? (
            <ListItemText
              primary={fDate(row.created_at)}
              secondary={fTime(row.created_at)}
              slotProps={{
                primary: { noWrap: true, sx: { typography: 'body2' } },
                secondary: { sx: { mt: 0.5, typography: 'caption' } },
              }}
            />
          ) : (
            <Box>
              <Box sx={{ typography: 'caption', color: 'text.disabled' }}>Start:</Box>
              <Box sx={{ typography: 'body2', mb: 0.5 }}>
                {row.subscription_start ? fDate(row.subscription_start) : '-'}
              </Box>
              <Box sx={{ typography: 'caption', color: 'text.disabled' }}>End:</Box>
              <Box sx={{ typography: 'body2' }}>
                {row.subscription_end ? fDate(row.subscription_end) : '-'}
              </Box>
            </Box>
          )}
        </TableCell>

        <TableCell>
          <ListItemText
            primary={formatAmount()}
            secondary={row.usd_value ? `≈ ${fCurrency(row.usd_value)}` : null}
            slotProps={{
              primary: { noWrap: true, sx: { typography: 'body2' } },
              secondary: { sx: { mt: 0.5, typography: 'caption', color: 'text.disabled' } },
            }}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {renderMenuActions()}
    </>
  );
}
