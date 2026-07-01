import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { VideoUploader } from '../components/VideoUploader';
import { ProfileSettings } from '../components/ProfileSettings';
import { VideoTable } from '../components/VideoTable';
import { JobProgress } from '../components/JobProgress';
import { PreviewCard } from '../components/PreviewCard';
import { PhraseBankUploader } from '../components/PhraseBankUploader';
import { PrivacyCard } from '../components/PrivacyCard';
import { listVideos, saveMetadata, renderVideo, renderAll, getJob, deleteVideo, healthCheck, applyRandomPhrases, downloadAllFiles, getProfile, deleteAllVideos } from '../lib/api';
import type { VideoStatus, JobStatus } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<VideoStatus[]>([]);
  const [metadata, setMetadata] = useState<{ [filename: string]: { pov_text: string; caption_text: string } }>({});
  const [activeJob, setActiveJob] = useState<JobStatus | null>(null);
  const [processingVideos, setProcessingVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [ffmpegInstalled, setFfmpegInstalled] = useState<boolean>(true);

  // Estados de Upload e Modais de Confirmação
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [deletingAll, setDeletingAll] = useState<boolean>(false);

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    display_name: string;
    instagram_handle: string;
    logoSignedUrl: string;
    verified: boolean;
  }>({
    display_name: '',
    instagram_handle: '',
    logoSignedUrl: '',
    verified: true
  });
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"input" | "output">("input");

  const handleProfileChange = (newProfile: { display_name: string; handle: string; verified: boolean; logo_path?: string }) => {
    setProfile({
      display_name: newProfile.display_name,
      instagram_handle: newProfile.handle,
      logoSignedUrl: newProfile.logo_path || '',
      verified: newProfile.verified
    });
  };

  const handleDownloadAll = () => {
    const readyVideos = videos.filter(v => v.exists_output);
    if (readyVideos.length === 0) {
      alert("Nenhum vídeo pronto para baixar. Gere os vídeos primeiro.");
      return;
    }

    setDownloadStatus("Preparando download...");
    try {
      downloadAllFiles('all');
      setDownloadStatus("Aguardando exportação...");
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

  const handleDeleteAllVideos = async () => {
    setDeletingAll(true);
    try {
      const result = await deleteAllVideos();
      alert(`Sucesso! ${result.deletedCount} vídeos foram excluídos da fila.`);
      setSelectedVideoId(null);
      setShowDeleteAllModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir todos os vídeos.');
    } finally {
      setDeletingAll(false);
    }
  };

  const loadData = async () => {
    try {
      const health = await healthCheck();
      setFfmpegInstalled(health.ffmpeg_installed);

      // Carrega perfil de usuário real do banco no primeiro carregamento
      const userProfile = await getProfile();
      setProfile({
        display_name: userProfile.display_name,
        instagram_handle: userProfile.instagram_handle || userProfile.handle || '',
        logoSignedUrl: userProfile.logo_path || '',
        verified: userProfile.verified
      });

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
      
      if (videoList.length > 0 && !selectedVideoId) {
        setSelectedVideoId(videoList[0].id);
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

    // Sincroniza imediatamente o selectedVideo local em tempo real
    setVideos(prev => prev.map(v => {
      if (v.filename === filename) {
        return {
          ...v,
          [field]: value
        };
      }
      return v;
    }));
  };

  const handleSaveMetadata = async () => {
    if (isUploading) return;
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

  const handleRenderSingle = async (videoId: string) => {
    if (isUploading) return;
    if (!profile.display_name.trim() || !profile.instagram_handle.trim()) {
      alert("Preencha as informações do perfil antes de gerar os vídeos.");
      return;
    }

    await handleSaveMetadata();
    
    setProcessingVideos(prev => [...prev, videoId]);
    try {
      await renderVideo(videoId);
      loadData();
    } catch (err: any) {
      alert(err.message || `Falha ao gerar vídeo.`);
    } finally {
      setProcessingVideos(prev => prev.filter(id => id !== videoId));
    }
  };

  const handleRenderAll = async () => {
    if (isUploading) return;
    if (!profile.display_name.trim() || !profile.instagram_handle.trim()) {
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
    } catch (err: any) {
      alert(err.message || 'Falha ao iniciar processamento em lote.');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (isUploading) return;
    const targetVideo = videos.find(v => v.id === videoId);
    if (!targetVideo) return;

    if (confirm(`Tem certeza que deseja apagar ${targetVideo.filename}?`)) {
      try {
        await deleteVideo(videoId);
        if (selectedVideoId === videoId) {
          setSelectedVideoId(null);
        }
        loadData();
      } catch (err: any) {
        alert(err.message || 'Erro ao apagar arquivo.');
      }
    }
  };

  const selectedVideo = videos.find(v => v.id === selectedVideoId);

  const topButtonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: isUploading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-secondary)',
    transition: 'all var(--transition-fast)',
    opacity: isUploading ? 0.4 : 1
  };

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isUploading) return;
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
        
        {/* Supabase connection missing warning banner */}
        {!isSupabaseConfigured && (
          <div style={{
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            color: 'var(--color-error)',
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
              <strong>Supabase não configurado!</strong> O ViralFrame Studio necessita das variáveis de ambiente <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> configuradas no painel da Vercel para poder persistir e processar os dados em produção.
            </div>
          </div>
        )}

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
            <VideoUploader onUploadSuccess={loadData} setIsDashboardUploading={setIsUploading} />
            <PhraseBankUploader onApplySuccess={handleApplyPhrasesSuccess} />
            
            <button
              onClick={() => setShowPrivacyModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'var(--font-secondary)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              🛡️ Privacidade e LGPD
            </button>
          </div>
          
          <PreviewCard 
            display_name={profile.display_name}
            instagram_handle={profile.instagram_handle}
            logoSignedUrl={profile.logoSignedUrl}
            isVerified={profile.verified}
            selectedVideo={selectedVideo}
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
              
              {/* Baixar Tudo ZIP */}
              <button
                onClick={handleDownloadAll}
                disabled={videos.length === 0 || isUploading}
                style={topButtonStyle}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                📦 Baixar Tudo ZIP
              </button>

              {/* Botão aplicar aleatórias */}
              <button
                onClick={async () => {
                  if (isUploading) return;
                  try {
                    const updated = await applyRandomPhrases(false);
                    handleApplyPhrasesSuccess(updated);
                    alert("Campos vazios preenchidos com sucesso!");
                  } catch (err: any) {
                    alert(err.message || "Erro ao preencher frases vazias.");
                  }
                }}
                disabled={videos.length === 0 || isUploading}
                style={topButtonStyle}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                🎲 Preencher vazios
              </button>
              
              {/* Atualizar lista */}
              <button
                onClick={loadData}
                disabled={isUploading}
                style={topButtonStyle}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                🔄 Atualizar Lista
              </button>
              
              {/* Salvar frases */}
              <button
                onClick={handleSaveMetadata}
                disabled={isUploading}
                style={{
                  ...topButtonStyle,
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: 'var(--accent-cyan)'
                }}
                onMouseEnter={e => {
                  if (isUploading) return;
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                }}
                onMouseLeave={e => {
                  if (isUploading) return;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                }}
              >
                💾 Salvar Frases
              </button>

              {/* Botão Excluir Todos os Vídeos */}
              <button
                onClick={() => setShowDeleteAllModal(true)}
                disabled={videos.length === 0 || isUploading}
                style={{
                  ...topButtonStyle,
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: 'var(--color-error)'
                }}
                onMouseEnter={e => {
                  if (isUploading) return;
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                }}
                onMouseLeave={e => {
                  if (isUploading) return;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                }}
              >
                🗑️ Limpar Fila
              </button>
              
              {/* Gerar todos os vídeos */}
              <button
                onClick={handleRenderAll}
                disabled={videos.length === 0 || isUploading}
                style={{
                  background: 'var(--gradient-cyan-blue)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (videos.length === 0 || isUploading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-secondary)',
                  transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.25)',
                  opacity: (videos.length === 0 || isUploading) ? 0.5 : 1
                }}
                onMouseEnter={e => {
                  if (videos.length > 0 && !isUploading) e.currentTarget.style.opacity = '0.9';
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
              selectedVideoId={selectedVideoId}
              onSelectVideo={(id) => {
                setSelectedVideoId(id);
                setPreviewMode("input");
              }}
              isUploading={isUploading}
            />
          )}
        </div>
      </div>

      {/* Modal de Privacidade e LGPD */}
      {showPrivacyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 22, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
          animation: 'fadeIn var(--transition-fast) forwards'
        }}
          onClick={() => setShowPrivacyModal(false)}
        >
          <div style={{
            width: '100%',
            maxWidth: '460px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPrivacyModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: 'var(--text-primary)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                zIndex: 10
              }}
            >
              ✕
            </button>
            <PrivacyCard />
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Exclusão Completa */}
      {showDeleteAllModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 22, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
          animation: 'fadeIn var(--transition-fast) forwards'
        }}
          onClick={() => !deletingAll && setShowDeleteAllModal(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: 'var(--shadow-xl)',
            maxWidth: '420px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--color-error)', fontWeight: 700 }}>
                ⚠️ Excluir todos os vídeos?
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Essa ação apagará todos os vídeos enviados desta fila. Essa ação não pode ser desfeita.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                disabled={deletingAll}
                onClick={() => setShowDeleteAllModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '11px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-secondary)'
                }}
              >
                Cancelar
              </button>
              <button
                disabled={deletingAll}
                onClick={handleDeleteAllVideos}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                  border: 'none',
                  padding: '11px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-secondary)'
                }}
              >
                {deletingAll ? 'Excluindo...' : 'Sim, excluir tudo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};
