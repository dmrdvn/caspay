import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';


// ----------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (used in hooks and client components)
export const supabase =
  supabaseUrl && supabaseKey
    ? createSupabaseClient(supabaseUrl, supabaseKey)
    : ({} as SupabaseClient<any, 'public', any>);

// Server-side Supabase client with service role (bypasses RLS)
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : ({} as SupabaseClient<any, 'public', any>);

// Server-side Supabase client creator (used in server actions and server components)
export async function createClient(): Promise<SupabaseClient<any, 'public', any>> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key must be configured');
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
}
