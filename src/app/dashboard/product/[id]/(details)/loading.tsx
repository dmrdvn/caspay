'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export default function Loading() {
  return (
    <DashboardContent>
      {/* Toolbar Skeleton */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: { xs: 3, md: 5 } }}>
        <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
        <Box sx={{ flexGrow: 1 }} />
        <Skeleton variant="rectangular" width={40} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Box>

      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        {/* Image Carousel Skeleton */}
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          <Skeleton variant="rectangular" sx={{ width: '100%', height: 480, borderRadius: 2 }} />
        </Grid>

        {/* Summary Skeleton */}
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <Box sx={{ pt: 3 }}>
            <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={120} height={48} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={1} sx={{ mb: 3 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 1 }} />
          </Box>
        </Grid>
      </Grid>

      {/* Features Section Skeleton */}
      <Box sx={{ my: 10 }}>
        <Grid container spacing={5}>
          {[1, 2, 3].map((item) => (
            <Grid key={item} size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="text" width="60%" height={24} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tabs Card Skeleton */}
      <Skeleton variant="rectangular" sx={{ width: '100%', height: 400, borderRadius: 2 }} />
    </DashboardContent>
  );
}
