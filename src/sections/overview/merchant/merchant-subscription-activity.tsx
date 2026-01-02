import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories: string[];
    data: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

export function MerchantSubscriptionActivity({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    chart: { stacked: true },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: { y: { formatter: (value: number) => fNumber(value) } },
    plotOptions: { bar: { columnWidth: '40%' } },
    ...chart.options,
  });

  // Calculate totals for legend values
  const legendValues = chart.data.map((series) =>
    fShortenNumber(series.data.reduce((sum, val) => sum + val, 0))
  );

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <span style={{ fontSize: '14px', color: '#637381', fontWeight: 500 }}>2025</span>
        }
        sx={{ mb: 3 }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={chart.data.map((item) => item.name)}
        values={legendValues}
        sx={{ px: 3, gap: 3 }}
      />

      <Chart
        type="bar"
        series={chart.data}
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
