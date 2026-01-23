import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import type { PayLinkWithProduct, FulfillmentMetadata } from 'src/types/paylink';

import { usePayLinkMutations } from 'src/hooks/use-paylinks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const PayLinkFormSchema = z.object({
  wallet_address: z.string().optional(),
  payment_methods: z.array(z.enum(['wallet', 'fiat', 'bridge'])).optional(),
  network: z.enum(['testnet', 'mainnet']).optional(),
  is_active: z.boolean(),
  expires_at: z.string().optional(),
  custom_success_url: z.string().url().optional().or(z.literal('')),
  custom_message: z.string().optional(),
  custom_button_text: z.string().optional(),
  max_uses: z.number().int().min(1).optional().nullable(),
  fulfillment_type: z.enum([
    'none',
    'digital_download',
    'license_key',
    'service_access',
    'donation',
    'coupon_voucher',
    'event_ticket',
    'content_access',
    'custom_message',
  ]).optional(),
  redirect_delay: z.number().min(0).max(60).optional(),
  download_url: z.string().url().optional().or(z.literal('')),
  download_file_name: z.string().optional(),
  download_expires_hours: z.number().int().min(0).optional(),
  license_key: z.string().optional(),
  license_instructions: z.string().optional(),
  service_access_url: z.string().url().optional().or(z.literal('')),
  service_username: z.string().optional(),
  service_instructions: z.string().optional(),
  donation_campaign: z.string().optional(),
  donation_thank_you: z.string().optional(),
  coupon_code: z.string().optional(),
  coupon_discount_info: z.string().optional(),
  coupon_expires_at: z.string().optional(),
  event_name: z.string().optional(),
  event_date: z.string().optional(),
  event_ticket_code: z.string().optional(),
  event_venue: z.string().optional(),
  event_additional_info: z.string().optional(),
  content_url: z.string().url().optional().or(z.literal('')),
  content_access_days: z.number().int().min(0).optional(),
  content_instructions: z.string().optional(),
  message_title: z.string().optional(),
  message_body: z.string().optional(),
});

type PayLinkFormType = z.infer<typeof PayLinkFormSchema>;

// ----------------------------------------------------------------------

type Props = {
  paylink: PayLinkWithProduct;
  merchantId: string;
};

