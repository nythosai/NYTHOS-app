import React from 'react';
import { useAppKit } from '@reown/appkit/react';
import ProofPage from './ProofPage';
import { useSeoHead } from '../hooks/useSeoHead';

export default function PublicProofShell() {
  useSeoHead({
    title: 'Live Proof Feed: Verified On-Chain Signals | NYTHOS',
    description: 'Every NYTHOS signal is verified after it fires. Browse the public proof feed to see verified hits, misses, and 24-hour accuracy across ETH, BTC, and Base.',
    canonical: 'https://www.nythos.io/proof',
    breadcrumb: [
      { name: 'NYTHOS', url: 'https://www.nythos.io/' },
      { name: 'Live Proof Feed', url: 'https://www.nythos.io/proof' },
    ],
  });
  const { open } = useAppKit();

  return (
    <div className="pps-shell">

      {/* ── Header ── */}
      <header className="pps-header">
        <a href="/" className="pps-logo-link">
          <span className="pps-logo">NYTHOS</span>
          <span className="pps-tag">$NYT</span>
        </a>

        <div className="pps-header-right">
          <span className="pps-live-label">LIVE PUBLIC PROOF</span>
          <button onClick={() => open()} className="pps-connect-btn">Connect Wallet</button>
        </div>
      </header>

      {/* ── Proof Page ── */}
      <ProofPage publicOnly />

      {/* ── CTA Footer ── */}
      <div className="pps-cta-footer">
        <p className="pps-beta-label">NYTHOS IS IN OPEN BETA</p>
        <p className="pps-cta-text">
          Connect your wallet to access the full signal feed, whale radar, watchlists, and Telegram alerts.
        </p>
        <button onClick={() => open()} className="pps-cta-btn">
          CONNECT WALLET TO EXPLORE BETA
        </button>
        <div className="pps-back-row">
          <a href="/" className="pps-back-link">← Back to home</a>
        </div>
        <p className="pps-footer-fineprint">
          NYTHOS · @NythosAI · $NYT · Pattern observation, not prediction.
        </p>
      </div>

    </div>
  );
}
