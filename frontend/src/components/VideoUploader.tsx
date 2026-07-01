import React, { useRef, useState } from 'react';
import { uploadVideos } from '../lib/api';

interface VideoUploaderProps {
  onUploadSuccess: () => void;
  setIsDashboardUploading?: (uploading: boolean) => void;
}

interface UploadQueueItem {
  filename: string;
  status: 'waiting' | 'uploading' | 'uploaded' | 'failed';
  error?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onUploadSuccess,
  setIsDashboardUploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [uploadSummary, setUploadSummary] = useState<{ uploaded: number; failed: number } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    if (uploading) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList) => {
    if (uploading) return;

    const allowedExtensions = ['.mp4', '.mov', '.mkv', '.webm'];
    const filesArray = Array.from(files);
    
    const validFiles = filesArray.filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return allowedExtensions.includes(ext);
    });

    const invalidCount = filesArray.length - validFiles.length;

    if (validFiles.length === 0) {
      let errorMsg = 'Nenhum arquivo de vídeo válido selecionado.';
      if (invalidCount > 0) {
        errorMsg += ` ${invalidCount} arquivo(s) não foram enviados por formato inválido (use MP4, MOV, MKV ou WebM).`;
      }
      setError(errorMsg);
      return;
    }

    // Inicializa fila de upload
    const initialQueue: UploadQueueItem[] = validFiles.map(file => ({
      filename: file.name,
      status: 'waiting'
    }));

    setUploadQueue(initialQueue);
    setUploading(true);
    setUploadSummary(null);
    setError(null);
    if (setIsDashboardUploading) {
      setIsDashboardUploading(true);
    }

    try {
      const response = await uploadVideos(validFiles, (filename, status, errorMsg) => {
        // Atualiza o progresso individual de cada arquivo em tempo real
        setUploadQueue(prev => prev.map(item => {
          if (item.filename === filename) {
            return { ...item, status, error: errorMsg };
          }
          return item;
        }));
      });

      const uploadedCount = response.uploaded?.length || 0;
      const failedCount = response.failed?.length || 0;
      
      setUploadSummary({ uploaded: uploadedCount, failed: failedCount });
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar os vídeos. Verifique sua conexão e tente novamente.');
    } finally {
      // Mantém a tela de progresso concluída visível por 6 segundos e depois reseta
      setTimeout(() => {
        setUploadQueue([]);
        setUploading(false);
        if (setIsDashboardUploading) {
          setIsDashboardUploading(false);
        }
      }, 6000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (uploading) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // Cálculos de progresso do lote
  const totalFiles = uploadQueue.length;
  const uploadedFiles = uploadQueue.filter(item => item.status === 'uploaded').length;
  const failedFiles = uploadQueue.filter(item => item.status === 'failed').length;
  const processedFiles = uploadedFiles + failedFiles;
  const uploadPercent = totalFiles > 0 ? Math.round((processedFiles / totalFiles) * 100) : 0;
  const currentFile = uploadQueue.find(item => item.status === 'uploading')?.filename || '';

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '2px dashed ' + (dragActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'),
      borderRadius: 'var(--radius-xl)',
      padding: '30px 24px',
      textAlign: 'center',
      cursor: uploading ? 'default' : 'pointer',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      transition: 'all var(--transition-normal)',
      background: dragActive ? 'rgba(34, 211, 238, 0.02)' : 'var(--bg-secondary)',
    }}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".mp4,.mov,.mkv,.webm,video/mp4,video/quicktime,video/x-matroska,video/webm"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={uploading}
      />
      
      {!uploading && !uploadSummary ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)',
            fontSize: '24px',
            boxShadow: '0 0 16px rgba(59, 130, 246, 0.15)'
          }}>
            🎬
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-primary)' }}>
              Arraste e solte seus vídeos aqui
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Suporta MP4, MOV, MKV e WebM
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              Você pode selecionar vários vídeos de uma vez.
            </p>
          </div>
          <button style={{
            background: 'var(--gradient-cyan-blue)',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.25)',
            fontFamily: 'var(--font-secondary)',
            transition: 'opacity var(--transition-fast), transform var(--transition-fast)'
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Selecionar vídeos
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', cursor: 'default' }} onClick={e => e.stopPropagation()}>
          {/* Header do progresso */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {uploadSummary ? '✅ Envio Concluído' : '⚡ Enviando vídeos...'}
            </h4>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {uploadPercent}%
            </span>
          </div>

          {/* Barra de Progresso */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            <div style={{
              width: `${uploadPercent}%`,
              height: '100%',
              background: 'var(--gradient-cyan-blue)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px var(--accent-cyan-glow)'
            }} />
          </div>

          {/* Status Geral */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>
              {processedFiles} de {totalFiles} enviados
            </span>
            {currentFile && (
              <span style={{ fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                Subindo: {currentFile}
              </span>
            )}
          </div>

          {/* Lista detalhada por arquivo */}
          <div style={{
            maxHeight: '120px',
            overflowY: 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {uploadQueue.map((item, idx) => {
              let badgeColor = 'var(--text-muted)';
              let badgeBg = 'rgba(255,255,255,0.02)';
              let statusLabel = 'Aguardando';

              if (item.status === 'uploading') {
                badgeColor = 'var(--accent-cyan)';
                badgeBg = 'rgba(34, 211, 238, 0.1)';
                statusLabel = 'Subindo';
              } else if (item.status === 'uploaded') {
                badgeColor = 'var(--color-success)';
                badgeBg = 'var(--color-success-bg)';
                statusLabel = 'Pronto';
              } else if (item.status === 'failed') {
                badgeColor = 'var(--color-error)';
                badgeBg = 'var(--color-error-bg)';
                statusLabel = 'Falhou';
              }

              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
                  <span style={{ 
                    color: 'var(--text-primary)', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap', 
                    maxWidth: '180px' 
                  }}>
                    {item.filename}
                  </span>
                  <span style={{ 
                    color: badgeColor, 
                    backgroundColor: badgeBg, 
                    padding: '2px 6px', 
                    borderRadius: 'var(--radius-sm)', 
                    fontWeight: 600,
                    fontSize: '10px'
                  }}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sumário final */}
          {uploadSummary && (
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              fontSize: '12px',
              border: '1px solid var(--border-color)',
              color: uploadSummary.failed > 0 ? 'var(--color-warning)' : 'var(--color-success)',
              fontWeight: 500,
              textAlign: 'center'
            }}>
              {uploadSummary.failed > 0 
                ? `🚀 ${uploadSummary.uploaded} vídeos enviados com sucesso. ${uploadSummary.failed} falharam.`
                : `🚀 Todos os ${uploadSummary.uploaded} vídeos foram enviados com sucesso!`
              }
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};
