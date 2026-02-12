import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './components/section-title';
import { FloatLine } from './components/svg-elements';

const QUARTERS = [
    {
        label: 'Q1 2026',
        color: 'primary',
        icon: 'solar:check-circle-bold-duotone',
        items: [
            { text: 'SDK v1.0 release', completed: true },
            { text: 'Full on-chain subscription verification' },
            { text: 'Webhook system for real-time notifications' },
            { text: 'Social auth integration' },
            { text: 'Multi-language dashboard support' },
            { text: 'WordPress / WooCommerce plugin launch' },
        ],
    },
    {
        label: 'Q2 2026',
        color: 'info',
        icon: 'solar:check-circle-bold-duotone',
        items: [
            { text: 'Fiat on-ramp integration' },
            { text: 'UI & UX improvements' },
            { text: 'Automated subscription renewals on-chain' },
            { text: 'Referral / affiliate program' },
            { text: 'Enhanced documentation' },
            { text: 'Bug bounty & airdrop' },
            { text: 'SDK v2.0 release' },
            { text: 'Mainnet launch' },
        ],
    },
    {
        label: 'Q3 2026',
        color: 'warning',
        icon: 'solar:check-circle-bold-duotone',
        items: [
            { text: 'Multi-chain expansion' },
            { text: 'Invoice provider integration' },
            { text: 'Mobile app support for SDK' },
            { text: 'Advanced fraud detection & monitoring' },
            { text: 'Multi-signature wallet support' },
            { text: 'Recurring payment automation (on-chain cron)' },
        ],
    },
    {
        label: 'Q4 2026',
        color: 'error',
        icon: 'solar:check-circle-bold-duotone',
        items: [
            { text: 'White-label solution for enterprises' },
            { text: 'Discord / Telegram bots' },
            { text: 'Browser extension' },
            { text: 'KYC / AML integration' },
            { text: 'Audit log export' },
            { text: 'GDPR compliance tools' },
            { text: 'AI-powered fraud detection' },
        ],
    },
] as const;

const renderLines = () => (
    <>

        <FloatLine sx={{ top: 80, left: 0 }} />
        <FloatLine vertical sx={{ top: 0, left: 80 }} />
    </>
);

export function HomeRoadmap({ sx, ...other }: BoxProps) {
    return (
        <Box
            component="section"
            sx={[
                {
                    position: 'relative',
                    overflow: 'hidden',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <MotionViewport>
                {renderLines()}

                <Container>
                    <SectionTitle
                        caption="Roadmap"
                        title="Our"
                        txtGradient="Journey"
                        description="A clear path forward — here's what we're building to make CasPay the definitive blockchain payment infrastructure."
                        sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}
                        slotProps={{
                            description: {
                                sx: { maxWidth: 680, mx: 'auto' },
                            },
                        }}
                    />


                    <Grid container spacing={{ xs: 3, md: 4 }}>
                        {QUARTERS.map((quarter, index) => (
                            <Grid key={quarter.label} size={{ xs: 12, sm: 6, md: 3 }}>
                                <QuarterCard quarter={quarter} index={index} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </MotionViewport>
        </Box>
    );
}

type QuarterCardProps = BoxProps & {
    quarter: (typeof QUARTERS)[number];
    index: number;
};

function QuarterCard({ quarter, index, sx, ...other }: QuarterCardProps) {
    return (
        <Box
            component={m.div}
            variants={varFade('inUp', { distance: 24 })}
            sx={[
                (theme) => ({
                    p: 3,
                    height: 1,
                    borderRadius: 2,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,

                }),
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3, mt: 1 }}>
                <Box
                    sx={[
                        (theme) => ({
                            width: 48,
                            height: 48,
                            display: 'flex',
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: varAlpha(theme.vars.palette[quarter.color].mainChannel, 0.08),
                            color: `${quarter.color}.main`,
                        }),
                    ]}
                >
                    <Iconify icon={quarter.icon} width={24} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 'fontWeightBold' }}>
                    {quarter.label}
                </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ flex: 1 }}>
                {quarter.items.map((item) => {
                    const text = item.text;
                    const completed = 'completed' in item && !!item.completed;

                    return (
                        <Stack key={text} direction="row" spacing={1.5} alignItems="flex-start">
                            <Box
                                sx={[
                                    (theme) => ({
                                        mt: 0.6,
                                        width: 6,
                                        height: 6,
                                        flexShrink: 0,
                                        borderRadius: '50%',
                                        bgcolor: completed
                                            ? 'success.main'
                                            : `${quarter.color}.main`,
                                        boxShadow: completed
                                            ? `0 0 0 3px ${varAlpha(theme.vars.palette.success.mainChannel, 0.16)}`
                                            : `0 0 0 3px ${varAlpha(theme.vars.palette[quarter.color].mainChannel, 0.16)}`,
                                    }),
                                ]}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: completed ? 'text.disabled' : 'text.secondary',
                                    textDecoration: completed ? 'line-through' : 'none',
                                }}
                            >
                                {text}
                            </Typography>
                        </Stack>
                    );
                })}
            </Stack>
        </Box>
    );
}
