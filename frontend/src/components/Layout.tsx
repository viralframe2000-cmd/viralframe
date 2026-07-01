import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-secondary)',
    }}>
      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: scrolled ? 'rgba(5,8,22,0.9)' : 'rgba(8,13,26,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'background 0.3s ease',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--gradient-cyan-blue)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-primary)', fontWeight: 800, fontSize: '18px', color: 'white',
            boxShadow: '0 0 16px rgba(59,130,246,0.3)',
          }}>V</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '15px', fontWeight: 700,
              letterSpacing: '-0.4px', color: 'var(--text-primary)',
            }}>
              ViralFrame<span style={{ color: 'var(--accent-cyan)' }}> Studio</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, lineHeight: 1 }}>
              Criação em Lote
            </div>
          </div>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Server status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 500, color: 'var(--color-success)',
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            padding: '5px 12px', borderRadius: 'var(--radius-full)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              boxShadow: '0 0 6px var(--color-success)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }} />
            Servidor Ativo
          </div>

          {/* User email */}
          {userEmail && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--gradient-blue-purple)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {userEmail[0].toUpperCase()}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</span>
            </div>
          )}

          {/* Logout */}
          {userEmail && (
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--color-error)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'var(--font-secondary)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-error-bg)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              }}>
              Sair
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '32px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px 32px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span>ViralFrame Studio © 2026</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          {[{ to: '/termos', l: 'Termos' }, { to: '/privacidade', l: 'Privacidade' }, { to: '/cookies', l: 'Cookies' }].map(link => (
            <Link key={link.to} to={link.to} style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              {link.l}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};
