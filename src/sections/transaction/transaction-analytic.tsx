import type { IconifyName } from 'src/components/iconify';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency, fShortenNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  total: number;
  priceUsd: number;
  priceToken: number;
  tokenSymbol: string;
  color?: string;
  percent: number;
  icon: IconifyName;
};

export function TransactionAnalytic({ title, total, icon, color, percent, priceUsd, priceToken, tokenSymbol }: Props) {
  return (
    <Box
      sx={{
        width: 1,
        gap: 2.5,
        minWidth: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon={icon} width={32} sx={{ color, position: 'absolute' }} />

        <CircularProgress
          size={56}
          thickness={2}
          value={percent}
          variant="determinate"
          sx={{ color, opacity: 0.48 }}
        />

        <CircularProgress
          size={56}
          value={100}
          thickness={3}
          variant="determinate"
          sx={[
            (theme) => ({
              top: 0,
              left: 0,
              opacity: 0.48,
              position: 'absolute',
              color: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
            }),
          ]}
        />
      </Box>

      <div>
        <Typography variant="subtitle1">{title}</Typography>

        <Box
          component="span"
          sx={{ my: 0.5, display: 'block', typography: 'body2', color: 'text.disabled' }}
        >
          {fShortenNumber(total)} transactions
        </Box>

        <Box component="span" sx={{ typography: 'subtitle2', display: 'block' }}>
          {fCurrency(priceUsd)}
        </Box>
        
        <Box component="span" sx={{ typography: 'caption', color: 'text.secondary', display: 'block', mt: 0.5 }}>
          {priceToken.toLocaleString()} {tokenSymbol}
        </Box>
      </div>
    </Box>
  );
}
