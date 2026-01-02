import type { BoxProps } from '@mui/material/Box';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  backHref: string;
  editHref: string;
  status: string;
  onChangeStatus: (newValue: string) => void;
  statusOptions: { value: string; label: string }[];
};

export function ProductDetailsToolbar({
  sx,
  status,
  backHref,
  editHref,
  statusOptions,
  onChangeStatus,
  ...other
}: Props) {
  const menuActions = usePopover();

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'top-right' } }}
    >
      <MenuList>
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === status}
            onClick={() => {
              menuActions.onClose();
              onChangeStatus(option.value);
            }}
          >
            {option.value === 'active' && <Iconify icon="solar:eye-bold" />}
            {option.value === 'inactive' && <Iconify icon="solar:eye-closed-bold" />}
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Box
        sx={[
          { gap: 1.5, display: 'flex', mb: { xs: 3, md: 5 } },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Button
          component={RouterLink}
          href={backHref}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        >
          Back
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Edit">
          <IconButton component={RouterLink} href={editHref}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>

        <Button
          color={status === 'active' ? 'success' : 'inherit'}
          variant="contained"
          loading={!status}
          loadingIndicator="Loading…"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          onClick={menuActions.onOpen}
          sx={{ textTransform: 'capitalize' }}
        >
          {status}
        </Button>
      </Box>

      {renderMenuActions()}
    </>
  );
}
