import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message || 'Erro ao realizar login.');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-secondary)',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          animation: 'blobFloat1 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          animation: 'blobFloat2 22s ease-in-out infinite',
        }} />
      </div>

      {/* ── COLUNA ESQUERDA — Branding ── */}
      <div style={{
        flex: '1',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.06) 100%)',
        borderRight: '1px solid var(--border-color)',
        position: 'relative',
        zIndex: 1,
      }} className="auth-left-col">

        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--gradient-cyan-blue)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '20px', color: 'white',
            boxShadow: 'var(--shadow-glow-blue)',
          }}>V</div>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
            ViralFrame Studio
          </span>
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: '2.4rem', fontWeight: 800,
          letterSpacing: '-1.5px', lineHeight: 1.1,
          margin: '0 0 20px 0', color: 'var(--text-primary)',
        }}>
          Automatize a criação<br />
          <span style={{
            background: 'var(--gradient-cyan-blue)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>de vídeos virais</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 48px 0', maxWidth: '380px' }}>
          Banco de frases, preview em tempo real e renderização em lote com FFmpeg.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '⚡', text: 'Gere centenas de Reels em minutos' },
            { icon: '👁️', text: 'Preview em tempo real antes de renderizar' },
            { icon: '📦', text: 'Export em lote para Reels, TikTok e Shorts' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', flexShrink: 0,
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              }}>{item.icon}</div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLUNA DIREITA — Formulário ── */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
      }}>

        {/* Mobile logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--gradient-cyan-blue)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '18px', color: 'white',
            boxShadow: 'var(--shadow-glow-blue)',
          }}>V</div>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            ViralFrame Studio
          </span>
        </Link>

        {/* Card principal */}
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px 36px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.5s ease both',
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '1.6rem', fontWeight: 800,
              letterSpacing: '-0.8px',
              margin: '0 0 8px 0', color: 'var(--text-primary)',
            }}>
              Entrar na conta
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
              Bem-vindo de volta! Continue criando vídeos virais.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* E-mail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-dark"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '14px',
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

            {/* Senha */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
                  Senha
                </label>
                <Link to="/esqueci-senha" style={{
                  fontSize: '12px', color: 'var(--accent-cyan)',
                  textDecoration: 'none', fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-blue)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}>
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '14px',
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

            {/* Erro */}
            {error && (
              <div style={{
                color: 'var(--color-error)',
                fontSize: '13px',
                background: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                padding: '12px 14px',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '8px',
                animation: 'fadeIn 0.3s ease both',
              }}>
                <span style={{ fontSize: '16px' }}>⚠</span>
                {error}
              </div>
            )}

            {/* Botão de login */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(59,130,246,0.5)' : 'var(--gradient-cyan-blue)',
                color: 'white',
                border: 'none',
                padding: '13px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'var(--font-secondary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
                transition: 'all 0.2s',
                marginTop: '4px',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.5)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)'; }}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  Entrando...
                </>
              ) : 'Entrar na Conta →'}
            </button>
          </form>

          {/* Link para cadastro */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            Não tem uma conta?{' '}
            <Link to="/cadastro" style={{
              color: 'var(--accent-cyan)', fontWeight: 600,
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-blue)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}>
              Criar conta grátis
            </Link>
          </div>

          {/* Links legais */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '16px',
            marginTop: '20px', fontSize: '12px',
          }}>
            {[
              { to: '/termos', label: 'Termos' },
              { to: '/privacidade', label: 'Privacidade' },
              { to: '/cookies', label: 'Cookies' },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{
                color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left-col { display: flex !important; }
        }
      `}</style>
    </div>
  );
};
