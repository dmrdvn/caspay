import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
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

// ----------------------------------------------------------------------

const PayLinkFormSchema = z.object({
  product_id: z.string().min(1, { message: 'Product is required' }),
  wallet_address: z.string().optional(),
  fee_percentage: z.number().min(0).max(100).optional(),
  payment_methods: z.array(z.enum(['wallet', 'fiat'])).optional(),
  expires_at: z.string().optional(),
  custom_success_url: z.string().url().optional().or(z.literal('')),
  custom_message: z.string().optional(),
  custom_button_text: z.string().optional(),
  max_uses: z.number().int().min(1).optional(),
  metadata: z.string().optional(),
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
      fee_percentage: 2.0,
      payment_methods: ['wallet', 'fiat'],
      expires_at: '',
      custom_success_url: '',
      custom_message: '',
      custom_button_text: 'Pay Now',
      max_uses: undefined,
      metadata: undefined,
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Parse metadata if provided
      let parsedMetadata: Record<string, any> | undefined;
      if (data.metadata) {
        try {
          parsedMetadata = JSON.parse(data.metadata);
        } catch {
          toast.error('Invalid JSON format for metadata');
          return;
        }
      }

      const result = await createPayLink({
        product_id: data.product_id,
        wallet_address: data.wallet_address,
        fee_percentage: data.fee_percentage,
        payment_methods: data.payment_methods,
        expires_at: data.expires_at,
        custom_success_url: data.custom_success_url,
        custom_message: data.custom_message,
        custom_button_text: data.custom_button_text,
        max_uses: data.max_uses,
        metadata: parsedMetadata,
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

            <Field.Text
              name="fee_percentage"
              label="Fee Percentage"
              type="number"
              helperText="Platform fee (0-100%)"
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
                { label: 'Fiat (Credit Card)', value: 'fiat' },
              ]}
              helperText="Select allowed payment methods"
            />

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

            <Field.Text
              name="custom_success_url"
              label="Success Redirect URL (Optional)"
              placeholder="https://yoursite.com/success"
              helperText="Redirect users here after successful payment"
            />
          </Stack>
        </Card>

        {/* Advanced */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Advanced Settings
            </Typography>

            <Field.Text
              name="metadata"
              label="Metadata (Optional)"
              multiline
              rows={4}
              placeholder='{"key": "value"}'
              helperText="JSON format for custom data"
            />
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
