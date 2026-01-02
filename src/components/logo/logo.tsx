'use client';

import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/global-config';

import { logoClasses } from './classes';
// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  // Mini logo (square-ish): 750x465 aspect ratio ≈ 1.6:1
  const singleLogo = (
    <img
      alt="CasPay Mini Logo"
      src={`${CONFIG.assetsDir}/logo/CasPay-Mini.png`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );

  // Full logo (wide): 1265x359 aspect ratio ≈ 3.5:1
  const fullLogo = (
    <img
      alt="CasPay Full Logo"
      src={`${CONFIG.assetsDir}/logo/CasPay.png`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          // Mini logo: 750x465 (1.6:1) - nearly square
          width: 48,
          height: 48,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Full logo: 1265x359 (3.5:1) - wide
          ...(!isSingle && { 
            width: 160, 
            height: 50,
          }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
