import bcrypt from 'bcryptjs';

import { supabaseAdmin } from 'src/lib/supabase';

export interface ValidatedMerchant {
  id: string;
  merchant_id: string;
  wallet_address: string;
  status: string;
  network?: 'testnet' | 'mainnet';
  api_key_id: string;
  permissions: string[];
  allowed_domains?: string[] | null;
  rate_limit?: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
}

export interface ValidationError {
  error: string;
  code: 'INVALID_KEY' | 'EXPIRED_KEY' | 'INACTIVE_MERCHANT' | 'INSUFFICIENT_PERMISSIONS' | 'TEST_KEY_IN_PRODUCTION' | 'DOMAIN_NOT_ALLOWED';
  status: number;
}

function compareApiKey(apiKey: string, hash: string): boolean {
  return bcrypt.compareSync(apiKey, hash);
}

function isOriginAllowed(origin: string | null, allowedDomains: string[]): boolean {
  if (!origin) return false;
  
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    
    return allowedDomains.some(domain => {
      if (hostname === domain) return true;
      if (domain.startsWith('*.')) {
        const baseDomain = domain.slice(2);
        return hostname.endsWith('.' + baseDomain) || hostname === baseDomain;
      }
      return false;
    });
  } catch {
    return false;
  }
}

export async function validatePublicApiKey(
  apiKey: string | null,
  requiredPermission: 'write:payments' | 'read:subscriptions' = 'write:payments',
  origin?: string | null
): Promise<ValidatedMerchant | ValidationError> {
  if (!apiKey) {
    return {
      error: 'API key is required',
      code: 'INVALID_KEY',
      status: 401
    };
  }

  if (!apiKey.startsWith('cp_live_') && !apiKey.startsWith('cp_test_')) {
    return {
      error: 'Invalid API key format',
      code: 'INVALID_KEY',
      status: 401
    };
  }

  try {
    const supabase = supabaseAdmin;

    const { data: apiKeys, error: queryError } = await supabase
      .from('api_keys')
      .select(`
        id,
        merchant_id,
        key_prefix,
        key_hash,
        permissions,
        active,
        expires_at,
        last_used_at,
        allowed_domains,
        merchants (
          id,
          merchant_id,
          wallet_address,
          status,
          network
        )
      `)
      .eq('key_prefix', apiKey.startsWith('cp_live_') ? 'cp_live_' : 'cp_test_')
      .eq('active', true);

    if (queryError || !apiKeys || apiKeys.length === 0) {
      return {
        error: 'Invalid API key',
        code: 'INVALID_KEY',
        status: 401
      };
    }

    const apiKeyData = apiKeys.find(key => compareApiKey(apiKey, key.key_hash));
    
    if (!apiKeyData) {
      return {
        error: 'Invalid API key',
        code: 'INVALID_KEY',
        status: 401
      };
    }

    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return {
        error: 'API key has expired',
        code: 'EXPIRED_KEY',
        status: 401
      };
    }

    const merchant = apiKeyData.merchants as any;
    if (!merchant || merchant.status !== 'active') {
      return {
        error: 'Merchant account is not active',
        code: 'INACTIVE_MERCHANT',
        status: 403
      };
    }

    const isTestKey = apiKey.startsWith('cp_test_');
    const merchantNetwork = merchant.network || 'testnet';

    if (isTestKey && merchantNetwork === 'mainnet') {
      return {
        error: 'Test API keys can only be used with testnet merchants',
        code: 'INVALID_KEY',
        status: 403
      };
    }

    if (!isTestKey && merchantNetwork === 'testnet') {
      return {
        error: 'Live API keys can only be used with mainnet merchants',
        code: 'INVALID_KEY',
        status: 403
      };
    }

    const permissions = (apiKeyData.permissions as any)?.scopes || [];
    if (!permissions.includes(requiredPermission)) {
      return {
        error: `Insufficient permissions. Required: ${requiredPermission}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        status: 403
      };
    }

    const isLiveKey = apiKey.startsWith('cp_live_');
    const allowedDomains = apiKeyData.allowed_domains as string[] | null;
    
    if (isLiveKey && allowedDomains && allowedDomains.length > 0) {
      if (!isOriginAllowed(origin || null, allowedDomains)) {
        return {
          error: 'Domain not allowed for this API key',
          code: 'DOMAIN_NOT_ALLOWED',
          status: 403
        };
      }
    }

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
      allowed_domains: allowedDomains,
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

export function isValidationError(result: ValidatedMerchant | ValidationError): result is ValidationError {
  return 'error' in result;
}
