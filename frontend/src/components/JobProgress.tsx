import React from 'react';
import type { JobStatus } from '../lib/api';

interface JobProgressProps {
  job: JobStatus | null;
}

export const JobProgress: React.FC<JobProgressProps> = ({ job }) => {
  if (!job || job.status === 'completed' || job.status === 'failed') {
    return null;
  }

  const total = job.total || 1;
  const processed = job.processed || 0;
  const failed = job.failed || 0;
  const percent = Math.min(Math.round(((processed + failed) / total) * 100), 100);

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '24px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>Gerando Vídeos em Massa</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Status: <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{job.message}</span>
          </p>
        </div>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{percent}%</span>
      </div>
      
      {/* Barra de progresso */}
      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--accent-blue)', borderRadius: '5px' }}></div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span>Total: <strong>{total}</strong></span>
        <span>Sucessos: <strong style={{ color: '#10b981' }}>{processed}</strong></span>
        <span>Falhas: <strong style={{ color: '#ef4444' }}>{failed}</strong></span>
      </div>
    </div>
  );
};
