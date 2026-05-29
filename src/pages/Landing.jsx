import React, { useEffect, useState } from 'react';
import api from '../api';
import { useSeoHead } from '../hooks/useSeoHead';
import './Landing.css';

const STATIC_SIGNALS = [
  { id: 's1', token: 'ETH', description: 'Large wallet accumulation detected. 3 addresses added 820 ETH in a 4h window.', valueUSD: 2_900_000, timestamp: Math.floor(Date.now() / 1000) - 420 },
  { id: 's2', token: 'BASE', description: 'Smart money cluster moved into Base DeFi. 12 coordinated entries within 90min.', valueUSD: 1_400_000, timestamp: Math.floor(Date.now() / 1000) - 1080 },
  { id: 's3', token: 'BTC', description: 'Dormant wallet (4yr) sent 6.2 BTC to new address before price spike.', valueUSD: 520_000, timestamp: Math.floor(Date.now() / 1000) - 2700 },
];

const CHAIN_COLORS = { ETH: '#a89cff', BTC: '#f7931a', BASE: '#4d88ff' };

function LiveSignalPreview() {
  const [signals, setSignals] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    api.get('/api/signals?limit=10')
      .then(r => {
        const high = (r.data.signals || []).filter(s => s.confidence === 'HIGH').slice(0, 3);
        setSignals(high.length >= 2 ? high : null);
      })
      .catch(() => setSignals(null));

    api.get('/api/accuracy/stats')
      .then(r => setAccuracy(r.data))
      .catch(() => {});
  }, []);

  const displaySignals = signals ?? STATIC_SIGNALS;
  const isLive = signals !== null;
  const rate = accuracy?.overall?.rate24h;
  const total = accuracy?.overall?.total24h;

  return (
    <section className="live-proof">
      <div className="live-proof-inner">
        <div className="live-proof-header">
          <div className="live-header-left">
            <span className="live-dot" />
            <span className="live-label">{isLive ? 'LIVE SIGNALS' : 'SIGNAL PREVIEW'}</span>
          </div>
          <span className="live-accuracy">
            {isLive && rate !== null && rate !== undefined && total >= 3
              ? `${rate}% accuracy · ${total} signals tracked`
              : 'Example feed. Launch the app for live access.'}
          </span>
        </div>
        <div className="live-signals-grid">
          {displaySignals.map(s => (
            <div key={s.id} className="live-signal-card" style={{ '--chain-color': CHAIN_COLORS[s.token] || '#6c63ff' }}>
              <div className="lsc-glow" />
              <div className="lsc-top">
                <span className="lsc-chain">{s.token}</span>
                <span className="lsc-conf high">HIGH</span>
                <span className="lsc-time">{formatAge(s.timestamp)}</span>
              </div>
              <div className="lsc-desc">{s.description}</div>
              {s.valueUSD && (
                <div className="lsc-value">${(s.valueUSD / 1e6).toFixed(1)}M moved</div>
              )}
            </div>
          ))}
        </div>
        <p className="live-proof-note">
          {isLive ? 'Real-time signal feed. Updated continuously.' : 'Launch the app to unlock the full live signal feed.'}
        </p>
      </div>
    </section>
  );
}

