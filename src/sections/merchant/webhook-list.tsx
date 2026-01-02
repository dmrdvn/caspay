'use client';

import type { WebhookEndpoint } from 'src/types/webhook';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { WebhookItem } from './webhook-item';
import { WebhookDialog } from './webhook-dialog';

// ----------------------------------------------------------------------

type Props = {
  merchantId: string;
  webhooks: WebhookEndpoint[];
  isLoading: boolean;
  onDelete: (webhookId: string) => Promise<void>;
  onTest: (webhookId: string) => Promise<any>;
};

export function WebhookList({ merchantId, webhooks, isLoading, onDelete, onTest }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);

  const handleEdit = (webhook: WebhookEndpoint) => {
    setEditingWebhook(webhook);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWebhook(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading webhooks...
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
            <Typography variant="h6">Webhook Endpoints</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Configure webhook URLs to receive real-time event notifications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenDialog(true)}
          >
            Add Endpoint
          </Button>
        </Box>

        {/* List */}
        {webhooks.length === 0 ? (
          <EmptyContent
            filled
            title="No Webhook Endpoints"
            description="Add your first webhook endpoint to start receiving event notifications"
            sx={{ py: 10 }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {webhooks.map((webhook) => (
              <WebhookItem
                key={webhook.id}
                webhook={webhook}
                onEdit={handleEdit}
                onDelete={onDelete}
                onTest={onTest}
              />
            ))}
          </Box>
        )}
      </Box>

      <WebhookDialog
        merchantId={merchantId}
        open={openDialog}
        webhook={editingWebhook}
        onClose={handleCloseDialog}
      />
    </>
  );
}
