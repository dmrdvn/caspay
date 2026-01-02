import type { BoxProps } from '@mui/material/Box';

import { useState } from 'react';
import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Accordion, { accordionClasses } from '@mui/material/Accordion';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle } from './components/section-title';
import { FloatLine, FloatPlusIcon, FloatTriangleDownIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

const FAQs = [
  {
    question: 'How does CasPay pricing work?',
    answer: (
      <Typography>
        CasPay is free to start. We charge a 0.5% transaction fee on the Pro plan. Enterprise plans
        offer custom pricing with volume discounts and dedicated support. No setup fees, no monthly
        charges.
      </Typography>
    ),
  },
  {
    question: 'Which tokens does CasPay support?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li> Native CSPR token for all payments</li>
        <li> All CEP-18 standard tokens on Casper Network</li>
        <li>
          Custom token support available for Enterprise plans
        </li>
        <li>
          Learn more about
          <Link
            href="https://docs.caspay.link"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mx: 0.5 }}
          >
            supported tokens
          </Link>
        </li>
      </Box>
    ),
  },
  {
    question: 'How fast are payment confirmations?',
    answer: (
      <Box component="ul" sx={{ pl: 3, listStyleType: 'disc' }}>
        <li> Average confirmation time: under 20 seconds</li>
        <li> Real-time dashboard updates via Supabase</li>
        <li> Webhook notifications for instant payment processing</li>
      </Box>
    ),
  },
  {
    question: 'What kind of applications is CasPay suitable for?',
    answer: (
      <Typography>
        CasPay is designed for any application requiring blockchain payments: e-commerce platforms,
        SaaS subscriptions, NFT marketplaces, gaming, content platforms, and more. Both B2C and B2B
        use cases are supported.
      </Typography>
    ),
  },
  {
    question: 'Is there a free plan to test CasPay?',
    answer: (
      <Typography>
        Yes! Our Free plan includes unlimited transactions with basic analytics. Perfect for
        testing and development. No credit card required to get started.
        <Link
          href="/auth/casper/sign-in"
          sx={{ mx: 0.5 }}
        >
          Sign up now
        </Link>
        and start accepting payments immediately.
      </Typography>
    ),
  },
  {
    question: 'How does the subscription payment system work?',
    answer: (
      <Typography>
        CasPay supports automated recurring payments with flexible billing cycles (daily, weekly,
        monthly, yearly). Subscriptions are managed through our dashboard with automatic renewal,
        dunning management, and real-time analytics. Perfect for SaaS and membership businesses.
      </Typography>
    ),
  },
];

// ----------------------------------------------------------------------

export function HomeFAQs({ sx, ...other }: BoxProps) {
  const [expanded, setExpanded] = useState<string | false>(FAQs[0].question);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const renderDescription = () => (
    <SectionTitle
      caption="FAQs"
      title="We’ve got the"
      txtGradient="answers"
      sx={{ textAlign: 'center' }}
    />
  );

  const renderContent = () => (
    <Box
      sx={[
        {
          mt: 8,
          gap: 1,
          mx: 'auto',
          maxWidth: 720,
          display: 'flex',
          mb: { xs: 5, md: 8 },
          flexDirection: 'column',
        },
      ]}
    >
      {FAQs.map((item, index) => (
        <Accordion
          key={item.question}
          disableGutters
          component={m.div}
          variants={varFade('inUp', { distance: 24 })}
          expanded={expanded === item.question}
          onChange={handleChange(item.question)}
          sx={(theme) => ({
            transition: theme.transitions.create(['background-color'], {
              duration: theme.transitions.duration.shorter,
            }),
            py: 1,
            px: 2.5,
            border: 'none',
            borderRadius: 2,
            '&:hover': {
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            },
            [`&.${accordionClasses.expanded}`]: {
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            },
          })}
        >
          <AccordionSummary
            id={`home-faqs-panel${index}-header`}
            aria-controls={`home-faqs-panel${index}-content`}
          >
            <Typography component="span" variant="h6">
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>{item.answer}</AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderContact = () => (
    <Box
      sx={[
        (theme) => ({
          px: 3,
          py: 8,
          textAlign: 'center',
          background: `linear-gradient(to left, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}, transparent)`,
        }),
      ]}
    >
      <m.div variants={varFade('in')}>
        <Typography variant="h4">Still have questions?</Typography>
      </m.div>

      <m.div variants={varFade('in')}>
        <Typography sx={{ mt: 2, mb: 3, color: 'text.secondary' }}>
          Please describe your case to receive the most accurate advice
        </Typography>
      </m.div>

      <m.div variants={varFade('in')}>
        <Button
          color="inherit"
          variant="contained"
          href="mailto:support@caspay.link?subject=[Question] from CasPay User"
          startIcon={<Iconify icon="solar:letter-bold" />}
        >
          Contact us
        </Button>
      </m.div>
    </Box>
  );

  return (
    <Box component="section" sx={sx} {...other}>
      <MotionViewport sx={{ py: 10, position: 'relative' }}>
        {topLines()}

        <Container>
          {renderDescription()}
          {renderContent()}
        </Container>

        <Stack sx={{ position: 'relative' }}>
          {bottomLines()}
          {renderContact()}
        </Stack>
      </MotionViewport>
    </Box>
  );
}

// ----------------------------------------------------------------------

const topLines = () => (
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

const bottomLines = () => (
  <>
    <FloatLine sx={{ top: 0, left: 0 }} />
    <FloatLine sx={{ bottom: 0, left: 0 }} />
    <FloatPlusIcon sx={{ top: -8, left: 72 }} />
    <FloatPlusIcon sx={{ bottom: -8, left: 72 }} />
  </>
);
