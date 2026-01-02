'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { fData } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { updateUserProfile } from 'src/auth/context/casper/action';

// ----------------------------------------------------------------------

export type UpdateUserSchemaType = z.infer<typeof UpdateUserSchema>;

export const UpdateUserSchema = z.object({
  displayName: z.string().min(1, { message: 'Name is required!' }),
  email: schemaUtils.email(),
  photoURL: schemaUtils.file({ error: 'Avatar is required!' }).optional(),
});

// ----------------------------------------------------------------------

export function ProfileGeneral() {
  const { user, checkUserSession } = useAuthContext();

  const currentUser: UpdateUserSchemaType = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.avatarUrl || null,
  };

  const defaultValues: UpdateUserSchemaType = {
    displayName: '',
    email: '',
    photoURL: null,
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
    values: currentUser,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!user?.publicKey) {
        toast.error('User not authenticated');
        return;
      }

      // Update user profile in Supabase
      await updateUserProfile(user.publicKey, {
        full_name: data.displayName,
        email: data.email,
        avatar_url: typeof data.photoURL === 'string' ? data.photoURL : undefined,
      });

      // Refresh user session
      await checkUserSession?.();

      toast.success('Profile updated successfully!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {/* Onboarding info */}
      {(!user?.displayName || !user?.email) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome! Please complete your profile information.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> Max size: {fData(3145728)}
                </Typography>
              }
            />

            {/* Wallet Info */}
            <Divider sx={{ my: 3 }} />
            
            <Stack spacing={1} sx={{ textAlign: 'left' }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Wallet Information
              </Typography>
              
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Public Key:
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {user?.publicKey?.slice(0, 20)}...{user?.publicKey?.slice(-10)}
                </Typography>
              </Stack>

              {user?.walletProvider && (
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Wallet:
                  </Typography>
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                    {user.walletProvider}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Field.Text 
                name="displayName" 
                label="Full Name" 
                required
              />
              <Field.Text 
                name="email" 
                label="Email Address" 
                required
                type="email"
              />
            </Stack>

            <Stack spacing={3} sx={{ mt: 3, alignItems: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
