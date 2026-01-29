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

type Props = {
  apiKey: ApiKeyListItem;
  onDelete: (keyId: string) => Promise<void>;
  onRotate: (keyId: string) => Promise<{ key: string }>;
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
      setNewRotatedKey(result.key);
      setConfirmRotateOpen(false);
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
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 280 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                  Permissions
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {apiKey.permissions.scopes.map((scope) => {
                    const getPermissionColor = (permission: string) => {
                      if (permission.includes('write')) return 'error';
                      if (permission.includes('read')) return 'info';
                      return 'default';
                    };
                    
                    return (
                      <Chip
                        key={scope}
                        label={scope}
                        size="small"
                        variant="soft"
                        color={getPermissionColor(scope)}
                        sx={{ 
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
              {environment === 'live' && apiKey.allowed_domains && apiKey.allowed_domains.length > 0 && (
                <Box sx={{ flex: 1, minWidth: 280 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Allowed Domains ({apiKey.allowed_domains.length})
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {apiKey.allowed_domains.slice(0, 3).map((domain) => (
                      <Chip
                        key={domain}
                        label={domain}
                        size="small"
                        variant="outlined"
                        color="success"
                        sx={{ 
                          height: 24,
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                    {apiKey.allowed_domains.length > 3 && (
                      <Chip
                        label={`+${apiKey.allowed_domains.length - 3} more`}
                        size="small"
                        variant="filled"
                        color="default"
                        sx={{ 
                          height: 24,
                          fontSize: '0.7rem',
                          opacity: 0.7
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              )}
            </Box>

            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                gap: 2,
                pt: 2,
                borderTop: (theme) => `1px dashed ${theme.palette.divider}`
              }}
            >
              {apiKey.last_used_at && (
                <Box>
                 
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {fDateTime(apiKey.last_used_at)}
                  </Typography>
                </Box>
              )}

              {apiKey.expires_at && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Expires
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: isExpired ? 'error.main' : 'text.primary',
                    }}
                  >
                    {fDate(apiKey.expires_at)}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Created
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  {fDate(apiKey.created_at)}
                </Typography>
              </Box>
            </Box>
          </Stack>
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
