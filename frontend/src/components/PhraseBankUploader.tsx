import React, { useState, useEffect } from 'react';
import { uploadPhrases, listPhrases, applyRandomPhrases, downloadPhraseTemplateUrl } from '../lib/api';
import type { VideoStatus } from '../lib/api';

interface PhraseBankUploaderProps {
  onApplySuccess: (updatedVideos: VideoStatus[]) => void;
}

export const PhraseBankUploader: React.FC<PhraseBankUploaderProps> = ({ onApplySuccess }) => {
  const [totalPhrases, setTotalPhrases] = useState<number>(0);
  const [activePhrases, setActivePhrases] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPhrasesInfo = async () => {
    try {
      const info = await listPhrases();
      setTotalPhrases(info.total);
      setActivePhrases(info.active);
    } catch (err) {
      console.error("Erro ao carregar frases:", err);
    }
  };

  useEffect(() => {
    fetchPhrasesInfo();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const result = await uploadPhrases(file);
        if (result.success) {
          setTotalPhrases(result.total);
          setActivePhrases(result.active);
          setSuccessMsg(`Sucesso! ${result.total} frases carregadas (${result.active} ativas).`);
          // Oculta a mensagem de sucesso depois de 5 segundos
          setTimeout(() => setSuccessMsg(null), 5000);
        } else {
          setError("Falha ao processar arquivo de frases.");
        }
      } catch (err: any) {
        setError(err.message || "Erro ao enviar arquivo.");
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    }
  };

  const handleApplyRandom = async () => {
    setApplying(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updatedVideos = await applyRandomPhrases(overwrite);
      onApplySuccess(updatedVideos);
      setSuccessMsg("Frases aleatórias aplicadas com sucesso!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || "Falha ao aplicar frases.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📚</span> Banco de Frases
        </h4>
        <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          Suba um arquivo com POVs e legendas para preencher seus vídeos automaticamente.
        </p>
      </div>

      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--border-radius-md)',
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px dashed var(--border-color)'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>Status do Banco:</span>
        <span style={{ color: totalPhrases > 0 ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 600 }}>
          {totalPhrases > 0 ? `${totalPhrases} frases (${activePhrases} ativas)` : "Nenhuma frase"}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <a 
          href={downloadPhraseTemplateUrl()}
          download="modelo_frases.csv"
          style={{
            flex: 1,
            backgroundColor: 'white',
            border: '1px solid var(--border-color)',
            padding: '8px 12px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            display: 'inline-block'
          }}
        >
          📥 Baixar Modelo
        </a>

        <label style={{
          flex: 1,
          backgroundColor: 'white',
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'center',
          color: 'var(--text-primary)',
          display: 'inline-block'
        }}>
          {uploading ? 'Enviando...' : '📤 Enviar CSV'}
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
            disabled={uploading}
          />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input 
            type="checkbox" 
            checked={overwrite} 
            onChange={(e) => setOverwrite(e.target.checked)}
            style={{
              width: '15px',
              height: '15px',
              cursor: 'pointer'
            }}
          />
          <span>Sobrescrever frases existentes</span>
        </label>

        <button
          onClick={handleApplyRandom}
          disabled={applying || totalPhrases === 0}
          style={{
            width: '100%',
            backgroundColor: totalPhrases > 0 ? 'var(--accent-blue)' : '#cbd5e1',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: totalPhrases > 0 ? 'pointer' : 'not-allowed',
            opacity: applying ? 0.8 : 1
          }}
        >
          {applying ? 'Preenchendo...' : '🎲 Preencher Aleatório'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '11px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', border: '1px solid #fca5a5' }}>
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div style={{ color: '#059669', fontSize: '11px', backgroundColor: '#ecfdf5', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', border: '1px solid #a7f3d0' }}>
          ✅ {successMsg}
        </div>
      )}

      <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
        * O POV aparece no vídeo. A legenda vai para o post do Instagram.
      </p>
    </div>
  );
};
