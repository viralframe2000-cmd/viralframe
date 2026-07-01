import React, { useState, useEffect } from 'react';
import { getProfile, saveProfile, uploadLogo, profileLogoUrl } from '../lib/api';
import type { ProfileSettingsData } from '../lib/api';

interface ProfileSettingsProps {
  onProfileChange: (profile: ProfileSettingsData, logoTimestamp: number) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onProfileChange }) => {
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [verified, setVerified] = useState(true);
  const [logoTimestamp, setLogoTimestamp] = useState<number>(Date.now());
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setDisplayName(data.display_name);
      setHandle(data.handle);
      setVerified(data.verified);
      onProfileChange(data, logoTimestamp);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFieldChange = (field: 'display_name' | 'handle', value: string) => {
    let updatedDisplayName = displayName;
    let updatedHandle = handle;

    if (field === 'display_name') {
      setDisplayName(value);
      updatedDisplayName = value;
    } else if (field === 'handle') {
      setHandle(value);
      updatedHandle = value;
    }

    onProfileChange({
      display_name: updatedDisplayName,
      handle: updatedHandle,
      verified,
    }, logoTimestamp);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      setError(null);
      setSuccessMsg(null);

      try {
        await uploadLogo(file);
        const newTimestamp = Date.now();
        setLogoTimestamp(newTimestamp);
        
        onProfileChange({
          display_name: displayName,
          handle,
          verified,
        }, newTimestamp);
        
        setSuccessMsg("Foto de perfil atualizada com sucesso!");
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (err: any) {
        setError("Erro ao enviar a logo.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const saved = await saveProfile({
        display_name: displayName,
        handle,
        verified,
      });
      setDisplayName(saved.display_name);
      setHandle(saved.handle);
      setVerified(saved.verified);
      onProfileChange(saved, logoTimestamp);
      setSuccessMsg("Informações do perfil salvas com sucesso.");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearProfile = async () => {
    if (confirm("Deseja realmente limpar as informações do perfil?")) {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      try {
        const saved = await saveProfile({
          display_name: "",
          handle: "",
          verified,
          logo_path: undefined
        });
        setDisplayName("");
        setHandle("");
        onProfileChange(saved, Date.now());
        setSuccessMsg("Informações do perfil limpas.");
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (err: any) {
        setError("Erro ao limpar perfil.");
      } finally {
        setSaving(false);
      }
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
      gap: '20px',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)'
    }}>
      <div>
        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <span style={{ fontSize: '18px' }}>👤</span> Informações do Perfil
        </h4>
        <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Essas informações aparecerão no topo do vídeo final.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img 
            src={profileLogoUrl(logoTimestamp)} 
            alt="Logo" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerText = displayName ? displayName[0].toUpperCase() : '👤';
              }
            }}
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background var(--transition-fast), border-color var(--transition-fast)'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            {uploading ? 'Enviando...' : '📷 Escolher Logo'}
            <input type="file" accept=".png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleLogoChange} disabled={uploading} />
          </label>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            PNG ou JPG circular.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome exibido</label>
          <input 
            type="text" 
            value={displayName}
            onChange={(e) => handleFieldChange('display_name', e.target.value)}
            placeholder="Coloque seu nome de exibição aqui"
            className="input-dark"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              outline: 'none',
              width: '100%',
              fontFamily: 'var(--font-secondary)',
              transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(59,130,246,0.6)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>@ do perfil</label>
          <input 
            type="text" 
            value={handle}
            onChange={(e) => handleFieldChange('handle', e.target.value)}
            placeholder="Coloque seu @ do Instagram aqui"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              outline: 'none',
              width: '100%',
              fontFamily: 'var(--font-secondary)',
              transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(59,130,246,0.6)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={handleSaveProfile}
            disabled={saving || !displayName.trim() || !handle.trim()}
            style={{
              flex: 1,
              background: 'var(--gradient-cyan-blue)',
              color: 'white',
              border: 'none',
              padding: '11px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
              opacity: (saving || !displayName.trim() || !handle.trim()) ? 0.5 : 1
            }}
            onMouseEnter={e => {
              if (!(saving || !displayName.trim() || !handle.trim())) {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {saving ? 'Salvando...' : '💾 Salvar Perfil'}
          </button>
          
          <button
            onClick={handleClearProfile}
            disabled={saving || (!displayName && !handle)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-error)',
              padding: '11px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background var(--transition-fast), border-color var(--transition-fast)',
              opacity: (saving || (!displayName && !handle)) ? 0.5 : 1
            }}
            onMouseEnter={e => {
              if (!(saving || (!displayName && !handle))) {
                e.currentTarget.style.backgroundColor = 'var(--color-error-bg)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            🗑️ Limpar Perfil
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', fontSize: '12px', backgroundColor: 'var(--color-error-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div style={{ color: 'var(--color-success)', fontSize: '12px', backgroundColor: 'var(--color-success-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✅ {successMsg}
        </div>
      )}
    </div>
  );
};
