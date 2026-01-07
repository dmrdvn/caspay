import type { ApiKeyPrefix, ApiKeyEnvironment } from 'src/types/api-key';


export function generateApiKey(environment: ApiKeyEnvironment): string {
  const prefix: ApiKeyPrefix = environment === 'live' ? 'cp_live_' : 'cp_test_';
  const secretLength = 24;
  const secret = generateSecureRandomString(secretLength);
  return `${prefix}${secret}`;
}


export async function hashApiKey(apiKey: string): Promise<string> {

  if (apiKey.startsWith('cp_test_')) {
    return apiKey;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function generateKeyHint(apiKey: string): string {

  if (apiKey.startsWith('cp_test_')) {
    return apiKey;
  }

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

export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {

  if (apiKey.startsWith('cp_test_')) {
    return apiKey === hash;
  }

  const computedHash = await hashApiKey(apiKey);
  return computedHash === hash;
}

export function extractEnvironment(apiKey: string): ApiKeyEnvironment | null {
  if (apiKey.startsWith('cp_live_')) {
    return 'live';
  }
  if (apiKey.startsWith('cp_test_')) {
    return 'test';
  }
  return null;
}

export function isValidApiKeyFormat(apiKey: string): boolean {
  const regex = /^cp_(live|test)_[a-z0-9]{24}$/;
  return regex.test(apiKey);
}

function generateSecureRandomString(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);

  let result = '';
  for (let i = 0; i < length; i += 1) {

    result += charset[values[i] % charset.length];
  }

  return result;
}
