import { NextRequest, NextResponse } from 'next/server';
import { formatAuthMessage } from 'src/lib/auth/casper-signature';
import { supabaseAdmin } from 'src/lib/supabase';

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
    const expiresAtDate = new Date(Date.now() + 5 * 60 * 1000);
    const message = formatAuthMessage(publicKey, nonce);

    const supabase = supabaseAdmin;

    const { error: insertError } = await supabase
      .from('auth_nonces')
      .insert({
        nonce,
        public_key: publicKey,
        expires_at: expiresAtDate.toISOString(),
      });

    if (insertError) {
      console.error('[Challenge] Failed to store nonce:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate challenge' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      nonce,
      message,
      expiresAt: expiresAtDate.getTime(),
    });
  } catch (error: any) {
    console.error('[Challenge] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}
