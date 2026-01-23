import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './components/section-title';
import { CircleSvg, FloatLine, FloatPlusIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

const renderLines = () => (
  <>
    <FloatPlusIcon sx={{ top: 72, left: 72 }} />
    <FloatPlusIcon sx={{ bottom: 72, left: 72 }} />
    <FloatLine sx={{ top: 80, left: 0 }} />
    <FloatLine sx={{ bottom: 80, left: 0 }} />
    <FloatLine vertical sx={{ top: 0, left: 80 }} />
  </>
);

export function HomeMinimal({ sx, ...other }: BoxProps) {
  const renderDescription = () => (
    <>
      <SectionTitle
        caption="Why CasPay?"
        title="What's in"
        txtGradient="CasPay?"
        sx={{ mb: { xs: 5, md: 8 }, textAlign: { xs: 'center', md: 'left' } }}
      />

      <Stack spacing={6} sx={{ maxWidth: { sm: 560, md: 400 }, mx: { xs: 'auto', md: 'unset' } }}>
        {ITEMS.map((item) => (
          <Box
            component={m.div}
            variants={varFade('inUp', { distance: 24 })}
            key={item.title}
            sx={[{ gap: 3, display: 'flex' }]}
          >
            <SvgIcon sx={{ width: 40, height: 40 }}>{item.icon}</SvgIcon>
            <Stack spacing={1}>
              <Typography variant="h5" component="h6">
                {item.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>{item.description}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </>
  );

  const renderImage = () => (
    <Stack
      component={m.div}
      variants={varFade('inRight', { distance: 24 })}
      sx={{
        height: 1,
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={[
          (theme) => ({
            left: 0,
            width: 720,
            borderRadius: 2,
            position: 'absolute',
            bgcolor: 'background.default',
            boxShadow: `-40px 40px 80px 0px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            ...theme.applyStyles('dark', {
              boxShadow: `-40px 40px 80px 0px ${varAlpha(theme.vars.palette.common.blackChannel, 0.16)}`,
            }),
          }),
        ]}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            CasPay in your dApp
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
            Initialize the SDK and accept payments with a single function call.
          </Typography>

          <Box
            sx={(theme) => ({
              mt: 2,
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: theme.vars.palette.grey['900'] || 'grey.900',
              color: 'common.white',
              border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
              fontFamily: 'monospace',
            })}
          >
            <Box
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: varAlpha(theme.vars.palette.grey['800Channel'] || theme.vars.palette.grey['500Channel'], 0.9),
                borderBottom: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
              })}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f57' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#febc2e' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#28c840' }} />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.72 }}>
                dapp.tsx
              </Typography>
            </Box>

            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                fontSize: 12,
                overflowX: 'auto',
              }}
            >
              <code>{`import { CasPay } from '@caspay/sdk';

const caspay = new CasPay({
  apiKey: your_caspay_api_key,
  merchantId: 'your_merchant_id',
  walletAddress: 'your_wallet_address',
  network: 'testnet',
  baseUrl: 'https://caspay.link/api',
});

const result = await caspay.payments.makePayment({
  productId: 'caspay_product_id',
  amount: 10,
  currency: 'CSPR',
});`}</code>
            </Box>
          </Box>
        </Box>
      </Box>
    </Stack>
  );

  return (
    <Box
      component="section"
      sx={[
        {
          overflow: 'hidden',
          position: 'relative',
          py: { xs: 10, md: 20 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <MotionViewport>
        {renderLines()}

        <Container sx={{ position: 'relative' }}>
          <Grid container columnSpacing={{ xs: 0, md: 8 }} sx={{ position: 'relative', zIndex: 9 }}>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>{renderDescription()}</Grid>

            <Grid sx={{ display: { xs: 'none', md: 'block' } }} size={{ md: 6, lg: 6 }}>
              {renderImage()}
            </Grid>
          </Grid>

          <CircleSvg variants={varFade('in')} sx={{ display: { xs: 'none', md: 'block' } }} />
        </Container>
      </MotionViewport>
    </Box>
  );
}

// ----------------------------------------------------------------------

const ITEMS = [
  {
    title: 'Enterprise-Grade Security',
    description: 'Built on Casper Network with dictionary-based multi-tenancy. 22x more cost-efficient than factory patterns.',
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.48"
          d="M24 4L6 14V22C6 32 12 40 24 44C36 40 42 32 42 22V14L24 4Z"
          fill="currentColor"
        />
        <path
          d="M24 2L4 12V22C4 34 12 44 24 48C36 44 44 34 44 22V12L24 2ZM24 6L40 14V22C40 31 35 38.5 24 42C13 38.5 8 31 8 22V14L24 6Z"
          fill="currentColor"
        />
        <path
          d="M20 24L18 22L16 24L20 28L32 16L30 14L20 24Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: 'Lightning Fast Payments',
    description: 'Payment confirmations in under 20 seconds with Casper finality. Real-time dashboard updates via Supabase.',
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.48"
          d="M26 2L10 26H22L18 46L42 18H28L26 2Z"
          fill="currentColor"
        />
        <path
          d="M28 2L12 26H20L16 48L44 18H32L28 2ZM28 8L30 16H36L22 38L24 24H16L28 8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: 'Developer-Friendly SDKs',
    description: 'Simple integration with JS/TS, Rust, and PHP SDKs. Stripe-like developer experience for blockchain.',
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.48"
          d="M9.04688 27.4V13.2992C9.04688 8.55495 12.8835 4.70898 17.6162 4.70898H12.3984C7.6522 4.70898 3.80469 8.55649 3.80469 13.3027V27.3965C3.80469 32.1426 7.6522 35.9902 12.3984 35.9902H17.6162C12.8835 35.9902 9.04688 32.1443 9.04688 27.4Z"
          fill="currentColor"
        />
        <path
          d="M32.25 44.584H15.75C13.472 44.4995 13.4737 41.2302 15.75 41.1465H32.25C34.528 41.231 34.5263 44.5003 32.25 44.584ZM35.6875 37.709H12.3107C6.62541 37.709 2 33.0837 2 27.3983V13.3027C2 7.61642 6.62619 2.99023 12.3125 2.99023H35.6875C41.3738 2.99023 46 7.61642 46 13.3027V27.3965C46 33.0828 41.3738 37.709 35.6875 37.709ZM12.3125 6.42773C8.52163 6.42773 5.4375 9.51186 5.4375 13.3027V27.3983C5.4375 31.1881 8.52085 34.2715 12.3107 34.2715H35.6875C39.4784 34.2715 42.5625 31.1874 42.5625 27.3965V13.3027C42.5625 9.51186 39.4784 6.42773 35.6875 6.42773H12.3125Z"
          fill="currentColor"
        />
        <path
          d="M22.1107 29.0297C21.9535 29.0297 21.7937 29.008 21.635 28.9624C20.7227 28.7001 20.1958 27.748 20.4581 26.8357L24.4112 13.0857C24.6735 12.1734 25.6258 11.6469 26.538 11.9088C27.4502 12.1711 27.9772 13.1232 27.7149 14.0355L23.7618 27.7855C23.545 28.539 22.8575 29.0297 22.1107 29.0297ZM32.4224 27.3106C31.978 27.3106 31.5338 27.1393 31.1974 26.7974C30.5316 26.1208 30.5402 25.0326 31.2168 24.3668L34.5819 21.0551C34.9162 20.6941 34.9163 20.2198 34.5791 19.8587L31.2086 16.4961C30.5365 15.8256 30.5353 14.7374 31.2057 14.0654C31.8762 13.3933 32.9645 13.3922 33.6364 14.0625L37.0066 17.4247C38.6751 19.0208 38.6751 21.8961 37.0062 23.4922C37.0036 23.4948 37.0009 23.4975 36.9983 23.5001L33.6281 26.8169C33.2933 27.1462 32.8577 27.3106 32.4224 27.3106ZM15.7504 27.3106C15.3151 27.3106 14.8797 27.1462 14.5449 26.8168L11.1747 23.5C11.172 23.4974 11.1693 23.4948 11.1668 23.4921C9.49776 21.8956 9.49784 19.0207 11.1668 17.4244L14.5365 14.0625C15.2086 13.3921 16.2968 13.3935 16.9672 14.0654C17.6376 14.7374 17.6364 15.8256 16.9644 16.4961L13.5941 19.8583C13.2569 20.2193 13.2562 20.6934 13.591 21.0551L16.956 24.3668C17.6326 25.0326 17.6413 26.1208 16.9754 26.7974C16.6391 27.1392 16.1948 27.3106 15.7504 27.3106Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];
