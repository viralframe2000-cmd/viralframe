import { supabase, handleSupabaseError } from './supabase';
import { getCurrentUser } from './profile';
import { createSignedUrl } from './storage';

export interface VideoStatus {
  id: string;
  filename: string;
  status: string;
  exists_output: boolean;
  video_url: string | null;
  caption_url: string | null;
  cover_url: string | null;
  pov_text?: string;
  caption_text?: string;
  input_preview_url: string | null;
  output_preview_url: string | null;
  input_signed_url?: string | null;
  output_signed_url?: string | null;
  has_output: boolean;
}

/**
 * Busca ou cria um projeto padrão ("Projeto Principal") para o usuário.
 */
export async function getOrCreateDefaultProject(userId: string): Promise<string> {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    return handleSupabaseError(error, 'Erro ao identificar seu projeto principal.');
  }

  if (projects && projects.length > 0) {
    return projects[0].id;
  }

  // Cria um projeto principal
  const { data: newProject, error: createError } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: 'Projeto Principal'
    })
    .select('id')
    .single();

  if (createError) {
    return handleSupabaseError(createError, 'Não foi possível criar um projeto padrão.');
  }

  return newProject.id;
}

/**
 * Envia múltiplos vídeos para o Supabase Storage (bucket user-uploads) e cria os registros correspondentes.
 * Oferece suporte a callback de progresso por arquivo para fornecer feedback em tempo real na interface.
 */
export async function uploadVideos(
  files: File[],
  onFileProgress?: (filename: string, status: 'uploading' | 'uploaded' | 'failed', errorMsg?: string) => void
): Promise<{ uploaded: string[]; failed: string[] }> {
  try {
    const user = await getCurrentUser();
    const projectId = await getOrCreateDefaultProject(user.id);

    const uploaded: string[] = [];
    const failed: string[] = [];

    const allowedExtensions = ['.mp4', '.mov', '.mkv', '.webm'];

    for (const file of files) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        console.warn(`Formato de arquivo inválido para ${file.name}`);
        if (onFileProgress) {
          onFileProgress(file.name, 'failed', 'Formato de arquivo inválido. Use MP4, MOV, MKV ou WebM.');
        }
        failed.push(file.name);
        continue;
      }

      // Notifica início do upload do arquivo
      if (onFileProgress) {
        onFileProgress(file.name, 'uploading');
      }

      // 1. Cria um registro inicial na tabela videos para obter o ID gerado automaticamente
      const { data: videoRecord, error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          project_id: projectId,
          original_filename: file.name,
          status: 'uploading'
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`Erro ao registrar vídeo ${file.name} no banco:`, insertError);
        if (onFileProgress) {
          onFileProgress(file.name, 'failed', 'Erro ao inicializar registro de vídeo no banco.');
        }
        failed.push(file.name);
        continue;
      }

      const videoId = videoRecord.id;
      const cleanExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const storagePath = `${user.id}/${projectId}/${videoId}/original.${cleanExt}`;

      // 2. Upload do arquivo para o bucket user-uploads
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(storagePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error(`Erro ao enviar arquivo físico ${file.name} ao storage:`, uploadError);

        // Atualiza status do banco para falhado
        await supabase
          .from('videos')
          .update({
            status: 'failed',
            error_message: 'Erro de upload de arquivo: ' + uploadError.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', videoId);

        if (onFileProgress) {
          onFileProgress(file.name, 'failed', uploadError.message);
        }
        failed.push(file.name);
        continue;
      }

      // 3. Atualiza o registro final com o caminho de armazenamento e status uploaded
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          input_storage_path: storagePath,
          status: 'uploaded',
          updated_at: new Date().toISOString()
        })
        .eq('id', videoId);

      if (updateError) {
        console.error(`Erro ao atualizar registro de vídeo ${file.name}:`, updateError);
        if (onFileProgress) {
          onFileProgress(file.name, 'failed', 'Erro ao atualizar dados finais do vídeo.');
        }
        failed.push(file.name);
      } else {
        if (onFileProgress) {
          onFileProgress(file.name, 'uploaded');
        }
        uploaded.push(file.name);
      }
    }

    return { uploaded, failed };
  } catch (err: any) {
    console.error('Erro geral no upload de vídeos:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error('Não foi possível enviar os vídeos. Verifique sua conexão e tente novamente.');
  }
}

