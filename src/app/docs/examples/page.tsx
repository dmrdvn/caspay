'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Button,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip title={copied ? 'Kopyalandı!' : 'Kopyala'}>
      <IconButton onClick={handleCopy} size="small" sx={{ color: 'inherit' }}>
        <Iconify icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} width={18} />
      </IconButton>
    </Tooltip>
  );
}

export default function ExamplesPage() {
  const completePaymentFlow = `import CasPay from '@caspay/sdk';

// Initialize SDK
const caspay = new CasPay({
  apiKey: 'your_api_key_here',
  environment: 'production'
});

// Create payment link
async function createPaymentLink() {
  try {
    const payment = await caspay.payments.create({
      product_id: 'prod_123abc',
      amount: 100.00,
      currency: 'CSPR',
      customer_email: 'customer@example.com',
      success_url: 'https://yoursite.com/success',
      cancel_url: 'https://yoursite.com/cancel',
      metadata: {
        order_id: 'order_12345'
      }
    });

    console.log('Payment link:', payment.checkout_url);
    return payment;
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error;
  }
}

// Check payment status
async function checkPaymentStatus(paymentId: string) {
  try {
    const payment = await caspay.payments.get(paymentId);
    
    switch (payment.status) {
      case 'completed':
        console.log('Payment successful!');
        // Complete the order
        break;
      case 'pending':
        console.log('Payment pending...');
        break;
      case 'failed':
        console.log('Payment failed');
        // Handle error
        break;
    }
    
    return payment;
  } catch (error) {
    console.error('Payment query error:', error);
    throw error;
  }
}

// Usage
createPaymentLink()
  .then(payment => {
    console.log('Payment ID:', payment.id);
    // Redirect user to checkout_url
    window.location.href = payment.checkout_url;
  });`;

  const subscriptionExample = `import CasPay from '@caspay/sdk';

const caspay = new CasPay({
  apiKey: 'your_api_key_here',
  environment: 'production'
});

// Create subscription plan
async function createSubscriptionPlan() {
  try {
    const plan = await caspay.subscriptions.createPlan({
      name: 'Premium Plan',
      description: 'Monthly premium membership',
      amount: 29.99,
      currency: 'CSPR',
      interval: 'monthly',
      features: ['Unlimited access', 'Priority support', 'API access']
    });

    console.log('Plan created:', plan.id);
    return plan;
  } catch (error) {
    console.error('Plan creation error:', error);
    throw error;
  }
}

// Subscribe customer to plan
async function subscribeCustomer(planId: string, customerEmail: string) {
  try {
    const subscription = await caspay.subscriptions.create({
      plan_id: planId,
      customer_email: customerEmail,
      trial_days: 14, // 14-day trial period
      success_url: 'https://yoursite.com/welcome',
      cancel_url: 'https://yoursite.com/pricing'
    });

    console.log('Subscription created:', subscription.id);
    return subscription;
  } catch (error) {
    console.error('Subscription creation error:', error);
    throw error;
  }
}

// Cancel subscription
async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await caspay.subscriptions.cancel(subscriptionId, {
      at_period_end: true // Cancel at period end
    });

    console.log('Subscription canceled');
    return subscription;
  } catch (error) {
    console.error('Cancellation error:', error);
    throw error;
  }
}

// Check subscription status
async function checkSubscriptionStatus(subscriptionId: string) {
  try {
    const subscription = await caspay.subscriptions.get(subscriptionId);
    
    if (subscription.status === 'active') {
      console.log('Subscription active');
      console.log('Next payment:', subscription.next_payment_date);
    } else if (subscription.status === 'canceled') {
      console.log('Subscription canceled');
    }
    
    return subscription;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}`;

  const webhookExample = `// Express.js example
import express from 'express';
import crypto from 'crypto';

const app = express();

// Webhook endpoint
app.post('/webhooks/caspay', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-caspay-signature'] as string;
  const webhookSecret = process.env.CASPAY_WEBHOOK_SECRET!;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Unauthorized');
  }

  // Parse event
  const event = JSON.parse(req.body.toString());

  // Handle event by type
  switch (event.type) {
    case 'payment.completed':
      handlePaymentCompleted(event.data);
      break;
    
    case 'payment.failed':
      handlePaymentFailed(event.data);
      break;
    
    case 'subscription.created':
      handleSubscriptionCreated(event.data);
      break;
    
    case 'subscription.canceled':
      handleSubscriptionCanceled(event.data);
      break;
    
    case 'subscription.payment_succeeded':
      handleSubscriptionPayment(event.data);
      break;
    
    default:
      console.log(\`Unknown event type: \${event.type}\`);
  }

  // Acknowledge webhook
  res.json({ received: true });
});

// Event handler functions
async function handlePaymentCompleted(payment: any) {
  console.log('Payment completed:', payment.id);
  
  // Update database
  await database.orders.update({
    where: { id: payment.metadata.order_id },
    data: { 
      status: 'paid',
      payment_id: payment.id,
      paid_at: new Date()
    }
  });
  
  // Send email to customer
  await sendEmail({
    to: payment.customer_email,
    subject: 'Payment received',
    template: 'payment-success',
    data: { payment }
  });
}

async function handlePaymentFailed(payment: any) {
  console.log('Payment failed:', payment.id);
  
  // Update order
  await database.orders.update({
    where: { id: payment.metadata.order_id },
    data: { status: 'payment_failed' }
  });
  
  // Notify customer
  await sendEmail({
    to: payment.customer_email,
    subject: 'Payment failed',
    template: 'payment-failed',
    data: { payment }
  });
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('New subscription:', subscription.id);
  
  // Grant premium access to user
  await database.users.update({
    where: { email: subscription.customer_email },
    data: { 
      subscription_id: subscription.id,
      plan: subscription.plan_id,
      subscription_status: 'active'
    }
  });
}

async function handleSubscriptionCanceled(subscription: any) {
  console.log('Subscription canceled:', subscription.id);
  
  // Remove premium access
  await database.users.update({
    where: { subscription_id: subscription.id },
    data: { 
      subscription_status: 'canceled',
      premium_until: subscription.current_period_end
    }
  });
}

async function handleSubscriptionPayment(subscription: any) {
  console.log('Subscription payment received:', subscription.id);
  
  // Update payment date
  await database.users.update({
    where: { subscription_id: subscription.id },
    data: { 
      last_payment_date: new Date(),
      next_payment_date: subscription.next_payment_date
    }
  });
}

app.listen(3000, () => {
  console.log('Webhook server running: http://localhost:3000');
});`;

  const nextjsExample = `// Next.js App Router example
// app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CasPay from '@caspay/sdk';

const caspay = new CasPay({
  apiKey: process.env.NEXT_PUBLIC_CASPAY_API_KEY!,
  environment: 'production'
});

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Create payment link
      const payment = await caspay.payments.create({
        product_id: productId,
        amount: 99.99,
        currency: 'CSPR',
        customer_email: 'customer@example.com',
        success_url: \`\${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}\`,
        cancel_url: \`\${window.location.origin}/checkout\`,
        metadata: {
          product_name: 'Premium Package',
          user_id: 'user_123'
        }
      });

      // Redirect to checkout page
      window.location.href = payment.checkout_url;
    } catch (err) {
      setError('Unable to start payment. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <button
        onClick={() => handleCheckout('prod_premium_package')}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Buy Now - 99.99 CSPR'}
      </button>
    </div>
  );
}

// app/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CasPay from '@caspay/sdk';

const caspay = new CasPay({
  apiKey: process.env.NEXT_PUBLIC_CASPAY_API_KEY!,
  environment: 'production'
});

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Fetch payment details
      caspay.payments.get(sessionId)
        .then(data => {
          setPayment(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Payment fetch error:', err);
          setLoading(false);
        });
    }
  }, [searchParams]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!payment) {
    return <div>Payment not found</div>;
  }

  return (
    <div>
      <h1>✅ Payment Successful!</h1>
      <p>Payment ID: {payment.id}</p>
      <p>Amount: {payment.amount} {payment.currency}</p>
      <p>Status: {payment.status}</p>
    </div>
  );
}`;

  const wordpressExample = `<?php
/**
 * WooCommerce CasPay Gateway
 */

add_filter('woocommerce_payment_gateways', 'add_caspay_gateway');
function add_caspay_gateway($gateways) {
    $gateways[] = 'WC_Gateway_CasPay';
    return $gateways;
}

add_action('plugins_loaded', 'init_caspay_gateway');
function init_caspay_gateway() {
    class WC_Gateway_CasPay extends WC_Payment_Gateway {
        public function __construct() {
            $this->id = 'caspay';
            $this->icon = '';
            $this->has_fields = false;
            $this->method_title = 'CasPay';
            $this->method_description = 'Accept payments with Casper Network';

            $this->init_form_fields();
            $this->init_settings();

            $this->title = $this->get_option('title');
            $this->description = $this->get_option('description');
            $this->api_key = $this->get_option('api_key');
            $this->enabled = $this->get_option('enabled');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, 
                array($this, 'process_admin_options'));
            add_action('woocommerce_api_wc_gateway_caspay', 
                array($this, 'webhook'));
        }

        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title' => 'Enable/Disable',
                    'type' => 'checkbox',
                    'label' => 'Enable CasPay payment gateway',
                    'default' => 'yes'
                ),
                'title' => array(
                    'title' => 'Title',
                    'type' => 'text',
                    'description' => 'Title that customers will see',
                    'default' => 'Pay with CasPay',
                    'desc_tip' => true,
                ),
                'description' => array(
                    'title' => 'Description',
                    'type' => 'textarea',
                    'description' => 'Description shown during checkout',
                    'default' => 'Make secure payments via Casper Network.',
                ),
                'api_key' => array(
                    'title' => 'API Key',
                    'type' => 'text',
                    'description' => 'Your CasPay API key',
                    'default' => ''
                )
            );
        }

        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            
            // Send request to CasPay API
            $response = wp_remote_post('https://api.caspaylink.com/v1/payments', array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json'
                ),
                'body' => json_encode(array(
                    'amount' => $order->get_total(),
                    'currency' => $order->get_currency(),
                    'order_id' => $order_id,
                    'customer_email' => $order->get_billing_email(),
                    'success_url' => $this->get_return_url($order),
                    'cancel_url' => wc_get_checkout_url(),
                    'webhook_url' => WC()->api_request_url('wc_gateway_caspay')
                ))
            ));

            if (is_wp_error($response)) {
                wc_add_notice('Payment error: ' . $response->get_error_message(), 'error');
                return;
            }

            $body = json_decode(wp_remote_retrieve_body($response), true);

            if (isset($body['checkout_url'])) {
                return array(
                    'result' => 'success',
                    'redirect' => $body['checkout_url']
                );
            }

            wc_add_notice('Unable to start payment', 'error');
            return;
        }

        public function webhook() {
            $payload = file_get_contents('php://input');
            $event = json_decode($payload, true);

            if ($event['type'] === 'payment.completed') {
                $order_id = $event['data']['metadata']['order_id'];
                $order = wc_get_order($order_id);
                
                if ($order) {
                    $order->payment_complete($event['data']['id']);
                    $order->add_order_note('CasPay payment completed. Payment ID: ' . 
                        $event['data']['id']);
                }
            }

            http_response_code(200);
        }
    }
}`;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h3" gutterBottom>
            <Iconify icon={"solar:code-square-bold-duotone" as any} width={40} sx={{ mr: 2 }} />
            Code Examples
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-world examples and use cases for CasPay integration
          </Typography>
        </Box>

        {/* Complete Payment Flow */}
        <Box>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon={"solar:wallet-bold-duotone" as any} width={28} color="primary.main" />
              <Typography variant="h5">Complete Payment Flow</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Full example of creating a payment link and checking status
            </Typography>

            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
              <CardContent>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <CopyButton text={completePaymentFlow} />
                </Box>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0,
                  }}
                >
                  {completePaymentFlow}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Subscription Management */}
        <Box>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:refresh-circle-bold-duotone" width={28} color="success.main" />
              <Typography variant="h5">Subscription Management</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Creating subscription plans, adding customers, and handling cancellations
            </Typography>

            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
              <CardContent>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <CopyButton text={subscriptionExample} />
                </Box>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0,
                  }}
                >
                  {subscriptionExample}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Webhook Integration */}
        <Box>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:bell-bing-bold-duotone" width={28} color="warning.main" />
              <Typography variant="h5">Webhook Integration</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Creating webhook endpoints with Express.js and event handling
            </Typography>

            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
              <CardContent>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <CopyButton text={webhookExample} />
                </Box>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0,
                  }}
                >
                  {webhookExample}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Next.js Integration */}
        <Box>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:atom-bold-duotone" width={28} color="info.main" />
              <Typography variant="h5">Next.js Integration</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Next.js App Router checkout page and success page implementation
            </Typography>

            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
              <CardContent>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <CopyButton text={nextjsExample} />
                </Box>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0,
                  }}
                >
                  {nextjsExample}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* WordPress/WooCommerce Integration */}
        <Box>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon={"solar:cart-large-2-bold-duotone" as any} width={28} color="error.main" />
              <Typography variant="h5">WooCommerce Integration</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Custom payment gateway implementation for WordPress/WooCommerce
            </Typography>

            <Card sx={{ bgcolor: 'grey.800', color: 'common.white', position: 'relative' }}>
              <CardContent>
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <CopyButton text={wordpressExample} />
                </Box>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0,
                  }}
                >
                  {wordpressExample}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Next Steps */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Next Steps
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Card sx={{ flex: 1, bgcolor: 'background.neutral' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Iconify icon="solar:code-bold" width={32} color="primary.main" />
                  <Typography variant="h6">API Reference</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explore all API endpoints and detailed documentation
                  </Typography>
                  <Button
                    component={RouterLink}
                    href="/docs/api-reference"
                    variant="outlined"
                    endIcon={<Iconify icon={"solar:alt-arrow-right-bold" as any} />}
                  >
                    API Reference
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, bgcolor: 'background.neutral' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Iconify icon="solar:bell-bold" width={32} color="warning.main" />
                  <Typography variant="h6">Webhook Guide</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Learn how to listen to webhook events
                  </Typography>
                  <Button
                    component={RouterLink}
                    href="/docs/guides/webhooks"
                    variant="outlined"
                    endIcon={<Iconify icon={"solar:alt-arrow-right-bold" as any} />}
                  >
                    Webhook Guide
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
