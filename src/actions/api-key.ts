'use server';

import type {
  ApiKeyListItem,
  ApiKeyWithSecret,
  CreateApiKeyInput,
  UpdateApiKeyInput,
} from 'src/types/api-key';

import { hashApiKey, generateApiKey, generateKeyHint } from 'src/utils/api-key';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

/**
 * Get all API keys for a merchant
 * @param merchantId - Merchant ID
 * @returns List of API keys (without key_hash)
 */
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

  // Remove key_hash from response for security
  return data.map(({ key_hash: _key_hash, ...rest }) => rest) as ApiKeyListItem[];
}

/**
 * Get a single API key by ID
 * @param keyId - API Key ID
 * @returns API key details (without key_hash)
 */
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

  // Remove key_hash from response
  const rest = { ...data };
  delete (rest as any).key_hash;
  return rest as ApiKeyListItem;
}

/**
 * Create a new API key
 * @param input - API key creation input
 * @returns Newly created API key with plain text key (shown only once)
 */
export async function createApiKey(input: CreateApiKeyInput): Promise<ApiKeyWithSecret> {
  const { merchant_id, name, environment, permissions, expires_at } = input;

  // Generate API key
  const apiKey = generateApiKey(environment);
  const keyHash = await hashApiKey(apiKey);
  const keyHint = generateKeyHint(apiKey);
  const keyPrefix = environment === 'live' ? 'cp_live_' : 'cp_test_';

  // Default permissions (explicit scopes, never use wildcard)
  const defaultPermissions = {
    scopes: ['read:subscriptions', 'read:payments', 'write:payments']
  };

  // Insert into database
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

  // Return with plain text key (only shown once)
  return {
    ...data,
    key: apiKey,
  } as ApiKeyWithSecret;
}

/**
 * Update an existing API key
 * @param keyId - API Key ID
 * @param input - Update input
 * @returns Updated API key
 */
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

/**
 * Delete an API key
 * @param keyId - API Key ID
 */
export async function deleteApiKey(keyId: string): Promise<void> {
  const { error } = await supabase.from('api_keys').delete().eq('id', keyId);

  if (error) {
    console.error('Error deleting API key:', error);
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
}

/**
 * Rotate an API key (delete old, create new with same settings)
 * @param keyId - API Key ID to rotate
 * @returns New API key with plain text key
 */
export async function rotateApiKey(keyId: string): Promise<ApiKeyWithSecret> {
  // Get current key details
  const { data: currentKey, error: fetchError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', keyId)
    .single();

  if (fetchError) {
    console.error('Rotate API Key - Fetch Error:', fetchError);
    throw new Error(`Failed to fetch API key: ${fetchError.message}`);
  }

  if (!currentKey) {
    throw new Error('API key not found');
  }

  // Extract environment from prefix
  const environment = currentKey.key_prefix === 'cp_live_' ? 'live' : 'test';

  // Create new key with same settings
  const newKey = await createApiKey({
    merchant_id: currentKey.merchant_id,
    name: currentKey.name,
    environment,
    permissions: currentKey.permissions,
    expires_at: currentKey.expires_at,
  });

  // Delete old key
  await deleteApiKey(keyId);

  return newKey;
}

/**
 * Toggle API key active status
 * @param keyId - API Key ID
 * @returns Updated API key
 */
export async function toggleApiKeyStatus(keyId: string): Promise<ApiKeyListItem> {
  // Get current status
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

  // Toggle status
  return updateApiKey(keyId, { active: !currentKey.active });
}

/**
 * Update last_used_at timestamp for an API key
 * @param keyHash - Hashed API key
 */
export async function updateApiKeyLastUsed(keyHash: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash);

  if (error) {
    console.error('Error updating API key last used:', error);
    // Don't throw - this is not critical
  }
}
