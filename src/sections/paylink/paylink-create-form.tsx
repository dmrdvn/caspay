import * as z from 'zod';
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

import { useAuthContext } from 'src/auth/hooks';
import { useProducts } from 'src/hooks/use-products';
import { usePayLinkMutations } from 'src/hooks/use-paylinks';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import type { FulfillmentType, FulfillmentMetadata } from 'src/types/paylink';

// ----------------------------------------------------------------------

const PayLinkFormSchema = z.object({
  product_id: z.string().min(1, { message: 'Product is required' }),
  wallet_address: z.string().optional(),
  payment_methods: z.array(z.enum(['wallet', 'fiat'])).optional(),
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
  merchantId: string;
};

export function PayLinkCreateForm({ merchantId }: Props) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { products } = useProducts(merchantId);
  const { createPayLink } = usePayLinkMutations(merchantId);

  const methods = useForm<PayLinkFormType>({
    resolver: zodResolver(PayLinkFormSchema),
    defaultValues: {
      product_id: '',
      wallet_address: user?.publicKey || '',
      payment_methods: ['wallet', 'fiat'],
      expires_at: '',
      custom_success_url: '',
      custom_message: '',
      custom_button_text: 'Pay Now',
      max_uses: undefined,
      fulfillment_type: 'none',
      redirect_delay: 10,
      download_url: '',
      download_file_name: '',
      download_expires_hours: 0,
      license_key: '',
      license_instructions: '',
      service_access_url: '',
      service_username: '',
      service_instructions: '',
      donation_campaign: '',
      donation_thank_you: '',
      coupon_code: '',
      coupon_discount_info: '',
      coupon_expires_at: '',
      event_name: '',
      event_date: '',
      event_ticket_code: '',
      event_venue: '',
      event_additional_info: '',
      content_url: '',
      content_access_days: 0,
      content_instructions: '',
      message_title: '',
      message_body: '',
    },
  });

  const { handleSubmit, watch } = methods;
  const selectedFulfillmentType = watch('fulfillment_type');
  const customSuccessUrl = watch('custom_success_url');

  const onSubmit = handleSubmit(async (data) => {
    try {
      const fulfillmentMetadata: FulfillmentMetadata = {
        fulfillment_type: data.fulfillment_type || 'none',
      };

      if (data.custom_success_url) {
        fulfillmentMetadata.redirect_delay = data.redirect_delay || 10;
      }

      if (data.fulfillment_type === 'digital_download' && data.download_url) {
        fulfillmentMetadata.digital_download = {
          url: data.download_url,
          file_name: data.download_file_name,
          expires_hours: data.download_expires_hours || 0,
        };
      } else if (data.fulfillment_type === 'license_key' && data.license_key) {
        fulfillmentMetadata.license_key = {
          key: data.license_key,
          instructions: data.license_instructions,
        };
      } else if (data.fulfillment_type === 'service_access' && data.service_access_url) {
        fulfillmentMetadata.service_access = {
          access_url: data.service_access_url,
          username: data.service_username,
          instructions: data.service_instructions,
        };
      } else if (data.fulfillment_type === 'donation') {
        fulfillmentMetadata.donation = {
          campaign_name: data.donation_campaign,
          thank_you_note: data.donation_thank_you,
        };
      } else if (data.fulfillment_type === 'coupon_voucher' && data.coupon_code) {
        fulfillmentMetadata.coupon_voucher = {
          coupon_code: data.coupon_code,
          discount_info: data.coupon_discount_info,
          expires_at: data.coupon_expires_at,
        };
      } else if (data.fulfillment_type === 'event_ticket' && data.event_name && data.event_date && data.event_ticket_code) {
        fulfillmentMetadata.event_ticket = {
          event_name: data.event_name,
          event_date: data.event_date,
          ticket_code: data.event_ticket_code,
          venue: data.event_venue,
          additional_info: data.event_additional_info,
        };
      } else if (data.fulfillment_type === 'content_access' && data.content_url) {
        fulfillmentMetadata.content_access = {
          content_url: data.content_url,
          access_duration_days: data.content_access_days || 0,
          instructions: data.content_instructions,
        };
      } else if (data.fulfillment_type === 'custom_message' && data.message_title && data.message_body) {
        fulfillmentMetadata.custom_message = {
          title: data.message_title,
          message: data.message_body,
        };
      }

      const result = await createPayLink({
        product_id: data.product_id,
        wallet_address: data.wallet_address,
        payment_methods: data.payment_methods,
        expires_at: data.expires_at,
        custom_success_url: data.custom_success_url,
        custom_message: data.custom_message,
        custom_button_text: data.custom_button_text,
        max_uses: data.max_uses ?? undefined,
        metadata: fulfillmentMetadata,
      });

      toast.success(`PayLink created! ${result.public_url}`);
      router.push(paths.dashboard.payLink.root);
    } catch (error) {
      console.error('PayLink creation error:', error);
      toast.error('Failed to create PayLink');
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

            <Field.Select name="product_id" label="Select Product" required>
              <MenuItem value="">Select a product</MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} - {product.price} {product.currency}
                </MenuItem>
              ))}
            </Field.Select>

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
              ]}
              helperText="Select allowed payment methods. Wallet payments are fully functional, fiat integration coming soon."
            />

            <Alert severity="info" sx={{ py: 1 }}>
              <Typography variant="caption">
                <strong>Wallet Payment:</strong> Fully active - customers can pay with CSPR via Casper Wallet
                <br />
                <strong>Fiat Payment:</strong> Display option available, integration under development
              </Typography>
            </Alert>

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

            <Field.Text
              name="custom_button_text"
              label="Button Text"
            />

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
                Choose what happens after successful payment. You can deliver digital goods, show custom messages, or redirect to your site.
              </Typography>
            </Alert>

            <Field.Select name="fulfillment_type" label="Fulfillment Type">
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

            {selectedFulfillmentType === 'digital_download' && (
              <Stack spacing={2}>
                <Field.Text
                  name="download_url"
                  label="Download URL"
                  placeholder="https://files.example.com/product.zip"
                  required
                />
                <Field.Text
                  name="download_file_name"
                  label="File Name (Optional)"
                  placeholder="product-v1.0.zip"
                />
                <Field.Text
                  name="download_expires_hours"
                  label="Expires After (Hours)"
                  type="number"
                  helperText="0 = unlimited access"
                />
              </Stack>
            )}

            {selectedFulfillmentType === 'license_key' && (
              <Stack spacing={2}>
                <Field.Text
                  name="license_key"
                  label="License Key"
                  placeholder="XXXX-YYYY-ZZZZ-WWWW"
                  required
                />
                <Field.Text
                  name="license_instructions"
                  label="Instructions (Optional)"
                  multiline
                  rows={2}
                  placeholder="Enter this key in the activation dialog"
                />
              </Stack>
            )}

            {selectedFulfillmentType === 'service_access' && (
              <Stack spacing={2}>
                <Field.Text
                  name="service_access_url"
                  label="Access URL"
                  placeholder="https://portal.example.com"
                  required
                />
                <Field.Text
                  name="service_username"
                  label="Username (Optional)"
                  placeholder="Will be sent via email"
                />
                <Field.Text
                  name="service_instructions"
                  label="Instructions (Optional)"
                  multiline
                  rows={2}
                />
              </Stack>
            )}

            {selectedFulfillmentType === 'donation' && (
              <Stack spacing={2}>
                <Field.Text
                  name="donation_campaign"
                  label="Campaign Name (Optional)"
                  placeholder="School Fundraising 2024"
                />
                <Field.Text
                  name="donation_thank_you"
                  label="Thank You Note"
                  multiline
                  rows={3}
                  placeholder="Thank you for your generous donation!"
                />
              </Stack>
            )}

            {selectedFulfillmentType === 'coupon_voucher' && (
              <Stack spacing={2}>
                <Field.Text
                  name="coupon_code"
                  label="Coupon Code"
                  placeholder="SAVE20"
                  required
                />
                <Field.Text
                  name="coupon_discount_info"
                  label="Discount Info (Optional)"
                  placeholder="20% off on next purchase"
                />
                <Field.DateTimePicker
                  name="coupon_expires_at"
                  label="Expires At (Optional)"
                />
              </Stack>
            )}

            {selectedFulfillmentType === 'event_ticket' && (
              <Stack spacing={2}>
                <Field.Text
                  name="event_name"
                  label="Event Name"
                  placeholder="Annual Conference 2024"
                  required
                />
                <Field.DateTimePicker
                  name="event_date"
                  label="Event Date"
                />
                <Field.Text
                  name="event_ticket_code"
                  label="Ticket Code"
                  placeholder="TICKET-001"
                  required
                />
                <Field.Text
                  name="event_venue"
                  label="Venue (Optional)"
                  placeholder="Conference Center, NYC"
                />
                <Field.Text
                  name="event_additional_info"
                  label="Additional Info (Optional)"
                  multiline
                  rows={2}
                />
              </Stack>
            )}

            {selectedFulfillmentType === 'content_access' && (
              <Stack spacing={2}>
                <Field.Text
                  name="content_url"
                  label="Content URL"
                  placeholder="https://courses.example.com/premium"
                  required
                />
                <Field.Text
                  name="content_access_days"
                  label="Access Duration (Days)"
                  type="number"
                  helperText="0 = lifetime access"
                />
                <Field.Text
                  name="content_instructions"
                  label="Instructions (Optional)"
                  multiline
                  rows={2}
                />
              </Stack>
            )}

            {selectedFulfillmentType === 'custom_message' && (
              <Stack spacing={2}>
                <Field.Text
                  name="message_title"
                  label="Message Title"
                  placeholder="Thank You!"
                  required
                />
                <Field.Text
                  name="message_body"
                  label="Message Body"
                  multiline
                  rows={4}
                  placeholder="Your payment was successful. We appreciate your business!"
                  required
                />
              </Stack>
            )}

            {customSuccessUrl && selectedFulfillmentType !== 'none' && (
              <Alert severity="info" sx={{ py: 1 }}>
                <Typography variant="caption">
                  <strong>Note:</strong> After displaying fulfillment content, users will be redirected to your success URL.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Card>


        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained">
            Create PayLink
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
