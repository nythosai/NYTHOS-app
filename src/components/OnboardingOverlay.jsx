import { useState } from 'react';
import './OnboardingOverlay.css';

const STORAGE_KEY = 'nythos_onboarded';

const steps = [
  {
    num: '01',
    title: 'Live Signal Feed',
    body: 'NYTHOS watches whale wallets, Base swaps, bridge flows, and price momentum across ETH, BTC, SOL, and Base — 24/7. Every signal is scored by confidence level so you know what to act on.',
    cta: 'Next',
  },
  {
    num: '02',
    title: 'Wallet Intelligence',
    body: 'Connect your wallet to unlock your personal score, watchlist, and custom alerts. The platform detects which tokens you hold and surfaces signals relevant to your portfolio.',
    cta: 'Next',
  },
  {
    num: '03',
    title: 'Beta Mode — Everything Is Open',
    body: 'NYTHOS is in open beta. Contracts are not yet deployed, so all features are unlocked for every connected wallet. Join the founder list to lock in your pilot rate when token-gating goes live on Base.',
    cta: 'Enter NYTHOS',
  },
];

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !window.localStorage.getItem(STORAGE_KEY);
  });
  const [step, setStep]       = useState(0);

  function advance() {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      window.localStorage.setItem(STORAGE_KEY, '1');
      setVisible(false);
    }
  }

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  const current = steps[step];
  const isLast  = step === steps.length - 1;

  return (
    <div className="ob-backdrop" onClick={e => e.target === e.currentTarget && dismiss()}>
      <div className="ob-modal" role="dialog" aria-modal="true" aria-label="Welcome to NYTHOS">

        <button className="ob-skip" onClick={dismiss}>Skip</button>

        <div className="ob-step-num">{current.num} / {steps.length}</div>

        <div className="ob-progress">
          {steps.map((_, i) => (
            <div key={i} className={`ob-pip ${i <= step ? 'active' : ''}`} />
          ))}
        </div>

        <div className="ob-symbol">
          <svg viewBox="0 0 120 120" width="56" height="56">
            <circle cx="60" cy="60" r="12" fill="#080b12" stroke="#6c63ff" strokeWidth="1.5" />
            {Array.from({ length: 16 }, (_, i) => {
              const angle = (i * 360) / 16;
              const rad   = (angle * Math.PI) / 180;
              const inner = 18, outer = 32 + (i % 4 === 0 ? 10 : i % 2 === 0 ? 5 : 0);
              return (
                <line
                  key={i}
                  x1={60 + inner * Math.cos(rad)} y1={60 + inner * Math.sin(rad)}
                  x2={60 + outer * Math.cos(rad)} y2={60 + outer * Math.sin(rad)}
                  stroke="#6c63ff" strokeWidth="1" opacity="0.5"
                />
              );
            })}
          </svg>
        </div>

        <h2 className="ob-title">{current.title}</h2>
        <p className="ob-body">{current.body}</p>

        <button className={`ob-cta ${isLast ? 'ob-cta-final' : ''}`} onClick={advance}>
          {current.cta} →
        </button>

      </div>
    </div>
  );
}
