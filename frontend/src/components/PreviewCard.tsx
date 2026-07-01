import React from 'react';

interface PreviewCardProps {
  povText: string;
  brandName?: string;
  brandHandle?: string;
  logoUrl?: string | null;
  isVerified?: boolean;
  selectedVideoFilename?: string | null;
  inputPreviewUrl?: string | null;
  outputPreviewUrl?: string | null;
  hasOutput?: boolean;
  previewMode?: "input" | "output";
  onPreviewModeChange?: (mode: "input" | "output") => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ 
  povText,
  brandName = "", 
  brandHandle = "", 
  logoUrl = null, 
  isVerified = true,
  selectedVideoFilename = null,
  inputPreviewUrl = null,
  outputPreviewUrl = null,
  hasOutput = false,
  previewMode = "input",
  onPreviewModeChange
}) => {
  const nameToDisplay = brandName && brandName.trim() ? brandName.trim() : "Nome do Perfil";
  const handleToDisplay = brandHandle && brandHandle.trim() ? brandHandle.trim() : "@seuperfil";
  
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-primary)' }}>
          Pré-visualização do Layout
        </h3>
        {selectedVideoFilename && (
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            🎬 {selectedVideoFilename}
          </span>
        )}
      </div>

      {/* Seletor Original/Renderizado */}
      {selectedVideoFilename && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          justifyContent: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '8px', marginLeft: '6px' }}>
            Visualizar:
          </span>
          <button
            onClick={() => onPreviewModeChange?.("input")}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: previewMode === "input" ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: previewMode === "input" ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: previewMode === "input" ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-secondary)'
            }}
          >
            Original
          </button>
          <button
            onClick={() => {
              if (hasOutput) {
                onPreviewModeChange?.("output");
              }
            }}
            disabled={!hasOutput}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: hasOutput ? 'pointer' : 'not-allowed',
              backgroundColor: previewMode === "output" ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: previewMode === "output" 
                ? 'var(--text-primary)' 
                : hasOutput 
                  ? 'var(--text-secondary)' 
                  : 'var(--text-muted)',
              boxShadow: previewMode === "output" ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-secondary)'
            }}
            title={!hasOutput ? "Gere o vídeo para visualizar o resultado final." : ""}
          >
            Renderizado
          </button>
        </div>
      )}
      
      {/* Moldura celular */}
      <div style={{
        width: '280px',
        height: '497px',
        border: '10px solid #1e293b',
        borderRadius: '38px',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        {/* Notch do celular */}
        <div style={{
          width: '110px',
          height: '18px',
          backgroundColor: '#1e293b',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          margin: '0 auto',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}></div>

        {/* 1. Cabeçalho */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '40px 20px 10px 20px',
          backgroundColor: '#ffffff'
        }}>
          {/* Logo */}
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            overflow: 'hidden'
          }}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    parent.innerText = brandName && brandName.trim() ? brandName.trim()[0].toUpperCase() : '👤';
                  }
                }}
              />
            ) : (
              brandName && brandName.trim() ? brandName.trim()[0].toUpperCase() : '👤'
            )}
          </div>
          <div>
            <div style={{ 
              fontSize: '10px', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '3px',
              wordBreak: 'break-word',
              maxWidth: '190px',
              lineHeight: 1.2,
              color: '#0f172a'
            }}>
              {nameToDisplay}
              {isVerified && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#1d9bf0',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '5px',
                  flexShrink: 0
                }}>
                  ✓
                </span>
              )}
            </div>
            <div style={{ fontSize: '8px', color: '#64748b' }}>{handleToDisplay}</div>
          </div>
        </div>

        {/* 2. Frase POV */}
        <div style={{
          padding: '0 20px',
          textAlign: 'center',
          margin: '10px 0',
          minHeight: '44px'
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#000000',
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}>
            {povText || "POV: você entrou no grupo de promoções certo"}
          </p>
        </div>

        {/* 3. Vídeo do Produto */}
        <div style={{
          flex: 1,
          margin: '0 10px 30px 10px',
          backgroundColor: '#000000',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '11px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {selectedVideoFilename ? (
            (() => {
              const videoSrc = previewMode === "output" && hasOutput ? outputPreviewUrl : inputPreviewUrl;
              if (videoSrc) {
                return (
                  <video
                    key={videoSrc}
                    src={videoSrc}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '11px'
                    }}
                  />
                );
              }
              return <span style={{ zIndex: 1, fontWeight: 500 }}>Carregando vídeo...</span>;
            })()
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', zIndex: 1, fontWeight: 500 }}>
              Selecione um vídeo na fila para visualizar
            </div>
          )}
        </div>

        {/* Rodapé Limpo (Branco Sem Texto) */}
        <div style={{
          height: '24px',
          backgroundColor: '#ffffff',
          width: '100%'
        }}></div>
      </div>
    </div>
  );
};
