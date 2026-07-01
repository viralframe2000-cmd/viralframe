import { supabase, handleSupabaseError } from './supabase';
import { getCurrentUser } from './profile';
import { listVideos } from './videos';
import type { VideoStatus } from './videos';

export interface PhraseItem {
  id: string;
  pov_text: string;
  caption_text: string;
  categoria?: string | null;
  tom?: string | null;
  ativo: string; // 'Sim' ou 'Não' (compatibilidade com a UI)
}

export interface PhraseListResponse {
  phrases: PhraseItem[];
  total: number;
  active: number;
}

/**
 * Busca ou cria um banco de frases padrão para o usuário.
 */
export async function getOrCreateDefaultPhraseBank(userId: string): Promise<string> {
  const { data: banks, error } = await supabase
    .from('phrase_banks')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    return handleSupabaseError(error, 'Erro ao identificar seu banco de frases.');
  }

  if (banks && banks.length > 0) {
    return banks[0].id;
  }

  // Cria um banco de frases default
  const { data: newBank, error: createError } = await supabase
    .from('phrase_banks')
    .insert({
      user_id: userId,
      name: 'Banco de Frases'
    })
    .select('id')
    .single();

  if (createError) {
    return handleSupabaseError(createError, 'Não foi possível criar um banco de frases.');
  }

  return newBank.id;
}

/**
 * Faz parse nativo de uma linha de CSV, lidando corretamente com aspas.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

/**
 * Faz upload e processa o arquivo CSV de frases localmente no cliente, salvando-as no Supabase.
 */
export async function uploadPhrases(file: File): Promise<{ success: boolean; total: number; active: number }> {
  try {
    const user = await getCurrentUser();
    const phraseBankId = await getOrCreateDefaultPhraseBank(user.id);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          if (!content) {
            throw new Error('O arquivo CSV está vazio.');
          }

          const lines = content.split(/\r?\n/);
          if (lines.length <= 1) {
            throw new Error('O arquivo CSV deve conter um cabeçalho e pelo menos uma linha de dados.');
          }

          // Lê o cabeçalho e identifica as colunas
          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
          const povIndex = headers.indexOf('pov_text');
          const captionIndex = headers.indexOf('caption_text');

          if (povIndex === -1 || captionIndex === -1) {
            throw new Error('O CSV precisa conter pov_text e caption_text.');
          }

          const categoriaIndex = headers.indexOf('categoria');
          const tomIndex = headers.indexOf('tom');
          const ativoIndex = headers.indexOf('ativo');

          const phrasesToInsert: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = parseCsvLine(line);

            // Ignora linhas incompletas
            if (cols.length <= Math.max(povIndex, captionIndex)) continue;

            const pov_text = cols[povIndex]?.trim();
            const caption_text = cols[captionIndex]?.trim();

            if (!pov_text && !caption_text) continue;

            const categoria = categoriaIndex !== -1 ? cols[categoriaIndex]?.trim() || 'Geral' : 'Geral';
            const tom = tomIndex !== -1 ? cols[tomIndex]?.trim() || 'Neutro' : 'Neutro';

            // Comportamento do campo ativo:
            // "Não" ou "nao" = false
            // "Sim" = true
            // Vazio, coluna ausente ou qualquer outro valor = true
            let ativo = true;
            if (ativoIndex !== -1) {
              const activeStr = cols[ativoIndex]?.trim().toLowerCase();
              if (activeStr === 'não' || activeStr === 'nao' || activeStr === 'false' || activeStr === '0') {
                ativo = false;
              }
            }

            phrasesToInsert.push({
              user_id: user.id,
              phrase_bank_id: phraseBankId,
              pov_text: pov_text || '',
              caption_text: caption_text || '',
              categoria,
              tom,
              ativo
            });
          }

          if (phrasesToInsert.length === 0) {
            throw new Error('Nenhuma frase válida encontrada para inserção.');
          }

          // Insere em lote no Supabase
          const { error: insertError } = await supabase
            .from('phrases')
            .insert(phrasesToInsert);

          if (insertError) {
            return handleSupabaseError(insertError, 'Não foi possível salvar as frases no banco de dados.');
          }

          const freshInfo = await listPhrases();
          resolve({
            success: true,
            total: freshInfo.total,
            active: freshInfo.active
          });

        } catch (err: any) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Erro de leitura do arquivo CSV.'));
      reader.readAsText(file, 'UTF-8');
    });
  } catch (err: any) {
    console.error('Erro em uploadPhrases:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível carregar o banco de frases.');
  }
}

