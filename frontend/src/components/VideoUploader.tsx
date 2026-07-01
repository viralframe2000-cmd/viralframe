import React, { useRef, useState } from 'react';
import { uploadVideos } from '../lib/api';

interface VideoUploaderProps {
  onUploadSuccess: () => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList) => {
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

    setUploading(true);
    setError(null);
    try {
      const response = await uploadVideos(validFiles);
      const uploadedCount = response.uploaded?.length || 0;
      const failedCount = response.failed?.length || 0;
      
      let msg = `${uploadedCount} vídeo(s) enviado(s) com sucesso.`;
      if (invalidCount > 0) {
        msg += ` ${invalidCount} arquivo(s) não foram enviados por formato inválido.`;
      }
      if (failedCount > 0) {
        msg += ` ${failedCount} falha(s) de escrita no servidor.`;
      }
      
      alert(msg);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar vídeos.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
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
    e.stopPropagation(); // Evita dupla ativação por causa do container
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '2px dashed ' + (dragActive ? 'rgba(34, 211, 238, 0.6)' : 'rgba(255, 255, 255, 0.08)'),
      borderRadius: 'var(--radius-xl)',
      padding: '36px 24px',
      textAlign: 'center',
      cursor: 'pointer',
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
      onMouseEnter={e => {
        if (!dragActive) {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
        }
      }}
      onMouseLeave={e => {
        if (!dragActive) {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.background = 'var(--bg-secondary)';
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,.mp4,.mov,.mkv,.webm"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      
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
            {uploading ? 'Enviando vídeos...' : 'Arraste e solte seus vídeos aqui'}
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Suporta MP4, MOV, MKV e WebM
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            Você pode selecionar vários vídeos de uma vez.
          </p>
        </div>
        {!uploading && (
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
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Selecionar vídeos
          </button>
        )}
      </div>
      
      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};
