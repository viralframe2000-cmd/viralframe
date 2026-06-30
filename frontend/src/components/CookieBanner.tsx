import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('vf_cookie_consent');
    if (!savedConsent) {
      setVisible(true);
    }
  }, []);

  const saveConsent = async (consentSettings: CookieSettings) => {
    localStorage.setItem('vf_cookie_consent', JSON.stringify(consentSettings));
    setVisible(false);

    // Salva na tabela do Supabase se o usuário estiver logado
    const { data: { user } } = await supabase.auth.getUser();
    try {
      await supabase.from('cookie_consents').insert({
        user_id: user?.id || null,
        anonymous_id: user ? null : 'anon_' + Math.random().toString(36).substring(2, 11),
        necessary: consentSettings.necessary,
        analytics: consentSettings.analytics,
        marketing: consentSettings.marketing,
        preferences: consentSettings.preferences,
        policy_version: '1.0'
      });
    } catch (err) {
      console.warn('Erro ao persistir consentimento de cookies no banco:', err);
    }
  };

  const handleAcceptAll = () => {
    const allOn = { necessary: true, analytics: true, marketing: true, preferences: true };
    saveConsent(allOn);
  };

  const handleRejectAll = () => {
    const onlyNecessary = { necessary: true, analytics: false, marketing: false, preferences: false };
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(settings);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      right: '24px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '640px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif"
    }}>
      {!showPreferences ? (
        <>
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600 }}>🍪 Nós respeitamos sua privacidade</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Utilizamos cookies necessários para manter sua sessão ativa no Supabase e cookies opcionais para estatísticas de uso que melhoram o editor de vídeo. Ao clicar em "Aceitar todos", você concorda com o uso de todas as categorias. Veja nossa{' '}
              <a href="/privacidade" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>
                Política de Privacidade
              </a>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowPreferences(true)}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                padding: '8px 14px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Personalizar
            </button>
            <button 
              onClick={handleRejectAll}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '8px 14px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Rejeitar
            </button>
            <button 
              onClick={handleAcceptAll}
              style={{
                backgroundColor: 'var(--accent-blue)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Aceitar todos
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600 }}>Personalizar preferências de cookies</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Defina quais categorias opcionais de cookies você aceita carregar no site:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked disabled style={{ width: '16px', height: '16px' }} />
              <div>
                <strong>Necessários (Sempre ativos)</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Usados para autenticação com Supabase e controle de tráfego básico.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.preferences} 
                onChange={(e) => setSettings({ ...settings, preferences: e.target.checked })} 
                style={{ width: '16px', height: '16px' }} 
              />
              <div>
                <strong>Preferências</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Salva preferências visuais como tema e visualização de celular.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.analytics} 
                onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })} 
                style={{ width: '16px', height: '16px' }} 
              />
              <div>
                <strong>Analíticos</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mede performance e frequência de cliques de botões nas renderizações.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.marketing} 
                onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })} 
                style={{ width: '16px', height: '16px' }} 
              />
              <div>
                <strong>Marketing</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Utilizado para medir anúncios em mídias de captação externa.</div>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end', marginTop: '4px' }}>
            <button 
              onClick={() => setShowPreferences(false)}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                padding: '8px 14px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Voltar
            </button>
            <button 
              onClick={handleSavePreferences}
              style={{
                backgroundColor: 'var(--accent-blue)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Salvar minhas escolhas
            </button>
          </div>
        </>
      )}
    </div>
  );
};
