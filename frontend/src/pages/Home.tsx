import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: "'Inter', sans-serif",
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--accent-blue)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            V
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>ViralFrame Studio</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" style={{
            textDecoration: 'none',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            border: '1px solid var(--border-color)',
            backgroundColor: 'white'
          }}>
            Login
          </Link>
          <Link to="/cadastro" style={{
            textDecoration: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: 'var(--accent-blue)'
          }}>
            Cadastrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        gap: '24px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          margin: 0,
          lineHeight: '1.1',
          letterSpacing: '-1.5px'
        }}>
          Crie vídeos virais em massa com frases e legendas automáticas
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          margin: 0,
          lineHeight: '1.5'
        }}>
          Automatize Reels, TikToks e Shorts com layout de perfil profissional, banco de frases inteligente e renderização na nuvem com FFmpeg.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Link to="/cadastro" style={{
            textDecoration: 'none',
            color: 'white',
            padding: '12px 28px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '16px',
            fontWeight: 700,
            backgroundColor: 'var(--accent-blue)',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
          }}>
            Começar Grátis →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div>ViralFrame Studio &copy; 2026</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/termos" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Termos de Uso</Link>
          <span>•</span>
          <Link to="/privacidade" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Política de Privacidade</Link>
          <span>•</span>
          <Link to="/cookies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Política de Cookies</Link>
        </div>
      </footer>
    </div>
  );
};
