import React from 'react';
import './AboutPage.css';

export default function AboutPage({ onViewRoadmap }) {
  return (
    <div className="about-page">

      <div className="about-hero">
        <div className="about-symbol">
          <svg viewBox="0 0 200 200" width="80" height="80">
            <circle cx="100" cy="100" r="18" fill="#080b12" stroke="#6c63ff" strokeWidth="1.5" />
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i * 360) / 24;
              const rad = (angle * Math.PI) / 180;
              const inner = 26, outer = 48 + (i % 3 === 0 ? 14 : i % 2 === 0 ? 8 : 0);
              return (
                <g key={i}>
                  <line x1={100 + inner * Math.cos(rad)} y1={100 + inner * Math.sin(rad)} x2={100 + outer * Math.cos(rad)} y2={100 + outer * Math.sin(rad)} stroke="#6c63ff" strokeWidth="1" opacity="0.6" />
                  <circle cx={100 + (outer + 6) * Math.cos(rad)} cy={100 + (outer + 6) * Math.sin(rad)} r="2" fill="none" stroke="#6c63ff" strokeWidth="1" opacity="0.4" />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="about-title">What is NYTHOS?</div>
        <p className="about-sub">Base first onchain intelligence, built for real users before token hype.</p>
      </div>

      <div className="about-quote">
        <blockquote>
          NYTHOS turns noisy onchain data into usable signals. The job is simple:
          surface whale movements, score what matters, and give traders, builders,
          and communities a cleaner read on Base and the wider market.
        </blockquote>
        <cite>Product brief</cite>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-card-label">WHAT IT DOES</div>
          <p>NYTHOS watches large wallet activity, price momentum, watched wallets, and signal accuracy across multiple chains while positioning Base as the launch home for access and monetization.</p>
        </div>
        <div className="about-card">
          <div className="about-card-label">HOW IT WORKS</div>
          <p>The backend triggers on each new Base block using a WebSocket listener, scores events as they arrive, stores them in MongoDB, and delivers them through a frontend, Telegram workflow, and API. The contracts are written for Base and waiting on audit and deployment.</p>
        </div>
        <div className="about-card">
          <div className="about-card-label">WHO IT SERVES</div>
          <p>The first customers are not everyone in crypto. They are traders, Base communities, bot builders, and small teams that want wallet monitoring, signal feeds, and proof driven intelligence.</p>
        </div>
        <div className="about-card">
          <div className="about-card-label">WHY BASE</div>
          <p>This codebase is already lined up for Base. The wallet UX, contract setup, and product story fit a Base native launch much better than a chain switch or a rushed public sale.</p>
        </div>
      </div>

      <div className="about-stats">
        <div className="about-stat">
          <span className="about-stat-num">5</span>
          <span className="about-stat-label">Contracts written and tested</span>
        </div>
        <div className="about-stat">
          <span className="about-stat-num">108</span>
          <span className="about-stat-label">Passing contract tests</span>
        </div>
        <div className="about-stat">
          <span className="about-stat-num">$219k</span>
          <span className="about-stat-label">Presale hard cap</span>
        </div>
        <div className="about-stat">
          <span className="about-stat-num">27M</span>
          <span className="about-stat-label">NYT available for sale</span>
        </div>
      </div>

      <div className="about-differentiation">
        <div className="about-differentiation-title">Why not Nansen, Arkham, or Dune?</div>
        <p>
          Nansen, Arkham, and Dune are excellent but expensive, generalist tools built for institutional desks.
          Nansen starts at $150/month. Arkham is geared toward investigators. Dune requires SQL and interpretation skills most retail users don't have.
          NYTHOS is built Base-native from day one: lower cost of entry, opinionated signals that don't require a data analyst to read, and an access layer that is a token you hold rather than a monthly SaaS subscription you cancel.
          The moat is depth on Base specifically, plus a community that earns revenue share for holding rather than chasing a feature parity race against better-funded incumbents.
        </p>
      </div>

      {onViewRoadmap && (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button className="about-link" onClick={onViewRoadmap} style={{ cursor: 'pointer', background: 'transparent' }}>
            VIEW ROADMAP →
          </button>
        </div>
      )}

      <div className="about-links">
        <a href="https://t.me/NythosAI" className="about-link">
          TELEGRAM → @NythosAI
        </a>
        <a href="https://x.com/NythosAI" className="about-link">
          X → @NythosAI
        </a>
        <a href="mailto:hello@nythos.io" className="about-link">
          EMAIL → hello@nythos.io
        </a>
      </div>

    </div>
  );
}
