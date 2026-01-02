'use client';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { MotivationIllustration } from 'src/assets/illustrations';
import {
  useMerchants,
  useMonthlyActivity,
  useMerchantAnalytics,
  useTopPerformingItems,
  useRecentTransactions,
} from 'src/hooks';

import { MerchantWelcome } from '../merchant-welcome';
import { MerchantTopItems } from '../merchant-top-items';
import { MerchantAppWidget } from '../merchant-app-widget';
import { MerchantSaleByGender } from '../merchant-sale-by-gender';
import { MerchantOrderTimeline } from '../merchant-order-timeline';
import { MerchantCurrentBalance } from '../merchant-current-balance';
import { MerchantSubscriptionActivity } from '../merchant-subscription-activity';

// ----------------------------------------------------------------------

export function OverviewMerchantView() {
  const theme = useTheme();
  const { currentMerchant } = useMerchants();

  // Fetch real data from Supabase
  const { analytics } = useMerchantAnalytics(currentMerchant?.id);
  const { items } = useTopPerformingItems(currentMerchant?.id, 4);
  const { transactions } = useRecentTransactions(currentMerchant?.id, 4);
  const { activity } = useMonthlyActivity(currentMerchant?.id, 2025);

  // Calculate values from analytics - REAL DATA
  const totalRevenue = analytics?.total_revenue_usd || 0;
  const monthlyRevenue = analytics?.monthly_revenue_usd || 0;
  const productSalesCount = analytics?.product_sales || 0;
  const subscriptionCount = analytics?.subscription_charges || 0;
  const totalPayments = analytics?.successful_payments || 0;

  // Revenue breakdown percentages - rounded to 1 decimal
  const productRevenuePercent = totalPayments > 0 
    ? Math.round((productSalesCount / totalPayments) * 1000) / 10 
    : 50;
  const subscriptionRevenuePercent = totalPayments > 0 
    ? Math.round((subscriptionCount / totalPayments) * 1000) / 10 
    : 50;

  // Ensure arrays are defined
  const topItems = items || [];
  const recentTransactions = transactions || [];
  const monthlyActivity = activity || [];

  // Prepare chart data from real monthly activity
  const chartData = {
    products: monthlyActivity.length > 0 
      ? monthlyActivity.map((m) => m.products_sold) 
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    subscriptions: monthlyActivity.length > 0 
      ? monthlyActivity.map((m) => m.new_subscriptions) 
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    cancellations: monthlyActivity.length > 0 
      ? monthlyActivity.map((m) => m.cancellations) 
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <MerchantWelcome
            title={`Welcome back 🎉  \n ${currentMerchant?.store_name || 'Merchant'}`}
            description="Track your sales, manage subscriptions, and grow your business."
            img={<MotivationIllustration hideBackground />}
            action={
              <Button variant="contained" color="primary">
                View Transactions
              </Button>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MerchantCurrentBalance
            title="Revenue Overview"
            earning={monthlyRevenue}
            refunded={0}
            orderTotal={totalRevenue}
            currentBalance={totalRevenue}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MerchantAppWidget
            title="Total Revenue"
            total={totalRevenue}
            icon="solar:wallet-money-bold-duotone"
            chart={{
              series: 75,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MerchantAppWidget
            title="Product Sales"
            total={productSalesCount}
            icon="solar:cart-large-2-bold-duotone"
            chart={{
              series: 65,
              colors: [theme.palette.success.light, theme.palette.success.main],
            }}
            sx={{
              bgcolor: 'success.dark',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MerchantAppWidget
            title="Subscription Charges"
            total={subscriptionCount}
            icon="solar:refresh-circle-bold-duotone"
            chart={{
              series: 55,
              colors: [theme.palette.info.light, theme.palette.info.main],
            }}
            sx={{
              bgcolor: 'info.dark',
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <MerchantSaleByGender
            title="Revenue Breakdown"
            total={totalPayments}
            chart={{
              series: [
                { label: 'Product Sales', value: productRevenuePercent },
                { label: 'Subscriptions', value: subscriptionRevenuePercent },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <MerchantSubscriptionActivity
            title="Subscription Activity"
            subheader="Products, new subscriptions, and subscription cancellations"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              data: [
                {
                  name: 'Products Sold',
                  data: chartData.products,
                },
                {
                  name: 'New Subscriptions',
                  data: chartData.subscriptions,
                },
                {
                  name: 'Subscription Cancellations',
                  data: chartData.cancellations,
                },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <MerchantTopItems
            title="Top Performing Items"
            subheader="Best selling products and subscription plans"
            list={topItems}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <MerchantOrderTimeline
            title="Recent Activity"
            subheader="Latest transactions"
            list={
              recentTransactions.length > 0
                ? recentTransactions.map((txn) => ({
                    id: txn.id,
                    type: txn.type,
                    title: txn.title,
                    time: new Date(txn.time),
                  }))
                : [
                    {
                      id: '1',
                      type: 'order1' as const,
                      title: 'No recent activity yet',
                      time: new Date(),
                    },
                  ]
            }
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
