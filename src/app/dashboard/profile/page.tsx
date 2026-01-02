import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ProfileGeneralView } from 'src/sections/profile/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Profile | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <ProfileGeneralView />;
}
