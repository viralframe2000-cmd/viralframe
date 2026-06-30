import React from 'react';
import { Link } from 'react-router-dom';

export const CookiesPolicy: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
      color: 'var(--text-primary)'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '40px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Política de Cookies</h1>
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            ← Voltar para o Login
          </Link>
        </div>

        <div style={{ lineHeight: '1.6', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            Esta política explica como o <strong>ViralFrame Studio</strong> utiliza cookies e tecnologias semelhantes para reconhecê-lo e melhorar a sua experiência ao navegar em nosso SaaS.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>1. O que são Cookies?</h3>
          <p>
            Cookies são pequenos arquivos de texto salvos em seu computador ou dispositivo móvel quando você visita um site. Eles nos permitem identificar sessões ativas, lembrar suas preferências de layout e entender o comportamento de navegação geral.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>2. Categorias de Cookies Utilizados</h3>
          <ul>
            <li><strong>Cookies Necessários (Sempre Ativos):</strong> Essenciais para a segurança, login via Supabase Auth e navegação geral pelas páginas protegidas. Sem eles, o SaaS não pode operar.</li>
            <li><strong>Cookies de Preferências (Opcionais):</strong> Salvam escolhas que você faz na plataforma (como o idioma ou o layout preferido do mockup de celular no editor).</li>
            <li><strong>Cookies Analíticos (Opcionais):</strong> Ajudam-nos a medir o tráfego do site e a frequência de uso das funcionalidades, ajudando na correção de bugs e otimizações de performance.</li>
            <li><strong>Cookies de Marketing (Opcionais):</strong> Podem ser utilizados para rastrear anúncios e interações com campanhas publicitárias.</li>
          </ul>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>3. Como Gerenciar Seus Consentimentos</h3>
          <p>
            Ao acessar o ViralFrame Studio pela primeira vez, exibimos um banner solicitando suas preferências de cookies. Você pode alterar essas escolhas a qualquer momento clicando no link <strong>"Preferências de Cookies"</strong> no rodapé da página ou através das configurações da sua conta logada.
          </p>
          <p>
            Desabilitar cookies de preferências ou analíticos não impede o funcionamento básico da aplicação, mas limitará certas automações de conveniência que melhoram o fluxo de trabalho do editor.
          </p>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '20px' }}>
            Última atualização: 30 de Junho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
