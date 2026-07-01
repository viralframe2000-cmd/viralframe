import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '⚠️ Supabase URL ou Anon Key não configurados no arquivo .env. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

/**
 * Trata erros do Supabase de forma centralizada e amigável.
 */
export function handleSupabaseError(error: any, defaultMessage: string): never {
  console.error('Erro detalhado do Supabase:', error);
  if (!error) {
    throw new Error(defaultMessage);
  }
  
  const msg = error.message || '';
  const code = error.code || '';
  
  // Tratamento de erros de RLS / Permissões
  if (
    code === '42501' || 
    msg.toLowerCase().includes('row-level security') || 
    msg.toLowerCase().includes('permission denied') ||
    msg.toLowerCase().includes('violates row-level security')
  ) {
    throw new Error('Você não tem permissão para acessar este arquivo.');
  }

  // Tratamento de erros de Sessão / Token inválido
  if (
    msg.toLowerCase().includes('jwt') || 
    msg.toLowerCase().includes('invalid token') || 
    msg.toLowerCase().includes('session expired') ||
    msg.toLowerCase().includes('user not found')
  ) {
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  throw new Error(msg || defaultMessage);
}

