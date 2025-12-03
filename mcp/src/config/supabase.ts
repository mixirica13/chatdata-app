import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Client for user operations (uses anon key with RLS)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Admin client for server operations (bypasses RLS)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
