import React from 'react';
import { Link } from 'react-router-dom';

export const Privacy: React.FC = () => {
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
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Política de Privacidade</h1>
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            ← Voltar para o Login
          </Link>
        </div>

        <div style={{ lineHeight: '1.6', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            Esta política de privacidade descreve como o <strong>ViralFrame Studio</strong> coleta, processa, utiliza e protege as informações e dados pessoais coletados de nossos usuários, em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/18)</strong>.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>1. Controlador dos Dados</h3>
          <p>
            O controlador dos dados tratados sob este serviço é a empresa <strong>[RAZÃO SOCIAL DA EMPRESA]</strong>, inscrita no CNPJ sob o nº <strong>[CNPJ DA EMPRESA]</strong>, com sede em <strong>[ENDEREÇO DA SEDE]</strong>.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>2. Dados Coletados e Finalidades</h3>
          <p>
            Para possibilitar a entrega dos serviços e controle técnico de cotas do SaaS, tratamos os seguintes dados:
          </p>
          <ul>
            <li><strong>Dados Cadastrais:</strong> E-mail e senha, para autenticação, controle de acesso e segurança da conta.</li>
            <li><strong>Configurações do Perfil:</strong> Nome exibido no vídeo, handle da rede social e logotipo/avatar, para customizar o cabeçalho gerado pelo FFmpeg nos vídeos.</li>
            <li><strong>Vídeos Brutos e Textos:</strong> Arquivos MP4 originais subidos no Supabase Storage, frases POV e legendas na tabela, para realizar a renderização de vídeo automatizada.</li>
            <li><strong>Dados de Acesso:</strong> IP de conexão e consentimento de cookies, para controle de segurança e auditoria legal exigida pelo Marco Civil da Internet.</li>
          </ul>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>3. Compartilhamento com Terceiros</h3>
          <p>
            Para operacionalizar nossa infraestrutura SaaS na nuvem de forma ágil, compartilhamos informações com os seguintes provedores de serviço:
          </p>
          <ul>
            <li><strong>Supabase Inc:</strong> Banco de dados relacional PostgreSQL, Autenticação de Usuários e Storage Privado de mídias.</li>
            <li><strong>Vercel Inc:</strong> Hospedagem serverless e distribuição rápida da interface web do frontend.</li>
            <li><strong>Provedores de VPS (External Workers):</strong> Hospedagem do Docker com subprocesso FFmpeg onde ocorre o processamento temporário dos vídeos.</li>
          </ul>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>4. Direitos do Titular (LGPD)</h3>
          <p>
            De acordo com o Art. 18 da LGPD, os titulares de dados pessoais possuem direitos garantidos de:
          </p>
          <ul>
            <li>Confirmar a existência de tratamento de dados.</li>
            <li>Acessar e exportar seus dados cadastrais e metadados de vídeos em formato legível.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a eliminação completa dos dados de sua conta e a exclusão permanente de todas as mídias subidas e geradas de nossos servidores de armazenamento.</li>
          </ul>
          <p>
            Você pode exercer esses direitos diretamente na central de configurações de <strong>Privacidade</strong> no seu painel ou através do canal de contato abaixo.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>5. Segurança e Retenção</h3>
          <p>
            Adotamos políticas de criptografia, controle de acessos (RLS) no Supabase e conexões seguras HTTPS. Guardamos seus arquivos enquanto sua conta estiver ativa. Ao solicitar exclusão da conta, todos os registros e arquivos originais e finais associados ao seu ID de usuário são removidos definitivamente.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>6. Contato do Encarregado de Proteção de Dados (DPO)</h3>
          <p>
            Para dirimir dúvidas ou solicitações formais sobre seus dados, entre em contato com nosso Encarregado através do e-mail: <strong>[EMAIL DE CONTATO DO ENCARREGADO/DPO]</strong>.
          </p>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '20px' }}>
            Última atualização: 30 de Junho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
