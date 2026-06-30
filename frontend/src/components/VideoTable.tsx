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
        padding: '40px',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        Nenhum vídeo carregado no momento. Use o painel de upload para adicionar novos vídeos.
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>Vídeo original</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)', width: '30%' }}>Frase POV (No vídeo)</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)', width: '35%' }}>Legenda do Post (Instagram)</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>Ações</th>
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
                    backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s'
                  }}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                    {video.filename}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <input
                      type="text"
                      value={fileMeta.pov_text}
                      onChange={(e) => onMetadataChange(video.filename, 'pov_text', e.target.value)}
                      placeholder="Ex: POV: você entrou no grupo certo"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <textarea
                      value={fileMeta.caption_text}
                      onChange={(e) => onMetadataChange(video.filename, 'caption_text', e.target.value)}
                      placeholder="Legenda para colar no Instagram"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    {isProcessing ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--accent-blue)',
                        backgroundColor: '#eff6ff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        fontSize: '11px'
                      }}>
                        ⚡ Editando...
                      </span>
                    ) : video.exists_output ? (
                      <span style={{
                        color: '#10b981',
                        backgroundColor: '#ecfdf5',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        fontSize: '11px'
                      }}>
                        Pronto
                      </span>
                    ) : (
                      <span style={{
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        fontSize: '11px'
                      }}>
                        Pendente
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVideo(video.filename);
                        }}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-blue)' : 'white',
                          color: isSelected ? 'white' : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        {isSelected ? 'Visualizando' : '👁️ Visualizar'}
                      </button>

                      <button
                        onClick={() => onRender(video.filename)}
                        disabled={isProcessing}
                        style={{
                          backgroundColor: 'var(--text-primary)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '11px',
                          opacity: isProcessing ? 0.6 : 1
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
                              backgroundColor: '#f1f5f9',
                              color: 'var(--text-primary)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            📥 Vídeo
                          </a>
                          <a
                            href={downloadCaptionUrl(video.filename, authToken)}
                            download
                            title="Baixar Legenda"
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: 'var(--text-primary)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            📝 Legenda
                          </a>
                        </>
                      )}
                      
                      <button
                        onClick={() => onDelete(video.filename)}
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#ef4444',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 500
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
