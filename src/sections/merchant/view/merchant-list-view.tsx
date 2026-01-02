'use client';


import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useMerchants } from 'src/hooks/use-merchants';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function MerchantListView() {
  const { merchants, isLoading } = useMerchants();

  const renderList = () => (
    <Box
      sx={{
        gap: 3,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
      }}
    >
      {merchants.map((merchant) => (
        <Card
          key={merchant.id}
          sx={{
            p: 3,
            display: 'flex',
            position: 'relative',
            flexDirection: 'column',
            '&:hover': {
              boxShadow: (theme) => theme.customShadows.z8,
            },
          }}
        >
          <IconButton
            component={RouterLink}
            href={paths.dashboard.merchant.edit(merchant.id)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>

          <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Avatar
              alt={merchant.store_name}
              src={merchant.logo_url || undefined}
              sx={{ width: 64, height: 64 }}
            >
              {merchant.store_name.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" noWrap>
                {merchant.store_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {merchant.merchant_id}
              </Typography>
            </Box>

            <Label
              variant="soft"
              color={
                (merchant.status === 'active' && 'success') ||
                (merchant.status === 'pending' && 'warning') ||
                (merchant.status === 'suspended' && 'error') ||
                'default'
              }
              sx={{ textTransform: 'capitalize' }}
            >
              {merchant.status}
            </Label>
          </Stack>

          <Button
            component={RouterLink}
            href={paths.dashboard.merchant.details(merchant.id)}
            variant="outlined"
            size="small"
          >
            View Details
          </Button>
        </Card>
      ))}
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Merchants"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Merchants', href: paths.dashboard.merchant.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.merchant.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Create Merchant
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading merchants...
          </Typography>
        </Box>
      ) : merchants.length === 0 ? (
        <EmptyContent
          filled
          title="No Merchants"
          description="Get started by creating a new merchant account"
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.merchant.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Create Merchant
            </Button>
          }
          sx={{ py: 10 }}
        />
      ) : (
        renderList()
      )}
    </DashboardContent>
  );
}
