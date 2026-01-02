import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

/**
 * Input nav data is an array of navigation section items used to define the structure and content of a navigation bar.
 * Each section contains a subheader and an array of items, which can include nested children items.
 *
 * Each item can have the following properties:
 * - `title`: The title of the navigation item.
 * - `path`: The URL path the item links to.
 * - `icon`: An optional icon component to display alongside the title.
 * - `info`: Optional additional information to display, such as a label.
 * - `allowedRoles`: An optional array of roles that are allowed to see the item.
 * - `caption`: An optional caption to display below the title.
 * - `children`: An optional array of nested navigation items.
 * - `disabled`: An optional boolean to disable the item.
 * - `deepMatch`: An optional boolean to indicate if the item should match subpaths.
 */
export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Merchant', path: paths.dashboard.merchant.root, icon: ICONS.user },
    ],
  },
  /**
   * Commerce
   */
  {
    subheader: 'Commerce',
    items: [
      {
        title: 'Products',
        path: paths.dashboard.product.root,
        icon: ICONS.product,
        children: [
          { title: 'List Products', path: paths.dashboard.product.root },
          { title: 'Create New Product', path: paths.dashboard.product.new },
        ],
      },
      {
        title: 'Subscriptions',
        path: paths.dashboard.subscription.root,
        icon: ICONS.tour,
        children: [
          { title: 'List Plans', path: paths.dashboard.subscription.root },
          { title: 'Create New Plan', path: paths.dashboard.subscription.new },
        ],
      },
       {
        title: 'Payment Links',
        path: paths.dashboard.paymentLink.root,
        icon: ICONS.external,
        info: (
          <Label color="warning" variant="soft">
            SOON
          </Label>
        ),
      },

    ],
  },
  /**
   * Financial
   */
  {
    subheader: 'Financial',
    items: [
      {
        title: 'Transactions',
        path: paths.dashboard.transaction.root,
        icon: ICONS.invoice,
      },

    ],
  },
  /**
   * Settings
   */
  {
    subheader: 'Settings',
    items: [
      { title: 'Profile', path: paths.dashboard.profile, icon: ICONS.user },
    ],
  },
];
