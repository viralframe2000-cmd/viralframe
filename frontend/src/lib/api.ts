import { supabase } from './supabase';
import type { ProfileSettingsData } from './profile';
import { getProfile as getProfileDirect, saveProfile as saveProfileDirect, uploadProfileLogo, clearProfile as clearProfileDirect } from './profile';
import type { VideoStatus } from './videos';
import { uploadVideos as uploadVideosDirect, listVideos as listVideosDirect, saveMetadata as saveMetadataDirect, deleteVideo as deleteVideoDirect } from './videos';
import type { PhraseItem, PhraseListResponse } from './phrases';
import { uploadPhrases as uploadPhrasesDirect, listPhrases as listPhrasesDirect, applyRandomPhrases as applyRandomPhrasesDirect } from './phrases';
import type { JobStatus } from './renderJobs';
import { createRenderJob, getJob as getJobDirect } from './renderJobs';

export const API_BASE_URL = '';

// Reexportando tipos
export type { VideoStatus, JobStatus, PhraseItem, PhraseListResponse, ProfileSettingsData };

/**
 * Obtém o token de sessão ativo.
 */
export async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

/**
 * Emula a checagem de FFmpeg para que o frontend presuma sucesso,
 * dado que o processamento agora ocorre 100% de forma isolada no Docker do worker.
 */
export async function healthCheck() {
  return { ffmpeg_installed: true };
}

// Vinculações diretas de vídeos
export const uploadVideos = uploadVideosDirect;
export const listVideos = listVideosDirect;
export const saveMetadata = saveMetadataDirect;
export const deleteVideo = deleteVideoDirect; // Agora aceita videoId: string

// Vinculações de render jobs
export async function renderVideo(videoId: string) {
  return createRenderJob([videoId]);
}

export async function renderAll() {
  return createRenderJob();
}

export const getJob = getJobDirect;

// Vinculações de frases
export const uploadPhrases = uploadPhrasesDirect;
export const listPhrases = listPhrasesDirect;
export const applyRandomPhrases = applyRandomPhrasesDirect;

// Vinculações de perfil
export const getProfile = getProfileDirect;
export const saveProfile = saveProfileDirect;
export const clearProfile = clearProfileDirect;

/**
 * Faz upload da logo vinculando ao perfil.
 */
export async function uploadLogo(file: File) {
  const logoUrl = await uploadProfileLogo(file);
  return { success: true, logo_url: logoUrl };
}

/**
 * Mantida apenas para compatibilidade de assinatura — retorna string vazia.
 */
export function profileLogoUrl(_timestamp?: number, _token?: string) {
  return '';
}

/**
 * Lida com downloads em lote ZIP de forma limpa no frontend.
 */
export async function downloadAllFiles(_type: 'videos' | 'videos-captions' | 'all') {
  alert('Exportação ZIP será ativada pelo worker em breve.');
}
