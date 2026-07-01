import React, { useState, useEffect } from 'react';
import type { VideoStatus } from '../lib/api';

interface VideoTableProps {
  videos: VideoStatus[];
  metadata: { [filename: string]: { pov_text: string; caption_text: string } };
  onMetadataChange: (filename: string, field: 'pov_text' | 'caption_text', value: string) => void;
  onRender: (id: string) => void;
  onDelete: (id: string) => void;
  processingVideos: string[];
  selectedVideoId: string | null;
  onSelectVideo: (id: string) => void;
  isUploading?: boolean;
}

export const VideoTable: React.FC<VideoTableProps> = ({
  videos,
  metadata,
  onMetadataChange,
  onRender,
  onDelete,
  processingVideos,
  selectedVideoId,
  onSelectVideo,
  isUploading = false
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (videos.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        fontFamily: 'var(--font-secondary)'
      }}>
        Nenhum vídeo carregado no momento. Use o painel de upload para adicionar novos vídeos.
      </div>
    );
  }

  const inputFocusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(34, 211, 238, 0.6)';
    e.target.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.15)';
    e.target.style.background = 'rgba(255, 255, 255, 0.06)';
  };

  const inputBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(255, 255, 255, 0.03)';
  };

  // Renderizador de Status Badge
  const renderStatusBadge = (video: VideoStatus, isProcessing: boolean) => {
    let color = 'var(--text-secondary)';
    let bg = 'rgba(255,255,255,0.05)';
    let border = 'rgba(255,255,255,0.08)';
    let text = 'Pendente';
    let icon = '⚪';

    if (isProcessing || video.status === 'processing') {
      color = '#3b82f6';
      bg = 'rgba(59, 130, 246, 0.15)';
      border = 'rgba(59, 130, 246, 0.3)';
      text = 'Processando';
      icon = '⚙️';
    } else if (video.status === 'queued') {
      color = '#f59e0b';
      bg = 'rgba(245, 158, 11, 0.15)';
      border = 'rgba(245, 158, 11, 0.3)';
      text = 'Na fila';
      icon = '⏳';
    } else if (video.exists_output) {
      color = '#10b981';
      bg = 'rgba(16, 185, 129, 0.15)';
      border = 'rgba(16, 185, 129, 0.3)';
      text = 'Renderizado';
      icon = '✅';
    } else if (video.status === 'failed') {
      color = '#ef4444';
      bg = 'rgba(239, 68, 68, 0.15)';
      border = 'rgba(239, 68, 68, 0.3)';
      text = 'Falhou';
      icon = '❌';
    } else if (video.status === 'edited') {
      color = 'var(--accent-purple)';
      bg = 'rgba(139, 92, 246, 0.15)';
      border = 'rgba(139, 92, 246, 0.3)';
      text = 'Editado';
      icon = '✍️';
    } else if (video.status === 'uploaded') {
      color = 'var(--accent-cyan)';
      bg = 'rgba(34, 211, 238, 0.1)';
      border = 'rgba(34, 211, 238, 0.25)';
      text = 'Enviado';
      icon = '📥';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        padding: '4px 10px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '11px',
        whiteSpace: 'nowrap'
      }}>
        {icon} {text}
      </span>
    );
  };

  // Renderizador de Layout Mobile (Cards)
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {videos.map((video) => {
          const fileMeta = metadata[video.filename] || { pov_text: '', caption_text: '' };
          const isProcessing = video.id ? processingVideos.includes(video.id) : false;
          const isSelected = video.id ? selectedVideoId === video.id : false;
          const isQueued = video.status === 'queued' || video.status === 'processing';

          return (
            <div
              key={video.id || video.filename}
              onClick={() => video.id && onSelectVideo(video.id)}
              style={{
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'var(--bg-secondary)',
                border: '1px solid ' + (isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'),
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 0 14px rgba(34, 211, 238, 0.15)' : 'var(--shadow-sm)'
              }}
            >
              {/* Header do Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ 
                  fontWeight: 600, 
                  color: 'var(--text-primary)', 
                  fontSize: '13.5px',
                  wordBreak: 'break-all',
                  maxWidth: '65%'
                }}>
                  {video.filename}
                </span>
                {renderStatusBadge(video, isProcessing)}
              </div>

              {/* Formulários de Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Frase POV</label>
                  <input
                    type="text"
                    value={fileMeta.pov_text}
                    onChange={(e) => onMetadataChange(video.filename, 'pov_text', e.target.value)}
                    onFocus={inputFocusStyle}
                    onBlur={inputBlurStyle}
                    placeholder="Ex: POV: você entrou no grupo certo"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Legenda</label>
                  <textarea
                    value={fileMeta.caption_text}
                    onChange={(e) => onMetadataChange(video.filename, 'caption_text', e.target.value)}
                    onFocus={inputFocusStyle}
                    onBlur={inputBlurStyle}
                    placeholder="Legenda para o Instagram"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '12px' 
              }} 
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => video.id && onSelectVideo(video.id)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                    border: '1px solid ' + (isSelected ? 'rgba(34, 211, 238, 0.3)' : 'var(--border-color)'),
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '11px',
                    flex: 1
                  }}
                >
                  Visualizar
                </button>

                <button
                  onClick={() => video.id && onRender(video.id)}
                  disabled={isProcessing || isQueued || isUploading}
                  style={{
                    background: 'var(--gradient-cyan-blue)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: (isProcessing || isQueued || isUploading) ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    opacity: (isProcessing || isQueued || isUploading) ? 0.5 : 1,
                    flex: 1
                  }}
                >
                  Gerar
                </button>
                
                {video.exists_output && (
                  <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '4px' }}>
                    <a
                      href={video.video_url || '#'}
                      download
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        flex: 1,
                        textAlign: 'center',
                        display: 'block'
                      }}
                    >
                      🎥 Vídeo
                    </a>
                    <a
                      href={video.caption_url || '#'}
                      download
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        flex: 1,
                        textAlign: 'center',
                        display: 'block'
                      }}
                    >
                      📝 Legenda
                    </a>
                  </div>
                )}
                
                <button
                  onClick={() => video.id && onDelete(video.id)}
                  disabled={isUploading}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-error)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    width: '100%',
                    marginTop: '4px',
                    opacity: isUploading ? 0.5 : 1
                  }}
                >
                  Excluir Vídeo
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Renderizador de Layout Desktop (Tabela Aprimorada)
  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-primary)',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '13px'
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
      fontFamily: 'var(--font-secondary)'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={headerStyle}>Vídeo original</th>
              <th style={{ ...headerStyle, width: '30%' }}>Frase POV (No vídeo)</th>
              <th style={{ ...headerStyle, width: '35%' }}>Legenda do Post (Instagram)</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Status</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => {
              const fileMeta = metadata[video.filename] || { pov_text: '', caption_text: '' };
              const isProcessing = video.id ? processingVideos.includes(video.id) : false;
              const isSelected = video.id ? selectedVideoId === video.id : false;
              const isQueued = video.status === 'queued' || video.status === 'processing';
              
              return (
                <tr 
                  key={video.id || video.filename} 
                  onClick={() => video.id && onSelectVideo(video.id)}
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                    {video.filename}
                  </td>
                  
                  {/* Campo POV */}
                  <td style={{ padding: '12px 20px' }}>
                    <input
                      type="text"
                      value={fileMeta.pov_text}
                      onChange={(e) => onMetadataChange(video.filename, 'pov_text', e.target.value)}
                      onFocus={inputFocusStyle}
                      onBlur={inputBlurStyle}
                      onClick={e => e.stopPropagation()}
                      placeholder="Ex: POV: você entrou no grupo certo"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                  </td>

                  {/* Campo Legenda */}
                  <td style={{ padding: '12px 20px' }}>
                    <textarea
                      value={fileMeta.caption_text}
                      onChange={(e) => onMetadataChange(video.filename, 'caption_text', e.target.value)}
                      onFocus={inputFocusStyle}
                      onBlur={inputBlurStyle}
                      onClick={e => e.stopPropagation()}
                      placeholder="Legenda para colar no Instagram"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'all 0.2s'
                      }}
                    />
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {renderStatusBadge(video, isProcessing)}
                  </td>

                  {/* Ações */}
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (video.id) onSelectVideo(video.id);
                        }}
                        style={{
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                          border: '1px solid ' + (isSelected ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'),
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '11px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                          }
                        }}
                      >
                        {isSelected ? 'Visualizando' : '👁️ Visualizar'}
                      </button>

                      <button
                        onClick={() => video.id && onRender(video.id)}
                        disabled={isProcessing || isQueued || isUploading}
                        style={{
                          background: 'var(--gradient-cyan-blue)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: (isProcessing || isQueued || isUploading) ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          transition: 'all 0.2s',
                          opacity: (isProcessing || isQueued || isUploading) ? 0.5 : 1
                        }}
                        onMouseEnter={e => {
                          if (!isProcessing && !isQueued && !isUploading) e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        Gerar
                      </button>
                      
                      {video.exists_output && (
                        <>
                          <a
                            href={video.video_url || '#'}
                            download
                            title="Baixar Vídeo"
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                            }}
                          >
                            🎥 Vídeo
                          </a>
                          <a
                            href={video.caption_url || '#'}
                            download
                            title="Baixar Legenda"
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontSize: '11px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                            }}
                          >
                            📝 Legenda
                          </a>
                        </>
                      )}
                      
                      <button
                        onClick={() => video.id && onDelete(video.id)}
                        disabled={isUploading}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--color-error)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: isUploading ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                          opacity: isUploading ? 0.5 : 1
                        }}
                        onMouseEnter={e => {
                          if (!isUploading) {
                            e.currentTarget.style.background = 'var(--color-error-bg)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isUploading) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                          }
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