/**
 * Retorna todas as frases cadastradas pelo usuário.
 */
export async function listPhrases(): Promise<PhraseListResponse> {
  try {
    const user = await getCurrentUser();

    const { data: dbPhrases, error, count } = await supabase
      .from('phrases')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (error) {
      return handleSupabaseError(error, 'Não foi possível carregar o banco de frases.');
    }

    const phrases: PhraseItem[] = (dbPhrases || []).map(p => ({
      id: p.id,
      pov_text: p.pov_text,
      caption_text: p.caption_text,
      categoria: p.categoria,
      tom: p.tom,
      ativo: p.ativo ? 'Sim' : 'Não'
    }));

    const activeCount = dbPhrases ? dbPhrases.filter(p => p.ativo).length : 0;

    return {
      phrases,
      total: count || 0,
      active: activeCount
    };
  } catch (err: any) {
    console.error('Erro em listPhrases:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Não foi possível carregar o banco de frases.');
  }
}

/**
 * Aplica frases ativas de forma aleatória na lista de vídeos.
 */
export async function applyRandomPhrases(overwrite: boolean): Promise<VideoStatus[]> {
  try {
    const user = await getCurrentUser();

    // 1. Busca vídeos
    const { data: videos, error: videoError } = await supabase
      .from('videos')
      .select('id, pov_text, caption_text, status')
      .eq('user_id', user.id);

    if (videoError) {
      return handleSupabaseError(videoError, 'Erro ao buscar seus vídeos.');
    }

    if (!videos || videos.length === 0) {
      throw new Error('Nenhum vídeo encontrado na fila.');
    }

    // 2. Busca frases ativas
    const { data: activePhrases, error: phrasesError } = await supabase
      .from('phrases')
      .select('pov_text, caption_text')
      .eq('user_id', user.id)
      .eq('ativo', true);

    if (phrasesError) {
      return handleSupabaseError(phrasesError, 'Erro ao buscar frases no banco de dados.');
    }

    if (!activePhrases || activePhrases.length === 0) {
      throw new Error('Nenhuma frase ativa cadastrada no banco de frases.');
    }

    // Embaralha as frases
    const shuffled = [...activePhrases].sort(() => Math.random() - 0.5);
    let phraseIdx = 0;

    for (const video of videos) {
      const isVazio = !video.pov_text?.trim() && !video.caption_text?.trim();

      // Se não for sobrescrever e já estiver preenchido, ignora
      if (!overwrite && !isVazio) continue;

      const frase = shuffled[phraseIdx % shuffled.length];
      phraseIdx++;

      const updatePayload: any = {
        pov_text: frase.pov_text,
        caption_text: frase.caption_text,
        updated_at: new Date().toISOString()
      };

      // Só altera o status para 'edited' se o status atual for 'uploaded', 'empty', nulo ou vazio
      const currentStatus = video.status;
      if (!currentStatus || currentStatus === 'uploaded' || currentStatus === 'empty') {
        updatePayload.status = 'edited';
      }

      const { error: updateError } = await supabase
        .from('videos')
        .update(updatePayload)
        .eq('id', video.id);

      if (updateError) {
        console.error(`Erro ao aplicar frase no vídeo ID ${video.id}:`, updateError);
      }
    }

    // Retorna a lista atualizada de vídeos
    return listVideos();
  } catch (err: any) {
    console.error('Erro em applyRandomPhrases:', err);
    if (err.message && (err.message.includes('permissão') || err.message.includes('sessão'))) {
      throw err;
    }
    throw new Error(err.message || 'Falha ao aplicar frases.');
  }
}

/**
 * Gera e realiza o download do CSV modelo totalmente no client-side.
 */
export function downloadPhraseTemplate() {
  const headers = 'pov_text,caption_text,categoria,tom,ativo\n';
  const row1 = '"POV: você achou o nicho certo de vídeos","Crie vídeos automatizados usando inteligência artificial e venda no piloto automático. Clique no link da bio!",Geral,Neutro,Sim\n';
  const row2 = '"POV: você cansou de gastar horas editando","O ViralFrame Studio faz tudo por você em menos de 1 minuto.",Geral,Neutro,Sim\n';
  const row3 = '"POV: como economizar R$ 2000 em edições","Com o ViralFrame, a inteligência artificial gera centenas de vídeos automatizados.",Financeiro,Profissional,Não\n';

  const csvContent = '\uFEFF' + headers + row1 + row2 + row3; // \uFEFF força o Excel a ler como UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'modelo_banco_frases.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
