import { supabase, handleSupabaseError } from './supabase';
import { createSignedUrl } from './storage';

export interface ProfileSettingsData {
  display_name: string;
  handle: string;
  verified: boolean;
  logo_path?: string;
  avatar_path?: string | null;
  instagram_handle?: string;
}

/**
 * Obtém o usuário atualmente autenticado ou redireciona para login.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    window.location.href = '/login';
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }
  return user;
}

/**
 * Busca os dados de perfil do usuário autenticado diretamente na tabela public.profiles.
 */
export async function getProfile(): Promise<ProfileSettingsData> {
  try {
    const user = await getCurrentUser();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return handleSupabaseError(error, 'Não foi possível carregar o perfil.');
    }

    if (!profile) {
      return {
        display_name: '',
        handle: '',
        verified: true,
        logo_path: undefined,
        avatar_path: null,
        instagram_handle: ''
      };
    }

    let logoUrl: string | undefined = undefined;
    if (profile.avatar_path) {
      try {
        logoUrl = await createSignedUrl('user-logos', profile.avatar_path);
      } catch (err) {
        console.error('Erro ao gerar signed URL para a logo:', err);
      }
    }

    return {
      display_name: profile.display_name || '',
      handle: profile.instagram_handle || '',
      verified: true,
      logo_path: logoUrl,
      avatar_path: profile.avatar_path,
      instagram_handle: profile.instagram_handle
    };
  } catch (err: any) {
    console.error('Erro em getProfile:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível carregar o perfil.');
  }
}

/**
 * Salva ou atualiza os dados do perfil do usuário autenticado.
 */
export async function saveProfile(data: { display_name: string; handle: string; verified?: boolean }): Promise<ProfileSettingsData> {
  try {
    const user = await getCurrentUser();

    // Normaliza o arroba
    let normalizedHandle = data.handle.trim();
    if (normalizedHandle && !normalizedHandle.startsWith('@')) {
      normalizedHandle = '@' + normalizedHandle;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: data.display_name.trim(),
        instagram_handle: normalizedHandle,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return handleSupabaseError(error, 'Não foi possível salvar o perfil. Verifique sua sessão e tente novamente.');
    }

    return getProfile();
  } catch (err: any) {
    console.error('Erro em saveProfile:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível salvar o perfil.');
  }
}

/**
 * Faz upload da imagem de logo para o bucket user-logos e vincula ao perfil do usuário.
 */
export async function uploadProfileLogo(file: File): Promise<string> {
  try {
    const user = await getCurrentUser();

    // Valida tipo do arquivo
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato de arquivo inválido. Use PNG, JPG, JPEG ou WEBP.');
    }

    // Valida tamanho do arquivo (máximo de 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('O arquivo excede o limite de tamanho de 5MB.');
    }

    const storagePath = `${user.id}/logo.png`;

    // Upload com upsert: true para sobrescrever se já existir
    const { error: uploadError } = await supabase.storage
      .from('user-logos')
      .upload(storagePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      return handleSupabaseError(uploadError, 'Não foi possível enviar a logo. Tente outro arquivo.');
    }

    // Atualiza o registro em profiles com o path da logo
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_path: storagePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return handleSupabaseError(updateError, 'Não foi possível salvar o vínculo da logo ao seu perfil.');
    }

    // Gera e retorna signed URL para preview imediato
    return createSignedUrl('user-logos', storagePath);
  } catch (err: any) {
    console.error('Erro em uploadProfileLogo:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível enviar a logo.');
  }
}

/**
 * Limpa as configurações de perfil do usuário logado e apaga seu arquivo de logo no storage.
 */
export async function clearProfile(): Promise<ProfileSettingsData> {
  try {
    const user = await getCurrentUser();

    // Remove do storage o arquivo padrão logo.png
    const storagePath = `${user.id}/logo.png`;
    const { error: removeError } = await supabase.storage
      .from('user-logos')
      .remove([storagePath]);

    if (removeError) {
      console.error('Erro ao apagar arquivo de logo do storage:', removeError);
    }

    // Limpa a tabela profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: '',
        instagram_handle: '',
        avatar_path: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      return handleSupabaseError(updateError, 'Não foi possível limpar o perfil.');
    }

    return {
      display_name: '',
      handle: '',
      verified: true,
      logo_path: undefined,
      avatar_path: null,
      instagram_handle: ''
    };
  } catch (err: any) {
    console.error('Erro em clearProfile:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível limpar o perfil.');
  }
}
