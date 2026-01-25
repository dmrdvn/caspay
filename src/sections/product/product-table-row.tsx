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
import Chip from '@mui/material/Chip';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import { fDate } from 'src/utils/format-time';

import { useProductMutations, useMerchants } from 'src/hooks';

import type { Product } from 'src/types/product';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

type Props = {
  row: Product;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteSuccess?: () => void;
};

export function ProductTableRow({ row, selected, onSelectRow, onDeleteSuccess }: Props) {
  const router = useRouter();
  const confirm = useBoolean();
  const popover = usePopover();
  
  const { currentMerchant } = useMerchants();
  const { deleteProduct, toggleStatus } = useProductMutations(currentMerchant?.id);

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.product.edit(row.id));
    popover.onClose();
  }, [router, row.id, popover]);

  const handleView = useCallback(() => {
    router.push(paths.dashboard.product.details(row.id));
    popover.onClose();
  }, [router, row.id, popover]);

  const handleToggleStatus = useCallback(async () => {
    try {
      await toggleStatus(row.id);
      popover.onClose();
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  }, [toggleStatus, row.id, popover, onDeleteSuccess]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteProduct(row.id);
      confirm.onFalse();
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }, [deleteProduct, row.id, confirm, onDeleteSuccess]);

  const stockStatus = !row.track_inventory
    ? null
    : (row.stock ?? 0) === 0
      ? 'out_of_stock'
      : (row.stock ?? 0) <= 10
        ? 'low_stock'
        : 'in_stock';

  const stockColors = {
    in_stock: 'success' as const,
    low_stock: 'warning' as const,
    out_of_stock: 'error' as const,
  };

  const stockLabels = {
    in_stock: `${row.stock} In stock`,
    low_stock: `${row.stock} Low stock`,
    out_of_stock: 'Out of stock',
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              alt={row.name}
              src={row.image_url || undefined}
              variant="rounded"
              sx={{ width: 48, height: 48 }}
            >
              {row.name?.charAt(0).toUpperCase()}
            </Avatar>

            <ListItemText
              primary={row.name}
              secondary={row.description ? row.description.slice(0, 40) + '...' : '-'}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ color: 'text.disabled', noWrap: true }}
            />
          </Box>
        </TableCell>

        <TableCell>
          <Tooltip title="Copy Product ID">
            <Link
              component="button"
              onClick={() => navigator.clipboard.writeText(row.product_id)}
              underline="hover"
              color="inherit"
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
            >
              {row.product_id}
            </Link>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Box sx={{ typography: 'body2', fontWeight: 500 }}>
            {row.price} {row.currency}
          </Box>
        </TableCell>

        <TableCell>
          <Chip
            label={row.token_address === 'NATIVE' ? 'CSPR' : 'CEP-18'}
            size="small"
            color={row.token_address === 'NATIVE' ? 'primary' : 'secondary'}
            variant="soft"
          />
        </TableCell>

        <TableCell>
          {!row.track_inventory ? (
            <Chip
              label="No tracking"
              size="small"
              variant="outlined"
              color="default"
            />
          ) : stockStatus ? (
            <Label variant="soft" color={stockColors[stockStatus]}>
              {stockLabels[stockStatus]}
            </Label>
          ) : null}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={row.active ? 'success' : 'default'}>
            {row.active ? 'Active' : 'Inactive'}
          </Label>
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
            startIcon={<Iconify icon="solar:eye-bold" />}
            onClick={handleView}
            sx={{ justifyContent: 'flex-start' }}
          >
            View
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
            color="inherit"
            startIcon={
              <Iconify icon={row.active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
            }
            onClick={handleToggleStatus}
            sx={{ justifyContent: 'flex-start' }}
          >
            {row.active ? 'Deactivate' : 'Activate'}
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
        title="Delete Product"
        content="Are you sure you want to delete this product? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        }
      />
    </>
  );
}
