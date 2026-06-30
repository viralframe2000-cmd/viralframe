import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const PrivacyCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExportData = async () => {
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      const { error } = await supabase.from('data_requests').insert({
        user_id: user.id,
        type: 'export',
        status: 'pending',
        notes: 'Solicitado via painel do usuário'
      });

      if (error) throw error;
      setMsg('✅ Solicitação de exportação de dados recebida! Você receberá os arquivos por e-mail em até 48 horas.');
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar exportação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm1 = confirm('ATENÇÃO: Deseja realmente excluir permanentemente sua conta do ViralFrame Studio e apagar todos os seus vídeos e arquivos?');
    if (!confirm1) return;

    const confirm2 = confirm('Essa ação é irreversível. Todos os seus dados serão excluídos do sistema imediatamente. Confirmar exclusão definitiva?');
    if (!confirm2) return;

    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      // Registra a solicitação de exclusão
      const { error: reqError } = await supabase.from('data_requests').insert({
        user_id: user.id,
        type: 'delete',
        status: 'pending',
        notes: 'Solicitado via painel do usuário'
      });

      if (reqError) throw reqError;

      // Executa logout e redireciona
      await supabase.auth.signOut();
      alert('Sua conta foi programada para exclusão e você foi deslogado. Obrigado por utilizar o ViralFrame Studio.');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar exclusão.');
      setLoading(false);
    }
  };

  const handleReopenCookies = () => {
    localStorage.removeItem('vf_cookie_consent');
    window.location.reload();
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🛡️</span> Privacidade e LGPD
        </h4>
        <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          Gerencie a privacidade de seus dados pessoais e preferências.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={handleExportData}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '10px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📥 Exportar meus dados pessoais
        </button>

        <button
          onClick={handleReopenCookies}
          style={{
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '10px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🍪 Preferências de Cookies
        </button>

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#ef4444',
            padding: '10px',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ⚠️ Solicitar exclusão da conta (LGPD)
        </button>
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
        Políticas ativas: <a href="/termos" target="_blank" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Termos 1.0</a> | <a href="/privacidade" target="_blank" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Privacidade 1.0</a>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '11px', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', border: '1px solid #fca5a5' }}>
          ⚠️ {error}
        </div>
      )}
      {msg && (
        <div style={{ color: '#059669', fontSize: '11px', backgroundColor: '#ecfdf5', padding: '8px 12px', borderRadius: 'var(--border-radius-md)', border: '1px solid #a7f3d0' }}>
          {msg}
        </div>
      )}
    </div>
  );
};
