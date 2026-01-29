'use client';

import type { ApiKeyScope, ApiKeyEnvironment, CreateApiKeyInput } from 'src/types/api-key';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useApiKeyMutations } from 'src/hooks/use-api-keys';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

type Props = {
  merchantId: string;
  merchantNetwork: 'testnet' | 'mainnet';
  open: boolean;
  onClose: () => void;
};

type FormValues = {
  name: string;
  environment: ApiKeyEnvironment;
  showAdvanced: boolean;
  permissions: {
    read_subscriptions: boolean;
    read_payments: boolean;
    write_payments: boolean;
  };
  allowedDomains: string;
  expirationOption: 'never' | '7days' | '30days';
};

export function CreateApiKeyDialog({ merchantId, merchantNetwork, open, onClose }: Props) {
  const { createKey } = useApiKeyMutations(merchantId);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultEnvironment = merchantNetwork === 'mainnet' ? 'live' : 'test';

  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
      environment: defaultEnvironment,
      showAdvanced: false,
      permissions: {
        read_subscriptions: true,
        read_payments: true,
        write_payments: true,
      },
      allowedDomains: '',
      expirationOption: '30days',
    },
  });

  const {
    reset,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting },
  } = methods;

  const showAdvanced = watch('showAdvanced');
  const environment = watch('environment');
  const isLiveKey = environment === 'live';

  const onSubmit = handleSubmit(async (data) => {
    try {
      setFormError(null);
      
      const scopes: ApiKeyScope[] = [];
      if (data.permissions.read_subscriptions) scopes.push('read:subscriptions');
      if (data.permissions.read_payments) scopes.push('read:payments');
      if (data.permissions.write_payments) scopes.push('write:payments');

      let expires_at: string | null = null;
      if (data.expirationOption !== 'never') {
        const now = new Date();
        if (data.expirationOption === '7days') {
          now.setDate(now.getDate() + 7);
        } else if (data.expirationOption === '30days') {
          now.setDate(now.getDate() + 30);
        }
        expires_at = now.toISOString();
      }

      let allowed_domains: string[] | undefined;
      if (data.allowedDomains.trim()) {
        const domains = data.allowedDomains
          .split(/[,\n]+/)
          .map(d => d.trim())
          .filter(d => d.length > 0);
        
        const isLive = data.environment === 'live';
        for (const domain of domains) {
          const error = validateDomain(domain, isLive);
          if (error !== true) {
            setFormError(`Invalid domain "${domain}": ${error}`);
            return;
          }
        }
        
        allowed_domains = domains;
      }

      const input: CreateApiKeyInput = {
        merchant_id: merchantId,
        name: data.name,
        environment: data.environment,
        permissions: { scopes },
        allowed_domains,
        expires_at,
      };

      const result = await createKey(input);
      
      setNewApiKey(result.key);
    } catch (error) {
      console.error('Failed to create API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the API key';
      setFormError(errorMessage);
    }
  });

  const handleClose = () => {
    reset();
    setNewApiKey(null);
    onClose();
  };

  const handleCopyKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
    }
  };

  const validateDomain = (domain: string, isLive: boolean): string | true => {
    if (isLive && /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(domain.toLowerCase())) {
      return 'Localhost, IP addresses, and private networks not allowed for live keys';
    }
    
    if (domain.startsWith('*.')) {
      const baseDomain = domain.slice(2);
      if (!baseDomain || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(baseDomain)) {
        return 'Invalid wildcard domain format (e.g., *.example.com)';
      }

      const parts = baseDomain.split('.');
      const tld = parts[parts.length - 1].toLowerCase();
      if (!isValidTLD(tld)) {
        return `Invalid or unknown TLD in wildcard domain: .${tld}`;
      }
      if (parts.length < 2) {
        return 'Wildcard domain must include at least one subdomain level (e.g., *.example.com, not *.com)';
      }
    } else {
      if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(domain)) {
        return 'Invalid domain format (e.g., example.com or app.example.com)';
      }
      const parts = domain.split('.');
      const tld = parts[parts.length - 1].toLowerCase();
      if (!isValidTLD(tld)) {
        return `Invalid or unknown TLD: .${tld}`;
      }
      if (parts.length < 2) {
        return 'Domain must include a valid TLD (e.g., .com, .io)';
      }
    }
    if (domain.includes('..')) {
      return 'Consecutive dots not allowed';
    }
    if (domain.endsWith('-') || domain.includes('-.') || domain.includes('.-')) {
      return 'Invalid hyphen placement';
    }
    if (domain.length > 253) {
      return 'Domain name too long (max 253 characters)';
    }
    
    return true;
  };

  const isValidTLD = (tld: string): boolean => {
    const validTLDs = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
      'io', 'co', 'ai', 'app', 'dev', 'tech', 'cloud',
      'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in', 'br',
      'info', 'biz', 'name', 'pro', 'xyz', 'online', 'site',
      'store', 'shop', 'web', 'blog', 'news', 'media',
      'link', 'network', 'digital', 'systems', 'services'
    ];
    return validTLDs.includes(tld) || tld.length === 2;
  };

  return (
    <Dialog open={open} onClose={newApiKey ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {newApiKey ? 'API Key Created Successfully' : 'Create New API Key'}
      </DialogTitle>

      <DialogContent>
        {newApiKey ? (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Make sure to copy your API key now
              </Typography>
              <Typography variant="body2">
                You won&apos;t be able to see it again! Store it securely.
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
                  {newApiKey}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="solar:copy-bold" />}
                  onClick={handleCopyKey}
                >
                  Copy
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <Form methods={methods} onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="body2">{formError}</Typography>
                </Alert>
              )}

              <Field.Text
                name="name"
                label="Key Name"
                placeholder="My API Key"
                helperText="A descriptive name for this key"
              />

              <Field.Select name="environment" label="Environment">
                {(merchantNetwork === 'testnet' || merchantNetwork === 'mainnet') ? (
                  [
                    ...(merchantNetwork === 'testnet' ? [<MenuItem key="test" value="test">Test Mode</MenuItem>] : []),
                    ...(merchantNetwork === 'mainnet' ? [<MenuItem key="live" value="live">Live Mode</MenuItem>] : []),
                    ...(merchantNetwork === 'testnet' ? [<MenuItem key="live-disabled" value="live" disabled>Live Mode (Not available for testnet merchants)</MenuItem>] : []),
                    ...(merchantNetwork === 'mainnet' ? [<MenuItem key="test-disabled" value="test" disabled>Test Mode (Not available for mainnet merchants)</MenuItem>] : [])
                  ]
                ) : (
                  [
                    <MenuItem key="test" value="test">Test Mode</MenuItem>,
                    <MenuItem key="live" value="live">Live Mode</MenuItem>
                  ]
                )}
              </Field.Select>

              <Alert severity="info">
                <Typography variant="body2">
                  {merchantNetwork === 'mainnet'
                    ? 'Live keys can only be used on mainnet. Test keys can only be used on testnet.'
                    : 'Test keys can only be used on testnet. Live keys can only be used on mainnet.'}
                </Typography>
              </Alert>

              {isLiveKey && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Allowed Domains *
                  </Typography>
                  <Controller
                    name="allowedDomains"
                    control={control}
                    rules={{
                      required: isLiveKey ? 'At least one domain is required for live keys' : false,
                      validate: (value) => {
                        if (!isLiveKey || !value.trim()) return true;
                        const domains = value.split(/[,\n]+/).map(d => d.trim()).filter(d => d.length > 0);
                        if (domains.length === 0) return 'At least one domain is required';
                        return true;
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="example.com&#10;*.example.com&#10;app.example.com"
                        helperText={
                          error?.message || 
                          'Enter production domains where this key will be used (one per line or comma-separated). Supports wildcards: *.example.com. Localhost not allowed.'
                        }
                        error={!!error}
                      />
                    )}
                  />
                </Box>
              )}

              <Divider />

              {/* Advanced Options Toggle */}
              <Controller
                name="showAdvanced"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={
                      <Box>
                        <Typography variant="subtitle2">Advanced Options</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Configure permissions and expiration
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />

              {/* Advanced Options Content */}
              <Collapse in={showAdvanced}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                  {/* Permissions */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                      Permissions
                    </Typography>
                    <Box sx={{ pl: 1 }}>
                      <Controller
                        name="permissions.read_subscriptions"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label={
                              <Box>
                                <Typography variant="body2">Read Subscriptions</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  Check subscription status
                                </Typography>
                              </Box>
                            }
                          />
                        )}
                      />
                      <Controller
                        name="permissions.read_payments"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label={
                              <Box>
                                <Typography variant="body2">Read Payments</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  View payment history
                                </Typography>
                              </Box>
                            }
                          />
                        )}
                      />
                      <Controller
                        name="permissions.write_payments"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label={
                              <Box>
                                <Typography variant="body2">Write Payments</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  Record new payments
                                </Typography>
                              </Box>
                            }
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* Expiration */}
                  <Field.Select name="expirationOption" label="Expiration">
                    <MenuItem value="7days">7 days</MenuItem>
                    <MenuItem value="30days">30 days (recommended)</MenuItem>
                    <MenuItem value="never">Never (not recommended)</MenuItem>
                  </Field.Select>
                </Box>
              </Collapse>
            </Box>
          </Form>
        )}
      </DialogContent>

      <DialogActions>
        {newApiKey ? (
          <Button variant="contained" onClick={handleClose} fullWidth>
            Done
          </Button>
        ) : (
          <>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              loading={isSubmitting}
            >
              Create Key
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
