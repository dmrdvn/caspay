// ----------------------------------------------------------------------

export type ApiKeyEnvironment = 'live' | 'test';

export type ApiKeyPrefix = 'cp_live_' | 'cp_test_';

export type ApiKeyScope = 'read' | 'write' | 'admin' | 'read:subscriptions' | 'read:payments' | 'write:payments';

export type ApiKeyPermissions = {
  scopes: ApiKeyScope[];
};

// ----------------------------------------------------------------------

/**
 * API Key entity
 */
export type ApiKey = {
  id: string;
  merchant_id: string;
  name: string;
  key_prefix: ApiKeyPrefix;
  key_hash: string; // Hashed key (not exposed to client)
  key_hint: string; // Masked key for display (e.g., 'cp_live_****x2m7')
  permissions: ApiKeyPermissions;
  last_used_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * API Key creation input
 */
export type CreateApiKeyInput = {
  merchant_id: string;
  name: string;
  environment: ApiKeyEnvironment; // 'live' or 'test'
  permissions?: ApiKeyPermissions;
  expires_at?: string | null;
};

/**
 * API Key update input
 */
export type UpdateApiKeyInput = {
  name?: string;
  permissions?: ApiKeyPermissions;
  expires_at?: string | null;
  active?: boolean;
};

/**
 * API Key with plain key (only returned on creation)
 */
export type ApiKeyWithSecret = ApiKey & {
  key: string; // Plain text key (only shown once)
};

/**
 * API Key list item for UI
 */
export type ApiKeyListItem = Omit<ApiKey, 'key_hash'>;
