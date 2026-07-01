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
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  };

  const inputStyle: React.CSSProperties = {
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
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(59,130,246,0.6)';
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)';
    e.target.style.background = 'rgba(255,255,255,0.08)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(255,255,255,0.05)';
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
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          animation: 'blobFloat2 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
          animation: 'blobFloat1 22s ease-in-out infinite',
        }} />
      </div>

      {/* ── COLUNA ESQUERDA ── */}
      <div style={{
        flex: '1',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(34,211,238,0.04) 100%)',
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
          }}>V</div>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
            ViralFrame Studio
          </span>
        </Link>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 'var(--radius-full)', padding: '6px 16px',
          fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)',
          marginBottom: '24px',
        }}>
          ✦ Gratuito para começar
        </div>

        <h1 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: '2.2rem', fontWeight: 800,
          letterSpacing: '-1.5px', lineHeight: 1.1,
          margin: '0 0 20px 0', color: 'var(--text-primary)',
        }}>
          Comece a escalar<br />sua produção{' '}
          <span style={{
            background: 'var(--gradient-cyan-blue)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>de vídeos</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 48px 0', maxWidth: '380px' }}>
          Crie sua conta e comece a transformar vídeos brutos em Reels virais prontos para postar.
        </p>

        {/* Testimonial */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '380px',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0', fontStyle: 'italic' }}>
            "Com o ViralFrame Studio, consigo criar 50 Reels por dia com frases diferentes. A renderização em lote mudou minha produção completamente."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--gradient-blue-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '15px', color: 'white',
            }}>A</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Ana Silva</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Creator de conteúdo viral</div>
            </div>
          </div>
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
            width: '36px', height: '36px', background: 'var(--gradient-cyan-blue)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '18px', color: 'white',
          }}>V</div>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            ViralFrame Studio
          </span>
        </Link>

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

          {success ? (
            /* Estado de sucesso */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px', height: '64px',
                background: 'var(--color-success-bg)',
                border: '2px solid var(--color-success-border)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px',
                animation: 'fadeIn 0.5s ease both',
              }}>✓</div>
              <h2 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.4rem', fontWeight: 700,
                margin: '0 0 12px 0', color: 'var(--color-success)',
              }}>
                Conta criada!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                Seja bem-vindo ao ViralFrame Studio. Redirecionando para o dashboard...
              </p>
              <div style={{
                marginTop: '20px', height: '3px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: '100%',
                  background: 'var(--gradient-cyan-blue)',
                  animation: 'shimmer 3s linear',
                  backgroundSize: '200% 100%',
                }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1.6rem', fontWeight: 800,
                  letterSpacing: '-0.8px',
                  margin: '0 0 8px 0', color: 'var(--text-primary)',
                }}>
                  Criar sua conta
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Gratuito. Sem cartão de crédito.
                </p>
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Nome */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
                    Nome de exibição
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Seu nome ou marca"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

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
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Senha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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

                {/* Botão */}
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
                    marginTop: '6px',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.5)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)'; }}>
                  {loading ? (
                    <>
                      <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                      Criando conta...
                    </>
                  ) : 'Criar conta grátis →'}
                </button>

                {/* Termos */}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                  Ao criar uma conta, você concorda com os{' '}
                  <Link to="/termos" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                    Termos de Uso
                  </Link>
                  {' '}e a{' '}
                  <Link to="/privacidade" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                    Política de Privacidade
                  </Link>.
                </p>
              </form>

              <div style={{
                textAlign: 'center',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}>
                Já tem uma conta?{' '}
                <Link to="/login" style={{
                  color: 'var(--accent-cyan)', fontWeight: 600,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-blue)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}>
                  Fazer login
                </Link>
              </div>
            </>
          )}
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
