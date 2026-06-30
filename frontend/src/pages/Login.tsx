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
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700 }}>Entrar no ViralFrame</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Faça login para automatizar seus vídeos
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>E-mail</label>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Senha</label>
              <Link to="/esqueci-senha" style={{ fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none' }}>
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {loading ? 'Entrando...' : 'Entrar na Conta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Não tem uma conta?{' '}
          <Link to="/cadastro" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
            Criar conta
          </Link>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '11px'
        }}>
          <Link to="/termos" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Termos</Link>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <Link to="/privacidade" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacidade</Link>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <Link to="/cookies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cookies</Link>
        </div>
      </div>
    </div>
  );
};
