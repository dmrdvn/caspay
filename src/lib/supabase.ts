import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && supabaseKey
    ? createSupabaseClient(supabaseUrl, supabaseKey)
    : ({} as SupabaseClient<any, 'public', any>);

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : ({} as SupabaseClient<any, 'public', any>);

