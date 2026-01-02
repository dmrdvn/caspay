import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fCurrency } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories: string[];
    series: number[];
    options?: ChartOptions;
  };
};

export function MerchantRevenueChart({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.light,
    theme.palette.primary.main,
  ];

  const chartOptions = useChart({
    colors: [chartColors[1]],
    xaxis: { categories: chart.categories },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: chartColors[0], opacity: 0.24 },
          { offset: 100, color: chartColors[1], opacity: 0.24 },
        ],
      },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    tooltip: {
      y: { formatter: (value: number) => fCurrency(value) },
    },
    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <Chart
        type="area"
        series={[{ name: 'Revenue', data: chart.series }]}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{
          pl: 1,
          py: 2.5,
          pr: 2.5,
          height: 320,
        }}
      />
    </Card>
  );
}
