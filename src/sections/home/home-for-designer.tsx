import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

const ENTERPRISE_FEATURES = [
  {
    icon: 'solar:shield-warning-bold',
    title: 'Audit-Ready Contracts',
    description: 'Smart contracts reviewed and optimized for enterprise compliance',
  },
  {
    icon: 'solar:tag-price-bold',
    title: '22x Cost Efficiency',
    description: 'Dictionary-based architecture reduces gas costs by 95%',
  },
  {
    icon: 'solar:alt-arrow-right-bold',
    title: 'KYC/AML Ready',
    description: 'Built-in compliance infrastructure for regulated markets',
  },
  {
    icon: 'solar:play-bold',
    title: 'Sub-20s Confirmations',
    description: 'Casper finality for fast and reliable payment processing',
  },
] as const;

export function HomeForDesigner({ sx, ...other }: BoxProps) {
  return (
    <Box
      component="section"
      sx={[
        (theme) => ({
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 10, md: 15 },
          background: `linear-gradient(135deg, ${theme.vars.palette.grey[900]} 0%, ${varAlpha(theme.vars.palette.primary.darkChannel, 0.8)} 100%)`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Background Pattern */}
      <Box
        sx={[
          (theme) => ({
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            position: 'absolute',
            opacity: 0.03,
            ...theme.mixins.bgGradient({
              images: [
                `linear-gradient(0deg, ${varAlpha(theme.vars.palette.common.whiteChannel, 0.04)} 1px, transparent 1px)`,
                `linear-gradient(90deg, ${varAlpha(theme.vars.palette.common.whiteChannel, 0.04)} 1px, transparent 1px)`,
              ],
              sizes: ['40px 40px'],
              repeats: ['repeat'],
            }),
          }),
        ]}
      />

      <MotionViewport>
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Stack
            spacing={3}
            sx={{
              mb: { xs: 6, md: 8 },
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              component={m.div}
              variants={varFade('inDown', { distance: 24 })}
              sx={[
                (theme) => ({
                  px: 2,
                  py: 0.75,
                  borderRadius: 1.5,
                  typography: 'caption',
                  fontWeight: 'fontWeightSemiBold',
                  border: `solid 1px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.16)}`,
                  bgcolor: varAlpha(theme.vars.palette.common.whiteChannel, 0.08),
                  color: 'common.white',
                }),
              ]}
            >
              ENTERPRISE-READY
            </Box>

            <Box component={m.div} variants={varFade('inUp', { distance: 24 })}>
              <Typography
                variant="h2"
                sx={[
                  (theme) => ({
                    color: 'common.white',
                    mb: 2,
                    ...theme.mixins.textGradient(
                      `135deg, ${theme.vars.palette.common.white}, ${varAlpha(theme.vars.palette.common.whiteChannel, 0.7)}`
                    ),
                  }),
                ]}
              >
                Built for Production
              </Typography>

              <Typography
                sx={[
                  (theme) => ({
                    color: varAlpha(theme.vars.palette.common.whiteChannel, 0.72),
                    maxWidth: 640,
                    mx: 'auto',
                  }),
                ]}
              >
                Enterprise-grade infrastructure designed for compliance, security, and scalability.
                Trusted by businesses processing millions in blockchain payments.
              </Typography>
            </Box>
          </Stack>

          {/* Features Grid */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {ENTERPRISE_FEATURES.map((feature, index) => (
              <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  component={m.div}
                  variants={varFade('inUp', { distance: 24 })}
                  sx={[
                    (theme) => ({
                      p: 3,
                      height: 1,
                      borderRadius: 2,
                      textAlign: 'center',
                      border: `solid 1px ${varAlpha(theme.vars.palette.common.whiteChannel, 0.08)}`,
                      bgcolor: varAlpha(theme.vars.palette.common.whiteChannel, 0.04),
                      transition: theme.transitions.create(['background-color', 'border-color'], {
                        duration: theme.transitions.duration.standard,
                      }),
                      '&:hover': {
                        bgcolor: varAlpha(theme.vars.palette.common.whiteChannel, 0.08),
                        borderColor: varAlpha(theme.vars.palette.common.whiteChannel, 0.16),
                      },
                    }),
                  ]}
                >
                  <Box
                    sx={[
                      (theme) => ({
                        mb: 2,
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        display: 'flex',
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                        color: theme.vars.palette.primary.light,
                      }),
                    ]}
                  >
                    <Iconify icon={feature.icon} width={28} />
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{ color: 'common.white', mb: 1, fontWeight: 'fontWeightSemiBold' }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={[
                      (theme) => ({
                        color: varAlpha(theme.vars.palette.common.whiteChannel, 0.64),
                      }),
                    ]}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* CTA Buttons */}
          <Stack
            component={m.div}
            variants={varFade('inUp', { distance: 24 })}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            <Button
              size="large"
              variant="contained"
              color="primary"
              href="/auth/casper/sign-in"
              startIcon={<Iconify icon="solar:rocket-2-bold-duotone" />}
            >
              Start Building
            </Button>

            <Button
              size="large"
              variant="outlined"
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.caspay.link"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              sx={[
                (theme) => ({
                  color: 'common.white',
                  borderColor: varAlpha(theme.vars.palette.common.whiteChannel, 0.24),
                  '&:hover': {
                    borderColor: theme.vars.palette.common.white,
                    bgcolor: varAlpha(theme.vars.palette.common.whiteChannel, 0.08),
                  },
                }),
              ]}
            >
              Read Documentation
            </Button>
          </Stack>
        </Container>
      </MotionViewport>
    </Box>
  );
}