function formatAge(ts) {
  const diff = Math.floor((Date.now() - ts * 1000) / 60000);
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

const FLAGSHIP_FEATURE = {
  eyebrow: 'The engine',
  title: 'AI-scored signals, ranked before they become noise',
  body: 'Every whale movement, DEX cluster, and dormant-wallet wake is scored HIGH, MED, or LOW by Claude, using cluster size, timing patterns, and historical follow-through. The signals that matter rise; the rest fade.',
  bullets: [
    'Cluster detection across 6 billion on-chain events',
    'Outcome verification 24h after every signal fires',
    'Confidence rated against historical accuracy',
  ],
};

const SUPPORTING_FEATURES = [
  { label: 'Multi-chain coverage', detail: 'ETH · BTC · Base in one feed.' },
  { label: 'Wallet scoring',       detail: 'Score any address by historical accuracy.' },
  { label: '30-day history',       detail: 'Full lookback on every signal.' },
  { label: 'REST API & webhooks',  detail: 'Pipe signals into your own stack.' },
];

export default function Landing() {
  useSeoHead({
    title: 'NYTHOS: Real-Time Whale Signals & On-Chain Intelligence for ETH, BTC, Base',
    description: 'NYTHOS tracks whale wallets across Ethereum, Bitcoin, and Base in real time. AI-scored HIGH/MED/LOW confidence signals, 24h outcome verification, free open beta.',
    canonical: 'https://www.nythos.io/',
  });

  return (
    <div className="landing">

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-header-left">
          <span className="logo">NYTHOS</span>
          <span className="tag">$NYT</span>
        </div>
        <nav className="landing-header-right">
          <a className="header-nav-link" href="#features-anchor">Features</a>
          <a className="header-nav-link" href="#whitelist-anchor">Presale</a>
          <a className="header-nav-link" href="/proof">Live Feed</a>
          <a className="header-connect-btn" href="/dashboard">Launch App</a>
        </nav>
      </header>

      <main className="landing-main" id="main">

        {/* ── Hero ── */}
        <section className="hero-section">
          <div className="hero-bg-grid" aria-hidden="true" />
          <div className="hero-glow-orb hero-glow-1" aria-hidden="true" />
          <div className="hero-glow-orb hero-glow-2" aria-hidden="true" />

          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Base-native onchain intelligence · Open beta · No token required
          </div>

          <h1 className="landing-title">
            <span className="title-line">Track Smart Money.</span>
            <span className="title-line title-accent">Before It Moves.</span>
          </h1>

          <p className="landing-sub">
            NYTHOS monitors ETH, BTC, and Base for large-wallet activity, scores each signal by confidence, and delivers a live feed you can act on. Right now. No token needed.
          </p>

          <div className="hero-cta-row">
            <a className="connect-btn-main" href="/dashboard">Launch App →</a>
            <div className="hero-cta-secondary">
              <a className="hero-link" href="#whitelist-anchor">Join founder list →</a>
              <a className="hero-link" href="/proof">See live proof feed →</a>
            </div>
          </div>

          <p className="landing-hint">
            Connect inside the app: Coinbase Wallet, MetaMask, Rainbow, or any WalletConnect wallet.
          </p>
        </section>

        {/* ── Live Signal Proof ── */}
        <LiveSignalPreview />

        {/* ── Features ── */}
        <section className="features-section" id="features-anchor">
          <div className="section-label">WHAT YOU GET</div>
          <h2 className="section-title">Everything you need to front-run smart money</h2>
          <p className="section-sub">No noise. No dashboard bloat. Just the signals that matter, scored and delivered.</p>

          <article className="flagship-feature">
            <div className="flagship-feature-eyebrow">{FLAGSHIP_FEATURE.eyebrow}</div>
            <h3 className="flagship-feature-title">{FLAGSHIP_FEATURE.title}</h3>
            <p className="flagship-feature-body">{FLAGSHIP_FEATURE.body}</p>
            <ul className="flagship-feature-bullets">
              {FLAGSHIP_FEATURE.bullets.map(b => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>

          <ul className="supporting-features">
            {SUPPORTING_FEATURES.map(f => (
              <li key={f.label} className="supporting-feature">
                <span className="supporting-feature-label">{f.label}</span>
                <span className="supporting-feature-detail">{f.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── How It Works ── */}
        <section className="how-section">
          <div className="section-label">HOW IT WORKS</div>
          <h2 className="section-title">Three steps. Zero friction.</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-num" aria-hidden="true">01</div>
              <div className="how-step-content">
                <div className="how-step-title">Connect your wallet</div>
                <div className="how-step-desc">Your wallet is your login. No email, no password. Coinbase Wallet, MetaMask, Rainbow, or any WalletConnect wallet on mobile.</div>
              </div>
            </div>
            <div className="how-step-connector" aria-hidden="true" />
            <div className="how-step">
              <div className="how-step-num" aria-hidden="true">02</div>
              <div className="how-step-content">
                <div className="how-step-title">Explore the beta</div>
                <div className="how-step-desc">Live signals, wallet scoring, history, alerts, and API. The full product runs now. Test it before you ever spend a token.</div>
              </div>
            </div>
            <div className="how-step-connector" aria-hidden="true" />
            <div className="how-step">
              <div className="how-step-num" aria-hidden="true">03</div>
              <div className="how-step-content">
                <div className="how-step-title">Join the presale when it opens</div>
                <div className="how-step-desc">Once the Base contracts are audited and deployed, access will be token-gated. Founder list wallets get in first at $0.005.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tiers ── */}
        <section className="tiers-section">
          <div className="section-label">ACCESS TIERS</div>
          <h2 className="section-title">Start free. Scale with the token.</h2>
          <p className="section-sub">The app runs on open beta today. These tiers activate after audit and contract deployment on Base.</p>
          <div className="tiers-grid">

            <div className="tier-card">
              <div className="tier-card-name observer">OPEN BETA</div>
              <div className="tier-card-req">0 $NYT · Available now</div>
              <ul className="tier-card-perks">
                <li>✓ Full beta product access</li>
                <li>✓ Live signal preview</li>
                <li>✓ Public proof pages</li>
                <li>✓ Founder list access</li>
                <li className="locked">✗ Token gating not live yet</li>
                <li className="locked">✗ Staking and governance not live yet</li>
              </ul>
            </div>

            <div className="tier-card featured">
              <div className="tier-card-badge">PLANNED FIRST TIER</div>
              <div className="tier-card-name participant">PRO ACCESS</div>
              <div className="tier-card-req">100 $NYT after deploy</div>
              <ul className="tier-card-perks">
                <li>✓ Full live signal feed</li>
                <li>✓ AI-generated signal posts</li>
                <li>✓ Wallet scoring engine</li>
                <li>✓ 30-day signal history</li>
                <li>✓ REST API access</li>
                <li>✓ Custom alert rules</li>
              </ul>
            </div>

            <div className="tier-card">
              <div className="tier-card-name smart-money">PARTNER</div>
              <div className="tier-card-req">5,000 $NYT after deploy</div>
              <ul className="tier-card-perks">
                <li>✓ Everything in Pro Access</li>
                <li>✓ Priority whale alerts</li>
                <li>✓ Custom wallet monitoring</li>
                <li>✓ Team & community workflows</li>
                <li>✓ Governance input</li>
                <li>✓ Revenue share features</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── Presale CTA ── */}
        <section className="presale-cta" id="whitelist-anchor">
          <div className="presale-glow" aria-hidden="true" />
          <div className="presale-cta-inner">
            <div className="section-label">FOUNDER LIST OPEN</div>
            <h2 className="presale-title">Lock your spot at the lowest price.</h2>
            <p className="presale-sub">Three rounds open in sequence after audit on Base. The founder list is the only way to guarantee round-one access at $0.005.</p>

            <div className="presale-cta-rounds">
              <div className="pcr founder">
                <span className="pcr-label">FOUNDER</span>
                <strong className="pcr-price">$0.005</strong>
                <span className="pcr-status active">Open soon</span>
              </div>
              <div className="pcr-connector">→</div>
              <div className="pcr">
                <span className="pcr-label">EARLY ACCESS</span>
                <strong className="pcr-price">$0.008</strong>
                <span className="pcr-status">Round 2</span>
              </div>
              <div className="pcr-connector">→</div>
              <div className="pcr">
                <span className="pcr-label">PUBLIC</span>
                <strong className="pcr-price">$0.010</strong>
                <span className="pcr-status">Round 3</span>
              </div>
              <div className="pcr-connector">→</div>
              <div className="pcr highlight">
                <span className="pcr-label">BASE LIVE</span>
                <strong className="pcr-price">After Audit</strong>
                <span className="pcr-status">Post-deploy</span>
              </div>
            </div>

            <a className="connect-btn-main connect-btn-large" href="/presale">Join Founder List →</a>
            <p className="landing-hint">No wallet connection needed. Just email and your wallet address.</p>
          </div>
        </section>

        {/* ── Business Model ── */}
        <section className="revenue-section">
          <div className="revenue-inner">
            <div className="revenue-text">
              <div className="section-label">THE BUSINESS</div>
              <h2>Product first. Token when it's earned.</h2>
              <p>The plan is proof before presale: show retention, show real usage, then open the three-round structured sale. No hype loop. No token before the product earns it.</p>
              <div className="revenue-points">
                <div className="revenue-point">
                  <span className="rp-icon">✓</span>
                  <div>
                    <strong>Trader beta access</strong>
                    <span>Live signals, scoring, and history. Available now, no token required.</span>
                  </div>
                </div>
                <div className="revenue-point">
                  <span className="rp-icon">✓</span>
                  <div>
                    <strong>Builder API access</strong>
                    <span>REST API for bots and custom dashboards. Plug in on day one.</span>
                  </div>
                </div>
                <div className="revenue-point">
                  <span className="rp-icon">✓</span>
                  <div>
                    <strong>Community monitoring</strong>
                    <span>Pilot monitoring packages for DAO communities and on-chain funds.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="revenue-card">
              <div className="rev-card-title">WHO USES NYTHOS</div>
              {[
                { segment: 'Traders',     use: 'Signal beta',   num: '01' },
                { segment: 'Builders',    use: 'API access',    num: '02' },
                { segment: 'Communities', use: 'Monitoring',    num: '03' },
                { segment: 'Funds',       use: 'Research view', num: '04' },
              ].map(r => (
                <div key={r.segment} className="rev-row">
                  <span className="rev-num">{r.num}</span>
                  <span className="rev-segment">{r.segment}</span>
                  <span className="rev-use">{r.use}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section" id="faq-anchor">
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Common questions</h2>
          <div className="faq-grid">
            {[
              {
                q: 'How is NYTHOS different from Nansen or Arkham?',
                a: 'Nansen and Arkham are research tools: useful for historical deep-dives but slow for real-time trading. NYTHOS is built signal-first. Every whale movement is scored, surfaced instantly, and verified on-chain after the fact so you can audit accuracy before you trust it. And the beta is free.',
              },
              {
                q: 'How is NYTHOS different from Whale Alert?',
                a: "Whale Alert broadcasts raw transaction sizes on social media with no scoring, no history, and no accuracy record. NYTHOS scores every signal HIGH / MED / LOW, checks the outcome after 24h, and gives you a full 30-day queryable history, so you know which signals actually moved markets.",
              },
              {
                q: 'What blockchains are supported?',
                a: 'ETH, BTC, and Base today. ETH and Base include DEX activity, bridge flows, and smart contract interactions. BTC covers large-wallet accumulation and dormant-wallet reactivation. SOL support is in development.',
              },
              {
                q: 'Is it really free?',
                a: 'Yes. Full beta access (live signals, wallet scoring, 30-day history, REST API, and Telegram alerts) requires only a wallet connection. No subscription, no credit card. Token-gated tiers activate after the Base contract audit.',
              },
              {
                q: 'How accurate are the signals?',
                a: 'Every signal is verified automatically after it fires. The public proof feed shows verified hits and misses with full context. Accuracy is tracked over 24h windows and displayed live at nythos.io/proof.',
              },
              {
                q: 'What is the $NYT token?',
                a: '$NYT is the NYTHOS access token planned for Base after a professional smart contract audit. It gates Pro (100 $NYT) and Partner (5,000 $NYT) tiers. Founder round price is $0.005. No token is needed during open beta.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="faq-card">
                <h3 className="faq-q">{q}</h3>
                <p className="faq-a">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Manifesto / Quote ── */}
        <section className="manifesto-section">
          <div className="manifesto-line" aria-hidden="true" />
          <blockquote className="manifesto-quote">
            "The fastest way to kill a good crypto product is to sell the token before the product has earned trust."
          </blockquote>
          <cite className="manifesto-attr">NYTHOS launch principle</cite>
          <div className="manifesto-line" aria-hidden="true" />
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">NYTHOS</span>
            <span className="footer-tag">$NYT · Base-first · Beta live</span>
          </div>
          <nav className="footer-links">
            <a href="https://t.me/NythosAI" target="_blank" rel="noreferrer">Telegram</a>
            <a href="https://x.com/NythosAI" target="_blank" rel="noreferrer">Twitter / X</a>
            <a href="mailto:hello@nythos.io">Email</a>
            <a href="/proof">Live Feed</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </nav>
          <div className="footer-copy">© 2026 NYTHOS. Working product now, token infrastructure after audit.</div>
        </div>
      </footer>

    </div>
  );
}
