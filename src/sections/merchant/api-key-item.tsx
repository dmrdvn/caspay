import type { ApiKeyListItem } from 'src/types/api-key';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { fDate, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  apiKey: ApiKeyListItem;
  onDelete: (keyId: string) => Promise<void>;
  onRotate: (keyId: string) => Promise<{ key: string }>; // Return new key
  onToggleStatus: (keyId: string) => Promise<void>;
};

export function ApiKeyItem({ apiKey, onDelete, onRotate, onToggleStatus }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRotateOpen, setConfirmRotateOpen] = useState(false);
  const [newRotatedKey, setNewRotatedKey] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey.key_hint);
    handleClosePopover();
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      await onToggleStatus(apiKey.id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(apiKey.id);
    setConfirmDeleteOpen(false);
  };

  const handleRotate = async () => {
    try {
      const result = await onRotate(apiKey.id);
      setNewRotatedKey(result.key); // Show new key first
      setConfirmRotateOpen(false); // Then close confirm dialog
    } catch (error) {
      console.error('Failed to rotate key:', error);
      setConfirmRotateOpen(false);
    }
  };

  const isExpired = !!(apiKey.expires_at && new Date(apiKey.expires_at) < new Date());
  const environment = apiKey.key_prefix === 'cp_live_' ? 'live' : 'test';

  return (
    <>
      <Card sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="subtitle1">{apiKey.name}</Typography>
                <Chip
                  label={environment.toUpperCase()}
                  size="small"
                  color={environment === 'live' ? 'success' : 'warning'}
                  sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                />
                {!apiKey.active && (
                  <Label color="error" variant="soft">
                    Inactive
                  </Label>
                )}
                {isExpired && (
                  <Label color="error" variant="soft">
                    Expired
                  </Label>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  }}
                >
                  {apiKey.key_hint}
                </Typography>
                <Tooltip title="Copy key hint">
                  <IconButton size="small" onClick={handleCopyKey}>
                    <Iconify icon="solar:copy-bold" width={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={apiKey.active ? 'Deactivate' : 'Activate'}>
                <Switch
                  checked={!!apiKey.active}
                  onChange={handleToggleStatus}
                  disabled={isToggling || isExpired}
                  size="small"
                />
              </Tooltip>

              <IconButton onClick={handleOpenPopover}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Box>
          </Box>

          {/* Details */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Permissions
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {apiKey.permissions.scopes.join(', ')}
              </Typography>
            </Box>

            {apiKey.last_used_at && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Last Used
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {fDateTime(apiKey.last_used_at)}
                </Typography>
              </Box>
            )}

            {apiKey.expires_at && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Expires At
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: isExpired ? 'error.main' : 'text.primary',
                  }}
                >
                  {fDate(apiKey.expires_at)}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Created
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {fDate(apiKey.created_at)}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Card>

      <CustomPopover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClosePopover}>
        <MenuItem
          onClick={() => {
            handleCopyKey();
            handleClosePopover();
          }}
        >
          <Iconify icon="solar:copy-bold" />
          Copy Key Hint
        </MenuItem>

        <MenuItem
          onClick={() => {
            setConfirmRotateOpen(true);
            handleClosePopover();
          }}
        >
          <Iconify icon="solar:refresh-bold" />
          Rotate Key
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
        title="Delete API Key"
        content={
          <>
            Are you sure you want to delete <strong>{apiKey.name}</strong>? This action cannot be
            undone and will immediately revoke access for this key.
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Key
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmRotateOpen}
        onClose={() => setConfirmRotateOpen(false)}
        title="Rotate API Key"
        content={
          <>
            Are you sure you want to rotate <strong>{apiKey.name}</strong>? This will generate a
            new key and the old key will stop working immediately.
          </>
        }
        action={
          <Button variant="contained" color="warning" onClick={handleRotate}>
            Rotate Key
          </Button>
        }
      />

      {/* Show new rotated key */}
      <Dialog open={!!newRotatedKey} onClose={() => setNewRotatedKey(null)} maxWidth="sm" fullWidth>
        <DialogTitle>New API Key Generated</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Make sure to copy your new API key now
            </Typography>
            <Typography variant="body2">
              The old key has been revoked. You won&apos;t be able to see this key again!
            </Typography>
          </Alert>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.neutral',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all',
                }}
              >
                {newRotatedKey}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:copy-bold" />}
                onClick={() => {
                  if (newRotatedKey) {
                    navigator.clipboard.writeText(newRotatedKey);
                  }
                }}
              >
                Copy
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setNewRotatedKey(null)} fullWidth>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
