import type { ApiKeyPrefix, ApiKeyEnvironment } from 'src/types/api-key';

// ----------------------------------------------------------------------

/**
 * Generate a cryptographically secure random API key
 * @param environment - 'live' or 'test'
 * @returns Generated API key (e.g., 'cp_live_k8j3h5g9x2m7n4p1q6r8')
 */
export function generateApiKey(environment: ApiKeyEnvironment): string {
  const prefix: ApiKeyPrefix = environment === 'live' ? 'cp_live_' : 'cp_test_';
  const secretLength = 24;
  const secret = generateSecureRandomString(secretLength);
  return `${prefix}${secret}`;
}

/**
 * Hash an API key for secure storage
 * Uses SHA-256 hashing for production keys
 * Test keys are stored in plaintext for development traceability
 * @param apiKey - Plain text API key
 * @returns Hashed key (or plaintext for test keys)
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  // Test keys stored in plaintext for development traceability
  if (apiKey.startsWith('cp_test_')) {
    return apiKey; // Plaintext storage for test keys
  }

  // Production keys hashed with SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate a hint string for UI display
 * Shows prefix and last 4 characters for production keys
 * Shows full key for test keys (stored in plaintext)
 * @param apiKey - Full API key
 * @returns Hint string (e.g., 'cp_live_****r8x2' or full test key)
 */
export function generateKeyHint(apiKey: string): string {
  // Test keys shown in full (stored in plaintext anyway)
  if (apiKey.startsWith('cp_test_')) {
    return apiKey;
  }

  // Production keys masked
  const parts = apiKey.split('_');
  if (parts.length !== 3) {
    throw new Error('Invalid API key format');
  }

  const prefix = `${parts[0]}_${parts[1]}_`;
  const secret = parts[2];
  const lastChars = secret.slice(-4);
  const masked = '*'.repeat(Math.max(0, secret.length - 4));

  return `${prefix}${masked}${lastChars}`;
}

/**
 * Verify if an API key matches its hash
 * Test keys compared directly (plaintext), production keys compared via hash
 * @param apiKey - Plain text API key to verify
 * @param hash - Stored hash (or plaintext for test keys) to compare against
 * @returns True if key matches hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  // Test keys stored in plaintext - direct comparison
  if (apiKey.startsWith('cp_test_')) {
    return apiKey === hash;
  }

  // Production keys - hash comparison
  const computedHash = await hashApiKey(apiKey);
  return computedHash === hash;
}

/**
 * Extract environment from API key
 * @param apiKey - Full API key
 * @returns Environment ('live' or 'test')
 */
export function extractEnvironment(apiKey: string): ApiKeyEnvironment | null {
  if (apiKey.startsWith('cp_live_')) {
    return 'live';
  }
  if (apiKey.startsWith('cp_test_')) {
    return 'test';
  }
  return null;
}

/**
 * Validate API key format
 * @param apiKey - API key to validate
 * @returns True if format is valid
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  const regex = /^cp_(live|test)_[a-z0-9]{24}$/;
  return regex.test(apiKey);
}

// ----------------------------------------------------------------------

/**
 * Generate a cryptographically secure random string
 * Uses only lowercase letters and numbers
 * @param length - Length of the string
 * @returns Random string
 */
function generateSecureRandomString(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);

  let result = '';
  for (let i = 0; i < length; i += 1) {
    // Use modulo to map random value to charset index
    result += charset[values[i] % charset.length];
  }

  return result;
}
