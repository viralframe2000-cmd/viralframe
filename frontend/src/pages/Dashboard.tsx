import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { VideoUploader } from '../components/VideoUploader';
import { ProfileSettings } from '../components/ProfileSettings';
import { VideoTable } from '../components/VideoTable';
import { JobProgress } from '../components/JobProgress';
import { PreviewCard } from '../components/PreviewCard';
import { PhraseBankUploader } from '../components/PhraseBankUploader';
import { PrivacyCard } from '../components/PrivacyCard';
import { listVideos, saveMetadata, renderVideo, renderAll, getJob, deleteVideo, healthCheck, applyRandomPhrases, profileLogoUrl, downloadAllFiles, API_BASE_URL } from '../lib/api';
import type { VideoStatus, JobStatus } from '../lib/api';
import { supabase } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<VideoStatus[]>([]);
  const [metadata, setMetadata] = useState<{ [filename: string]: { pov_text: string; caption_text: string } }>({});
  const [activeJob, setActiveJob] = useState<JobStatus | null>(null);
  const [processingVideos, setProcessingVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedVideo, setFocusedVideo] = useState<string | null>(null);
  const [ffmpegInstalled, setFfmpegInstalled] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string>('');
  const [selectedVideoFilename, setSelectedVideoFilename] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ display_name: string; handle: string; verified: boolean; logo_path?: string }>({
    display_name: '',
    handle: '',
    verified: true,
    logo_path: undefined
  });
  const [logoTimestamp, setLogoTimestamp] = useState<number>(Date.now());
  const [showDownloadDropdown, setShowDownloadDropdown] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"input" | "output">("input");

  const handleProfileChange = (newProfile: { display_name: string; handle: string; verified: boolean }, timestamp: number) => {
    setProfile(newProfile);
    setLogoTimestamp(timestamp);
  };

  const handleDownloadAll = (type: 'videos' | 'videos-captions' | 'all') => {
    setShowDownloadDropdown(false);
    
    const readyVideos = videos.filter(v => v.exists_output);
    if (readyVideos.length === 0) {
      alert("Nenhum vídeo pronto para baixar. Gere os vídeos primeiro.");
      return;
    }

    setDownloadStatus("Preparando download...");
    
    try {
      downloadAllFiles(type);
      setDownloadStatus("Download iniciado.");
      setTimeout(() => {
        setDownloadStatus(null);
      }, 4000);
    } catch (err) {
      setDownloadStatus("Erro ao iniciar download.");
      setTimeout(() => {
        setDownloadStatus(null);
      }, 4000);
    }
  };

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthToken(session.access_token);
      }

      const health = await healthCheck();
      setFfmpegInstalled(health.ffmpeg_installed);

      const videoList = await listVideos();
      setVideos(videoList);
      
      const newMeta: { [filename: string]: { pov_text: string; caption_text: string } } = {};
      
      videoList.forEach(v => {
        newMeta[v.filename] = {
          pov_text: v.pov_text || '',
          caption_text: v.caption_text || ''
        };
      });
      setMetadata(prev => ({ ...prev, ...newMeta }));
      
      if (videoList.length > 0 && !focusedVideo) {
        setFocusedVideo(videoList[0].filename);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyPhrasesSuccess = (updatedVideos: VideoStatus[]) => {
    setVideos(updatedVideos);
    const newMeta: { [filename: string]: { pov_text: string; caption_text: string } } = {};
    updatedVideos.forEach(v => {
      newMeta[v.filename] = {
        pov_text: v.pov_text || '',
        caption_text: v.caption_text || ''
      };
    });
    setMetadata(prev => ({ ...prev, ...newMeta }));
  };

  useEffect(() => {
    let timer: any;
    if (activeJob && activeJob.status !== 'completed' && activeJob.status !== 'failed') {
      timer = setTimeout(async () => {
        try {
          const status = await getJob(activeJob.job_id);
          setActiveJob(status);
          if (status.status === 'completed' || status.status === 'failed') {
            loadData();
          }
        } catch (err) {
          console.error("Erro no polling do job:", err);
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [activeJob]);

  const handleMetadataChange = (filename: string, field: 'pov_text' | 'caption_text', value: string) => {
    setMetadata(prev => ({
      ...prev,
      [filename]: {
        ...prev[filename],
        [field]: value
      }
    }));
    setFocusedVideo(filename);
  };

  const handleSaveMetadata = async () => {
    const items = Object.entries(metadata).map(([filename, val]) => ({
      filename,
      pov_text: val.pov_text,
      caption_text: val.caption_text
    }));
    try {
      await saveMetadata(items);
      alert('Configurações salvas com sucesso!');
      loadData();
    } catch (err) {
      alert('Falha ao salvar metadados.');
    }
  };

  const handleRenderSingle = async (filename: string) => {
    if (!profile.display_name.trim() || !profile.handle.trim()) {
      alert("Preencha as informações do perfil antes de gerar os vídeos.");
      return;
    }

    await handleSaveMetadata();
    
    setProcessingVideos(prev => [...prev, filename]);
    try {
      await renderVideo(filename);
      loadData();
    } catch (err) {
      alert(`Falha ao gerar vídeo ${filename}`);
    } finally {
      setProcessingVideos(prev => prev.filter(f => f !== filename));
    }
  };

  const handleRenderAll = async () => {
    if (!profile.display_name.trim() || !profile.handle.trim()) {
      alert("Preencha as informações do perfil antes de gerar os vídeos.");
      return;
    }

    await handleSaveMetadata();
    
    try {
      const job = await renderAll();
      setActiveJob({
        job_id: job.job_id,
        total: videos.length,
        processed: 0,
        failed: 0,
        status: 'pending',
        message: 'Fila criada...'
      });
    } catch (err) {
      alert('Falha ao iniciar processamento em lote.');
    }
  };

  const handleDelete = async (filename: string) => {
    if (confirm(`Tem certeza que deseja apagar ${filename}?`)) {
      try {
        await deleteVideo(filename);
        loadData();
      } catch (err) {
        alert('Erro ao apagar arquivo.');
      }
    }
  };

  const selectedVideo = videos.find(v => v.filename === selectedVideoFilename);
  const currentPov = selectedVideoFilename && metadata[selectedVideoFilename]
    ? metadata[selectedVideoFilename].pov_text
    : (selectedVideo?.pov_text || '');

  const topButtonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-secondary)',
    transition: 'all var(--transition-fast)'
  };

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
    e.currentTarget.style.borderColor = 'var(--border-hover)';
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
    e.currentTarget.style.borderColor = 'var(--border-color)';
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* FFmpeg banner error */}
        {!ffmpegInstalled && (
          <div style={{
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            color: 'var(--color-warning)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            fontSize: '13px',
            fontWeight: 500,
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>
              <strong>FFmpeg não detectado no servidor!</strong> O processo de renderização dos Reels falhará.
              Configure a variável <code>FFMPEG_PATH</code> no arquivo <code>backend/.env</code> com o caminho exato do executável para prosseguir.
            </div>
          </div>
        )}
        
        {/* Painel Superior Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ProfileSettings onProfileChange={handleProfileChange} />
            <VideoUploader onUploadSuccess={loadData} />
            <PhraseBankUploader onApplySuccess={handleApplyPhrasesSuccess} />
            <PrivacyCard />
          </div>
          
          <PreviewCard 
            povText={currentPov || ''} 
            brandName={profile.display_name}
            brandHandle={profile.handle}
            logoUrl={profileLogoUrl(logoTimestamp, authToken)}
            isVerified={profile.verified}
            selectedVideoFilename={selectedVideoFilename}
            inputPreviewUrl={selectedVideo?.input_preview_url ? `${API_BASE_URL}${selectedVideo.input_preview_url}?token=${authToken}` : null}
            outputPreviewUrl={selectedVideo?.output_preview_url ? `${API_BASE_URL}${selectedVideo.output_preview_url}?token=${authToken}` : null}
            hasOutput={selectedVideo?.has_output || false}
            previewMode={previewMode}
            onPreviewModeChange={(mode) => setPreviewMode(mode)}
          />
        </div>

        {/* Barra de Progresso de Jobs */}
        <JobProgress job={activeJob} />

        {/* Tabela de Controle de Lotes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-primary)' }}>
                Fila de Edição
              </h3>
              {downloadStatus && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--accent-cyan)',
                  backgroundColor: 'rgba(34, 211, 238, 0.12)',
                  border: '1px solid rgba(34, 211, 238, 0.2)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🔄 {downloadStatus}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Dropdown Baixar Tudo */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  disabled={videos.length === 0}
                  style={topButtonStyle}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  📦 Baixar Tudo ▾
                </button>
                
                {showDownloadDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '6px',
                    backgroundColor: 'rgba(8, 13, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    minWidth: '240px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <button
                      onClick={() => handleDownloadAll('videos')}
                      style={{
                        padding: '10px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s',
                        fontFamily: 'var(--font-secondary)'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >
                      🎥 Só vídeos
                    </button>
                    <button
                      onClick={() => handleDownloadAll('videos-captions')}
                      style={{
                        padding: '10px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s',
                        fontFamily: 'var(--font-secondary)'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >
                      📝 Vídeos + legendas
                    </button>
                    <button
                      onClick={() => handleDownloadAll('all')}
                      style={{
                        padding: '10px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s',
                        fontFamily: 'var(--font-secondary)'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >
                      📁 Tudo: vídeos + legendas + capas
                    </button>
                  </div>
                )}
              </div>

              {/* Botão aplicar aleatórias */}
              <button
                onClick={async () => {
                  try {
                    const updated = await applyRandomPhrases(false);
                    handleApplyPhrasesSuccess(updated);
                    alert("Campos vazios preenchidos com sucesso!");
                  } catch (err: any) {
                    alert(err.message || "Erro ao preencher frases vazias.");
                  }
                }}
                disabled={videos.length === 0}
                style={topButtonStyle}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                🎲 Preencher vazios
              </button>
              
              {/* Atualizar lista */}
              <button
                onClick={loadData}
                style={topButtonStyle}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                🔄 Atualizar Lista
              </button>
              
              {/* Salvar frases */}
              <button
                onClick={handleSaveMetadata}
                style={{
                  ...topButtonStyle,
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: 'var(--accent-cyan)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                }}
              >
                💾 Salvar Frases
              </button>
              
              {/* Gerar todos os vídeos */}
              <button
                onClick={handleRenderAll}
                disabled={videos.length === 0}
                style={{
                  background: 'var(--gradient-cyan-blue)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-secondary)',
                  transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.25)',
                  opacity: videos.length === 0 ? 0.5 : 1
                }}
                onMouseEnter={e => {
                  if (videos.length > 0) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                🚀 Gerar Todos os Vídeos
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Carregando dados da fila local...</div>
          ) : (
            <VideoTable
              videos={videos}
              metadata={metadata}
              onMetadataChange={handleMetadataChange}
              onRender={handleRenderSingle}
              onDelete={handleDelete}
              processingVideos={processingVideos}
              selectedFilename={selectedVideoFilename}
              onSelectVideo={(filename) => {
                setSelectedVideoFilename(filename);
                setPreviewMode("input");
              }}
              authToken={authToken}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};
