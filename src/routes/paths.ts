// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // Error pages
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  demo: '/demo-2',
  
  // Public payment page
  payment: {
    page: (slug: string) => `/pay/${slug}`,
  },
  
  // AUTH
  auth: {
    casper: {
      signIn: `${ROOTS.AUTH}/casper/sign-in`,
    },
  },
  
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    profile: `${ROOTS.DASHBOARD}/profile`,
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
    },
    merchant: {
      root: `${ROOTS.DASHBOARD}/merchant`,
      new: `${ROOTS.DASHBOARD}/merchant/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/merchant/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/merchant/${id}/edit`,
      integrations: (id: string) => `${ROOTS.DASHBOARD}/merchant/${id}/integrations`,
      
      // Subscription Plans
      plans: (merchantId: string) => `${ROOTS.DASHBOARD}/merchant/${merchantId}/plans`,
      planNew: (merchantId: string) => `${ROOTS.DASHBOARD}/merchant/${merchantId}/plans/new`,
      planDetails: (merchantId: string, planId: string) =>
        `${ROOTS.DASHBOARD}/merchant/${merchantId}/plans/${planId}`,
      planEdit: (merchantId: string, planId: string) =>
        `${ROOTS.DASHBOARD}/merchant/${merchantId}/plans/${planId}/edit`,
    },
   
    subscription: {
      root: `${ROOTS.DASHBOARD}/subscription`,
      new: `${ROOTS.DASHBOARD}/subscription/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/subscription/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/subscription/${id}/edit`,

    },
    transaction: {
      root: `${ROOTS.DASHBOARD}/transaction`,
      details: (id: string) => `${ROOTS.DASHBOARD}/transaction/${id}`,
    },
    
    // PayLinks
    payLink: {
      root: `${ROOTS.DASHBOARD}/paylinks`,
      new: `${ROOTS.DASHBOARD}/paylinks/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/paylinks/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/paylinks/${id}/edit`,
    },
  },
};
