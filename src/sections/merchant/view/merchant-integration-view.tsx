'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useMerchant } from 'src/hooks/use-merchants';
import { useApiKeys, useApiKeyMutations } from 'src/hooks/use-api-keys';
import { useWebhooks, useWebhookMutations } from 'src/hooks/use-webhooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ApiKeyList } from '../api-key-list';
import { WebhookList } from '../webhook-list';

// ----------------------------------------------------------------------

type Props = {
  merchantId: string;
};

export function MerchantIntegrationView({ merchantId }: Props) {
  const { merchant, isLoading, error } = useMerchant(merchantId);
  const { apiKeys, isLoading: isLoadingKeys } = useApiKeys(merchantId);
  const { deleteKey, rotateKey, toggleStatus } = useApiKeyMutations(merchantId);
  const { webhooks, isLoading: isLoadingWebhooks } = useWebhooks(merchantId);
  const { deleteWebhook, testWebhook } = useWebhookMutations(merchantId);
  const [currentTab, setCurrentTab] = useState('api-keys');

  const TABS = [
    {
      value: 'api-keys',
      label: 'API Keys',
      icon: <Iconify icon="solar:key-bold" width={24} />,
    },
    {
      value: 'webhooks',
      label: 'Webhooks',
      icon: <Iconify icon="solar:link-bold" width={24} />,
    },
  ];

  if (isLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading...
          </Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (error || !merchant) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            {error || 'Merchant not found'}
          </Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="API Integration"
        backHref={paths.dashboard.merchant.details(merchantId)}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Merchant', href: paths.dashboard.merchant.root },
          { name: merchant.store_name, href: paths.dashboard.merchant.details(merchantId) },
          { name: 'Integration' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{
            px: 3,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {currentTab === 'api-keys' && (
          <ApiKeyList
            merchantId={merchantId}
            apiKeys={apiKeys}
            isLoading={isLoadingKeys}
            onDelete={deleteKey}
            onRotate={rotateKey}
            onToggleStatus={toggleStatus}
          />
        )}
        {currentTab === 'webhooks' && (
          <WebhookList
            merchantId={merchantId}
            webhooks={webhooks}
            isLoading={isLoadingWebhooks}
            onDelete={deleteWebhook}
            onTest={testWebhook}
          />
        )}
      </Card>
    </DashboardContent>
  );
}