/**
 * Lista todos os vídeos do usuário, com as URLs assinadas de visualização/download de buckets privados.
 */
export async function listVideos(): Promise<VideoStatus[]> {
  try {
    const user = await getCurrentUser();

    const { data: dbVideos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return handleSupabaseError(error, 'Não foi possível carregar a lista de vídeos.');
    }

    const videoStatuses: VideoStatus[] = [];

    for (const video of dbVideos) {
      let inputPreviewUrl: string | null = null;
      let outputPreviewUrl: string | null = null;
      let videoUrl: string | null = null;
      let captionUrl: string | null = null;
      let coverUrl: string | null = null;

      // Se existe o arquivo original de upload
      if (video.input_storage_path) {
        try {
          inputPreviewUrl = await createSignedUrl('user-uploads', video.input_storage_path);
        } catch (err) {
          console.error(`Erro ao assinar URL de entrada para ${video.original_filename}:`, err);
        }
      }

      // Se existe os arquivos renderizados (ou pronto do worker)
      const isPronto = video.status === 'pronto' || video.status === 'rendered';
      if (isPronto && video.output_storage_path) {
        try {
          outputPreviewUrl = await createSignedUrl('rendered-videos', video.output_storage_path);
          videoUrl = outputPreviewUrl;
        } catch (err) {
          console.error(`Erro ao assinar URL de saída para ${video.original_filename}:`, err);
        }
      }

      if (isPronto && video.caption_storage_path) {
        try {
          captionUrl = await createSignedUrl('rendered-videos', video.caption_storage_path);
        } catch (err) {
          console.error(`Erro ao assinar URL de legenda para ${video.original_filename}:`, err);
        }
      }

      if (isPronto && video.cover_storage_path) {
        try {
          coverUrl = await createSignedUrl('rendered-videos', video.cover_storage_path);
        } catch (err) {
          console.error(`Erro ao assinar URL de capa para ${video.original_filename}:`, err);
        }
      }

      // Padroniza status 'pronto' para 'rendered' na UI
      let mappedStatus = video.status;
      if (mappedStatus === 'pronto') {
        mappedStatus = 'rendered';
      }

      videoStatuses.push({
        id: video.id,
        filename: video.original_filename,
        status: mappedStatus,
        exists_output: isPronto && !!video.output_storage_path,
        video_url: videoUrl,
        caption_url: captionUrl,
        cover_url: coverUrl,
        pov_text: video.pov_text || '',
        caption_text: video.caption_text || '',
        input_preview_url: inputPreviewUrl,
        output_preview_url: outputPreviewUrl,
        input_signed_url: inputPreviewUrl,
        output_signed_url: outputPreviewUrl,
        has_output: isPronto && !!video.output_storage_path
      });
    }

    return videoStatuses;
  } catch (err: any) {
    console.error('Erro em listVideos:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível listar os vídeos.');
  }
}

/**
 * Salva metadados dos vídeos (pov_text e caption_text).
 * Só altera o status para 'edited' se o status atual for 'uploaded', 'empty' ou nulo.
 */
export async function saveMetadata(items: { filename: string; pov_text: string; caption_text: string }[]): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();
    const filenames = items.map(i => i.filename);

    // 1. Consulta o status atual dos vídeos a serem atualizados
    const { data: dbVideos, error: selectError } = await supabase
      .from('videos')
      .select('id, original_filename, status')
      .eq('user_id', user.id)
      .in('original_filename', filenames);

    if (selectError) {
      return handleSupabaseError(selectError, 'Não foi possível consultar os vídeos.');
    }

    for (const item of items) {
      const matchedVideo = dbVideos?.find(v => v.original_filename === item.filename);
      const currentStatus = matchedVideo?.status;

      const updatePayload: any = {
        pov_text: item.pov_text,
        caption_text: item.caption_text,
        updated_at: new Date().toISOString()
      };

      // Só muda para edited se o status atual for 'uploaded', 'empty', vazio ou nulo
      if (!currentStatus || currentStatus === 'uploaded' || currentStatus === 'empty') {
        updatePayload.status = 'edited';
      }

      const { error } = await supabase
        .from('videos')
        .update(updatePayload)
        .eq('user_id', user.id)
        .eq('original_filename', item.filename);

      if (error) {
        return handleSupabaseError(error, `Não foi possível salvar os dados do vídeo ${item.filename}.`);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro em saveMetadata:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Erro ao salvar metadados.');
  }
}

