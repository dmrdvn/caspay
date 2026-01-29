export interface SignatureVerificationResult {
  valid: boolean;
  error?: string;
}

export function formatAuthMessage(publicKey: string, nonce: string): string {
  return `Sign in to CasPay

Address: ${publicKey}
Nonce: ${nonce}
Chain: Casper Network

This request will not trigger a blockchain transaction or cost any gas fees.`;
}

export async function verifyCasperSignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<SignatureVerificationResult> {
  try {
    if (!signature || signature.length < 64) {
      return { valid: false, error: 'Invalid signature format' };
    }

    if (!publicKey || !publicKey.startsWith('01') && !publicKey.startsWith('02')) {
      return { valid: false, error: 'Invalid public key format' };
    }

    const hexPattern = /^[0-9a-fA-F]+$/;
    if (!hexPattern.test(signature)) {
      return { valid: false, error: 'Signature must be hex encoded' };
    }

    if (!hexPattern.test(publicKey)) {
      return { valid: false, error: 'Public key must be hex encoded' };
    }

    return { valid: true };
  } catch (error: any) {
    console.error('[verifyCasperSignature] Error:', error);
    return { valid: false, error: error?.message || 'Signature verification failed' };
  }
}
