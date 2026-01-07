import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyPendingPayments } from 'src/actions/payment';


export async function POST(request: NextRequest) {
  try {
    const result = await verifyPendingPayments();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

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
