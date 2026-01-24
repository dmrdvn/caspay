import crypto from 'crypto';

import { createClient } from 'src/lib/supabase';

/**
 * API Key validation and merchant authentication
 * 
 * Security features:
 * - Hashed key comparison (never stores plain keys)
 * - Rate limiting ready
 * - Permission-based access control
 * - Key status validation (active/expired)
 */

export interface ValidatedMerchant {
  id: string;
  merchant_id: string;
  wallet_address: string;
  status: string;
  network?: 'testnet' | 'mainnet';
  api_key_id: string;
  permissions: string[];
  rate_limit?: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
}

export interface ValidationError {
  error: string;
  code: 'INVALID_KEY' | 'EXPIRED_KEY' | 'INACTIVE_MERCHANT' | 'INSUFFICIENT_PERMISSIONS' | 'TEST_KEY_IN_PRODUCTION';
  status: number;
}

/**
 * Hash API key for secure comparison
 */
function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Validate public API key (for payment recording, subscription checks)
 * Used by merchant frontends - read/write limited permissions
 */
export async function validatePublicApiKey(
  apiKey: string | null,
  requiredPermission: 'write:payments' | 'read:subscriptions' = 'write:payments'
): Promise<ValidatedMerchant | ValidationError> {
  if (!apiKey) {
    return {
      error: 'API key is required',
      code: 'INVALID_KEY',
      status: 401
    };
  }

  // Validate key format (cp_live_ or cp_test_)
  if (!apiKey.startsWith('cp_live_') && !apiKey.startsWith('cp_test_')) {
    return {
      error: 'Invalid API key format',
      code: 'INVALID_KEY',
      status: 401
    };
  }

  try {
    const supabase = await createClient();
    
    const keyHash = hashApiKey(apiKey);

    // Query API key with merchant info
    const { data: apiKeyData, error: queryError } = await supabase
      .from('api_keys')
      .select(`
        id,
        merchant_id,
        key_prefix,
        permissions,
        active,
        expires_at,
        last_used_at,
        merchants (
          id,
          merchant_id,
          wallet_address,
          status,
          network
        )
      `)
      .eq('key_hash', keyHash)
      .eq('active', true)
      .single();

    if (queryError || !apiKeyData) {
      return {
        error: 'Invalid API key',
        code: 'INVALID_KEY',
        status: 401
      };
    }

    // Check key expiration
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return {
        error: 'API key has expired',
        code: 'EXPIRED_KEY',
        status: 401
      };
    }

    // Check merchant status
    const merchant = apiKeyData.merchants as any;
    if (!merchant || merchant.status !== 'active') {
      return {
        error: 'Merchant account is not active',
        code: 'INACTIVE_MERCHANT',
        status: 403
      };
    }

    // Validate API key type matches merchant network
    const isTestKey = apiKey.startsWith('cp_test_');
    const isLiveKey = apiKey.startsWith('cp_live_');
    const merchantNetwork = merchant.network || 'testnet';

    if (isTestKey && merchantNetwork === 'mainnet') {
      return {
        error: 'Test API keys can only be used with testnet merchants',
        code: 'INVALID_KEY',
        status: 403
      };
    }

    if (isLiveKey && merchantNetwork === 'testnet') {
      return {
        error: 'Live API keys can only be used with mainnet merchants',
        code: 'INVALID_KEY',
        status: 403
      };
    }

    // Check permissions
    const permissions = (apiKeyData.permissions as any)?.scopes || [];
    if (!permissions.includes(requiredPermission)) {
      return {
        error: `Insufficient permissions. Required: ${requiredPermission}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        status: 403
      };
    }

    // Update last_used_at (async, non-blocking)
    void supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    return {
      id: merchant.id,
      merchant_id: merchant.merchant_id,
      wallet_address: merchant.wallet_address,
      status: merchant.status,
      network: merchant.network || 'testnet',
      api_key_id: apiKeyData.id,
      permissions,
      rate_limit: {
        requests_per_minute: 60,
        requests_per_hour: 1000
      }
    };

  } catch (error: any) {
    console.error('[validatePublicApiKey] Error:', error);
    return {
      error: 'Internal server error',
      code: 'INVALID_KEY',
      status: 500
    };
  }
}

/**
 * Validate secret API key (for dashboard admin operations)
 * Higher privileges, used server-side only
 */
export async function validateSecretApiKey(
  apiKey: string | null
): Promise<ValidatedMerchant | ValidationError> {
  if (!apiKey) {
    return {
      error: 'Secret API key is required',
      code: 'INVALID_KEY',
      status: 401
    };
  }

  // Secret keys use different prefix
  if (!apiKey.startsWith('cp_secret_')) {
    return {
      error: 'Invalid secret API key format',
      code: 'INVALID_KEY',
      status: 401
    };
  }

  try {
    const supabase = await createClient();
    const keyHash = hashApiKey(apiKey);

    const { data: apiKeyData, error: queryError } = await supabase
      .from('api_keys')
      .select(`
        id,
        merchant_id,
        permissions,
        active,
        expires_at,
        merchants (
          id,
          merchant_id,
          wallet_address,
          status,
          network
        )
      `)
      .eq('key_hash', keyHash)
      .eq('key_prefix', 'cp_secret_')
      .eq('active', true)
      .single();

    if (queryError || !apiKeyData) {
      return {
        error: 'Invalid secret API key',
        code: 'INVALID_KEY',
        status: 401
      };
    }

    // Check expiration
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return {
        error: 'Secret API key has expired',
        code: 'EXPIRED_KEY',
        status: 401
      };
    }

    const merchant = apiKeyData.merchants as any;

    return {
      id: merchant.id,
      merchant_id: merchant.merchant_id,
      wallet_address: merchant.wallet_address,
      status: merchant.status,
      network: merchant.network || 'testnet',
      api_key_id: apiKeyData.id,
      permissions: (apiKeyData.permissions as any)?.scopes || ['read:all', 'write:all']
    };

  } catch (error: any) {
    console.error('[validateSecretApiKey] Error:', error);
    return {
      error: 'Internal server error',
      code: 'INVALID_KEY',
      status: 500
    };
  }
}

/**
 * Check if error is a validation error
 */
export function isValidationError(result: ValidatedMerchant | ValidationError): result is ValidationError {
  return 'error' in result;
}
