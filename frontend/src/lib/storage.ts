import { supabase } from './supabase';

/**
 * Cria uma signed URL para download/preview de um objeto privado no Supabase Storage.
 * @param bucket Nome do bucket (ex: user-uploads, rendered-videos, user-logos)
 * @param path Caminho interno do arquivo (ex: {userId}/{projectId}/{videoId}/original.mp4)
 * @param expiresIn Tempo de expiração em segundos (default: 3600 = 1 hora)
 */
export async function createSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  if (!path) return '';
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error(`Erro ao criar signed URL para o bucket "${bucket}" no caminho "${path}":`, error);
    throw new Error(`Não foi possível carregar o arquivo do storage (${bucket}/${path}).`);
  }

  return data.signedUrl;
}
