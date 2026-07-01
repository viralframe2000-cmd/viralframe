import { supabase, handleSupabaseError } from './supabase';
import { getCurrentUser } from './profile';
import { getOrCreateDefaultProject } from './videos';

export interface ExportJobStatus {
  id: string;
  status: string;
  total: number;
  processed: number;
  failed: number;
  export_storage_path: string | null;
  error_message: string | null;
}

/**
 * Cria um novo job de exportação ZIP no banco de dados.
 * @param total Quantidade total de vídeos que serão incluídos na exportação
 */
export async function createExportJob(total: number): Promise<string> {
  try {
    const user = await getCurrentUser();
    const projectId = await getOrCreateDefaultProject(user.id);

    const { data: job, error } = await supabase
      .from('export_jobs')
      .insert({
        user_id: user.id,
        project_id: projectId,
        status: 'queued',
        type: 'videos_zip',
        total,
        processed: 0,
        failed: 0,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      return handleSupabaseError(error, 'Não foi possível iniciar a exportação.');
    }

    return job.id;
  } catch (err: any) {
    console.error('Erro em createExportJob:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Falha ao iniciar a exportação dos arquivos.');
  }
}

/**
 * Consulta o status atual de um job de exportação específico.
 */
export async function getExportJob(jobId: string): Promise<ExportJobStatus> {
  try {
    const { data: job, error } = await supabase
      .from('export_jobs')
      .select('id, status, total, processed, failed, export_storage_path, error_message')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return handleSupabaseError(error || new Error('Job não encontrado'), 'Falha ao carregar status do export job.');
    }

    return {
      id: job.id,
      status: job.status,
      total: job.total || 0,
      processed: job.processed || 0,
      failed: job.failed || 0,
      export_storage_path: job.export_storage_path || null,
      error_message: job.error_message || null
    };
  } catch (err: any) {
    console.error('Erro em getExportJob:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Falha ao obter status da exportação.');
  }
}