/**
 * Exclui fisicamente o vídeo e suas dependências nos buckets do Supabase Storage e na tabela videos.
 * Identifica o vídeo por ID para garantir segurança.
 */
export async function deleteVideo(videoId: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();

    // 1. Busca os dados do vídeo pelo ID
    const { data: video, error: selectError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', videoId)
      .maybeSingle();

    if (selectError) {
      return handleSupabaseError(selectError, 'Falha ao buscar vídeo para exclusão.');
    }

    if (!video) {
      throw new Error('Vídeo não encontrado.');
    }

    // 2. Remove os arquivos físicos dos buckets se caminhos não forem vazios
    if (video.input_storage_path && video.input_storage_path.trim() !== '') {
      try {
        const { error: err1 } = await supabase.storage
          .from('user-uploads')
          .remove([video.input_storage_path]);
        if (err1) console.error(`Erro ao remover vídeo original ${video.input_storage_path}:`, err1);
      } catch (e) {
        console.error('Erro ao remover arquivo de entrada do storage:', e);
      }
    }

    const renderedFiles: string[] = [];
    if (video.output_storage_path && video.output_storage_path.trim() !== '') renderedFiles.push(video.output_storage_path);
    if (video.cover_storage_path && video.cover_storage_path.trim() !== '') renderedFiles.push(video.cover_storage_path);
    if (video.caption_storage_path && video.caption_storage_path.trim() !== '') renderedFiles.push(video.caption_storage_path);

    if (renderedFiles.length > 0) {
      try {
        const { error: err2 } = await supabase.storage
          .from('rendered-videos')
          .remove(renderedFiles);
        if (err2) console.error(`Erro ao remover arquivos renderizados:`, err2);
      } catch (e) {
        console.error('Erro ao remover arquivos renderizados do storage:', e);
      }
    }

    // 3. Remove o registro da tabela videos por ID
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', video.id);

    if (deleteError) {
      return handleSupabaseError(deleteError, 'Falha ao remover o registro do banco.');
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro em deleteVideo:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Erro ao apagar arquivo.');
  }
}

/**
 * Exclui fisicamente todos os vídeos do usuário autenticado atual nos buckets do Supabase Storage e na tabela videos.
 */
export async function deleteAllVideos(): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const user = await getCurrentUser();

    // 1. Busca os dados de todos os vídeos para obter os caminhos de storage
    const { data: videos, error: selectError } = await supabase
      .from('videos')
      .select('id, original_filename, input_storage_path, output_storage_path, cover_storage_path, caption_storage_path')
      .eq('user_id', user.id);

    if (selectError) {
      return handleSupabaseError(selectError, 'Falha ao consultar vídeos para exclusão.');
    }

    if (!videos || videos.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // 2. Coletar caminhos de storage a serem deletados de forma segura (não nulos/vazios)
    const inputPaths = videos
      .map(v => v.input_storage_path)
      .filter((p): p is string => typeof p === 'string' && p.trim() !== '');

    const renderedFiles = videos
      .flatMap(v => [v.output_storage_path, v.cover_storage_path, v.caption_storage_path])
      .filter((p): p is string => typeof p === 'string' && p.trim() !== '');

    // 3. Remove os arquivos físicos do bucket user-uploads, continuando mesmo com falhas
    if (inputPaths.length > 0) {
      try {
        const { error: err1 } = await supabase.storage
          .from('user-uploads')
          .remove(inputPaths);
        if (err1) console.error(`Erro ao remover vídeos originais do storage:`, err1);
      } catch (e) {
        console.error('Falha de exclusão física dos originais:', e);
      }
    }

    // 4. Remove os arquivos físicos do bucket rendered-videos, continuando mesmo com falhas
    if (renderedFiles.length > 0) {
      try {
        const { error: err2 } = await supabase.storage
          .from('rendered-videos')
          .remove(renderedFiles);
        if (err2) console.error(`Erro ao remover arquivos renderizados do storage:`, err2);
      } catch (e) {
        console.error('Falha de exclusão física dos renderizados:', e);
      }
    }

    // 5. Remove todos os registros da tabela videos do usuário
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      return handleSupabaseError(deleteError, 'Falha ao remover os registros do banco.');
    }

    return { success: true, deletedCount: videos.length };
  } catch (err: any) {
    console.error('Erro em deleteAllVideos:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Erro ao apagar todos os arquivos.');
  }
}
