import React from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
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
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Termos de Uso</h1>
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            ← Voltar para o Login
          </Link>
        </div>

        <div style={{ lineHeight: '1.6', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            Bem-vindo ao <strong>ViralFrame Studio</strong>. Estes termos regem o uso da nossa plataforma de automação e edição em lote de vídeos curtos.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>1. Identificação da Empresa</h3>
          <p>
            O serviço é prestado pela empresa <strong>[RAZÃO SOCIAL DA EMPRESA]</strong>, inscrita no CNPJ sob o nº <strong>[CNPJ DA EMPRESA]</strong>, com sede em <strong>[ENDEREÇO DA SEDE]</strong>.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>2. Conta de Usuário</h3>
          <p>
            Para usufruir dos serviços de automação, upload de mídias e geração de projetos, o usuário deve se cadastrar via e-mail e senha. É de responsabilidade exclusiva do usuário guardar suas credenciais e impedir acessos não autorizados.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>3. Responsabilidade pelo Conteúdo</h3>
          <p>
            O usuário assume total responsabilidade legal e moral pelos vídeos brutos carregados no Supabase Storage e pelos textos (frases POV e legendas) vinculados à renderização. É terminantemente proibido o processamento de materiais com direitos autorais protegidos sem autorização, bem como conteúdos violentos, preconceituosos, difamatórios ou ilícitos.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>4. Limitações de Uso e Armazenamento</h3>
          <p>
            O plano gratuito possui cotas mensais de renderização e limites de espaço no Supabase Storage. Tentativas de fraude, engenharia reversa das APIs ou abuso dos recursos do servidor resultarão na suspensão imediata da conta do usuário.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>5. Disponibilidade e Isenção de Responsabilidade</h3>
          <p>
            A renderização com FFmpeg depende de processamento de hardware remoto. Embora nos esforcemos para manter o sistema ativo 24/7, o ViralFrame Studio não oferece garantias de tempo de resposta absoluto de filas (SLA) para contas gratuitas e não se responsabiliza por perdas financeiras resultantes de falhas de processamento ou exclusões de arquivos temporários.
          </p>

          <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: 600 }}>6. Foro aplicável</h3>
          <p>
            Qualquer litígio resultante destes Termos de Uso será regido pelas leis da República Federativa do Brasil, elegendo-se o foro da comarca de <strong>[CIDADE DA SEDE]</strong> para dirimir controvérsias.
          </p>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '20px' }}>
            Última atualização: 30 de Junho de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
