'use client';

import type { DashboardContentProps } from 'src/layouts/dashboard';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function ProfileLayout({ children, ...other }: DashboardContentProps) {
  return (
    <DashboardContent maxWidth="xl" {...other}>
      <CustomBreadcrumbs
        heading="Profile Settings"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Profile' },
        ]}
        sx={{ mb: 3 }}
      />

      {children}
    </DashboardContent>
  );
}
