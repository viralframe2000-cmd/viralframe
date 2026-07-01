import { supabase } from './supabase';

/**
 * Cria uma signed URL para download/preview de um objeto privado no Supabase Storage.
 * @param bucket Nome do bucket (ex: user-uploads, rendered-videos, user-logos, exports)
 * @param path Caminho interno do arquivo (ex: {userId}/{projectId}/{videoId}/original.mp4)
 * @param expiresIn Tempo de expiração em segundos (default: 3600 = 1 hora)
 * @param downloadName Opcional - Nome do arquivo para forçar o download direto
 */
export async function createSignedUrl(
  bucket: string, 
  path: string, 
  expiresIn = 3600,
  downloadName?: string
): Promise<string> {
  if (!path) return '';
  
  const options = downloadName ? { download: downloadName } : undefined;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn, options);

  if (error) {
    console.error(`Erro ao criar signed URL para o bucket "${bucket}" no caminho "${path}":`, error);
    throw new Error(`Não foi possível carregar o arquivo do storage (${bucket}/${path}).`);
  }

  return data.signedUrl;
}

interface DownloadParams {
  bucket: string;
  path: string;
  filename: string;
}

/**
 * Baixa um arquivo do Supabase Storage diretamente no computador do usuário,
 * garantindo que não abra novas abas no navegador usando uma abordagem de Blob como fallback.
 */
export async function downloadStorageFile({ bucket, path, filename }: DownloadParams): Promise<void> {
  try {
    // 1. Tenta gerar a URL assinada com a instrução de download correspondente
    const signedUrl = await createSignedUrl(bucket, path, 3600, filename);
    
    if (!signedUrl) {
      throw new Error("Signed URL vazia.");
    }

    // 2. Realiza o download por Blob para garantir que o navegador faça o download local direto
    // sem abrir uma nova aba ou player de vídeo nativo (como no caso do Safari/Chrome em MP4)
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Falha na requisição de fetch do arquivo (${response.statusText}).`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // 3. Cria um link temporário para forçar o download no client-side
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    
    // Anexa ao corpo do documento para compatibilidade com navegadores legados/mobile
    document.body.appendChild(link);
    link.click();
    
    // Limpeza
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err: any) {
    console.error(`Erro ao executar downloadStorageFile para ${bucket}/${path}:`, err);
    throw new Error(err.message || "Não foi possível baixar o arquivo do storage.");
  }
}
