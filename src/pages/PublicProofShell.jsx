import React from 'react';
import { useAppKit } from '@reown/appkit/react';
import ProofPage from './ProofPage';

export default function PublicProofShell() {
  const { open } = useAppKit();

  return (
    <div style={{ background: '#080b12', minHeight: '100vh', color: '#e8e6f0' }}>

      {/* ── Header ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: '1px solid rgba(108,99,255,0.15)',
        position: 'sticky',
        top: 0,
        background: '#080b12',
        zIndex: 100,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 4, color: '#e8e6f0' }}>NYTHOS</span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 2,
            color: '#6c63ff',
            border: '1px solid rgba(108,99,255,0.4)',
            padding: '2px 7px',
            borderRadius: 3,
          }}>$NYT</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'rgba(232,230,240,0.45)', letterSpacing: 1 }}>
            LIVE PUBLIC PROOF
          </span>
          <button
            onClick={() => open()}
            style={{
              background: '#6c63ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 1,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Connect Wallet
          </button>
        </div>
      </header>

      {/* ── Proof Page ── */}
      <ProofPage publicOnly />

      {/* ── CTA Footer ── */}
      <div style={{
        borderTop: '1px solid rgba(108,99,255,0.15)',
        padding: '36px 28px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'rgba(232,230,240,0.55)', marginBottom: 8, letterSpacing: 1 }}>
          NYTHOS IS IN OPEN BETA
        </p>
        <p style={{ fontSize: 15, color: '#e8e6f0', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          Connect your wallet to access the full signal feed, whale radar, watchlists, and Telegram alerts.
        </p>
        <button
          onClick={() => open()}
          style={{
            background: '#6c63ff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 28px',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 2,
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginBottom: 12,
          }}
        >
          CONNECT WALLET TO EXPLORE BETA
        </button>
        <div style={{ marginTop: 10 }}>
          <a href="/" style={{ fontSize: 11, color: 'rgba(108,99,255,0.7)', textDecoration: 'none', letterSpacing: 1 }}>
            ← Back to home
          </a>
        </div>
        <p style={{ fontSize: 10, color: 'rgba(232,230,240,0.25)', marginTop: 28, letterSpacing: 1 }}>
          NYTHOS · @NythosAI · $NYT · Pattern observation, not prediction.
        </p>
      </div>

    </div>
  );
}
