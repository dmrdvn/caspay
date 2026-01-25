import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';

import { Iconify } from 'src/components/iconify';

const VIDEOS = [
  {
    id: 'esajmrQf0Ww',
    title: 'Create Merchant Account',
    description: 'Set up your merchant profile',
  },
  {
    id: 'XEo5mDBgzjw',
    title: 'Create Products & Subscription Plans',
    description: 'Configure your offerings',
  },
  {
    id: '-g05mAiyzN4',
    title: 'CasPay SDK Integration Test',
    description: 'Test SDK in your dApp',
  },
  {
    id: 'ecBzGgIBsZ8',
    title: 'PayLink Test & Usage',
    description: 'Create and share payment links',
  },
];

export function MerchantVideoTutorials() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Getting Started with CasPay"
          subheader="Step-by-step video tutorials to help you get started"
        />
        <CardContent>
          <Grid container spacing={2}>
            {VIDEOS.map((video) => (
              <Grid key={video.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    position: 'relative',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s',
                    
                  }}
                >
                  <CardActionArea 
                    onClick={() => setSelectedVideo(video.id)}
                    sx={{
                      '&:hover .play-button': {
                        transform: 'translate(-50%, -50%) scale(1.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '56.25%',
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Box
                        component="img"
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Box
                        className="play-button"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          width: 56,
                          height: 56,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Iconify icon="solar:play-bold" width={32} sx={{ color: 'common.white' }} />
                      </Box>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle2" noWrap>
                        {video.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {video.description}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedVideo)}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { bgcolor: 'transparent', boxShadow: 'none' },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: -40,
              right: 0,
              color: 'common.white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <Iconify icon="solar:close-circle-bold" width={24} />
          </IconButton>
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'background.neutral',
            }}
          >
            {selectedVideo && (
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="Video Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
              />
            )}
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
