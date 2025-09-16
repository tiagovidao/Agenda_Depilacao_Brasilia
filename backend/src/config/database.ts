import { createClient } from '@supabase/supabase-js';
import { config } from './env';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);