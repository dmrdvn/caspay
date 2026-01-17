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
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Form as FormProvider, RHFTextField } from 'src/components/hook-form';

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
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [connecting, setConnecting] = useState(false);

    const credentialsMethods = useForm({
        defaultValues: {
            merchantId: '',
            apiKey: '',
            walletAddress: ''
        }
    });

    const productMethods = useForm({
        defaultValues: {
            productId: '',
            amount: 0
        }
    });

    const trackingMethods = useForm({
        defaultValues: {
            productId: '',
            amount: 0,
            transactionHash: ''
        }
    });

    const subscriptionMethods = useForm({
        defaultValues: {
            planId: '',
            amount: 0
        }
    });

    const trackingSubMethods = useForm({
        defaultValues: {
            planId: '',
            amount: 0,
            transactionHash: ''
        }
    });

    const checkStatusMethods = useForm({
        defaultValues: {
            subscriberAddress: '',
            planId: ''
        }
    });

    const handleConnectWallet = async () => {
        if (walletConnected) {
            setWalletConnected(false);
            setWalletAddress('');
            toast.success('Wallet disconnected');
            return;
        }

        if (!window.CasPay) {
            toast.error('SDK script not loaded yet');
            return;
        }

        setConnecting(true);
        try {
            const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const baseUrl = isLocalhost ? `${window.location.origin}/api` : 'https://caspay.link/api';
            
            const tempSDK = new window.CasPay({
                apiKey: 'temp',
                merchantId: 'temp',
                walletAddress: 'temp',
                network: 'testnet',
                baseUrl
            });

            const address = await tempSDK.wallet.connect();
            setWalletAddress(address);
            setWalletConnected(true);
            toast.success('Wallet connected!');
        } catch (error: any) {
            if (error.installUrl) {
                toast.error('Casper Wallet not found. Please install it first.', {
                    action: {
                        label: 'Install',
                        onClick: () => window.open(error.installUrl, '_blank'),
                    },
                });
            } else {
                toast.error(error.message || 'Failed to connect wallet');
            }
        } finally {
            setConnecting(false);
        }
    };

    const handleSdkLoad = () => {
        console.log('CasPay SDK Loaded');
        setSdkReady(true);
    };

    const initCasPay = () => {
        const { merchantId, apiKey, walletAddress } = credentialsMethods.getValues();

        if (!merchantId || !apiKey || !walletAddress) {
            toast.error('Please enter Merchant ID, API Key, and Wallet Address first');
            return null;
        }

        if (!window.CasPay) {
            toast.error('SDK script not loaded yet');
            return null;
        }
        const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const baseUrl = isLocalhost ? `${window.location.origin}/api` : 'https://caspay.link/api';
        
        return new window.CasPay({
            apiKey,
            merchantId,
            walletAddress,
            network: 'testnet',
            baseUrl
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
            const result = await caspay.payments.makePayment({
                productId: data.productId,
                amount: Number(data.amount)
            });
            displayResponse(result, result.success ? 'success' : 'error');
        } catch (error: any) {
            displayResponse(error, 'error');
        }
    });

    const onTrackingSubmit = trackingMethods.handleSubmit(async (data) => {
        const caspay = initCasPay();
        if (!caspay) return;

        try {
            let senderAddress;
            try {
                senderAddress = await caspay.wallet.getAddress();
            } catch (err) {
                senderAddress = '0145ab3c7d9e8f2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c';
            }

            let txHash = data.transactionHash;
            if (!txHash || txHash.trim() === '') {
                txHash = 'demo_tx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            }

            const result = await caspay.payments.recordPayment({
                senderAddress,
                transactionHash: txHash,
                productId: data.productId,
                amount: Number(data.amount),
                currency: 'CSPR'
            });
            displayResponse(result, result.success ? 'success' : 'error');
        } catch (error: any) {
            displayResponse(error, 'error');
        }
    });

    const onSubscriptionSubmit = subscriptionMethods.handleSubmit(async (data) => {
        const caspay = initCasPay();
        if (!caspay) return;

        try {
            const result = await caspay.payments.makePayment({
                subscriptionPlanId: data.planId,
                amount: Number(data.amount)
            });
            displayResponse(result, result.success ? 'success' : 'error');
        } catch (error: any) {
            displayResponse(error, 'error');
        }
    });

    const onTrackingSubSubmit = trackingSubMethods.handleSubmit(async (data) => {
        const caspay = initCasPay();
        if (!caspay) return;

        try {
            let senderAddress;
            try {
                senderAddress = await caspay.wallet.getAddress();
            } catch (err) {
                senderAddress = '0145ab3c7d9e8f2a1b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c';
            }

            let txHash = data.transactionHash;
            if (!txHash || txHash.trim() === '') {
                txHash = 'demo_tx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            }

            const result = await caspay.payments.recordSubscription({
                senderAddress,
                transactionHash: txHash,
                subscriptionPlanId: data.planId,
                amount: Number(data.amount),
                currency: 'CSPR'
            });
            displayResponse(result, result.success ? 'success' : 'error');
        } catch (error: any) {
            displayResponse(error, 'error');
        }
    });

    const onCheckStatusSubmit = checkStatusMethods.handleSubmit(async (data) => {
        const caspay = initCasPay();
        if (!caspay) return;

        try {
            const result = await caspay.subscriptions.checkStatus({
                subscriberAddress: data.subscriberAddress,
                planId: data.planId || undefined
            });
            displayResponse(result, result.success ? 'success' : 'error');
        } catch (error: any) {
            displayResponse({ error: error.message || error.error }, 'error');
        }
    });

    return (
        <>
            <Script
                src="/sdk/caspay.min.js"
                onLoad={handleSdkLoad}
            />

            <AppBar
                position="sticky"
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 'none',
                    mb: 3,
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        CasPay SDK Demo
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        {walletConnected && walletAddress && (
                            <Chip
                                label={`${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`}
                                color="success"
                                size="medium"
                                sx={{
                                    fontFamily: 'monospace',
                                    '& .MuiChip-label': {
                                        px: 1.5
                                    }
                                }}
                            />
                        )}
                        <Button
                            variant="contained"
                            color={walletConnected ? 'error' : 'primary'}
                            onClick={handleConnectWallet}
                            disabled={!sdkReady || connecting}
                            sx={{
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            {connecting ? 'Connecting...' : walletConnected ? 'Disconnect' : 'Connect Wallet'}
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Container maxWidth={false} sx={{ maxWidth: '1400px', px: 3, pt:2 }}>
                <CustomBreadcrumbs
                    heading="CasPay SDK React/Next Demo"
                    links={[
                        { name: 'Home', href: paths.dashboard.root },
                        { name: 'Demo 2' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <Grid container spacing={3}>
                    <Grid size={12}>
                        <Card sx={{ boxShadow: 'none' }}>
                            <CardHeader title="Configuration" subheader="Set your merchant credentials" />
                            <CardContent>
                                <FormProvider methods={credentialsMethods}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <RHFTextField name="merchantId" label="Merchant ID" fullWidth />
                                        <RHFTextField name="apiKey" label="API Key" fullWidth />
                                        <RHFTextField name="walletAddress" label="Wallet Address (Receive Payments)" fullWidth />
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: '100%', boxShadow: 'none' }}>
                            <CardHeader
                                title="Pay with Wallet"
                                subheader="CasPay handles wallet connection, transfer & recording"
                                action={
                                    <Chip 
                                        label="Full Management" 
                                        size="small" 
                                        color="error"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                }
                            />
                            <CardContent>
                                <FormProvider methods={productMethods} onSubmit={onProductSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField name="productId" label="Product ID" placeholder="Enter product ID" />
                                        <RHFTextField name="amount" label="Amount (CSPR)" type="number" placeholder="Amount in CSPR" />

                                        <LoadingButton
                                            fullWidth
                                            color="primary"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={productMethods.formState.isSubmitting}
                                            disabled={!sdkReady}
                                            sx={{
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            Pay with Wallet
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: '100%', boxShadow: 'none' }}>
                            <CardHeader
                                title="Record Payment"
                                subheader="Merchant handles payment, CasPay records & tracks analytics"
                                action={
                                    <Chip 
                                        label="Tracking Only" 
                                        size="small" 
                                        color="info"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                }
                            />
                            <CardContent>
                                <Tooltip title="Merchant integrates Casper Wallet in their dApp, makes the payment, then records it here for analytics tracking" placement="top">
                                    <Box sx={{ bgcolor: 'rgba(0, 184, 217, 0.08)', border: '1px solid rgba(0, 184, 217, 0.24)', borderRadius: 1, p: 1.5, mb: 2.5, fontSize: '0.75rem', cursor: 'help', color: 'text.primary' }}>
                                        <strong style={{ color: 'rgb(0, 184, 217)' }}>ℹ️ Tracking Mode:</strong> Merchant integrates Casper Wallet in their dApp, makes the payment, then records it here for analytics tracking.
                                    </Box>
                                </Tooltip>
                                <FormProvider methods={trackingMethods} onSubmit={onTrackingSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField name="productId" label="Product ID" placeholder="Product ID" />
                                        <RHFTextField name="amount" label="Amount (CSPR)" type="number" placeholder="Amount in CSPR" />
                                        <RHFTextField name="transactionHash" label="Transaction Hash (Optional)" placeholder="Leave empty to auto-generate demo hash" />

                                        <LoadingButton
                                            fullWidth
                                            color="info"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={trackingMethods.formState.isSubmitting}
                                            disabled={!sdkReady}
                                            sx={{
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            Record Payment
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', boxShadow: 'none' }}>
                            <CardHeader
                                title="Subscribe with Wallet"
                                subheader="CasPay handles recurring subscription payments"
                                action={
                                    <Chip 
                                        label="Full Management" 
                                        size="small" 
                                        color="error"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                }
                            />
                            <CardContent>
                                <FormProvider methods={subscriptionMethods} onSubmit={onSubscriptionSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField name="planId" label="Plan ID" placeholder="Enter plan ID" />
                                        <RHFTextField name="amount" label="Amount (CSPR)" type="number" placeholder="Amount in CSPR" />

                                        <LoadingButton
                                            fullWidth
                                            color="primary"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={subscriptionMethods.formState.isSubmitting}
                                            disabled={!sdkReady}
                                            sx={{
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            Subscribe with Wallet
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', boxShadow: 'none' }}>
                            <CardHeader
                                title="Record Subscription"
                                subheader="Merchant handles subscription, CasPay tracks renewals"
                                action={
                                    <Chip 
                                        label="Tracking Only" 
                                        size="small" 
                                        color="info"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                }
                            />
                            <CardContent>
                                <Tooltip title="For recurring subscriptions managed by merchant" placement="top">
                                    <Box sx={{ bgcolor: 'rgba(0, 184, 217, 0.08)', border: '1px solid rgba(0, 184, 217, 0.24)', borderRadius: 1, p: 1.5, mb: 2.5, fontSize: '0.75rem', cursor: 'help', color: 'text.primary' }}>
                                        <strong style={{ color: 'rgb(0, 184, 217)' }}>ℹ️ Tracking Mode:</strong> For recurring subscriptions managed by merchant.
                                    </Box>
                                </Tooltip>
                                <FormProvider methods={trackingSubMethods} onSubmit={onTrackingSubSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField name="planId" label="Plan ID" placeholder="Plan ID" />
                                        <RHFTextField name="amount" label="Amount (CSPR)" type="number" placeholder="Amount in CSPR" />
                                        <RHFTextField name="transactionHash" label="Transaction Hash (Optional)" placeholder="Leave empty to auto-generate demo hash" />

                                        <LoadingButton
                                            fullWidth
                                            color="info"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={trackingSubMethods.formState.isSubmitting}
                                            disabled={!sdkReady}
                                            sx={{
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            Record Subscription
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: '100%', boxShadow: 'none' }}>
                            <CardHeader
                                title="Check Subscription"
                                subheader="Verify status via API"
                                action={
                                    <Chip 
                                        label="Status Check" 
                                        size="small" 
                                        color="success"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                }
                            />
                            <CardContent>
                                <FormProvider methods={checkStatusMethods} onSubmit={onCheckStatusSubmit}>
                                    <Stack spacing={2.5}>
                                        <RHFTextField 
                                            name="subscriberAddress" 
                                            label="Subscriber Address" 
                                            multiline 
                                            rows={3} 
                                            placeholder="Wallet address"
                                            sx={{
                                                '& textarea': {
                                                    fontFamily: 'monospace'
                                                }
                                            }}
                                        />
                                        <RHFTextField name="planId" label="Plan ID (Optional)" placeholder="e.g. plan_mjroxrg9_z1f20zd (leave empty for all)" />

                                        <LoadingButton
                                            fullWidth
                                            color="info"
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={checkStatusMethods.formState.isSubmitting}
                                            sx={{
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            Check Status
                                        </LoadingButton>
                                    </Stack>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={12}>
                        <Card sx={{ boxShadow: 'none' }}>
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
