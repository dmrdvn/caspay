import type {
  WebhookEndpoint,
  WebhookDelivery,
  WebhookTestResult,
  CreateWebhookInput,
  UpdateWebhookInput,
} from 'src/types/webhook';

import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';

import {
  getWebhookEndpoints,
  toggleWebhookStatus,
  testWebhookEndpoint,
  getWebhookDeliveries,
  retryWebhookDelivery,
  createWebhookEndpoint,
  updateWebhookEndpoint,
  deleteWebhookEndpoint,
  regenerateWebhookSecret,
  getRecentWebhookDeliveries,
} from 'src/actions/webhook';

// ----------------------------------------------------------------------

const getEndpointsKey = (merchantId: string | undefined) =>
  merchantId ? `/api/merchants/${merchantId}/webhooks` : null;

const getDeliveriesKey = (endpointId: string | undefined) =>
  endpointId ? `/api/webhooks/${endpointId}/deliveries` : null;

const getRecentDeliveriesKey = (merchantId: string | undefined) =>
  merchantId ? `/api/merchants/${merchantId}/webhook-deliveries` : null;

/**
 * Hook to fetch webhook endpoints for a merchant
 */
export function useWebhooks(merchantId: string | undefined) {
  const { data, error, isLoading, isValidating } = useSWR(
    getEndpointsKey(merchantId),
    () => (merchantId ? getWebhookEndpoints(merchantId) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    webhooks: data || [],
    isLoading,
    isValidating,
    error,
  };
}

/**
 * Hook for webhook mutations
 */
export function useWebhookMutations(merchantId: string | undefined) {
  const key = getEndpointsKey(merchantId);

  const create = useCallback(
    async (input: Omit<CreateWebhookInput, 'merchant_id'>): Promise<WebhookEndpoint> => {
      if (!merchantId) {
        throw new Error('Merchant ID is required');
      }

      const newWebhook = await createWebhookEndpoint({
        ...input,
        merchant_id: merchantId,
      });

      // Optimistically update cache
      await mutate(
        key,
        (current: WebhookEndpoint[] = []) => [newWebhook, ...current],
        false
      );

      // Revalidate
      await mutate(key);

      return newWebhook;
    },
    [merchantId, key]
  );

  const update = useCallback(
    async (endpointId: string, input: UpdateWebhookInput): Promise<WebhookEndpoint> => {
      const updated = await updateWebhookEndpoint(endpointId, input);

      // Optimistically update cache
      await mutate(
        key,
        (current: WebhookEndpoint[] = []) =>
          current.map((item) => (item.id === endpointId ? updated : item)),
        false
      );

      // Revalidate
      await mutate(key);

      return updated;
    },
    [key]
  );

  const remove = useCallback(
    async (endpointId: string): Promise<void> => {
      // Optimistically update cache
      await mutate(
        key,
        (current: WebhookEndpoint[] = []) => current.filter((item) => item.id !== endpointId),
        false
      );

      await deleteWebhookEndpoint(endpointId);

      // Revalidate
      await mutate(key);
    },
    [key]
  );

  const toggleStatus = useCallback(
    async (endpointId: string): Promise<WebhookEndpoint> => {
      const updated = await toggleWebhookStatus(endpointId);

      // Optimistically update cache
      await mutate(
        key,
        (current: WebhookEndpoint[] = []) =>
          current.map((item) => (item.id === endpointId ? updated : item)),
        false
      );

      // Revalidate
      await mutate(key);

      return updated;
    },
    [key]
  );

  const regenerateSecret = useCallback(
    async (endpointId: string): Promise<WebhookEndpoint> => {
      const updated = await regenerateWebhookSecret(endpointId);

      // Optimistically update cache
      await mutate(
        key,
        (current: WebhookEndpoint[] = []) =>
          current.map((item) => (item.id === endpointId ? updated : item)),
        false
      );

      // Revalidate
      await mutate(key);

      return updated;
    },
    [key]
  );

  const test = useCallback(
    async (endpointId: string): Promise<WebhookTestResult> => {
      const result = await testWebhookEndpoint(endpointId);
      return result;
    },
    []
  );

  return {
    createWebhook: create,
    updateWebhook: update,
    deleteWebhook: remove,
    toggleStatus,
    regenerateSecret,
    testWebhook: test,
  };
}

/**
 * Hook to fetch webhook deliveries for a specific endpoint
 */
export function useWebhookDeliveries(endpointId: string | undefined, limit: number = 50) {
  const { data, error, isLoading, isValidating } = useSWR(
    getDeliveriesKey(endpointId),
    () => (endpointId ? getWebhookDeliveries(endpointId, limit) : null),
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  return {
    deliveries: data || [],
    isLoading,
    isValidating,
    error,
  };
}

/**
 * Hook to fetch recent webhook deliveries for all merchant endpoints
 */
export function useRecentWebhookDeliveries(merchantId: string | undefined, limit: number = 50) {
  const { data, error, isLoading, isValidating } = useSWR(
    getRecentDeliveriesKey(merchantId),
    () => (merchantId ? getRecentWebhookDeliveries(merchantId, limit) : null),
    {
      revalidateOnFocus: false,
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );

  return {
    deliveries: data || [],
    isLoading,
    isValidating,
    error,
  };
}

/**
 * Hook for webhook delivery mutations
 */
export function useWebhookDeliveryMutations(endpointId: string | undefined) {
  const key = getDeliveriesKey(endpointId);

  const retry = useCallback(
    async (deliveryId: string): Promise<WebhookDelivery> => {
      const updated = await retryWebhookDelivery(deliveryId);

      // Optimistically update cache
      await mutate(
        key,
        (current: WebhookDelivery[] = []) =>
          current.map((item) => (item.id === deliveryId ? updated : item)),
        false
      );

      // Revalidate
      await mutate(key);

      return updated;
    },
    [key]
  );

  return {
    retryDelivery: retry,
  };
}
