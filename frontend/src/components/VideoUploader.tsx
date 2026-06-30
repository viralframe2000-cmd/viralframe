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

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '2px dashed ' + (dragActive ? 'var(--accent-blue)' : 'var(--border-color)'),
      borderRadius: 'var(--border-radius-lg)',
      padding: '30px',
      textAlign: 'center',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative'
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
        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,.mp4,.mov,.mkv,.webm"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#eff6ff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-blue)',
          fontSize: '24px'
        }}>
          🎬
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
            {uploading ? 'Enviando vídeos...' : 'Arraste e solte seus vídeos aqui'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Suporta MP4, MOV, MKV e WebM
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
            Você pode selecionar vários vídeos de uma vez.
          </p>
        </div>
        {!uploading && (
          <button style={{
            backgroundColor: 'var(--accent-blue)',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Selecionar vídeos
          </button>
        )}
      </div>
      
      {error && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: 500 }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};
