import React from 'react';
import type { VideoStatus } from '../lib/api';
import { downloadVideoUrl, downloadCaptionUrl } from '../lib/api';

interface VideoTableProps {
  videos: VideoStatus[];
  metadata: { [filename: string]: { pov_text: string; caption_text: string } };
  onMetadataChange: (filename: string, field: 'pov_text' | 'caption_text', value: string) => void;
  onRender: (filename: string) => void;
  onDelete: (filename: string) => void;
  processingVideos: string[];
  selectedFilename: string | null;
  onSelectVideo: (filename: string) => void;
  authToken: string;
}

export const VideoTable: React.FC<VideoTableProps> = ({
  videos,
  metadata,
  onMetadataChange,
  onRender,
  onDelete,
  processingVideos,
  selectedFilename,
  onSelectVideo,
  authToken
}) => {
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

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-primary)',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '13px'
  };

  const inputFocusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
    e.target.style.background = 'rgba(255, 255, 255, 0.06)';
  };

  const inputBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(255, 255, 255, 0.03)';
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
              const isProcessing = processingVideos.includes(video.filename);
              const isSelected = selectedFilename === video.filename;
              
              return (
                <tr 
                  key={video.filename} 
                  onClick={() => onSelectVideo(video.filename)}
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
                    {isProcessing ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#60a5fa',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}>
                        ⚡ Editando...
                      </span>
                    ) : video.exists_output ? (
                      <span style={{
                        color: '#4ade80',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}>
                        Pronto
                      </span>
                    ) : (
                      <span style={{
                        color: 'var(--text-secondary)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '11px'
                      }}>
                        Pendente
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVideo(video.filename);
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
                        onClick={() => onRender(video.filename)}
                        disabled={isProcessing}
                        style={{
                          background: 'var(--gradient-cyan-blue)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '11px',
                          transition: 'all 0.2s',
                          opacity: isProcessing ? 0.5 : 1
                        }}
                        onMouseEnter={e => {
                          if (!isProcessing) e.currentTarget.style.opacity = '0.9';
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
                            href={downloadVideoUrl(video.filename, authToken)}
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
                            href={downloadCaptionUrl(video.filename, authToken)}
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
                        onClick={() => onDelete(video.filename)}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--color-error)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--color-error-bg)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
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
