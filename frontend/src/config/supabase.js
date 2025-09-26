import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Debug logging
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'not set',
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  envUrl: import.meta.env.VITE_SUPABASE_URL,
  envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing'
});

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.error('❌ Supabase URL not configured properly!');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.error('❌ Supabase Anon Key not configured properly!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: true
  }
});

console.log('✅ Supabase client created successfully');

export default supabase;
