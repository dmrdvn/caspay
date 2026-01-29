import { NextRequest, NextResponse } from 'next/server';
import { formatAuthMessage } from 'src/lib/auth/casper-signature';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get('publicKey');

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Public key is required' },
        { status: 400 }
      );
    }

    const nonce = crypto.randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const message = formatAuthMessage(publicKey, nonce);

    return NextResponse.json({
      nonce,
      message,
      expiresAt,
    });
  } catch (error: any) {
    console.error('[Challenge] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}
