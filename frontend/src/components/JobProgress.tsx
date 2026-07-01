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
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backdropFilter: 'var(--blur-sm)',
      WebkitBackdropFilter: 'var(--blur-sm)',
      animation: 'fadeIn 0.3s ease both'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-primary)' }}>
            Gerando Vídeos em Massa
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Status: <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{job.message}</span>
          </p>
        </div>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{percent}%</span>
      </div>
      
      {/* Barra de progresso */}
      <div style={{ 
        width: '100%', 
        height: '10px', 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: 'var(--radius-full)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          width: `${percent}%`, 
          height: '100%', 
          background: 'var(--gradient-cyan-blue)', 
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 0 10px rgba(34, 211, 238, 0.4)',
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}></div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong></span>
        <span>Sucessos: <strong style={{ color: '#4ade80' }}>{processed}</strong></span>
        <span>Falhas: <strong style={{ color: 'var(--color-error)' }}>{failed}</strong></span>
      </div>
    </div>
  );
};
