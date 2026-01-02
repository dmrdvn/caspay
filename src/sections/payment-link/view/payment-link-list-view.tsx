'use client';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: 'solar:link-bold-duotone',
    title: 'Custom Payment Links',
    description: 'Create unique payment links for one-time or recurring payments',
    color: 'primary',
  },
  {
    icon: 'solar:wallet-money-bold-duotone',
    title: 'Flexible Amounts',
    description: 'Set fixed prices or let customers choose their payment amount',
    color: 'success',
  },
  {
    icon: 'solar:share-bold-duotone',
    title: 'Easy Sharing',
    description: 'Share payment links via email, social media, or embed on your website',
    color: 'info',
  },
  {
    icon: 'solar:chart-bold-duotone',
    title: 'Track Performance',
    description: 'Monitor payment link usage and conversion rates in real-time',
    color: 'warning',
  },
];

// ----------------------------------------------------------------------

export function PaymentLinkListView() {
  const handleCreateLink = () => {
    alert('🚧 This feature is currently under development!\n\nWe are working hard to bring you the ability to create custom payment links. Stay tuned!');
  };

  const renderHeader = () => (
    <Stack spacing={3} sx={{ mb: 5 }}>
      <CustomBreadcrumbs
        heading="Payment Links"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Payment Links' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleCreateLink}
          >
            Create Payment Link
          </Button>
        }
      />

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Create and manage payment links to accept payments from your customers easily.
      </Typography>
    </Stack>
  );

  const renderDevelopmentBanner = () => (
    <Card
      sx={{
        p: 4,
        mb: 5,
        textAlign: 'center',
      }}
    >
      <Box
        component={m.div}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        <Iconify
          icon="solar:programming-bold-duotone"
          width={80}
          sx={{ color: 'primary.main', mb: 2 }}
        />
      </Box>

      <Typography variant="h4" sx={{ mb: 2 }}>
        🚧 Under Development
      </Typography>

      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
        We&apos;re building a payment link system that will allow you to create, customize, and share payment links with your customers. This feature is coming soon!
      </Typography>
    </Card>
  );

  const renderFeatures = () => (
    <Box component={MotionViewport}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        What You Can Expect
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
        }}
      >
        {FEATURES.map((feature, index) => (
          <m.div key={feature.title} variants={varFade('inUp')}>
            <Card
              sx={{
                p: 3,
                height: 1,
                textAlign: 'center',
              }}
            >
              <Box
                sx={(theme) => {
                  type PaletteColor = 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
                  const color = feature.color as PaletteColor;
                  return {
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    display: 'flex',
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].mainChannel, 0.12)} 0%, ${varAlpha(theme.vars.palette[color].mainChannel, 0.24)} 100%)`,
                  };
                }}
              >
                <Iconify
                  icon={feature.icon as any}
                  width={32}
                  sx={{ color: `${feature.color}.main` }}
                />
              </Box>

              <Typography variant="h6" sx={{ mb: 1 }}>
                {feature.title}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {feature.description}
              </Typography>
            </Card>
          </m.div>
        ))}
      </Box>
    </Box>
  );

  const renderEmptyState = () => (
    <Card
      sx={{
        p: 5,
        mt: 5,
        textAlign: 'center',
        border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
      }}
    >
      <Iconify
        icon="solar:link-circle-bold-duotone"
        width={80}
        sx={{ color: 'text.disabled', mb: 2 }}
      />

      <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
        No Payment Links Yet
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.disabled', mb: 3 }}>
        Once this feature is ready, you&apos;ll be able to create and manage payment links here.
      </Typography>

      <Button
        variant="outlined"
        startIcon={<Iconify icon="solar:bell-bold" />}
        onClick={() => alert('We will notify you when this feature is ready! 🔔')}
      >
        Notify Me When Ready
      </Button>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      {renderHeader()}
      {renderDevelopmentBanner()}
      {renderFeatures()}
      {renderEmptyState()}
    </Container>
  );
}
