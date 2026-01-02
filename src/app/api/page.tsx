import { Box, Container, Typography, Card, CardContent, Stack, Chip, Alert } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

export default function APIPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center" textAlign="center">
          {/* Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => theme.customShadows.z20,
            }}
          >
            <Iconify icon={"solar:server-bold-duotone" as any} width={64} sx={{ color: 'common.white' }} />
          </Box>

          {/* Title */}
          <Box>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
              CasPay API
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Enterprise Payment Gateway API v1
            </Typography>
          </Box>

          {/* Status */}
          <Alert
            severity="success"
            icon={<Iconify icon="solar:check-circle-bold" width={24} />}
            sx={{ width: '100%', maxWidth: 400 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                API Status:
              </Typography>
              <Chip label="Operational" color="success" size="small" />
            </Stack>
          </Alert>

          {/* Base URL */}
          <Card sx={{ width: '100%', bgcolor: 'grey.900', color: 'common.white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.7, mb: 1, display: 'block' }}>
                Base URL
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
              >
                https://api.caspay.link/v1
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
            <Card
              component={RouterLink}
              href="/docs"
              sx={{
                flex: 1,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.customShadows.z20,
                },
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Iconify
                    icon="solar:document-text-bold-duotone"
                    width={40}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box textAlign="center">
                    <Typography variant="h6">Documentation</Typography>
                    <Typography variant="body2" color="text.secondary">
                      API reference & guides
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              component={RouterLink}
              href="/docs/api-reference"
              sx={{
                flex: 1,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.customShadows.z20,
                },
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Iconify
                    icon={"solar:code-bold-duotone" as any}
                    width={40}
                    sx={{ color: 'success.main' }}
                  />
                  <Box textAlign="center">
                    <Typography variant="h6">API Reference</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Endpoints & examples
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              component={RouterLink}
              href="/dashboard"
              sx={{
                flex: 1,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.customShadows.z20,
                },
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Iconify
                    icon="solar:widget-4-bold"
                    width={40}
                    sx={{ color: 'warning.main' }}
                  />
                  <Box textAlign="center">
                    <Typography variant="h6">Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage your account
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* API Features */}
          <Box sx={{ width: '100%', pt: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              API Features
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
              <Chip
                icon={<Iconify icon={"solar:wallet-money-bold-duotone" as any} width={16} />}
                label="Payment Processing"
                variant="outlined"
              />
              <Chip
                icon={<Iconify icon="solar:calendar-bold" width={16} />}
                label="Subscriptions"
                variant="outlined"
              />
              <Chip
                icon={<Iconify icon="solar:bell-bing-bold" width={16} />}
                label="Webhooks"
                variant="outlined"
              />
              <Chip
                icon={<Iconify icon="solar:shield-check-bold" width={16} />}
                label="Secure Authentication"
                variant="outlined"
              />
              <Chip
                icon={<Iconify icon={"solar:graph-bold" as any} width={16} />}
                label="Analytics"
                variant="outlined"
              />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
