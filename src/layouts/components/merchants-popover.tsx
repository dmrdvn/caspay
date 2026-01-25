'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { ButtonBaseProps } from '@mui/material/ButtonBase';
import type { Merchant } from 'src/types/merchant';

import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Button, { buttonClasses } from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export type MerchantsPopoverProps = ButtonBaseProps & {
  data?: Merchant[];
  currentMerchant?: Merchant | null;
  onChangeMerchant?: (merchant: Merchant) => void;
};

export function MerchantsPopover({ 
  data = [], 
  currentMerchant,
  onChangeMerchant,
  sx, 
  ...other 
}: MerchantsPopoverProps) {
  const router = useRouter();
  const mediaQuery = 'sm';

  const { open, anchorEl, onClose, onOpen } = usePopover();

  // Use currentMerchant from props, no local state needed
  const merchant = currentMerchant;

  const handleChangeMerchant = useCallback(
    (newMerchant: Merchant) => {
      onChangeMerchant?.(newMerchant);
      onClose();
      // Redirect to merchant details page
      router.push(paths.dashboard.merchant.details(newMerchant.id));
    },
    [onClose, onChangeMerchant, router]
  );

  const handleCreateMerchant = useCallback(() => {
    onClose();
    router.push(paths.dashboard.merchant.new);
  }, [onClose, router]);

  const buttonBg: SxProps<Theme> = {
    height: 1,
    zIndex: -1,
    opacity: 0,
    content: "''",
    borderRadius: 1,
    position: 'absolute',
    visibility: 'hidden',
    bgcolor: 'action.hover',
    width: 'calc(100% + 8px)',
    transition: (theme) =>
      theme.transitions.create(['opacity', 'visibility'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    ...(open && {
      opacity: 1,
      visibility: 'visible',
    }),
  };

  // Show placeholder if no merchant
  if (!merchant || data.length === 0) {
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={handleCreateMerchant}
        sx={sx}
      >
        Create Merchant
      </Button>
    );
  }

  const renderButton = () => (
    <ButtonBase
      disableRipple
      onClick={onOpen}
      sx={[
        {
          py: 0.5,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          '&::before': buttonBg,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Avatar
        alt={merchant?.store_name}
        src={merchant?.logo_url || undefined}
        sx={{ width: 24, height: 24 }}
      >
        {merchant?.store_name?.charAt(0).toUpperCase()}
      </Avatar>

      <Box
        component="span"
        sx={{ typography: 'subtitle2', display: { xs: 'none', [mediaQuery]: 'inline-flex' } }}
      >
        {merchant?.store_name}
      </Box>

      <Label
        color={merchant?.status === 'active' ? 'success' : 'default'}
        sx={{
          height: 22,
          cursor: 'inherit',
          textTransform: 'capitalize',
          display: { xs: 'none', [mediaQuery]: 'inline-flex' },
        }}
      >
        {merchant?.status}
      </Label>

      <Chip 
        label={merchant?.network || 'testnet'}
        size="small"
        color={merchant?.network === 'mainnet' ? 'primary' : 'warning'}
        sx={{
          height: 22,
          fontSize: '0.625rem',
          fontWeight: 600,
          cursor: 'inherit',
          textTransform: 'uppercase',
          display: { xs: 'none', [mediaQuery]: 'inline-flex' },
        }}
      />

      <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: 'text.disabled' }} />
    </ButtonBase>
  );

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        arrow: { placement: 'top-left' },
        paper: { sx: { mt: 0.5, ml: -1.55, width: 360 } },
      }}
    >
      <Scrollbar sx={{ maxHeight: 280 }}>
        <MenuList>
          {data.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === merchant?.id}
              onClick={() => handleChangeMerchant(option)}
              sx={{ height: 48 }}
            >
              <Avatar 
                alt={option.store_name} 
                src={option.logo_url || undefined} 
                sx={{ width: 24, height: 24 }}
              >
                {option.store_name.charAt(0).toUpperCase()}
              </Avatar>

              <Typography
                noWrap
                component="span"
                variant="body2"
                sx={{ flexGrow: 1, ml: 1.5, fontWeight: 'fontWeightMedium' }}
              >
                {option.store_name}
              </Typography>

              <Chip 
                label={option.network || 'testnet'}
                size="small"
                color={option.network === 'mainnet' ? 'primary' : 'warning'}
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  mr: 0.5,
                }}
              />

              <Label 
                color={option.status === 'active' ? 'success' : 'default'}
                sx={{ textTransform: 'capitalize' }}
              >
                {option.status}
              </Label>
            </MenuItem>
          ))}
        </MenuList>
      </Scrollbar>

      <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />

      <Button
        fullWidth
        startIcon={<Iconify width={18} icon="mingcute:add-line" />}
        onClick={handleCreateMerchant}
        sx={{
          gap: 2,
          justifyContent: 'flex-start',
          fontWeight: 'fontWeightMedium',
          [`& .${buttonClasses.startIcon}`]: {
            m: 0,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        Create Merchant
      </Button>
    </CustomPopover>
  );

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
