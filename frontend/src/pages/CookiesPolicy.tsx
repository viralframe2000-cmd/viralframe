import React from 'react';
import { Link } from 'react-router-dom';

export const CookiesPolicy: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      minHeight: '100vh',
      padding: '60px 20px',
      fontFamily: 'var(--font-secondary)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient blob */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
      }} />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'var(--blur-sm)',
        WebkitBackdropFilter: 'var(--blur-sm)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 40px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease both'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>
            Política de Cookies
          </h1>
          <Link to="/login" style={{
            color: 'var(--accent-cyan)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-blue)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent-cyan)')}
          >
            ← Voltar para o Login
          </Link>
        </div>

        <div style={{ lineHeight: '1.7', fontSize: '14.5px', display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-secondary)' }}>
          <p>
            Esta política explica como o <strong style={{ color: 'var(--text-primary)' }}>ViralFrame Studio</strong> utiliza cookies e tecnologias semelhantes para reconhecê-lo e melhorar a sua experiência ao navegar em nosso SaaS.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>1. O que são Cookies?</h3>
          <p>
            Cookies são pequenos arquivos de texto salvos em seu computador ou dispositivo móvel quando você visita um site. Eles nos permitem identificar sessões ativas, lembrar suas preferências de layout e entender o comportamento de navegação geral.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>2. Categorias de Cookies Utilizados</h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Cookies Necessários (Sempre Ativos):</strong> Essenciais para a segurança, login via Supabase Auth e navegação geral pelas páginas protegidas. Sem eles, o SaaS não pode operar.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Cookies de Preferências (Opcionais):</strong> Salvam escolhas que você faz na plataforma (como o idioma ou o layout preferido do mockup de celular no editor).</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Cookies Analíticos (Opcionais):</strong> Ajudam-nos a medir o tráfego do site e a frequência de uso das funcionalidades, ajudando na correção de bugs e otimizações de performance.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Cookies de Marketing (Opcionais):</strong> Podem ser utilizados para rastrear anúncios e interações com campanhas publicitárias.</li>
          </ul>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>3. Como Gerenciar Seus Consentimentos</h3>
          <p>
            Ao acessar o ViralFrame Studio pela primeira vez, exibimos um banner solicitando suas preferências de cookies. Você pode alterar essas escolhas a qualquer momento clicando no link <strong style={{ color: 'var(--text-primary)' }}>"Preferências de Cookies"</strong> no rodapé da página ou através da central de Privacidade no seu painel.
          </p>
          <p>
            Desabilitar cookies de preferências ou analíticos não impede o funcionamento básico da aplicação, mas limitará certas automações de conveniência que melhoram o fluxo de trabalho do editor.
          </p>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            Última atualização: 30 de Junho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
