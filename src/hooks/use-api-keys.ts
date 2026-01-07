import type {
  ApiKeyListItem,
  ApiKeyWithSecret,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from 'src/types/api-key';

import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';

import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  rotateApiKey,
  toggleApiKeyStatus,
} from 'src/actions/api-key';


const getKey = (merchantId: string | undefined) => 
  merchantId ? `/api/merchants/${merchantId}/api-keys` : null;

export function useApiKeys(merchantId: string | undefined) {
  const { data, error, isLoading, isValidating } = useSWR(
    getKey(merchantId),
    () => (merchantId ? getApiKeys(merchantId) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    apiKeys: data || [],
    isLoading,
    isValidating,
    error,
  };
}


export function useApiKeyMutations(merchantId: string | undefined) {
  const key = getKey(merchantId);

  const create = useCallback(
    async (input: Omit<CreateApiKeyInput, 'merchant_id'>): Promise<ApiKeyWithSecret> => {
      if (!merchantId) {
        throw new Error('Merchant ID is required');
      }

      const newKey = await createApiKey({
        ...input,
        merchant_id: merchantId,
      });

      // Optimistically update cache
      await mutate(
        key,
        (current: ApiKeyListItem[] = []) => [newKey, ...current],
        false
      );

      // Revalidate
      await mutate(key);

      return newKey;
    },
    [merchantId, key]
  );

  const update = useCallback(
    async (keyId: string, input: UpdateApiKeyInput): Promise<ApiKeyListItem> => {
      const updated = await updateApiKey(keyId, input);

      // Optimistically update cache
      await mutate(
        key,
        (current: ApiKeyListItem[] = []) =>
          current.map((item) => (item.id === keyId ? updated : item)),
        false
      );

      // Revalidate
      await mutate(key);

      return updated;
    },
    [key]
  );

  const remove = useCallback(
    async (keyId: string): Promise<void> => {
      // Optimistically update cache
      await mutate(
        key,
        (current: ApiKeyListItem[] = []) => current.filter((item) => item.id !== keyId),
        false
      );

      await deleteApiKey(keyId);

      // Revalidate
      await mutate(key);
    },
    [key]
  );

  const rotate = useCallback(
    async (keyId: string): Promise<ApiKeyWithSecret> => {
      const newKey = await rotateApiKey(keyId);

      // Optimistically update cache (replace old key with new one)
      await mutate(
        key,
        (current: ApiKeyListItem[] = []) =>
          current.map((item) => (item.id === keyId ? newKey : item)),
        false
      );

      // Revalidate
      await mutate(key);

      return newKey;
    },
    [key]
  );

  const toggleStatus = useCallback(
    async (keyId: string): Promise<ApiKeyListItem> => {
      const updated = await toggleApiKeyStatus(keyId);

      // Optimistically update cache
      await mutate(
        key,
        (current: ApiKeyListItem[] = []) =>
          current.map((item) => (item.id === keyId ? updated : item)),
        false
      );

      // Revalidate
      await mutate(key);

      return updated;
    },
    [key]
  );

  return {
    createKey: create,
    updateKey: update,
    deleteKey: remove,
    rotateKey: rotate,
    toggleStatus,
  };
}
