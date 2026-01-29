import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from 'src/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut();
    
    const cookieStore = await cookies();
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Logout] Error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
