'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form as FormProvider, RHFTextField, RHFSelect } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

declare global {
    interface Window {
        CasPay: any;
    }
}

export default function DemoNext() {
    const settings = useSettingsContext();
    const [sdkReady, setSdkReady] = useState(false);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [responseStatus, setResponseStatus] = useState<'success' | 'error' | null>(null);

    // Forms
    const credentialsMethods = useForm({
        defaultValues: {
            merchantId: '',
            apiKey: '',
        }
    });

    const productMethods = useForm({
        defaultValues: {
            senderAddress: '',
            transactionHash: '',
            productId: '',
            amount: 0,
            currency: 'USD'
        }
    });

    const subscriptionMethods = useForm({
        defaultValues: {
            senderAddress: '',
            transactionHash: '',
            planId: '',
            amount: 0,
            currency: 'USD'
        }
    });

    const checkStatusMethods = useForm({
        defaultValues: {
            subscriberAddress: '',
            planId: ''
        }
    });

    const handleSdkLoad = () => {
        console.log('CasPay SDK Loaded');
        setSdkReady(true);
    };

    const initCasPay = () => {
        const { merchantId, apiKey } = credentialsMethods.getValues();

        if (!merchantId || !apiKey) {
            toast.error('Please enter Merchant ID and API Key first');
            return null;
        }

        if (!window.CasPay) {
            toast.error('SDK script not loaded yet');
            return null;
        }
        return new window.CasPay({
            apiKey,
            merchantId,
            baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : 'https://api.caspay.link'
        });
    };

    const displayResponse = (data: any, status: 'success' | 'error') => {
        setApiResponse(data);
        setResponseStatus(status);
    };

    const onProductSubmit = productMethods.handleSubmit(async (data) => {
        const caspay = initCasPay();
        if (!caspay) return;

        try {
            const payment = await caspay.payments.create({
                senderAddress: data.senderAddress,
                transactionHash: data.transactionHash || undefined,
                productId: data.productId,
                amount: Number(data.amount),
                currency: data.currency
            });
            displayResponse(payment, 'success');
        } catch (error: any) {
            displayResponse(error, 'error');
        }
    });

    const onSubscriptionSubmit = subscriptionMethods.handleSubmit(async (data) => {
        const caspay = initCasPay();
        if (!caspay) return;

        try {
            const payment = await caspay.payments.create({
                senderAddress: data.senderAddress,
                transactionHash: data.transactionHash || undefined,
                subscriptionPlanId: data.planId,
                amount: Number(data.amount),
                currency: data.currency
            });
            displayResponse(payment, 'success');
        } catch (error: any) {
            displayResponse(error, 'error');
        }
    });

    const onCheckStatusSubmit = checkStatusMethods.handleSubmit(async (data) => {
        const { merchantId, apiKey } = credentialsMethods.getValues();

        if (!merchantId || !apiKey) {
            toast.error('Please enter Merchant ID and API Key first');
            return;
        }

        let url = `${process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : 'https://api.caspay.link'}/api/v1/subscriptions/check/?merchant_id=${merchantId}&subscriber=${data.subscriberAddress}`;
        if (data.planId) {
            url += `&plan_id=${data.planId}`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-CasPay-Key': apiKey
                }
            });

            const resData = await response.json();
            displayResponse(resData, response.ok ? 'success' : 'error');
        } catch (error: any) {
            displayResponse({ error: error.message }, 'error');
        }
    });

    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/npm/@caspay/sdk@1.0.1/dist/caspay.min.js"
                onLoad={handleSdkLoad}
            />

            <Container maxWidth={settings.state.compactLayout ? 'lg' : 'xl'}>
                <CustomBreadcrumbs
                    heading="CasPay SDK Demo Interface"
                    links={[
                        { name: 'Home', href: paths.dashboard.root },
                        { name: 'Demo 2' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Grid container spacing={3}>
                    {/* Credentials Section */}
                    <Grid size={12}>
                        <Card>
                            <CardHeader title="Configuration" subheader="Set your merchant credentials" />
                            <CardContent>
                                <FormProvider methods={credentialsMethods}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <RHFTextField name="merchantId" label="Merchant ID" fullWidth />
                                        <RHFTextField name="apiKey" label="API Key" fullWidth />
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Product Payment */}
                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardHeader
                                title="Product Purchase"
                                subheader="One-time Payment"
                                action={
                                    <Box sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', px: 1, py: 0.5, borderRadius: 1, typography: 'caption', fontWeight: 'bold' }}>
                                        One-Time
                                    </Box>
                                }
                            />
                            <CardContent>
                                <FormProvider methods={productMethods} onSubmit={onProductSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField name="senderAddress" label="Sender Wallet Address" multiline rows={2} />
                                        <RHFTextField name="transactionHash" label="Transaction Hash (Optional)" placeholder="Leave empty for mock mode" />

                                        <RHFTextField name="productId" label="Product ID" />

                                        <RHFTextField name="amount" label="Amount" type="number" />

                                        <LoadingButton
                                            fullWidth
                                            color="primary"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={productMethods.formState.isSubmitting}
                                            disabled={!sdkReady}
                                        >
                                            Process Payment
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Subscription Payment */}
                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardHeader
                                title="Subscription"
                                subheader="Recurring Payment"
                                action={
                                    <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 1, py: 0.5, borderRadius: 1, typography: 'caption', fontWeight: 'bold' }}>
                                        Recurring
                                    </Box>
                                }
                            />
                            <CardContent>
                                <FormProvider methods={subscriptionMethods} onSubmit={onSubscriptionSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField name="senderAddress" label="Sender Wallet Address" multiline rows={2} />
                                        <RHFTextField name="transactionHash" label="Transaction Hash (Optional)" placeholder="Leave empty for mock mode" />

                                        <RHFTextField name="planId" label="Plan ID" />

                                        <RHFTextField name="amount" label="Amount" type="number" />

                                        <LoadingButton
                                            fullWidth
                                            color="primary"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={subscriptionMethods.formState.isSubmitting}
                                            disabled={!sdkReady}
                                        >
                                            Start Subscription
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Status Check */}
                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardHeader
                                title="Check Subscription"
                                subheader="Verify status via API"
                                action={
                                    <Box sx={{ bgcolor: 'info.main', color: 'info.contrastText', px: 1, py: 0.5, borderRadius: 1, typography: 'caption', fontWeight: 'bold' }}>
                                        Status Check
                                    </Box>
                                }
                            />
                            <CardContent>
                                <FormProvider methods={checkStatusMethods} onSubmit={onCheckStatusSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField name="subscriberAddress" label="Subscriber Address" multiline rows={2} />
                                        <RHFTextField name="planId" label="Plan ID (Optional)" placeholder="e.g. plan_..." />

                                        <Box sx={{ flexGrow: 1 }} />

                                        <LoadingButton
                                            fullWidth
                                            color="info"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={checkStatusMethods.formState.isSubmitting}
                                        >
                                            Check Status
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* API Response */}
                    <Grid size={12}>
                        <Card>
                            <CardHeader title="API Response" />
                            <Divider />
                            <CardContent>
                                {apiResponse ? (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            bgcolor: 'background.neutral',
                                            borderLeft: (theme) => `4px solid ${responseStatus === 'success' ? theme.palette.success.main : theme.palette.error.main}`,
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            overflowX: 'auto',
                                            maxHeight: 500,
                                        }}
                                    >
                                        <pre style={{ margin: 0 }}>{JSON.stringify(apiResponse, null, 2)}</pre>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                        No requests sent yet. Submit a form above to test the API.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>
            </Container>
        </>
    );
}
