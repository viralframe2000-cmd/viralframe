import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: 'var(--font-secondary)',
      color: 'var(--text-primary)',
      overflowX: 'hidden',
    }}>

      {/* ── AMBIENT BLOBS ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          animation: 'blobFloat1 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '-15%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          animation: 'blobFloat2 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '20%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
          animation: 'blobFloat1 26s ease-in-out infinite reverse',
        }} />
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(5, 8, 22, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--gradient-cyan-blue)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-primary)',
            fontWeight: 700, fontSize: '18px', color: 'white',
            boxShadow: 'var(--shadow-glow-blue)',
          }}>V</div>
          <span style={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 700, fontSize: '17px', letterSpacing: '-0.5px',
          }}>ViralFrame<span style={{ color: 'var(--accent-cyan)' }}> Studio</span></span>
        </div>

        {/* Nav links — oculto em mobile */}
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#recursos" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            Recursos
          </a>
          <a href="#como-funciona" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            Como funciona
          </a>
        </nav>

        {/* Auth buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/login" style={{
            color: 'var(--text-secondary)',
            fontSize: '14px', fontWeight: 500,
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            textDecoration: 'none',
            background: 'transparent',
            transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}>
            Entrar
          </Link>
          <Link to="/cadastro" style={{
            background: 'var(--gradient-cyan-blue)',
            color: 'white',
            fontSize: '14px', fontWeight: 600,
            padding: '8px 18px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 0 16px rgba(59,130,246,0.3)',
            transition: 'opacity 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Começar grátis →
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)',
          marginBottom: '32px',
          animation: 'fadeIn 0.6s ease both',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', animation: 'pulseGlow 2s ease-in-out infinite' }} />
          Novo: Renderização em lote com FFmpeg Worker
        </div>

        {/* Título principal */}
        <h1 style={{
          fontFamily: 'var(--font-primary)',
          fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-2px',
          maxWidth: '820px',
          margin: '0 0 24px 0',
          animation: 'fadeInUp 0.7s ease 0.1s both',
        }}>
          Crie vídeos virais em massa{' '}
          <span style={{
            background: 'var(--gradient-cyan-blue)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 4s ease infinite',
          }}>
            com IA, frases POV
          </span>{' '}
          e renderização automática
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          lineHeight: 1.6,
          margin: '0 0 40px 0',
          animation: 'fadeInUp 0.7s ease 0.2s both',
        }}>
          Automatize Reels, TikToks e Shorts com banco de frases inteligente,
          preview em tempo real e renderização profissional com FFmpeg.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.7s ease 0.3s both',
        }}>
          <Link to="/cadastro" style={{
            background: 'var(--gradient-cyan-blue)',
            color: 'white', fontWeight: 700, fontSize: '16px',
            padding: '14px 32px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 0 24px rgba(59,130,246,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(59,130,246,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.4)'; }}>
            ⚡ Começar Grátis
          </Link>
          <Link to="/login" style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text-primary)', fontWeight: 600, fontSize: '16px',
            padding: '14px 28px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
            Fazer login
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '40px', marginTop: '64px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.7s ease 0.4s both',
        }}>
          {[
            { num: '10x', label: 'Mais rápido que edição manual' },
            { num: '∞', label: 'Vídeos em lote' },
            { num: '100%', label: 'Renderização na nuvem' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '2rem', fontWeight: 800,
                background: 'var(--gradient-cyan-blue)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{stat.num}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Hero mockup card */}
        <div style={{
          marginTop: '72px',
          width: '100%', maxWidth: '860px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '32px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'fadeInUp 0.8s ease 0.5s both',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Terminal/Editor mockup */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
              <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
            <div style={{
              flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)',
              borderRadius: '6px', marginLeft: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: 'var(--text-muted)',
            }}>viralframe.studio/dashboard</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { icon: '🎬', label: 'Vídeo carregado', val: 'reel_001.mp4', color: '#22d3ee' },
              { icon: '✏️', label: 'Frase POV', val: '"POV: você finalmente tomou a decisão..."', color: '#8b5cf6' },
              { icon: '🚀', label: 'Status', val: 'Renderizando... 78%', color: '#22c55e' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section id="recursos" style={{
        position: 'relative', zIndex: 1,
        padding: '100px 24px',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 'var(--radius-full)', padding: '6px 16px',
            fontSize: '13px', fontWeight: 600, color: 'var(--accent-purple)',
            marginBottom: '20px',
          }}>
            ✦ Recursos Principais
          </div>
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 800, letterSpacing: '-1.5px',
            margin: '0 0 16px 0',
          }}>
            Tudo que você precisa para{' '}
            <span style={{
              background: 'var(--gradient-blue-purple)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>criar em escala</span>
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Uma plataforma completa para transformar vídeos brutos em conteúdo viral pronto para postar.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {[
            {
              icon: '📚', color: 'var(--accent-cyan)', glow: 'rgba(34,211,238,0.15)',
              title: 'Banco de Frases Automático',
              desc: 'Importe centenas de frases POV e legendas. O sistema distribui automaticamente para cada vídeo.',
            },
            {
              icon: '👁️', color: 'var(--accent-blue)', glow: 'rgba(59,130,246,0.15)',
              title: 'Preview em Tempo Real',
              desc: 'Veja exatamente como seu Reel vai ficar antes de renderizar. Ajuste frases, perfil e layout.',
            },
            {
              icon: '⚡', color: 'var(--accent-purple)', glow: 'rgba(139,92,246,0.15)',
              title: 'Renderização com FFmpeg',
              desc: 'Worker dedicado com FFmpeg processa todos os vídeos em paralelo. Renderização profissional e rápida.',
            },
            {
              icon: '📦', color: 'var(--accent-pink)', glow: 'rgba(236,72,153,0.15)',
              title: 'Exportação em Lote',
              desc: 'Baixe todos os vídeos finalizados de uma vez, com legendas e miniaturas incluídas.',
            },
            {
              icon: '📱', color: '#22c55e', glow: 'rgba(34,197,94,0.15)',
              title: 'Pronto para Reels/TikTok/Shorts',
              desc: 'Layout 9:16 otimizado para as principais plataformas de vídeo curto.',
            },
            {
              icon: '🔒', color: '#f59e0b', glow: 'rgba(245,158,11,0.15)',
              title: 'Seguro com Supabase Auth',
              desc: 'Autenticação segura, armazenamento privado e conformidade com LGPD.',
            },
          ].map(feat => (
            <div key={feat.title}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px',
                cursor: 'default',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.06)';
                el.style.borderColor = 'rgba(255,255,255,0.12)';
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.borderColor = 'rgba(255,255,255,0.07)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}>
              <div style={{
                width: '48px', height: '48px',
                background: feat.glow,
                border: `1px solid ${feat.color}30`,
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', marginBottom: '18px',
              }}>{feat.icon}</div>
              <h3 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '17px', fontWeight: 700,
                margin: '0 0 10px 0', color: 'var(--text-primary)',
                letterSpacing: '-0.3px',
              }}>{feat.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{
        position: 'relative', zIndex: 1,
        padding: '100px 24px',
        background: 'linear-gradient(to bottom, transparent, rgba(59,130,246,0.03), transparent)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)',
              borderRadius: 'var(--radius-full)', padding: '6px 16px',
              fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)',
              marginBottom: '20px',
            }}>
              ◉ Como funciona
            </div>
            <h2 style={{
              fontFamily: 'var(--font-primary)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 800, letterSpacing: '-1.5px',
              margin: '0 0 16px 0',
            }}>
              Do vídeo bruto ao{' '}
              <span style={{
                background: 'var(--gradient-cyan-blue)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Reel pronto</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              {
                num: '01', color: 'var(--accent-cyan)',
                title: 'Envie seus vídeos',
                desc: 'Faça upload de múltiplos vídeos brutos de uma vez. O sistema organiza automaticamente na fila de edição.',
                detail: 'Suporte a MP4, MOV e WebM. Upload múltiplo com barra de progresso em tempo real.',
              },
              {
                num: '02', color: 'var(--accent-purple)',
                title: 'Aplique frases e legendas',
                desc: 'Importe seu banco de frases POV ou preencha manualmente. O preview mostra como ficará no Reel.',
                detail: 'Banco de frases automático, preenchimento aleatório inteligente, edição individual por vídeo.',
              },
              {
                num: '03', color: 'var(--accent-pink)',
                title: 'Gere tudo em massa',
                desc: 'Com um clique, o worker FFmpeg processa todos os vídeos simultaneamente. Download em lote quando pronto.',
                detail: 'Barra de progresso ao vivo, status por vídeo, download com legendas e miniaturas.',
              },
            ].map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '56px', height: '56px',
                    background: `${step.color}15`,
                    border: `2px solid ${step.color}40`,
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-primary)',
                    fontWeight: 800, fontSize: '18px', color: step.color,
                  }}>{step.num}</div>
                  {i < 2 && <div style={{ width: '2px', height: '48px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)', margin: '8px 0' }} />}
                </div>
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px 28px',
                  marginBottom: '4px',
                  transition: 'all 0.3s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
                  <h3 style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '20px', fontWeight: 700,
                    margin: '0 0 8px 0', color: 'var(--text-primary)',
                    letterSpacing: '-0.3px',
                  }}>{step.title}</h3>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                  <p style={{
                    fontSize: '13px', color: 'var(--text-muted)',
                    margin: 0, lineHeight: 1.5,
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '120px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '640px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '32px',
          padding: '64px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '200px', height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{
            fontFamily: 'var(--font-primary)',
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            fontWeight: 800, letterSpacing: '-1.5px',
            margin: '0 0 16px 0',
          }}>
            Pronto para escalar sua produção?
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', margin: '0 0 36px 0', lineHeight: 1.6 }}>
            Comece gratuitamente. Sem cartão de crédito necessário.
          </p>
          <Link to="/cadastro" style={{
            background: 'var(--gradient-cyan-blue)',
            color: 'white', fontWeight: 700, fontSize: '17px',
            padding: '16px 40px', borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 0 32px rgba(59,130,246,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(59,130,246,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(59,130,246,0.4)'; }}>
            ⚡ Criar conta gratuita
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid var(--border-color)',
        padding: '40px 40px',
        display: 'flex', flexWrap: 'wrap', gap: '24px',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--gradient-cyan-blue)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-primary)',
            fontWeight: 700, fontSize: '14px', color: 'white',
          }}>V</div>
          <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '14px' }}>
            ViralFrame Studio
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { to: '/termos', label: 'Termos de Uso' },
            { to: '/privacidade', label: 'Privacidade' },
            { to: '/cookies', label: 'Cookies' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{
              color: 'var(--text-muted)', fontSize: '13px',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              {link.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};
