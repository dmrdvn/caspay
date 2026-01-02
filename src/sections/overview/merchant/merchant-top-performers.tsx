import type { CardProps } from '@mui/material/Card';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

// Placeholder component - will be implemented with top products/plans data

type Props = CardProps & {
  title?: string;
  subheader?: string;
};

export function MerchantTopPerformers({ title, subheader, sx, ...other }: Props) {
  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />
      
      <Typography variant="body2" sx={{ p: 3, color: 'text.secondary', textAlign: 'center' }}>
        Top performing products and plans will be displayed here
      </Typography>
    </Card>
  );
}
