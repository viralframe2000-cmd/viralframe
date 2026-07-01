import { supabase, handleSupabaseError } from './supabase';
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
 * @param videoIds Opcional - Lista de IDs dos vídeos para renderização individual ou parcial.
 */
export async function createRenderJob(videoIds?: string[]): Promise<{ job_id: string }> {
  try {
    const user = await getCurrentUser();
    const projectId = await getOrCreateDefaultProject(user.id);

    // 1. Busca os vídeos a serem processados
    let query = supabase
      .from('videos')
      .select('id, original_filename, status, input_storage_path')
      .eq('user_id', user.id);

    if (videoIds && videoIds.length > 0) {
      // Geração explícita por ID: permite reprocessamento mesmo que já pronto/falhado
      query = query.in('id', videoIds);
    } else {
      // Geração em lote:
      // Só enfileira vídeos com input_storage_path preenchido, status diferente de 'processing', 'pronto' e 'rendered'
      query = query
        .not('input_storage_path', 'is', null)
        .not('status', 'eq', 'processing')
        .not('status', 'eq', 'pronto')
        .not('status', 'eq', 'rendered');
    }

    const { data: videos, error: fetchError } = await query;

    if (fetchError) {
      return handleSupabaseError(fetchError, 'Falha ao identificar vídeos para renderização.');
    }

    if (!videos || videos.length === 0) {
      throw new Error('Nenhum vídeo qualificado encontrado para renderização.');
    }

    const targetVideoIds = videos.map(v => v.id);

    // 2. Insere um novo job com status queued
    const { data: job, error: insertError } = await supabase
      .from('render_jobs')
      .insert({
        user_id: user.id,
        project_id: projectId,
        status: 'queued',
        total: targetVideoIds.length,
        processed: 0,
        failed: 0,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) {
      return handleSupabaseError(insertError, 'Não foi possível iniciar o processamento.');
    }

    // 3. Atualiza os vídeos correspondentes para o status queued
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'queued',
        render_job_id: job.id,
        updated_at: new Date().toISOString()
      })
      .in('id', targetVideoIds);

    if (updateError) {
      return handleSupabaseError(updateError, 'Não foi possível enfileirar os vídeos para processamento.');
    }

    return { job_id: job.id };
  } catch (err: any) {
    console.error('Erro em createRenderJob:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
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
      return handleSupabaseError(error || new Error('Job não encontrado'), 'Falha ao carregar status do job.');
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
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Falha ao obter status do processamento.');
  }
}
