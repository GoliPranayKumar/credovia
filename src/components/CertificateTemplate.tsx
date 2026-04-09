"use client";

import { ShieldCheck, Award, Calendar } from "lucide-react";

interface CertificateProps {
  name: string;
  score: number;
  date: string;
  certificateId: string;
  breakdown: { crypto: number; github: number; identity: number; domain: number; leetcode: number };
}

export function CertificateTemplate({ name, score, date, certificateId, breakdown }: CertificateProps) {
  const getSafeBadgeStyles = (s: number) => {
    if (s >= 80) return { bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff', border: 'rgba(255, 255, 255, 0.2)', label: 'Highly Credible' };
    if (s >= 60) return { bg: 'rgba(200, 200, 200, 0.1)', text: '#cccccc', border: 'rgba(255, 255, 255, 0.2)', label: 'Trusted' };
    if (s >= 40) return { bg: 'rgba(150, 150, 150, 0.1)', text: '#aaaaaa', border: 'rgba(255, 255, 255, 0.2)', label: 'Established' };
    return { bg: 'rgba(100, 100, 100, 0.1)', text: '#888888', border: 'rgba(255, 255, 255, 0.2)', label: 'Newcomer' };
  };

  const badge = getSafeBadgeStyles(score);

  const metrics = [
    { label: "On-Chain Protocol", value: breakdown.crypto, max: 40 },
    { label: "GitHub Open Source", value: breakdown.github, max: 25 },
    { label: "LeetCode Algorithms", value: breakdown.leetcode, max: 15 },
    { label: "Professional Identity", value: breakdown.identity, max: 10 },
    { label: "Domain Authority", value: breakdown.domain, max: 10 },
  ];

  return (
    <div 
      id="credovia-certificate"
      style={{ 
        width: '800px',
        height: '600px',
        position: 'relative',
        overflow: 'hidden',
        border: '16px solid #111111',
        backgroundColor: '#000000',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '50px 64px 40px 64px',
        textAlign: 'center',
        color: '#ffffff',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: '#ffffff', filter: 'blur(120px)', opacity: 0.05 }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: '#ffffff', filter: 'blur(120px)', opacity: 0.05 }} />
      
      {/* Border Pattern */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
      
      {/* Header */}
      <div style={{ zIndex: 10, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <img 
            src="/logo.png" 
            alt="Credovia Logo" 
            style={{ height: '65px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
          />
        </div>
        <div style={{ height: '1px', width: '120px', backgroundColor: '#333333', margin: '0 auto' }} />
      </div>

      {/* Content */}
      <div style={{ zIndex: 10, width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.4em', color: '#888888', marginBottom: '8px' }}>
              Certificate of Digital Reputation
          </h2>
          <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#ffffff', fontStyle: 'italic', margin: 0, letterSpacing: '-0.02em' }}>Proof of Credibility</h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <p style={{ color: '#aaaaaa', fontWeight: 500, fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>This formally verifies the algorithmic standing of</p>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            padding: '12px 40px', 
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            margin: '4px 0'
          }}>{name}</div>
        </div>

        {/* Breakdown Grid */}
        <div style={{ 
           width: '100%', 
           display: 'flex', 
           justifyContent: 'center', 
           gap: '16px', 
           flexWrap: 'wrap',
           marginTop: '12px'
        }}>
           {metrics.map((m, i) => (
             <div key={i} style={{ 
               padding: '12px 16px', 
               border: '1px solid rgba(255,255,255,0.1)', 
               borderRadius: '12px', 
               backgroundColor: '#0a0a0a',
               minWidth: '120px',
               textAlign: 'center'
             }}>
                <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', whiteSpace: 'nowrap' }}>
                  {m.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>{m.value}</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#555555' }}>/{m.max}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Score & Footer */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, marginTop: '20px' }}>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666666' }}>
            <Calendar style={{ width: '12px', height: '12px' }} />
            Issue Date
          </div>
          <p style={{ fontSize: '13px', margin: '4px 0 0', color: '#ffffff' }}>{date}</p>
        </div>

        <div style={{ transform: 'scale(1.15)', flexShrink: 0 }}>
          <div style={{ padding: '14px 20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a0a', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888888', marginBottom: '8px' }}>Verified Trust Rank</p>
              <div style={{ padding: '6px 14px', borderRadius: '9999px', border: `1px solid ${badge.border}`, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', backgroundColor: badge.bg, color: badge.text }}>
                <ShieldCheck style={{ width: '14px', height: '14px' }} />
                <span>{score} - {badge.label}</span>
              </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666666' }}>
            <Award style={{ width: '12px', height: '12px' }} />
            Verification ID
          </div>
          <p style={{ fontSize: '13px', margin: '4px 0 0', color: '#ffffff', opacity: 0.3 }}>{certificateId}</p>
        </div>
      </div>

      {/* Signature Watermark */}
      <img 
        src="/logo.png" 
        style={{ position: 'absolute', bottom: '48px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: 'auto', opacity: 0.05, zIndex: 1, filter: 'brightness(0) invert(1)' }} 
        alt="Watermark"
      />
    </div>




  );
}
