import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Check whether Supabase configuration environment variables are present and valid.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== 'YOUR_SUPABASE_URL' &&
      supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
      supabaseUrl.startsWith('http')
  );
}

/**
 * Returns error detail message if configuration is missing or placeholder.
 */
export function getSupabaseConfigError(): string | null {
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    return 'Missing VITE_SUPABASE_URL environment variable. Please configure VITE_SUPABASE_URL in your environment or secrets.';
  }
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    return 'Missing VITE_SUPABASE_ANON_KEY environment variable. Please configure VITE_SUPABASE_ANON_KEY in your environment or secrets.';
  }
  if (!supabaseUrl.startsWith('http')) {
    return 'Invalid VITE_SUPABASE_URL environment variable. Must start with http:// or https://.';
  }
  return null;
}

/**
 * Singleton Supabase client instance using ONLY the public ANON KEY.
 * NEVER use the Service Role Key in frontend code.
 */
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const configErr = getSupabaseConfigError();
  if (configErr) {
    console.error('Supabase Config Error:', configErr);
    throw new Error(configErr);
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

export { supabaseUrl, supabaseAnonKey };
