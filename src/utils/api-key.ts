import bcrypt from 'bcryptjs';

import type { ApiKeyPrefix, ApiKeyEnvironment } from 'src/types/api-key';


export function generateApiKey(environment: ApiKeyEnvironment): string {
  const prefix: ApiKeyPrefix = environment === 'live' ? 'cp_live_' : 'cp_test_';
  const secretLength = 24;
  const secret = generateSecureRandomString(secretLength);
  return `${prefix}${secret}`;
}

export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, 8);
}

export function generateKeyHint(apiKey: string): string {
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
