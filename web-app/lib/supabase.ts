import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

// Comprehensive logging for Supabase initialization
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 [Supabase Init] Checking environment variables...');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 40)}...` : '❌ MISSING');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ MISSING');
}

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  [Supabase Init] Environment variables missing. Calculation tracking will be disabled.');
    console.warn('   To enable tracking, create .env.local in web-app/ with:');
    console.warn('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  }
} else {
  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.error('❌ [Supabase Init] Invalid URL format. Should be: https://xxx.supabase.co');
    console.error('   Current URL:', supabaseUrl);
  } else {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ [Supabase Init] Client created successfully');
        console.log('   URL:', supabaseUrl);
      }
    } catch (error: any) {
      console.error('❌ [Supabase Init] Failed to create client:', error.message);
      supabase = null;
    }
  }
}

export { supabase };

