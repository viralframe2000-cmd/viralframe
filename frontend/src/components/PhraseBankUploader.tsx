import React, { useState, useEffect } from 'react';
import { uploadPhrases, listPhrases, applyRandomPhrases } from '../lib/api';
import { downloadPhraseTemplate } from '../lib/phrases';
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
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)'
    }}>
      <div>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <span style={{ fontSize: '18px' }}>📚</span> Banco de Frases
        </h4>
        <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Suba um arquivo com POVs e legendas para preencher seus vídeos automaticamente.
        </p>
      </div>

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: 500,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px dashed var(--border-color)'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>Status do Banco:</span>
        <span style={{ color: totalPhrases > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
          {totalPhrases > 0 ? `${totalPhrases} frases (${activePhrases} ativas)` : "Nenhuma frase"}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => downloadPhraseTemplate()}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontFamily: 'var(--font-secondary)',
            transition: 'background var(--transition-fast), border-color var(--transition-fast)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          📥 Baixar Modelo
        </button>

        <label style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'center',
          color: 'var(--text-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontFamily: 'var(--font-secondary)',
          transition: 'background var(--transition-fast), border-color var(--transition-fast)'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          cursor: 'pointer',
          userSelect: 'none',
          color: 'var(--text-secondary)'
        }}>
          <input 
            type="checkbox" 
            checked={overwrite} 
            onChange={(e) => setOverwrite(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              accentColor: 'var(--accent-blue)'
            }}
          />
          <span>Sobrescrever frases existentes</span>
        </label>

        <button
          onClick={handleApplyRandom}
          disabled={applying || totalPhrases === 0}
          style={{
            width: '100%',
            background: totalPhrases > 0 ? 'var(--gradient-cyan-blue)' : 'rgba(255, 255, 255, 0.04)',
            color: totalPhrases > 0 ? 'white' : 'var(--text-muted)',
            border: 'none',
            padding: '11px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: totalPhrases > 0 ? 'pointer' : 'not-allowed',
            transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
            fontFamily: 'var(--font-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            opacity: applying ? 0.8 : 1,
            boxShadow: totalPhrases > 0 ? '0 0 12px rgba(59, 130, 246, 0.25)' : 'none'
          }}
          onMouseEnter={e => {
            if (totalPhrases > 0 && !applying) e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {applying ? (
            <>
              <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
              Preenchendo...
            </>
          ) : '🎲 Preencher Aleatório'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', fontSize: '11px', backgroundColor: 'var(--color-error-bg)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error-border)' }}>
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div style={{ color: 'var(--color-success)', fontSize: '11px', backgroundColor: 'var(--color-success-bg)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success-border)' }}>
          ✅ {successMsg}
        </div>
      )}

      <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
        * O POV aparece no vídeo. A legenda vai para o post do Instagram.
      </p>
    </div>
  );
};
