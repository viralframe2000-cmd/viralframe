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
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '32px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--accent-blue)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px',
            margin: '0 auto 12px auto'
          }}>
            V
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700 }}>Recuperar Senha</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Enviaremos um link de recuperação para seu e-mail
          </p>
        </div>

        {success ? (
          <div style={{
            color: '#059669',
            fontSize: '14px',
            backgroundColor: '#ecfdf5',
            padding: '16px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid #a7f3d0',
            textAlign: 'center'
          }}>
            📧 Link enviado com sucesso! Verifique sua caixa de entrada e spam.
          </div>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>E-mail cadastrado</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  padding: '10px 14px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              />
            </div>

            {error && (
              <div style={{
                color: '#ef4444',
                fontSize: '12px',
                backgroundColor: '#fef2f2',
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid #fca5a5'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--accent-blue)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '4px'
              }}
            >
              {loading ? 'Processando...' : 'Enviar Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Lembrou a senha?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
};
