'use client';

import type { ApiKeyListItem } from 'src/types/api-key';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { ApiKeyItem } from './api-key-item';
import { CreateApiKeyDialog } from './create-api-key-dialog';

// ----------------------------------------------------------------------

type Props = {
  merchantId: string;
  apiKeys: ApiKeyListItem[];
  isLoading: boolean;
  onDelete: (keyId: string) => Promise<void>;
  onRotate: (keyId: string) => Promise<{ key: string }>;
  onToggleStatus: (keyId: string) => Promise<any>;
};

export function ApiKeyList({
  merchantId,
  apiKeys,
  isLoading,
  onDelete,
  onRotate,
  onToggleStatus,
}: Props) {
  const [openCreate, setOpenCreate] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading API keys...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h6">API Keys</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Manage your API keys for authenticating requests
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenCreate(true)}
          >
            Create API Key
          </Button>
        </Box>

        {/* List */}
        {apiKeys.length === 0 ? (
          <EmptyContent
            filled
            title="No API Keys"
            description="Create your first API key to start integrating with the CasPay platform"
            sx={{ py: 10 }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {apiKeys.map((apiKey) => (
              <ApiKeyItem
                key={apiKey.id}
                apiKey={apiKey}
                onDelete={onDelete}
                onRotate={onRotate}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </Box>
        )}
      </Box>

      <CreateApiKeyDialog
        merchantId={merchantId}
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </>
  );
}
