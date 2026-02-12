import type { BoxProps } from '@mui/material/Box';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import { varFade, MotionViewport, AnimateCountUp } from 'src/components/animate';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  carouselBreakpoints,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

import { SectionTitle } from './components/section-title';
import { FloatLine, FloatTriangleDownIcon } from './components/svg-elements';

const renderLines = () => (
  <>
    <Stack
      spacing={8}
      alignItems="center"
      sx={{
        top: 64,
        left: 80,
        position: 'absolute',
        transform: 'translateX(-50%)',
      }}
    >
      <FloatTriangleDownIcon sx={{ position: 'static', opacity: 0.12 }} />
      <FloatTriangleDownIcon
        sx={{
          width: 30,
          height: 15,
          opacity: 0.24,
          position: 'static',
        }}
      />
    </Stack>

    <FloatLine vertical sx={{ top: 0, left: 80 }} />
  </>
);

export function HomeTestimonials({ sx, ...other }: BoxProps) {
  const carousel = useCarousel({
    align: 'start',
    slidesToShow: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
    },
    breakpoints: {
      [carouselBreakpoints.sm]: { slideSpacing: '24px' },
      [carouselBreakpoints.md]: { slideSpacing: '40px' },
      [carouselBreakpoints.lg]: { slideSpacing: '64px' },
    },
  });

  const renderDescription = () => (
    <SectionTitle
      caption="testimonials"
      title="Trusted by"
      txtGradient="developers"
      sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center' }}
    />
  );

  const horizontalDivider = (position: 'top' | 'bottom') => (
    <Divider
      component="div"
      sx={[
        (theme) => ({
          width: 1,
          opacity: 0.16,
          height: '1px',
          border: 'none',
          position: 'absolute',
          background: `linear-gradient(to right, transparent 0%, ${theme.vars.palette.grey[500]} 50%, transparent 100%)`,
          ...(position === 'top' && { top: 0 }),
          ...(position === 'bottom' && { bottom: 0 }),
        }),
      ]}
    />
  );

  const verticalDivider = () => (
    <Divider
      component="div"
      orientation="vertical"
      flexItem
      sx={[
        (theme) => ({
          width: '1px',
          opacity: 0.16,
          border: 'none',
          background: `linear-gradient(to bottom, transparent 0%, ${theme.vars.palette.grey[500]} 50%, transparent 100%)`,
          display: { xs: 'none', md: 'block' },
        }),
      ]}
    />
  );

  const renderContent = () => (
    <Stack sx={{ position: 'relative', py: { xs: 5, md: 8 } }}>
      {horizontalDivider('top')}

      <Carousel carousel={carousel}>
        {TESTIMONIALS.map((item) => (
          <Stack key={item.id} component={m.div} variants={varFade('in')}>
            <Stack spacing={1} sx={{ typography: 'subtitle2' }}>
              <Rating size="small" name="read-only" value={item.rating} precision={0.5} readOnly />
              {item.category}
            </Stack>

            <Typography
              sx={(theme) => ({
                ...theme.mixins.maxLine({ line: 4, persistent: theme.typography.body1 }),
                mt: 2,
                mb: 3,
              })}
            >
              {item.content}
            </Typography>

            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar alt={item.name} src={item.avatar} sx={{ width: 48, height: 48 }} />
              <Stack sx={{ typography: 'subtitle1' }}>
                <Box component="span">{item.name}</Box>

                <Box component="span" sx={{ typography: 'body2', color: 'text.disabled' }}>
                  {fToNow(new Date(item.postedAt))}
                </Box>
              </Stack>
            </Box>
          </Stack>
        ))}
      </Carousel>

      <Box
        sx={{
          mt: { xs: 5, md: 8 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CarouselDotButtons
          variant="rounded"
          scrollSnaps={carousel.dots.scrollSnaps}
          selectedIndex={carousel.dots.selectedIndex}
          onClickDot={carousel.dots.onClickDot}
        />

        <CarouselArrowBasicButtons {...carousel.arrows} options={carousel.options} />
      </Box>
    </Stack>
  );

  const renderNumber = () => (
    <Stack sx={{ py: { xs: 5, md: 8 }, position: 'relative' }}>
      {horizontalDivider('top')}

      <Stack
        divider={verticalDivider()}
        sx={{ gap: 5, flexDirection: { xs: 'column', md: 'row' } }}
      >
        {[
          { label: 'Total transactions', value: 1.2 },
          { label: 'Active merchants', value: 5 },
          { label: 'Average confirmation time', value: 10 },
        ].map((item) => (
          <Stack key={item.label} spacing={2} sx={{ textAlign: 'center', width: 1 }}>
            <m.div variants={varFade('inUp', { distance: 24 })}>
              <AnimateCountUp
                to={item.value}
                unit={item.label === 'Total transactions' ? 'k+' : item.label === 'Average confirmation time' ? 's' : '+'}
                toFixed={item.label === 'Active merchants' ? 0 : 1}
                sx={[
                  (theme) => ({
                    fontWeight: 'fontWeightBold',
                    fontSize: { xs: 40, md: 64 },
                    lineHeight: { xs: 50 / 40, md: 80 / 64 },
                    fontFamily: theme.typography.fontSecondaryFamily,
                  }),
                ]}
              />
            </m.div>

            <m.div variants={varFade('inUp', { distance: 24 })}>
              <Box
                component="span"
                sx={[
                  (theme) => ({
                    ...theme.mixins.textGradient(
                      `90deg, ${theme.vars.palette.text.primary}, ${varAlpha(theme.vars.palette.text.primaryChannel, 0.2)}`
                    ),
                    opacity: 0.4,
                    typography: 'h6',
                  }),
                ]}
              >
                {item.label}
              </Box>
            </m.div>
          </Stack>
        ))}
      </Stack>

      {horizontalDivider('bottom')}
    </Stack>
  );

  return (
    <Box
      component="section"
      sx={[{ py: 10, position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <MotionViewport>
        {renderLines()}

        <Container>
          {renderDescription()}
          {renderContent()}
          {renderNumber()}
        </Container>
      </MotionViewport>
    </Box>
  );
}

const createReview = (index: number, name: string) => ({
  id: `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1${index}`,
  name,
  avatar: `https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-${index}.webp`,
  rating: 5,
});

const TESTIMONIALS = [
  {
    ...createReview(1, 'Donovan Booth'),
    category: 'Developer Experience',
    content: `CasPay's SDK made integrating blockchain payments incredibly simple. The documentation is clear, and the developer experience is on par with Stripe. Highly recommended for any Casper dApp.`,
    postedAt: 'February 8, 2026 10:30:00',
  },
  {
    ...createReview(2, 'Febe Noakes'),
    category: 'Performance',
    content: `Payment confirmations in under 20 seconds! This is exactly what we needed for our e-commerce platform. The real-time dashboard updates are a game-changer.`,
    postedAt: 'February 3, 2026 14:20:00',
  },
  {
    ...createReview(3, 'Shayna James'),
    category: 'Security',
    content: `The dictionary-based multi-tenancy design is brilliant. We're saving 22x on gas fees compared to our previous solution, and the security model is enterprise-grade.`,
    postedAt: 'January 27, 2026 09:15:00',
  },
  {
    ...createReview(4, 'Lucian Obrien'),
    category: 'Subscription Support',
    content: `Finally, a proper subscription payment system for Casper! The automated recurring payments work flawlessly. Customer support has been excellent too.`,
    postedAt: 'January 19, 2026 16:45:00',
  },
  {
    ...createReview(5, 'Deja Brady'),
    category: 'Integration',
    content:
      'Migrating from our legacy payment system to CasPay took less than a day. The API is intuitive, webhooks are reliable, and the multi-token support is exactly what we needed.',
    postedAt: 'January 10, 2026 11:30:00',
  },
  {
    ...createReview(6, 'Harrison Stein'),
    category: 'Analytics',
    content: 'The real-time analytics dashboard provides insights we never had before. Revenue tracking, subscription metrics, everything in one place. Incredible value.',
    postedAt: 'December 28, 2025 13:20:00',
  },
  {
    ...createReview(7, 'Reece Chung'),
    category: 'Compliance',
    content:
      'As an enterprise, compliance is critical for us. CasPay\'s audit-ready infrastructure and KYC/AML architecture gave us the confidence to go live quickly.',
    postedAt: 'December 18, 2025 08:50:00',
  },
  {
    ...createReview(8, 'Lana Steiner'),
    category: 'Cost Efficiency',
    content:
      'The cost savings are real. Single smart contract design with dictionary-based storage reduced our operational costs dramatically. Great engineering!',
    postedAt: 'December 5, 2025 15:10:00',
  },
];
