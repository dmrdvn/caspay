import type { CardProps } from '@mui/material/Card';
import type { SubscriptionPlan } from 'src/types/subscription';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = CardProps & {
  plan: SubscriptionPlan;
  editHref: string;
  detailsHref: string;
  onDelete: () => void;
};

export function SubscriptionPlanItem({ plan, editHref, detailsHref, onDelete, sx, ...other }: Props) {
  const menuActions = usePopover();

  const intervalLabel = {
    weekly: 'Week',
    monthly: 'Month',
    yearly: 'Year',
  }[plan.interval];

  // Get currency display info
  const getCurrencyDisplay = () => {
    if (plan.currency === 'CSPR') {
      return { displayPrice: `${plan.price} CSPR / ${intervalLabel}` };
    }
    // For USDT, USDC - show ONLY formatted price with $, don't add currency code
    const formattedPrice = fCurrency(plan.price);
    return { displayPrice: `${formattedPrice} / ${intervalLabel}` };
  };

  const { displayPrice } = getCurrencyDisplay();

  const renderHeader = () => (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.lighter',
        borderRadius: 2,
        gap: 1,
      }}
    >
      <Link 
        component={RouterLink} 
        href={detailsHref} 
        color="inherit"
        sx={{ 
          typography: 'h5', 
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          }
        }}
      >
        {plan.name}
      </Link>
      <Typography variant="h6" color="primary.dark">
        {displayPrice}
      </Typography>
    </Box>
  );

  const renderBadges = () => (
    <Box sx={{ gap: 1, display: 'flex', position: 'absolute', top: 16, right: 16, zIndex: 9 }}>
      <Label color={plan.active ? 'success' : 'error'} variant="filled">
        {plan.active ? 'Active' : 'Inactive'}
      </Label>
    </Box>
  );

  const renderTexts = () => (
    <ListItemText
      sx={[(theme) => ({ p: theme.spacing(2.5, 2.5, 2, 2.5) })]}
      primary={`Created: ${fDateTime(plan.created_at)}`}
      secondary={plan.description || 'No description'}
      slotProps={{
        primary: {
          sx: { typography: 'caption', color: 'text.disabled' },
        },
        secondary: {
          noWrap: true,
          component: 'p',
          sx: { mt: 1, color: 'text.secondary', typography: 'body2' },
        },
      }}
    />
  );

  const renderInfo = () => (
    <Box
      sx={[
        (theme) => ({
          gap: 1.5,
          display: 'flex',
          position: 'relative',
          flexDirection: 'column',
          p: theme.spacing(0, 2.5, 2.5, 2.5),
        }),
      ]}
    >
      <IconButton onClick={menuActions.onOpen} sx={{ position: 'absolute', bottom: 20, right: 8 }}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      {[
        {
          icon: <Iconify icon="solar:calendar-bold" sx={{ color: 'info.main' }} />,
          label: `Billing: ${intervalLabel}ly`,
        },
        {
          icon: <Iconify icon="solar:wallet-bold" sx={{ color: 'success.main' }} />,
          label: `Token: ${plan.currency}`,
        },
        ...(plan.trial_days > 0 ? [{
          icon: <Iconify icon="solar:gift-bold" sx={{ color: 'warning.main' }} />,
          label: `Trial: ${plan.trial_days} days`,
        }] : []),
      ].map((item) => (
        <Box
          key={item.label}
          sx={[{ gap: 0.5, display: 'flex', typography: 'body2', alignItems: 'center' }]}
        >
          {item.icon}
          {item.label}
        </Box>
      ))}
    </Box>
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <li>
          <MenuItem component={RouterLink} href={detailsHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
        </li>

        <li>
          <MenuItem component={RouterLink} href={editHref} onClick={() => menuActions.onClose()}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </li>

        <MenuItem
          onClick={() => {
            menuActions.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Card sx={[{ position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
        {renderBadges()}
        {renderHeader()}
        {renderTexts()}
        {renderInfo()}
      </Card>

      {renderMenuActions()}
    </>
  );
}
