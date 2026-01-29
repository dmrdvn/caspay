interface NonceEntry {
  nonce: string;
  publicKey: string;
  expiresAt: number;
}

class NonceStore {
  private store: Map<string, NonceEntry> = new Map();

  generate(publicKey: string): { nonce: string; expiresAt: number } {
    const nonce = crypto.randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.store.set(nonce, { nonce, publicKey, expiresAt });

    this.cleanup();

    return { nonce, expiresAt };
  }

  validate(nonce: string, publicKey: string): boolean {
    const entry = this.store.get(nonce);

    if (!entry) return false;
    if (entry.publicKey !== publicKey) return false;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(nonce);
      return false;
    }

    this.store.delete(nonce);
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [nonce, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(nonce);
      }
    }
  }
}

export const nonceStore = new NonceStore();
