import { supabase } from './supabase';
import type { ProfileSettingsData } from './profile';
import { getProfile as getProfileDirect, saveProfile as saveProfileDirect, uploadProfileLogo, clearProfile as clearProfileDirect } from './profile';
import type { VideoStatus } from './videos';
import { uploadVideos as uploadVideosDirect, listVideos as listVideosDirect, saveMetadata as saveMetadataDirect, deleteVideo as deleteVideoDirect, deleteAllVideos as deleteAllVideosDirect } from './videos';
import type { PhraseItem, PhraseListResponse } from './phrases';
import { uploadPhrases as uploadPhrasesDirect, listPhrases as listPhrasesDirect, applyRandomPhrases as applyRandomPhrasesDirect, clearPhrases as clearPhrasesDirect } from './phrases';
import type { JobStatus } from './renderJobs';
import { createRenderJob, getJob as getJobDirect } from './renderJobs';
import { downloadStorageFile as downloadStorageFileDirect } from './storage';
import type { ExportJobStatus } from './exports';
import { createExportJob as createExportJobDirect, getExportJob as getExportJobDirect } from './exports';

export const API_BASE_URL = '';

// Reexportando tipos
export type { VideoStatus, JobStatus, PhraseItem, PhraseListResponse, ProfileSettingsData, ExportJobStatus };

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
export const deleteVideo = deleteVideoDirect; // Aceita videoId: string
export const deleteAllVideos = deleteAllVideosDirect; // Ação para limpar fila inteira

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
export const clearPhrases = clearPhrasesDirect;

// Vinculações de perfil
export const getProfile = getProfileDirect;
export const saveProfile = saveProfileDirect;
export const clearProfile = clearProfileDirect;

// Vinculações de Storage
export const downloadStorageFile = downloadStorageFileDirect;

// Vinculações de Export Jobs (ZIP)
export const createExportJob = createExportJobDirect;
export const getExportJob = getExportJobDirect;

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
