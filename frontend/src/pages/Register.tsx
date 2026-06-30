import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      setError(error.message || 'Erro ao realizar cadastro.');
      setLoading(false);
    } else {
      // Criação de perfil inicial feita por trigger do BD, podemos salvar metadados
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate('/dashboard'), 3000);
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
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 700 }}>Criar sua Conta</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Comece a gerar vídeos em lote gratuitamente
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
            🎉 Cadastro realizado com sucesso! Redirecionando para o dashboard...
          </div>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome de exibição</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome ou marca"
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
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Já possui uma conta?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
            Fazer Login
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
