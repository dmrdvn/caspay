import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyPendingPayments } from 'src/actions/payment';


async function handleVerification() {
  console.log('[verify-payments] Starting verification cron job...');
  
  try {
    const result = await verifyPendingPayments();

    if (!result.success) {
      console.error('[verify-payments] Verification failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log('[verify-payments] Verification completed:', result.summary);
    return NextResponse.json({ 
      success: true, 
      summary: result.summary 
    });
  } catch (err: any) {
    console.error('[verify-payments] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleVerification();
}

export async function POST(request: NextRequest) {
  return handleVerification();
}