export function PayLinkEditForm({ paylink, merchantId }: Props) {
  const router = useRouter();
  const { updatePayLink } = usePayLinkMutations(merchantId);

  const fulfillmentMetadata = paylink.metadata as FulfillmentMetadata | null;
  const fulfillmentType = fulfillmentMetadata?.fulfillment_type || 'none';

  const methods = useForm<PayLinkFormType>({
    resolver: zodResolver(PayLinkFormSchema),
    defaultValues: {
      wallet_address: paylink.wallet_address,
      payment_methods: paylink.payment_methods as ('wallet' | 'fiat' | 'bridge')[] | undefined,
      network: paylink.network as 'testnet' | 'mainnet',
      is_active: paylink.is_active,
      expires_at: paylink.expires_at ? new Date(paylink.expires_at).toISOString().slice(0, 16) : '',
      custom_success_url: paylink.custom_success_url || '',
      custom_message: paylink.custom_message || '',
      custom_button_text: paylink.custom_button_text,
      max_uses: paylink.max_uses || undefined,
      fulfillment_type: fulfillmentType,
      redirect_delay: fulfillmentMetadata?.redirect_delay || 10,
      download_url: fulfillmentMetadata?.digital_download?.url || '',
      download_file_name: fulfillmentMetadata?.digital_download?.file_name || '',
      download_expires_hours: fulfillmentMetadata?.digital_download?.expires_hours || 0,
      license_key: fulfillmentMetadata?.license_key?.key || '',
      license_instructions: fulfillmentMetadata?.license_key?.instructions || '',
      service_access_url: fulfillmentMetadata?.service_access?.access_url || '',
      service_username: fulfillmentMetadata?.service_access?.username || '',
      service_instructions: fulfillmentMetadata?.service_access?.instructions || '',
      donation_campaign: fulfillmentMetadata?.donation?.campaign_name || '',
      donation_thank_you: fulfillmentMetadata?.donation?.thank_you_note || '',
      coupon_code: fulfillmentMetadata?.coupon_voucher?.coupon_code || '',
      coupon_discount_info: fulfillmentMetadata?.coupon_voucher?.discount_info || '',
      coupon_expires_at: fulfillmentMetadata?.coupon_voucher?.expires_at || '',
      event_name: fulfillmentMetadata?.event_ticket?.event_name || '',
      event_date: fulfillmentMetadata?.event_ticket?.event_date || '',
      event_ticket_code: fulfillmentMetadata?.event_ticket?.ticket_code || '',
      event_venue: fulfillmentMetadata?.event_ticket?.venue || '',
      event_additional_info: fulfillmentMetadata?.event_ticket?.additional_info || '',
      content_url: fulfillmentMetadata?.content_access?.content_url || '',
      content_access_days: fulfillmentMetadata?.content_access?.access_duration_days || 0,
      content_instructions: fulfillmentMetadata?.content_access?.instructions || '',
      message_title: fulfillmentMetadata?.custom_message?.title || '',
      message_body: fulfillmentMetadata?.custom_message?.message || '',
    },
  });

  const { handleSubmit, watch, setValue } = methods;
  const customSuccessUrl = watch('custom_success_url');
  const selectedPaymentMethods = watch('payment_methods');
  const selectedNetwork = watch('network');

  useEffect(() => {
    if (selectedPaymentMethods?.includes('bridge') && selectedNetwork === 'testnet') {
      setValue('network', 'mainnet');
    }
  }, [selectedPaymentMethods, selectedNetwork, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updatedMetadata: FulfillmentMetadata = {
        fulfillment_type: data.fulfillment_type || 'none',
        redirect_delay: data.redirect_delay || 10,
      };

      if (data.fulfillment_type === 'digital_download' && data.download_url) {
        updatedMetadata.digital_download = {
          url: data.download_url,
          file_name: data.download_file_name,
          expires_hours: data.download_expires_hours || 0,
        };
      } else if (data.fulfillment_type === 'license_key' && data.license_key) {
        updatedMetadata.license_key = {
          key: data.license_key,
          instructions: data.license_instructions,
        };
      } else if (data.fulfillment_type === 'service_access' && data.service_access_url) {
        updatedMetadata.service_access = {
          access_url: data.service_access_url,
          username: data.service_username,
          instructions: data.service_instructions,
        };
      } else if (data.fulfillment_type === 'donation') {
        updatedMetadata.donation = {
          campaign_name: data.donation_campaign,
          thank_you_note: data.donation_thank_you,
        };
      } else if (data.fulfillment_type === 'coupon_voucher' && data.coupon_code) {
        updatedMetadata.coupon_voucher = {
          coupon_code: data.coupon_code,
          discount_info: data.coupon_discount_info,
          expires_at: data.coupon_expires_at,
        };
      } else if (data.fulfillment_type === 'event_ticket' && data.event_name && data.event_date && data.event_ticket_code) {
        updatedMetadata.event_ticket = {
          event_name: data.event_name,
          event_date: data.event_date,
          ticket_code: data.event_ticket_code,
          venue: data.event_venue,
          additional_info: data.event_additional_info,
        };
      } else if (data.fulfillment_type === 'content_access' && data.content_url) {
        updatedMetadata.content_access = {
          content_url: data.content_url,
          access_duration_days: data.content_access_days || 0,
          instructions: data.content_instructions,
        };
      } else if (data.fulfillment_type === 'custom_message' && data.message_title && data.message_body) {
        updatedMetadata.custom_message = {
          title: data.message_title,
          message: data.message_body,
        };
      }

      await updatePayLink(paylink.id, {
        wallet_address: data.wallet_address,
        payment_methods: data.payment_methods,
        network: data.network,
        is_active: data.is_active,
        expires_at: data.expires_at || undefined,
        custom_success_url: data.custom_success_url || undefined,
        custom_message: data.custom_message,
        custom_button_text: data.custom_button_text,
        max_uses: data.max_uses ?? undefined,
        metadata: updatedMetadata,
      });

      toast.success('PayLink updated successfully!');
      router.push(paths.dashboard.payLink.root);
    } catch (error) {
      console.error('PayLink update error:', error);
      toast.error('Failed to update PayLink');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* Basic Settings */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Basic Settings
            </Typography>

            <Field.Switch name="is_active" label="Active" />

            <Field.Text 
              name="wallet_address" 
              label="Wallet Address" 
              helperText="Recipient wallet address for payments"
            />
          </Stack>
        </Card>

        {/* Payment Settings */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Payment Settings
            </Typography>

            <Field.MultiCheckbox
              name="payment_methods"
              label="Payment Methods"
              options={[
                { label: 'Wallet (Crypto)', value: 'wallet' },
                { label: 'Fiat (Credit Card) - Coming Soon', value: 'fiat' },
                { label: 'Multi-Chain Bridge', value: 'bridge' },
              ]}
              helperText="Select allowed payment methods. Wallet payments are fully functional, fiat integration coming soon."
              row
              sx={{ gap: 2, alignItems: 'center' }}
            />

            <Alert severity="info" sx={{ py: 1 }}>
              <Typography variant="caption">
                <strong>Wallet Payment:</strong> Fully active - customers can pay with CSPR via Casper Wallet
                <br />
                <strong>Fiat Payment:</strong> Display option available, integration under development
                <br />
                <strong>Multi-Chain Bridge:</strong> Accept payments from other chains (BTC, ETH, USDC, etc.) - Mainnet only
              </Typography>
            </Alert>

            <Field.Select name="network" label="Network">
              <MenuItem value="testnet">Testnet</MenuItem>
              <MenuItem value="mainnet">Mainnet</MenuItem>
            </Field.Select>

            {selectedPaymentMethods?.includes('bridge') && (
              <Alert severity="warning" sx={{ py: 1 }}>
                <Typography variant="caption">
                  <strong>Important:</strong> Multi-Chain Bridge only works on Mainnet. If you select Testnet, bridge payment option will be hidden from customers.
                </Typography>
              </Alert>
            )}

            <Field.DateTimePicker
              name="expires_at"
              label="Expiration Date (Optional)"
            />

            <Field.Text
              name="max_uses"
              label="Max Uses (Optional)"
              type="number"
              helperText="Leave empty for unlimited"
            />
          </Stack>
        </Card>

        {/* Customization */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Customization
            </Typography>

            <Field.Text name="custom_button_text" label="Button Text" />

            <Field.Text
              name="custom_message"
              label="Custom Message (Optional)"
              multiline
              rows={3}
              helperText="Display a custom message on the payment page"
            />

            <Stack direction="row" spacing={2}>
              <Field.Text
                name="custom_success_url"
                label="Success Redirect URL (Optional)"
                placeholder="https://yoursite.com/success"
                helperText="Redirect users here after successful payment"
                sx={{ flex: 7 }}
              />
              
              <Field.Select 
                name="redirect_delay" 
                label="Redirect After"
                disabled={!customSuccessUrl}
                sx={{ flex: 3 }}
              >
                <MenuItem value={0}>Instant</MenuItem>
                <MenuItem value={3}>3 seconds</MenuItem>
                <MenuItem value={5}>5 seconds</MenuItem>
                <MenuItem value={10}>10 seconds</MenuItem>
                <MenuItem value={15}>15 seconds</MenuItem>
                <MenuItem value={30}>30 seconds</MenuItem>
              </Field.Select>
            </Stack>
          </Stack>
        </Card>

       <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Post-Payment Fulfillment
            </Typography>

            <Alert severity="info" sx={{ py: 1 }}>
              <Typography variant="caption">
                Current fulfillment type: <strong>{fulfillmentType}</strong>. To change fulfillment settings, please create a new PayLink.
              </Typography>
            </Alert>

            <Field.Select name="fulfillment_type" label="Fulfillment Type" disabled>
              <MenuItem value="none">➖ None - Just payment confirmation</MenuItem>
              <MenuItem value="digital_download">📥 Digital Download</MenuItem>
              <MenuItem value="license_key">🔑 License Key</MenuItem>
              <MenuItem value="service_access">🌐 Service Access</MenuItem>
              <MenuItem value="donation">💝 Donation / Fundraising</MenuItem>
              <MenuItem value="coupon_voucher">🎟️ Coupon / Voucher</MenuItem>
              <MenuItem value="event_ticket">🎫 Event Ticket</MenuItem>
              <MenuItem value="content_access">📚 Content Access</MenuItem>
              <MenuItem value="custom_message">💬 Custom Message</MenuItem>
            </Field.Select>
          </Stack>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained">
            Update PayLink
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
