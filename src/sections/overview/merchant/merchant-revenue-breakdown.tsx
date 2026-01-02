import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fCurrency } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ChartOptions;
  };
};

export function MerchantRevenueBreakdown({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.info.main,
  ];

  const chartSeries = chart.series.map((item) => item.value);
  const chartLabels = chart.series.map((item) => item.label);

  const chartOptions = useChart({
    colors: chartColors,
    labels: chartLabels,
    stroke: { width: 3, colors: [theme.palette.background.paper] },
    fill: { opacity: 0.8 },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => fCurrency(value),
        title: { formatter: (seriesName: string) => `${seriesName}:` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            value: {
              formatter: (value: string | number) => fCurrency(Number(value)),
            },
            total: {
              formatter: (w: { globals: { seriesTotals: number[] } }) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fCurrency(sum);
              },
            },
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Chart
        type="donut"
        series={chartSeries}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{
          mx: 'auto',
          width: 280,
          height: 280,
        }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chartLabels}
        values={chart.series.map((item) => fCurrency(item.value))}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
