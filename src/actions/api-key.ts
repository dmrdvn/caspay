'use server';

import type {
  ApiKeyListItem,
  ApiKeyWithSecret,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from 'src/types/api-key';

import { hashApiKey, generateApiKey, generateKeyHint } from 'src/utils/api-key';

import { supabase } from 'src/lib/supabase';

export async function getApiKeys(merchantId: string): Promise<ApiKeyListItem[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching API keys:', error);
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return data.map(({ key_hash: _key_hash, ...rest }) => rest) as ApiKeyListItem[];
}

export async function getApiKeyById(keyId: string): Promise<ApiKeyListItem> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .single();

  if (error) {
    console.error('Error fetching API key:', error);
    throw new Error(`Failed to fetch API key: ${error.message}`);
  }


  const rest = { ...data };
  delete (rest as any).key_hash;
  return rest as ApiKeyListItem;
}

export async function createApiKey(input: CreateApiKeyInput): Promise<ApiKeyWithSecret> {
  const { merchant_id, name, environment, permissions, expires_at } = input;

  // Check merchant's network to ensure key environment matches
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('network')
    .eq('id', merchant_id)
    .single();

  if (merchantError) {
    console.error('Error fetching merchant:', merchantError);
    throw new Error(`Failed to fetch merchant: ${merchantError.message}`);
  }

  if (!merchant) {
    throw new Error('Merchant not found');
  }

  // Validate that the environment matches the merchant's network
  if ((merchant.network === 'mainnet' && environment !== 'live') || 
      (merchant.network === 'testnet' && environment !== 'test')) {
    throw new Error(`API key environment must match merchant network. Merchant network: ${merchant.network}, requested environment: ${environment}`);
  }

  const apiKey = generateApiKey(environment);
  const keyHash = await hashApiKey(apiKey);
  const keyHint = generateKeyHint(apiKey);
  const keyPrefix = environment === 'live' ? 'cp_live_' : 'cp_test_';

  const defaultPermissions = {
    scopes: ['read:subscriptions', 'read:payments', 'write:payments']
  };

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      merchant_id,
      name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      key_hint: keyHint,
      permissions: permissions || defaultPermissions,
      expires_at,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating API key:', error);
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return {
    ...data,
    key: apiKey,
  } as ApiKeyWithSecret;
}

export async function updateApiKey(
  keyId: string,
  input: UpdateApiKeyInput
): Promise<ApiKeyListItem> {
  const { data, error } = await supabase
    .from('api_keys')
    .update(input)
    .eq('id', keyId)
    .select()
    .single();

  if (error) {
    console.error('Error updating API key:', error);
    throw new Error(`Failed to update API key: ${error.message}`);
  }

  const rest = { ...data };
  delete (rest as any).key_hash;
  return rest as ApiKeyListItem;
}


export async function deleteApiKey(keyId: string): Promise<void> {
  const { error } = await supabase.from('api_keys').delete().eq('id', keyId);

  if (error) {
    console.error('Error deleting API key:', error);
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
}

export async function rotateApiKey(keyId: string): Promise<ApiKeyWithSecret> {
  const { data: currentKey, error: fetchError } = await supabase
    .from('api_keys')
    .select('*, merchant:merchants(network)')
    .eq('id', keyId)
    .single();

  if (fetchError) {
    console.error('Rotate API Key - Fetch Error:', fetchError);
    throw new Error(`Failed to fetch API key: ${fetchError.message}`);
  }

  if (!currentKey) {
    throw new Error('API key not found');
  }

  if (!(currentKey as any).merchant) {
    throw new Error('Merchant not found for API key');
  }

  const merchantNetwork = (currentKey as any).merchant.network;
  const environment = merchantNetwork === 'mainnet' ? 'live' : 'test';

  const newKey = await createApiKey({
    merchant_id: currentKey.merchant_id,
    name: currentKey.name,
    environment,
    permissions: currentKey.permissions,
    expires_at: currentKey.expires_at,
  });

  await deleteApiKey(keyId);

  return newKey;
}

export async function toggleApiKeyStatus(keyId: string): Promise<ApiKeyListItem> {

  const { data: currentKey, error: fetchError } = await supabase
    .from('api_keys')
    .select('active')
    .eq('id', keyId)
    .single();

  if (fetchError) {
    console.error('Toggle Status - Fetch Error:', fetchError);
    throw new Error(`Failed to fetch API key: ${fetchError.message}`);
  }

  if (!currentKey) {
    throw new Error('API key not found');
  }

  return updateApiKey(keyId, { active: !currentKey.active });
}

export async function updateApiKeyLastUsed(keyHash: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash);

  if (error) {
    console.error('Error updating API key last used:', error);
  }
}
