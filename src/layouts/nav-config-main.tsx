import type { NavMainProps } from './main/nav/types';

import { Iconify } from 'src/components/iconify';

export const navData: NavMainProps['data'] = [
  { title: 'Home', path: '/', icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" /> },
  {
    title: 'CasPay',
    path: '#',
    icon: <Iconify width={22} icon="solar:home-2-outline" />,
    children: [
      {
        subheader: 'Core Features',
        items: [
          { title: 'Payment Gateway', path: '#' },
          { title: 'Subscription Billing', path: '#' },
          { title: 'Multi-token Support', path: '#' },
          { title: 'Real-time Dashboard', path: '#' },
        ],
      },
      {
        subheader: 'Enterprise',
        items: [
          { title: 'Security & Compliance', path: '#' },
          { title: 'Audit-Ready Contracts', path: '#' },
          { title: 'KYC/AML Infrastructure', path: '#' },
          { title: 'White-label Solutions', path: '#' },
        ],
      },
      {
        subheader: 'Integration',
        items: [
          { title: 'API Integration', path: '#' },
          { title: 'Webhooks & Events', path: '#' },
          { title: 'SDK Libraries', path: '#' },
          { title: 'CLI Tools', path: '#' },
        ],
      },
    ],
  },
  {
    title: 'Developers',
    path: '#',
    icon: <Iconify width={22} icon="solar:programming-bold-duotone" />,
    children: [
      {
        subheader: 'Documentation',
        items: [
          { title: 'Getting Started', path: '#' },
          { title: 'API Reference', path: '#' },
          { title: 'Integration Guide', path: '#' },
          { title: 'Webhooks Guide', path: '#' },
        ],
      },
      {
        subheader: 'SDKs & Libraries',
        items: [
          { title: 'JavaScript/TypeScript', path: '#' },
          { title: 'Rust SDK', path: '#' },
          { title: 'PHP SDK', path: '#' },
          { title: 'Python SDK', path: '#' },
        ],
      },
      {
        subheader: 'Resources',
        items: [
          { title: 'Code Examples', path: '#' },
          { title: 'Video Tutorials', path: '#' },
          { title: 'API Playground', path: '#' },
          { title: 'GitHub Repository', path: '#' },
        ],
      },
    ],
  },
  {
    title: 'Company',
    path: '#',
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
    children: [
      {
        subheader: 'About CasPay',
        items: [
          { title: 'About Us', path: '#' },
          { title: 'Our Mission', path: '#' },
          { title: 'Team', path: '#' },
          { title: 'Careers', path: '#' },
        ],
      },
      {
        subheader: 'Resources',
        items: [
          { title: 'Blog', path: '#' },
          { title: 'Case Studies', path: '#' },
          { title: 'Press Kit', path: '#' },
          { title: 'Brand Assets', path: '#' },
        ],
      },
      {
        subheader: 'Support',
        items: [
          { title: 'Contact Us', path: '#' },
          { title: 'FAQs', path: '#' },
          { title: 'Community', path: '#' },
          { title: 'Status Page', path: '#' },
        ],
      },
    ],
  },
];
