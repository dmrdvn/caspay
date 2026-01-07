import { useCallback, useEffect, useState } from 'react';

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
import { getPayLinkStats } from 'src/actions/paylink';

import type { PayLinkWithProduct, PayLinkStats } from 'src/types/paylink';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: PayLinkWithProduct;
  selected: boolean;
  onSelectRow: () => void;
  stats?: PayLinkStats | null;
};

export function PayLinkTableRow({ row, selected, onSelectRow, stats: propStats }: Props) {
  const router = useRouter();
  const confirm = useBoolean();
  const popover = usePopover();
  
  const { deletePayLink } = usePayLinkMutations();
  const [stats, setStats] = useState<PayLinkStats | null>(propStats || null);

  const publicUrl = `https://caspay.link/pay/${row.slug}`;

  // Fetch stats only if not provided
  useEffect(() => {
    if (!propStats && row.id && row.merchant_id) {
      getPayLinkStats(row.id, row.merchant_id)
        .then(setStats)
        .catch(() => setStats(null));
    }
  }, [propStats, row.id, row.merchant_id]);

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
    } catch (error) {
      console.error('Error deleting PayLink:', error);
    }
  }, [deletePayLink, row.id, confirm]);

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
          <Label variant="soft" color={row.is_active ? 'success' : 'default'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        <TableCell align="center">
          <Box sx={{ typography: 'body2' }}>{row.current_uses || 0}</Box>
        </TableCell>

        <TableCell align="right">
          <Box sx={{ typography: 'body2', fontWeight: 500 }}>
            {stats?.total_revenue ? `${stats.total_revenue.toFixed(2)} CSPR` : '-'}
          </Box>
        </TableCell>

        <TableCell align="center">
          <Box sx={{ typography: 'body2', color: row.max_uses ? 'text.primary' : 'text.disabled' }}>
            {row.max_uses ? `${row.current_uses}/${row.max_uses}` : 'Unlimited'}
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
