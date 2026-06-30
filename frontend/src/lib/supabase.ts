import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback visual caso não esteja configurado
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL ou Anon Key não configurados no arquivo .env. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
