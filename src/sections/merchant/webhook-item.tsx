'use client';

import type { WebhookEndpoint } from 'src/types/webhook';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  webhook: WebhookEndpoint;
  onEdit: (webhook: WebhookEndpoint) => void;
  onDelete: (webhookId: string) => Promise<void>;
  onTest: (webhookId: string) => Promise<void>;
};

export function WebhookItem({ webhook, onEdit, onDelete, onTest }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhook.url);
    handleClosePopover();
  };

  const handleDelete = async () => {
    await onDelete(webhook.id);
    setConfirmDeleteOpen(false);
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTest(webhook.id);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <Card sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    wordBreak: 'break-all',
                  }}
                >
                  {webhook.url}
                </Typography>
                <Tooltip title="Copy URL">
                  <IconButton size="small" onClick={handleCopyUrl}>
                    <Iconify icon="solar:copy-bold" width={16} />
                  </IconButton>
                </Tooltip>
              </Box>

              {webhook.description && (
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {webhook.description}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!webhook.active && (
                <Label color="error" variant="soft">
                  Inactive
                </Label>
              )}

              <IconButton onClick={handleOpenPopover}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Box>
          </Box>

          {/* Events */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              Subscribed Events
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {webhook.events.includes('*') ? (
                <Chip label="All Events" size="small" color="primary" variant="outlined" />
              ) : (
                webhook.events.map((event) => (
                  <Chip
                    key={event}
                    label={event}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))
              )}
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 1,
              borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Created {fDate(webhook.created_at)}
            </Typography>

            <LoadingButton
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:play-bold" />}
              onClick={handleTest}
              loading={isTesting}
            >
              Test Endpoint
            </LoadingButton>
          </Box>
        </Stack>
      </Card>

      <CustomPopover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClosePopover}>
        <MenuItem
          onClick={() => {
            handleCopyUrl();
          }}
        >
          <Iconify icon="solar:copy-bold" />
          Copy URL
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEdit(webhook);
            handleClosePopover();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            setConfirmDeleteOpen(true);
            handleClosePopover();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete Webhook Endpoint"
        content={
          <>
            Are you sure you want to delete this webhook endpoint? This action cannot be undone and
            you will stop receiving events.
          </>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <IconButton onClick={() => setConfirmDeleteOpen(false)}>Cancel</IconButton>
            <IconButton color="error" onClick={handleDelete}>
              Delete
            </IconButton>
          </Box>
        }
      />
    </>
  );
}
