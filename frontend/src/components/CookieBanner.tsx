import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('vf_cookie_consent');
    if (!savedConsent) {
      // Delay para não aparecer imediatamente no carregamento
      setTimeout(() => {
        setVisible(true);
        setTimeout(() => setMounted(true), 50);
      }, 1200);
    }
  }, []);

  const saveConsent = async (consentSettings: CookieSettings) => {
    localStorage.setItem('vf_cookie_consent', JSON.stringify(consentSettings));
    setMounted(false);
    setTimeout(() => setVisible(false), 300);

    const { data: { user } } = await supabase.auth.getUser();
    try {
      await supabase.from('cookie_consents').insert({
        user_id: user?.id || null,
        anonymous_id: user ? null : 'anon_' + Math.random().toString(36).substring(2, 11),
        necessary: consentSettings.necessary,
        analytics: consentSettings.analytics,
        marketing: consentSettings.marketing,
        preferences: consentSettings.preferences,
        policy_version: '1.0',
      });
    } catch (err) {
      console.warn('Erro ao persistir consentimento de cookies:', err);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true, preferences: true });
  };

  const handleRejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false, preferences: false });
  };

  const handleSavePreferences = () => {
    saveConsent(settings);
  };

  if (!visible) return null;

  const btnBase: React.CSSProperties = {
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    border: 'none',
    whiteSpace: 'nowrap',
  };

  return (
    <>
      {/* Overlay sutil */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.2)',
        zIndex: 998,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
      }} />

      {/* Banner */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${mounted ? '0' : '24px'})`,
        width: 'calc(100% - 48px)',
        maxWidth: '680px',
        background: 'rgba(8,13,26,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '20px',
        boxShadow: '0 16px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        padding: '24px 28px',
        zIndex: 999,
        fontFamily: 'var(--font-secondary)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>

        {!showPreferences ? (
          /* ── VISTA PRINCIPAL ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              {/* Ícone */}
              <div style={{
                width: '44px', height: '44px', flexShrink: 0,
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
              }}>🍪</div>

              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontFamily: 'var(--font-primary)',
                  margin: '0 0 6px 0',
                  fontSize: '15px', fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  Nós respeitamos sua privacidade
                </h4>
                <p style={{
                  margin: 0, fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}>
                  Usamos cookies necessários para autenticação e cookies opcionais para melhorar sua experiência.{' '}
                  <Link to="/privacidade" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-blue)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}>
                    Política de Privacidade
                  </Link>{' '}e{' '}
                  <Link to="/cookies" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-blue)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}>
                    Política de Cookies
                  </Link>.
                </p>
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowPreferences(true)}
                style={{
                  ...btnBase,
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}>
                ⚙ Personalizar
              </button>
              <button
                onClick={handleRejectAll}
                style={{
                  ...btnBase,
                  background: 'transparent',
                  color: 'var(--color-error)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-error-bg)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                }}>
                Rejeitar opcionais
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  ...btnBase,
                  background: 'var(--gradient-cyan-blue)',
                  color: 'white',
                  boxShadow: '0 0 16px rgba(59,130,246,0.3)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.3)';
                }}>
                ✓ Aceitar todos
              </button>
            </div>
          </div>
        ) : (
          /* ── PREFERÊNCIAS ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{
                fontFamily: 'var(--font-primary)',
                margin: '0 0 6px 0',
                fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)',
              }}>
                Preferências de cookies
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Escolha quais categorias de cookies você aceita:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  key: 'necessary' as const,
                  title: 'Necessários',
                  desc: 'Autenticação com Supabase e sessão do usuário.',
                  disabled: true, checked: true,
                  color: 'var(--accent-cyan)',
                },
                {
                  key: 'preferences' as const,
                  title: 'Preferências',
                  desc: 'Salva preferências visuais como tema e layout.',
                  disabled: false, checked: settings.preferences,
                  color: 'var(--accent-purple)',
                },
                {
                  key: 'analytics' as const,
                  title: 'Analíticos',
                  desc: 'Mede uso de funcionalidades e performance.',
                  disabled: false, checked: settings.analytics,
                  color: 'var(--accent-blue)',
                },
                {
                  key: 'marketing' as const,
                  title: 'Marketing',
                  desc: 'Anúncios externos e análise de conversão.',
                  disabled: false, checked: settings.marketing,
                  color: 'var(--accent-pink)',
                },
              ].map(item => (
                <label key={item.key} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: item.disabled ? 'default' : 'pointer',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  transition: 'background 0.2s, border-color 0.2s',
                  userSelect: 'none',
                }}
                  onMouseEnter={e => { if (!item.disabled) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    disabled={item.disabled}
                    onChange={item.disabled ? undefined : e => setSettings({ ...settings, [item.key]: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: item.disabled ? 'default' : 'pointer', accentColor: item.color }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.title}
                      {item.disabled && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px',
                          color: item.color, background: `${item.color}15`,
                          border: `1px solid ${item.color}30`,
                          padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        }}>SEMPRE ATIVO</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPreferences(false)}
                style={{
                  ...btnBase,
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                ← Voltar
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  ...btnBase,
                  background: 'var(--gradient-cyan-blue)',
                  color: 'white',
                  boxShadow: '0 0 16px rgba(59,130,246,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                ✓ Salvar preferências
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
