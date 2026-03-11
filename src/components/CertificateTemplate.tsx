"use client";

import { ShieldCheck, Award, Calendar } from "lucide-react";

interface CertificateProps {
  name: string;
  score: number;
  date: string;
  certificateId: string;
}

export function CertificateTemplate({ name, score, date, certificateId }: CertificateProps) {
  const getSafeBadgeStyles = (s: number) => {
    if (s >= 80) return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)', label: 'Highly Credible' };
    if (s >= 60) return { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)', label: 'Trusted' };
    if (s >= 40) return { bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.2)', label: 'Established' };
    return { bg: 'rgba(244, 63, 94, 0.1)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.2)', label: 'Newcomer' };
  };

  const badge = getSafeBadgeStyles(score);

  return (
    <div 
      id="credovia-certificate"
      style={{ 
        width: '800px',
        height: '600px',
        position: 'relative',
        overflow: 'hidden',
        border: '16px solid #2563eb',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '64px',
        textAlign: 'center',
        color: '#0f172a'
      }}
    >
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: '#93c5fd', filter: 'blur(100px)', opacity: 0.15 }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: '#2563eb', filter: 'blur(100px)', opacity: 0.15 }} />
      
      {/* Border Pattern */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid rgba(37,99,235,0.1)', pointerEvents: 'none' }} />
      
      {/* Header */}
      <div style={{ zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb' }}>
            <ShieldCheck style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <span style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.025em', color: '#0f172a' }}>
              Credo<span style={{ color: '#2563eb' }}>via</span>
          </span>
        </div>
        <div style={{ height: '1px', width: '96px', backgroundColor: '#2563eb', margin: '0 auto' }} />
      </div>

      {/* Content */}
      <div style={{ zIndex: 10 }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.4em', color: '#1e40af', marginBottom: '8px' }}>
              Certificate of Digital Reputation
          </h2>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', fontStyle: 'italic', margin: 0 }}>Proof of Credibility</h1>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <p style={{ color: '#1e40af', fontWeight: 500, fontSize: '14px', margin: 0 }}>This document formally verifies that</p>
          <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0f172a', borderBottom: '2px solid #dbeafe', paddingBottom: '8px', paddingLeft: '32px', paddingRight: '32px', margin: 0 }}>{name}</h3>
          <p style={{ color: '#1e40af', maxWidth: '450px', lineHeight: 1.6, fontSize: '14px', margin: 0 }}>
            has established a verified digital identity through our weighted evaluation model, 
            incorporating on-chain analysis and professional social proof.
          </p>
        </div>
      </div>

      {/* Score & Footer */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb' }}>
            <Calendar style={{ width: '12px', height: '12px' }} />
            Issue Date
          </div>
          <p style={{ fontSize: '14px', margin: '4px 0 0', color: '#0f172a' }}>{date}</p>
        </div>

        <div style={{ transform: 'scale(1.25)' }}>
          <div style={{ padding: '16px', borderRadius: '24px', border: '1px solid rgba(37,99,235,0.1)', backgroundColor: 'white', boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e40af', marginBottom: '8px' }}>Verified Trust Rank</p>
              <div style={{ padding: '8px 16px', borderRadius: '9999px', border: `1px solid ${badge.border}`, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', backgroundColor: badge.bg, color: badge.text }}>
                <ShieldCheck style={{ width: '16px', height: '16px' }} />
                <span>{score} - {badge.label}</span>
              </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb' }}>
            <Award style={{ width: '12px', height: '12px' }} />
            Verification ID
          </div>
          <p style={{ fontSize: '14px', margin: '4px 0 0', color: '#0f172a', opacity: 0.5 }}>{certificateId}</p>
        </div>
      </div>

      {/* Signature Watermark */}
      <ShieldCheck style={{ position: 'absolute', bottom: '48px', left: '50%', transform: 'translateX(-50%)', width: '192px', height: '192px', color: '#2563eb', opacity: 0.04, zIndex: 1 }} />
    </div>




  );
}
