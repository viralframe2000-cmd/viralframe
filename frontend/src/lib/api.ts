import { supabase } from './supabase';

export const API_BASE_URL = 'http://localhost:8000';

export interface VideoStatus {
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

export interface JobStatus {
  job_id: string;
  total: number;
  processed: number;
  failed: number;
  status: string;
  message: string;
}

async function getAuthHeaders(customHeaders: Record<string, string> = {}): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    ...customHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function uploadVideos(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await fetch(`${API_BASE_URL}/api/upload/videos`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

export async function uploadLogo(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/upload/logo`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

export async function listVideos(): Promise<VideoStatus[]> {
  const res = await fetch(`${API_BASE_URL}/api/videos`, {
    headers: await getAuthHeaders(),
  });
  return res.json();
}

export async function saveMetadata(items: { filename: string; pov_text: string; caption_text: string }[]) {
  const res = await fetch(`${API_BASE_URL}/api/videos/metadata`, {
    method: 'POST',
    headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ items }),
  });
  return res.json();
}

export async function renderVideo(filename: string) {
  const res = await fetch(`${API_BASE_URL}/api/render/${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  return res.json();
}

export async function renderAll() {
  const res = await fetch(`${API_BASE_URL}/api/render-all`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  return res.json();
}

export async function getJob(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
    headers: await getAuthHeaders(),
  });
  return res.json();
}

export function downloadVideoUrl(filename: string, token: string) {
  return `${API_BASE_URL}/api/download/video/${encodeURIComponent(filename)}?token=${token}`;
}

export function downloadCaptionUrl(filename: string, token: string) {
  return `${API_BASE_URL}/api/download/caption/${encodeURIComponent(filename)}?token=${token}`;
}

export function downloadCoverUrl(filename: string, token: string) {
  return `${API_BASE_URL}/api/download/cover/${encodeURIComponent(filename)}?token=${token}`;
}

export async function deleteVideo(filename: string) {
  const res = await fetch(`${API_BASE_URL}/api/videos/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  return res.json();
}

export interface PhraseItem {
  id: number;
  pov_text: string;
  caption_text: string;
  categoria?: string | null;
  tom?: string | null;
  ativo: string;
}

export interface PhraseListResponse {
  phrases: PhraseItem[];
  total: number;
  active: number;
}

export async function uploadPhrases(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/phrases/upload`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

export async function listPhrases(): Promise<PhraseListResponse> {
  const res = await fetch(`${API_BASE_URL}/api/phrases`, {
    headers: await getAuthHeaders(),
  });
  return res.json();
}

export async function applyRandomPhrases(overwrite: boolean): Promise<VideoStatus[]> {
  const res = await fetch(`${API_BASE_URL}/api/phrases/apply-random`, {
    method: 'POST',
    headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ overwrite }),
  });
  return res.json();
}

export function downloadPhraseTemplateUrl() {
  return `${API_BASE_URL}/api/phrases/template`;
}

export interface ProfileSettingsData {
  display_name: string;
  handle: string;
  verified: boolean;
  logo_path?: string;
}

export async function getProfile(): Promise<ProfileSettingsData> {
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: await getAuthHeaders(),
  });
  return res.json();
}

export async function saveProfile(data: ProfileSettingsData): Promise<ProfileSettingsData> {
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'POST',
    headers: await getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  return res.json();
}

export function profileLogoUrl(timestamp?: number, token?: string) {
  const t = timestamp ? `&t=${timestamp}` : '';
  const tok = token ? `&token=${token}` : '';
  return `${API_BASE_URL}/api/profile/logo-redirect?dummy=1${t}${tok}`;
}

export async function downloadAllFiles(type: "videos" | "videos-captions" | "all") {
  const token = await getAuthToken();
  const url = `${API_BASE_URL}/api/download/all?type=${type}&token=${token}`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'viralframe-videos.zip');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



