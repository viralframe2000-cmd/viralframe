import React from 'react';
import { Link } from 'react-router-dom';

export const Privacy: React.FC = () => {
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
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
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
            Política de Privacidade
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
            Esta política de privacidade descreve como o <strong style={{ color: 'var(--text-primary)' }}>ViralFrame Studio</strong> coleta, processa, utiliza e protege as informações e dados pessoais coletados de nossos usuários, em estrita conformidade com a <strong style={{ color: 'var(--text-primary)' }}>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/18)</strong>.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>1. Controlador dos Dados</h3>
          <p>
            O controlador dos dados tratados sob este serviço é a empresa <strong style={{ color: 'var(--text-primary)' }}>[RAZÃO SOCIAL DA EMPRESA]</strong>, inscrita no CNPJ sob o nº <strong style={{ color: 'var(--text-primary)' }}>[CNPJ DA EMPRESA]</strong>, com sede em <strong style={{ color: 'var(--text-primary)' }}>[ENDEREÇO DA SEDE]</strong>.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>2. Dados Coletados e Finalidades</h3>
          <p>
            Para possibilitar a entrega dos serviços e controle técnico de cotas do SaaS, tratamos os seguintes dados:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Dados Cadastrais:</strong> E-mail e senha, para autenticação, controle de acesso e segurança da conta.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Configurações do Perfil:</strong> Nome exibido no vídeo, handle da rede social e logotipo/avatar, para customizar o cabeçalho gerado pelo FFmpeg nos vídeos.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Vídeos Brutos e Textos:</strong> Arquivos MP4 originais subidos no Supabase Storage, frases POV e legendas na tabela, para realizar a renderização de vídeo automatizada.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Dados de Acesso:</strong> IP de conexão e consentimento de cookies, para controle de segurança e auditoria legal exigida pelo Marco Civil da Internet.</li>
          </ul>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>3. Compartilhamento com Terceiros</h3>
          <p>
            Para operacionalizar nossa infraestrutura SaaS na nuvem de forma ágil, compartilhamos informações com os seguintes provedores de serviço:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Supabase Inc:</strong> Banco de dados relacional PostgreSQL, Autenticação de Usuários e Storage Privado de mídias.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Vercel Inc:</strong> Hospedagem serverless e distribuição rápida da interface web do frontend.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Provedores de VPS (External Workers):</strong> Hospedagem do Docker com subprocesso FFmpeg onde ocorre o processamento temporário dos vídeos.</li>
          </ul>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>4. Direitos do Titular (LGPD)</h3>
          <p>
            De acordo com o Art. 18 da LGPD, os titulares de dados pessoais possuem direitos garantidos de:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Confirmar a existência de tratamento de dados.</li>
            <li>Acessar e exportar seus dados cadastrais e metadados de vídeos em formato legível.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a eliminação completa dos dados de sua conta e a exclusão permanente de todas as mídias subidas e geradas de nossos servidores de armazenamento.</li>
          </ul>
          <p>
            Você pode exercer esses direitos diretamente na central de configurações de <strong style={{ color: 'var(--text-primary)' }}>Privacidade</strong> no seu painel ou através do canal de contato abaixo.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>5. Segurança e Retenção</h3>
          <p>
            Adotamos políticas de criptografia, controle de acessos (RLS) no Supabase e conexões seguras HTTPS. Guardamos seus arquivos enquanto sua conta estiver ativa. Ao solicitar exclusão da conta, todos os registros e arquivos originais e finais associados ao seu ID de usuário são removidos definitivamente.
          </p>

          <h3 style={{ margin: '16px 0 4px 0', fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-primary)', color: 'var(--text-primary)' }}>6. Contato do Encarregado de Proteção de Dados (DPO)</h3>
          <p>
            Para dirimir dúvidas ou solicitações formais sobre seus dados, entre em contato com nosso Encarregado através do e-mail: <strong style={{ color: 'var(--text-primary)' }}>[EMAIL DE CONTATO DO ENCARREGADO/DPO]</strong>.
          </p>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            Última atualização: 30 de Junho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
