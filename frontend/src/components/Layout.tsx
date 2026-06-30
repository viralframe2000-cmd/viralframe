import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || null);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--accent-blue)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            V
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>ViralFrame Studio</h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Criação de Vídeos Virais em Lote</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {userEmail && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              👤 {userEmail}
            </span>
          )}
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#10b981',
            backgroundColor: '#ecfdf5',
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: 500
          }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            Servidor Ativo
          </span>
          {userEmail && (
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '6px 14px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sair
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        ViralFrame Studio &copy; 2026
      </footer>
    </div>
  );
};
