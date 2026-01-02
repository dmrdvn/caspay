'use client';

import type { WebhookEndpoint } from 'src/types/webhook';

import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useWebhookMutations } from 'src/hooks/use-webhooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const EVENT_CATEGORIES = [
  {
    label: 'All Events',
    value: '*',
    description: 'Subscribe to all current and future events',
  },
  {
    label: 'Payment Events',
    value: 'payment.*',
    description: 'payment.received, payment.confirmed, payment.failed',
  },
  {
    label: 'Subscription Events',
    value: 'subscription.*',
    description: 'subscription.created, subscription.renewed, subscription.cancelled, subscription.expired',
  },
  {
    label: 'Invoice Events',
    value: 'invoice.*',
    description: 'invoice.created, invoice.paid',
  },
  {
    label: 'Payout Events',
    value: 'payout.*',
    description: 'payout.initiated, payout.completed, payout.failed',
  },
  {
    label: 'Contract Events',
    value: 'contract.*',
    description: 'contract.deployed, contract.error',
  },
];

// ----------------------------------------------------------------------

type Props = {
  merchantId: string;
  open: boolean;
  webhook: WebhookEndpoint | null;
  onClose: () => void;
};

type FormValues = {
  url: string;
  description: string;
  events: string[];
};

export function WebhookDialog({ merchantId, open, webhook, onClose }: Props) {
  const { createWebhook, updateWebhook } = useWebhookMutations(merchantId);
  const isEdit = Boolean(webhook);

  const methods = useForm<FormValues>({
    defaultValues: {
      url: webhook?.url || '',
      description: webhook?.description || '',
      events: webhook?.events || ['*'],
    },
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const selectedEvents = watch('events');

  const handleToggleEvent = (event: string) => {
    const currentEvents = selectedEvents;
    
    if (event === '*') {
      setValue('events', ['*']);
      return;
    }

    const filtered = currentEvents.filter((e) => e !== '*');
    
    if (filtered.includes(event)) {
      const newEvents = filtered.filter((e) => e !== event);
      setValue('events', newEvents.length > 0 ? newEvents : ['*']);
    } else {
      setValue('events', [...filtered, event]);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && webhook) {
        await updateWebhook(webhook.id, {
          url: data.url,
          description: data.description,
          events: data.events,
        });
      } else {
        await createWebhook({
          url: data.url,
          description: data.description,
          events: data.events,
        });
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save webhook:', error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Webhook Endpoint' : 'Add Webhook Endpoint'}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Field.Text
              name="url"
              label="Endpoint URL"
              placeholder="https://example.com/webhooks/caspay"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:link-bold" width={20} />
                  </InputAdornment>
                ),
              }}
            />

            <Field.Text
              name="description"
              label="Description (Optional)"
              placeholder="Production webhook for order notifications"
              multiline
              rows={2}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Event Subscriptions
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Select which events will trigger this webhook
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {EVENT_CATEGORIES.map((category) => {
                  const isSelected = selectedEvents.includes(category.value);
                  const isAllSelected = selectedEvents.includes('*');

                  return (
                    <Box
                      key={category.value}
                      onClick={() => handleToggleEvent(category.value)}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        bgcolor: isSelected || isAllSelected ? 'action.selected' : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: (theme) => `2px solid ${theme.palette.divider}`,
                            bgcolor: isSelected || isAllSelected ? 'primary.main' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {(isSelected || isAllSelected) && (
                            <Iconify icon="eva:checkmark-fill" width={12} color="common.white" />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2">{category.label}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {category.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Form>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton variant="contained" onClick={onSubmit} loading={isSubmitting}>
          {isEdit ? 'Update' : 'Create'} Endpoint
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
