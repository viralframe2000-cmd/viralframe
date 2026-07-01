import { supabase } from './supabase';
import { getCurrentUser } from './profile';
import { getOrCreateDefaultProject } from './videos';

export interface JobStatus {
  job_id: string;
  total: number;
  processed: number;
  failed: number;
  status: string;
  message: string;
}

/**
 * Cria um job de renderização para vídeos específicos ou para todos os vídeos qualificados.
 * @param videoFilenames Opcional - Lista de nomes dos arquivos originais para renderização individual ou parcial.
 */
export async function createRenderJob(videoFilenames?: string[]): Promise<{ job_id: string }> {
  try {
    const user = await getCurrentUser();
    const projectId = await getOrCreateDefaultProject(user.id);

    // 1. Busca os vídeos a serem processados
    let query = supabase
      .from('videos')
      .select('id, original_filename')
      .eq('user_id', user.id);

    if (videoFilenames && videoFilenames.length > 0) {
      query = query.in('original_filename', videoFilenames);
    } else {
      // Vídeos qualificados para lote (todos que não estão processando nem enfileirados)
      query = query.in('status', ['uploaded', 'failed', 'edited']);
    }

    const { data: videos, error: fetchError } = await query;

    if (fetchError) {
      console.error('Erro ao buscar vídeos para render job:', fetchError);
      throw new Error('Falha ao identificar vídeos para renderização.');
    }

    if (!videos || videos.length === 0) {
      throw new Error('Nenhum vídeo qualificado encontrado para renderização.');
    }

    const videoIds = videos.map(v => v.id);

    // 2. Insere um novo job com status queued
    const { data: job, error: insertError } = await supabase
      .from('render_jobs')
      .insert({
        user_id: user.id,
        project_id: projectId,
        status: 'queued',
        total: videoIds.length,
        processed: 0,
        failed: 0,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Erro ao criar render job:', insertError);
      throw new Error('Não foi possível iniciar o processamento.');
    }

    // 3. Atualiza os vídeos correspondentes para o status queued
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'queued',
        updated_at: new Date().toISOString()
      })
      .in('id', videoIds);

    if (updateError) {
      console.error('Erro ao atualizar status dos vídeos para renderização:', updateError);
      throw new Error('Não foi possível enfileirar os vídeos para processamento.');
    }

    return { job_id: job.id };
  } catch (err: any) {
    console.error('Erro em createRenderJob:', err);
    throw new Error(err.message || 'Falha ao iniciar processamento.');
  }
}

/**
 * Consulta o status atual de um job de renderização específico.
 */
export async function getJob(jobId: string): Promise<JobStatus> {
  try {
    const { data: job, error } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      console.error(`Erro ao obter job ${jobId}:`, error);
      throw new Error('Falha ao carregar status do job.');
    }

    let message = 'Aguardando início do processamento...';
    const status = job.status;

    if (status === 'processing') {
      message = `Processando: ${job.processed} de ${job.total} concluídos (${job.failed} falhas)`;
    } else if (status === 'completed') {
      message = `Processamento concluído! ${job.processed} vídeos gerados.`;
    } else if (status === 'failed') {
      message = `Falha no processamento: ${job.error_message || 'Erro do servidor'}`;
    } else if (status === 'partial') {
      message = `Processamento concluído parcialmente com erros (${job.failed} falhas em ${job.total} vídeos).`;
    }

    return {
      job_id: job.id,
      total: job.total || 0,
      processed: job.processed || 0,
      failed: job.failed || 0,
      status: job.status,
      message
    };
  } catch (err: any) {
    console.error('Erro em getJob:', err);
    throw new Error(err.message || 'Falha ao obter status do processamento.');
  }
}
