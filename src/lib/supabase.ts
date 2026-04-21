import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if we are using placeholder values
export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' && 
  !supabaseUrl.includes('placeholder-url') &&
  !supabaseAnonKey.includes('placeholder-key');

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    'Supabase is not configured. Real-time features and uploads will be disabled. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Photo = {
  id: string;
  created_at: string;
  url: string;
  thumbnail_url?: string;
  guest_name: string;
  caption?: string;
  event_id: string;
};
