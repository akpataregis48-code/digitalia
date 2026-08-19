import { createClient } from '@supabase/supabase-js';
import { PostgrestClient } from '@supabase/postgrest-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error('Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const DB_MODE: 'cloud' | 'local' = import.meta.env.VITE_DB_MODE === 'local' ? 'local' : 'cloud';

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const localUrl = import.meta.env.VITE_LOCAL_API_URL as string;
const localKey = import.meta.env.VITE_LOCAL_ANON_KEY as string;

if (DB_MODE === 'local' && (!localUrl || !localKey)) {
  throw new Error(
    'Missing local API config for LOCAL mode. Set VITE_LOCAL_API_URL and VITE_LOCAL_ANON_KEY in .env.local'
  );
}

export const data: PostgrestClient =
  DB_MODE === 'local'
    ? new PostgrestClient(localUrl, {
        headers: {
          apikey: localKey,
          Authorization: `Bearer ${localKey}`,
        },
      })
    : (supabase as unknown as PostgrestClient);

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;
