import { supabase } from './supabase';
import { getCurrentUser } from './profile';
import { createSignedUrl } from './storage';

export interface VideoStatus {
  id?: string;
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
    console.error('Erro ao buscar projetos:', error);
    throw new Error('Erro ao identificar seu projeto principal.');
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
    console.error('Erro ao criar projeto principal:', createError);
    throw new Error('Não foi possível criar um projeto padrão.');
  }

  return newProject.id;
}

/**
 * Envia múltiplos vídeos para o Supabase Storage (bucket user-uploads) e cria os registros correspondentes.
 */
export async function uploadVideos(files: File[]): Promise<{ uploaded: string[]; failed: string[] }> {
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
        failed.push(file.name);
        continue;
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
        failed.push(file.name);
        continue;
      }

      const videoId = videoRecord.id;
      const storagePath = `${user.id}/${projectId}/${videoId}/original${ext}`;

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
        failed.push(file.name);
      } else {
        uploaded.push(file.name);
      }
    }

    return { uploaded, failed };
  } catch (err: any) {
    console.error('Erro geral no upload de vídeos:', err);
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
      console.error('Erro ao consultar a tabela videos:', error);
      throw new Error('Não foi possível carregar a lista de vídeos.');
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

      // Se existe os arquivos renderizados
      const isPronto = video.status === 'pronto';
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

      videoStatuses.push({
        id: video.id,
        filename: video.original_filename,
        status: video.status,
        exists_output: isPronto && !!video.output_storage_path,
        video_url: videoUrl,
        caption_url: captionUrl,
        cover_url: coverUrl,
        pov_text: video.pov_text || '',
        caption_text: video.caption_text || '',
        input_preview_url: inputPreviewUrl,
        output_preview_url: outputPreviewUrl,
        has_output: isPronto && !!video.output_storage_path
      });
    }

    return videoStatuses;
  } catch (err: any) {
    console.error('Erro em listVideos:', err);
    throw new Error(err.message || 'Não foi possível listar os vídeos.');
  }
}

/**
 * Salva metadados dos vídeos (pov_text e caption_text) a partir da lista editada na UI.
 */
export async function saveMetadata(items: { filename: string; pov_text: string; caption_text: string }[]): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();

    for (const item of items) {
      const { error } = await supabase
        .from('videos')
        .update({
          pov_text: item.pov_text,
          caption_text: item.caption_text,
          status: 'edited',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('original_filename', item.filename);

      if (error) {
        console.error(`Erro ao salvar metadados do vídeo ${item.filename}:`, error);
        throw new Error(`Não foi possível salvar os dados do vídeo ${item.filename}.`);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro em saveMetadata:', err);
    throw new Error(err.message || 'Erro ao salvar metadados.');
  }
}

/**
 * Exclui fisicamente o vídeo e suas dependências nos buckets do Supabase Storage e na tabela videos.
 */
export async function deleteVideo(filename: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();

    // 1. Busca os dados do vídeo para obter os caminhos de storage
    const { data: videos, error: selectError } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .eq('original_filename', filename);

    if (selectError) {
      console.error(`Erro ao consultar vídeo ${filename} para remoção:`, selectError);
      throw new Error(`Falha ao excluir o vídeo.`);
    }

    for (const video of videos) {
      // 2. Remove os arquivos físicos dos buckets
      if (video.input_storage_path) {
        const { error: err1 } = await supabase.storage
          .from('user-uploads')
          .remove([video.input_storage_path]);
        if (err1) console.error(`Erro ao remover vídeo original ${video.input_storage_path}:`, err1);
      }

      const renderedFiles: string[] = [];
      if (video.output_storage_path) renderedFiles.push(video.output_storage_path);
      if (video.cover_storage_path) renderedFiles.push(video.cover_storage_path);
      if (video.caption_storage_path) renderedFiles.push(video.caption_storage_path);

      if (renderedFiles.length > 0) {
        const { error: err2 } = await supabase.storage
          .from('rendered-videos')
          .remove(renderedFiles);
        if (err2) console.error(`Erro ao remover arquivos renderizados:`, err2);
      }

      // 3. Remove o registro da tabela videos
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id);

      if (deleteError) {
        console.error(`Erro ao apagar registro do banco para vídeo ${video.id}:`, deleteError);
        throw new Error('Falha ao remover o registro do banco.');
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro em deleteVideo:', err);
    throw new Error(err.message || 'Erro ao apagar arquivo.');
  }
}
