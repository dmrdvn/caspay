import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import { fDate } from 'src/utils/format-time';

import { usePayLinkMutations } from 'src/hooks/use-paylinks';

import type { PayLinkWithProduct, FulfillmentMetadata } from 'src/types/paylink';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

type Props = {
  row: PayLinkWithProduct;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteSuccess?: () => void;
};

export function PayLinkTableRow({ row, selected, onSelectRow, onDeleteSuccess }: Props) {
  const router = useRouter();
  const confirm = useBoolean();
  const popover = usePopover();
  
  const { deletePayLink } = usePayLinkMutations();

  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pay/${row.slug}`;
  
  const fulfillmentMetadata = row.metadata as FulfillmentMetadata | null;
  const fulfillmentType = fulfillmentMetadata?.fulfillment_type || 'none';
  
  const fulfillmentLabels: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
    none: { label: 'None', color: 'default' },
    digital_download: { label: 'Download', color: 'info' },
    license_key: { label: 'License', color: 'success' },
    service_access: { label: 'Service', color: 'info' },
    donation: { label: 'Donation', color: 'warning' },
    coupon_voucher: { label: 'Coupon', color: 'success' },
    event_ticket: { label: 'Ticket', color: 'info' },
    content_access: { label: 'Content', color: 'info' },
    custom_message: { label: 'Message', color: 'default' },
  };

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicUrl);
    popover.onClose();
  }, [publicUrl, popover]);

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.payLink.edit(row.id));
    popover.onClose();
  }, [router, row.id, popover]);

  const handleDelete = useCallback(async () => {
    try {
      await deletePayLink(row.id);
      confirm.onFalse();
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Error deleting PayLink:', error);
    }
  }, [deletePayLink, row.id, confirm, onDeleteSuccess]);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              alt={row.product.name}
              src={row.product.image_url || undefined}
              variant="rounded"
              sx={{ width: 48, height: 48 }}
            >
              {row.product.name?.charAt(0).toUpperCase()}
            </Avatar>

            <ListItemText
              primary={row.product.name}
              secondary={`${row.product.price} ${row.product.currency}`}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ color: 'text.disabled' }}
            />
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Click to copy">
              <Link
                href={publicUrl}
                target="_blank"
                rel="noopener"
                underline="hover"
                color="inherit"
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyLink();
                }}
                sx={{ maxWidth: 200 }}
              >
              <Box component="span" sx={{ typography: 'body2', whiteSpace: 'nowrap' }}>
                  /pay/{row.slug}
                </Box>
              </Link>
            </Tooltip>
          </Box>
        </TableCell>

        <TableCell>
          <Label 
            variant="soft" 
            color={row.network === 'mainnet' ? 'success' : 'warning'}
          >
            {row.network === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </Label>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={row.is_active ? 'success' : 'default'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        <TableCell>
          <Label 
            variant="soft" 
            color={fulfillmentLabels[fulfillmentType]?.color || 'default'}
          >
            {fulfillmentLabels[fulfillmentType]?.label || 'None'}
          </Label>
        </TableCell>

        <TableCell align="center">
          <Box sx={{ typography: 'body2' }}>
            {row.current_uses || 0}/{row.max_uses || '∞'}
          </Box>
        </TableCell>

        <TableCell align="right">
          <Box sx={{ typography: 'body2', fontWeight: 500 }}>
            {row.total_revenue ? `${row.total_revenue.toFixed(2)} CSPR` : '-'}
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
            {fDate(row.created_at)}
          </Box>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <Stack>
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="solar:copy-bold" />}
            onClick={handleCopyLink}
            sx={{ justifyContent: 'flex-start' }}
          >
            Copy Link
          </Button>

          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={() => {
              window.open(publicUrl, '_blank');
              popover.onClose();
            }}
            sx={{ justifyContent: 'flex-start' }}
          >
            Preview
          </Button>

          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={handleEdit}
            sx={{ justifyContent: 'flex-start' }}
          >
            Edit
          </Button>

          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ justifyContent: 'flex-start' }}
          >
            Delete
          </Button>
        </Stack>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete PayLink"
        content="Are you sure you want to delete this PayLink? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        }
      />
    </>
  );
}
