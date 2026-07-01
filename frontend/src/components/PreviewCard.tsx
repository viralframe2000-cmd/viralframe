import React from 'react';

export interface VideoStatus {
  id: string;
  filename: string;
  status: string;
  exists_output: boolean;
  video_url: string | null;
  caption_url: string | null;
  cover_url: string | null;
  pov_text?: string;
  caption_text?: string;
  input_preview_url: string | null;
  output_preview_url: string | null;
  input_signed_url?: string | null;
  output_signed_url?: string | null;
  has_output: boolean;
}

interface PreviewCardProps {
  display_name?: string;
  instagram_handle?: string;
  logoSignedUrl?: string | null;
  isVerified?: boolean;
  selectedVideo?: VideoStatus | null;
  previewMode?: "input" | "output";
  onPreviewModeChange?: (mode: "input" | "output") => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ 
  display_name = "", 
  instagram_handle = "", 
  logoSignedUrl = null, 
  isVerified = true,
  selectedVideo = null,
  previewMode = "input",
  onPreviewModeChange
}) => {
  const nameToDisplay = display_name && display_name.trim() ? display_name.trim() : "Nome do Perfil";
  const handleToDisplay = instagram_handle && instagram_handle.trim() ? instagram_handle.trim() : "@seuperfil";
  const selectedVideoFilename = selectedVideo?.filename || null;
  const povText = selectedVideo?.pov_text || "";

  const inputPreviewUrl = selectedVideo?.input_signed_url || selectedVideo?.input_preview_url || null;
  const outputPreviewUrl = selectedVideo?.output_signed_url || selectedVideo?.output_preview_url || null;
  const hasOutput = selectedVideo?.has_output || selectedVideo?.exists_output || false;

  // Estado Vazio Elegante quando nenhum vídeo está focado
  if (!selectedVideoFilename) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        height: '100%',
        minHeight: '580px',
        width: '100%',
        backdropFilter: 'var(--blur-sm)',
        WebkitBackdropFilter: 'var(--blur-sm)',
        textAlign: 'center',
        fontFamily: 'var(--font-secondary)',
        animation: 'fadeIn var(--transition-normal) forwards'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          backgroundColor: 'rgba(34, 211, 238, 0.08)',
          border: '1px solid rgba(34, 211, 238, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)',
          fontSize: '28px',
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.1)',
          animation: 'float 3s ease-in-out infinite'
        }}>
          📱
        </div>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-primary)' }}>
          Visualização do Reels
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px', lineHeight: '1.5' }}>
          Selecione um vídeo na fila para visualizar
        </p>
      </div>
    );
  }
  
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
      width: '100%',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)',
      animation: 'fadeIn var(--transition-normal) forwards'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-primary)' }}>
          Pré-visualização do Layout
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedVideoFilename}>
          🎬 {selectedVideoFilename}
        </span>
      </div>

      {/* Seletor Original/Renderizado */}
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
          zIndex: 15
        }}></div>

        {previewMode === "output" && hasOutput && outputPreviewUrl ? (
          /* Modo Renderizado (Tela cheia interna do celular) */
          <video
            key={outputPreviewUrl}
            src={outputPreviewUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        ) : (
          /* Modo Original / Edição (HTML Overlay + Vídeo Original) */
          <>
            {/* 1. Cabeçalho */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '40px 20px 10px 20px',
              backgroundColor: '#ffffff',
              zIndex: 2
            }}>
              {/* Logo */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                flexShrink: 0
              }}>
                {logoSignedUrl && logoSignedUrl.trim() !== "" ? (
                  <img 
                    src={logoSignedUrl} 
                    alt="Logo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<span style="font-size: 12px; color: #64748b;">👤</span>`;
                      }
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>👤</span>
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
              minHeight: '44px',
              zIndex: 2
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

            {/* 3. Vídeo do Produto (Original com crop simétrico no HTML) */}
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
              overflow: 'hidden',
              zIndex: 2
            }}>
              {inputPreviewUrl ? (
                <video
                  key={inputPreviewUrl}
                  src={inputPreviewUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: '11px'
                  }}
                />
              ) : (
                <span style={{ zIndex: 1, fontWeight: 500 }}>Carregando vídeo...</span>
              )}
            </div>

            {/* Rodapé Limpo */}
            <div style={{
              height: '24px',
              backgroundColor: '#ffffff',
              width: '100%',
              zIndex: 2
            }}></div>
          </>
        )}
      </div>
    </div>
  );
};
