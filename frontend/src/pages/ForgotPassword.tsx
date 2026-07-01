import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message || 'Erro ao processar solicitação.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-secondary)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '40px 36px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        animation: 'fadeIn 0.5s ease both',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px', background: 'var(--gradient-cyan-blue)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '18px', color: 'white',
          }}>V</div>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
            ViralFrame Studio
          </span>
        </Link>

        <div style={{ marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.8px',
            margin: '0 0 8px 0', color: 'var(--text-primary)',
          }}>
            Recuperar senha
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Enviaremos um link de recuperação para o seu e-mail.
          </p>
        </div>

        {success ? (
          <div style={{
            textAlign: 'center', padding: '28px',
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: '14px',
            animation: 'fadeIn 0.4s ease both',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
            <h3 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '16px', fontWeight: 700,
              color: 'var(--color-success)', margin: '0 0 8px 0',
            }}>Link enviado!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Verifique sua caixa de entrada e pasta de spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
                E-mail cadastrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
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

            {error && (
              <div style={{
                color: 'var(--color-error)', fontSize: '13px',
                background: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                padding: '12px 14px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '8px',
                animation: 'fadeIn 0.3s ease both',
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(59,130,246,0.5)' : 'var(--gradient-cyan-blue)',
                color: 'white', border: 'none',
                padding: '13px', borderRadius: '10px',
                fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-secondary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {loading ? (
                <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Processando...</>
              ) : '📧 Enviar Link de Recuperação'}
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center', marginTop: '24px',
          paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '14px', color: 'var(--text-secondary)',
        }}>
          Lembrou a senha?{' '}
          <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-blue)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}>
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
};
