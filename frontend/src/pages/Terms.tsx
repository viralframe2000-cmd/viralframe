import React from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
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
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
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
            Termos de Uso
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
            Bem-vindo ao <strong style={{ color: 'var(--text-primary)' }}>ViralFrame Studio</strong>. Estes termos regem o uso da nossa plataforma de automação e edição em lote de vídeos curtos.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>1. Identificação da Empresa</h3>
          <p>
            O serviço é prestado pela empresa <strong style={{ color: 'var(--text-primary)' }}>[RAZÃO SOCIAL DA EMPRESA]</strong>, inscrita no CNPJ sob o nº <strong style={{ color: 'var(--text-primary)' }}>[CNPJ DA EMPRESA]</strong>, com sede em <strong style={{ color: 'var(--text-primary)' }}>[ENDEREÇO DA SEDE]</strong>.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>2. Conta de Usuário</h3>
          <p>
            Para usufruir dos serviços de automação, upload de mídias e geração de projetos, o usuário deve se cadastrar via e-mail e senha. É de responsabilidade exclusiva do usuário guardar suas credenciais e impedir acessos não autorizados.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>3. Responsabilidade pelo Conteúdo</h3>
          <p>
            O usuário assume total responsabilidade legal e moral pelos vídeos brutos carregados no Supabase Storage e pelos textos (frases POV e legendas) vinculados à renderização. É terminantemente proibido o processamento de materiais com direitos autorais protegidos sem autorização, bem como conteúdos violentos, preconceituosos, difamatórios ou ilícitos.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>4. Limitações de Uso e Armazenamento</h3>
          <p>
            O plano gratuito possui cotas mensais de renderização e limites de espaço no Supabase Storage. Tentativas de fraude, engenharia reversa das APIs ou abuso dos recursos do servidor resultarão na suspensão imediata da conta do usuário.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>5. Disponibilidade e Isenção de Responsabilidade</h3>
          <p>
            A renderização com FFmpeg depende de processamento de hardware remoto. Embora nos esforcemos para manter o sistema ativo 24/7, o ViralFrame Studio não oferece garantias de tempo de resposta absoluto de filas (SLA) para contas gratuitas e não se responsabiliza por perdas financeiras resultantes de falhas de processamento ou exclusões de arquivos temporários.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>6. Foro aplicável</h3>
          <p>
            Qualquer litígio resultante destes Termos de Uso será regido pelas leis da República Federativa do Brasil, elegendo-se o foro da comarca de <strong style={{ color: 'var(--text-primary)' }}>[CIDADE DA SEDE]</strong> para dirimir controvérsias.
          </p>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            Última atualização: 30 de Junho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
