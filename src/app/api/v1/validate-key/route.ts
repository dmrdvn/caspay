import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validatePublicApiKey, isValidationError } from 'src/lib/api/validate-api-key';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-caspay-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const result = await validatePublicApiKey(apiKey, 'write:payments');

    if (isValidationError(result)) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      merchantId: result.merchant_id,
      keyType: apiKey.startsWith('cp_live_') ? 'live' : 'test'
    });
  } catch (error: any) {
    console.error('API Key Validation Error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
