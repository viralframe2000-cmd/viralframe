import React, { useState, useEffect } from 'react';
import { uploadPhrases, listPhrases, applyRandomPhrases, clearPhrases } from '../lib/api';
import { downloadPhraseTemplate } from '../lib/phrases';
import type { VideoStatus } from '../lib/api';

interface PhraseBankUploaderProps {
  onApplySuccess: (updatedVideos: VideoStatus[]) => void;
  phrasesCountTrigger?: number;
  onPhrasesCleared?: () => void;
}

export const PhraseBankUploader: React.FC<PhraseBankUploaderProps> = ({ 
  onApplySuccess,
  phrasesCountTrigger = 0,
  onPhrasesCleared
}) => {
  const [totalPhrases, setTotalPhrases] = useState<number>(0);
  const [activePhrases, setActivePhrases] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Estados para limpeza de frases (Regra 8 e Parte 3)
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

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
  }, [phrasesCountTrigger]);

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
        console.error("Erro real no upload de frases CSV:", err);
        setError(err.message || "Não foi possível carregar o banco de frases.");
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
      console.error("Erro real ao aplicar frases aleatórias:", err);
      setError(err.message || "Falha ao aplicar frases.");
    } finally {
      setApplying(false);
    }
  };

  const handleClearPhrases = async () => {
    setClearing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await clearPhrases();
      setTotalPhrases(0);
      setActivePhrases(0);
      setSuccessMsg("Banco de frases limpo com sucesso!");
      setShowClearConfirm(false);
      
      // Notifica o pai Dashboard de que as frases foram limpas para resetar qualquer dependência (Regra 9)
      if (onPhrasesCleared) {
        onPhrasesCleared();
      }
    } catch (err: any) {
      setError(err.message || "Erro ao limpar frases.");
    } finally {
      setClearing(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 6px 0', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <span style={{ fontSize: '18px' }}>📚</span> Banco de Frases
        </h4>
        {totalPhrases > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-error)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'var(--font-secondary)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🧹 Limpar Frases
          </button>
        )}
      </div>
      <div>
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

      {/* Modal de Confirmação para Limpeza de Frases (Parte 3) */}
      {showClearConfirm && (
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
          onClick={() => !clearing && setShowClearConfirm(false)}
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
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--color-error)', fontWeight: 700, fontFamily: 'var(--font-primary)' }}>
                🧹 Limpar banco de frases?
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Isso removerá todas as frases carregadas neste banco. Você poderá enviar outro CSV em seguida.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-secondary)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleClearPhrases}
                disabled={clearing}
                style={{
                  background: 'var(--color-error)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.25)',
                  fontFamily: 'var(--font-secondary)'
                }}
              >
                {clearing ? 'Limpando...' : 'Limpar frases'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
