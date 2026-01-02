import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './components/section-title';
import { FloatLine, FloatPlusIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

const renderLines = () => (
  <>
    <FloatPlusIcon sx={{ top: 72, left: 72 }} />
    <FloatLine sx={{ top: 80, left: 0 }} />
    <FloatLine vertical sx={{ top: 0, left: 80 }} />
  </>
);

export function HomeHighlightFeatures({ sx, ...other }: BoxProps) {
  return (
    <Box
      component="section"
      sx={[
        {
          position: 'relative',
          py: { xs: 10, md: 15 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <MotionViewport>
        {renderLines()}

        <Container>
          <SectionTitle 
            caption="Core Features" 
            title="Built for" 
            txtGradient="Performance" 
            sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}
          />

          <Grid container spacing={{ xs: 4, md: 6 }}>
            {FEATURES.map((feature, index) => (
              <Grid key={feature.title} size={{ xs: 12, md: 6, lg: 4 }}>
                <FeatureCard feature={feature} index={index} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </MotionViewport>
    </Box>
  );
}

// ----------------------------------------------------------------------

const FEATURES = [
  {
    title: 'Real-time Dashboard',
    description: 'Monitor all transactions and subscriptions with live updates. Track revenue, user activity, and payment status in real-time.',
    icon: 'solar:rocket-2-bold-duotone',
    color: 'primary',
  },
  {
    title: 'Multi-token Support',
    description: 'Accept payments in CSPR and any CEP-18 token. Flexible pricing with automatic token conversion support.',
    icon: 'solar:tag-price-bold',
    color: 'success',
  },
  {
    title: 'Subscription Management',
    description: 'Automated recurring payments with flexible billing cycles. Dunning management and renewal notifications included.',
    icon: 'solar:play-bold',
    color: 'warning',
  },
  {
    title: 'Enterprise Security',
    description: 'Dictionary-based multi-tenancy with 22x cost efficiency. Audit-ready smart contracts with comprehensive compliance.',
    icon: 'solar:shield-warning-bold',
    color: 'error',
  },
  {
    title: 'Developer SDKs',
    description: 'Simple integration with JS/TS, Rust, and PHP SDKs. Stripe-like developer experience for blockchain payments.',
    icon: 'solar:code-bold',
    color: 'info',
  },
  {
    title: 'Webhook Events',
    description: 'Real-time event notifications for payments, subscriptions, and invoices. Reliable delivery with automatic retry.',
    icon: 'solar:notification-bold',
    color: 'secondary',
  },
] as const;

type FeatureCardProps = BoxProps & {
  feature: (typeof FEATURES)[number];
  index: number;
};

function FeatureCard({ feature, index, sx, ...other }: FeatureCardProps) {
  return (
    <Box
      component={m.div}
      variants={varFade('inUp', { distance: 24 })}
      sx={[
        (theme) => ({
          p: 4,
          height: 1,
          borderRadius: 2,
          textAlign: 'center',
          position: 'relative',
          border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.standard,
          }),
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 24px 48px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
            ...theme.applyStyles('dark', {
              boxShadow: `0 24px 48px ${varAlpha(theme.vars.palette.common.blackChannel, 0.24)}`,
            }),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        sx={[
          (theme) => ({
            mb: 3,
            width: 64,
            height: 64,
            mx: 'auto',
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: varAlpha(theme.vars.palette[feature.color].mainChannel, 0.08),
            color: `${feature.color}.main`,
          }),
        ]}
      >
        <Iconify icon={feature.icon} width={32} />
      </Box>

      <Typography variant="h5" sx={{ mb: 2 }}>
        {feature.title}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {feature.description}
      </Typography>
    </Box>
  );
}
