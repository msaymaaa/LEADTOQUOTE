import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials as requested to guarantee instant connectivity
// regardless of .env file loading in the preview container.
const RAW_SUPABASE_URL = 'https://ayjymfziwgmvgwjnqfxe.supabase.co/rest/v1/';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5anltZnppd2dtdmd3am5xZnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MDYwNjgsImV4cCI6MjEwNTM4MjA2OH0.mZQEYycVbJjz4vIK7b62vAdIRwVYCI9YaV1fAjWVyIo';

// Normalize URL: Strip trailing '/rest/v1/' or '/' so that both Supabase Auth (/auth/v1)
// and PostgREST (/rest/v1) sub-routes resolve correctly to https://ayjymfziwgmvgwjnqfxe.supabase.co
export const SUPABASE_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

// Prioritize environment variable if set, otherwise use hardcoded credentials
const resolvedUrl = (import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL).trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const resolvedAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY).trim();

export const supabase = createClient(
  resolvedUrl,
  resolvedAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

export interface ProfileRecord {
  id: string;
  full_name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}
