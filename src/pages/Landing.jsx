import React, { useEffect, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import api from '../api';
import './Landing.css';

const STATIC_SIGNALS = [
  { id: 's1', token: 'ETH', description: 'Large wallet accumulation detected — 3 addresses added 820 ETH in 4h window.', valueUSD: 2_900_000, timestamp: Math.floor(Date.now() / 1000) - 420 },
  { id: 's2', token: 'BASE', description: 'Smart money cluster moved into Base DeFi. 12 coordinated entries within 90min.', valueUSD: 1_400_000, timestamp: Math.floor(Date.now() / 1000) - 1080 },
  { id: 's3', token: 'BTC', description: 'Dormant wallet (4yr) sent 6.2 BTC to new address before price spike.', valueUSD: 520_000, timestamp: Math.floor(Date.now() / 1000) - 2700 },
];

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

  const chainColor = { ETH: '#6c63ff', BTC: '#f7931a', BASE: '#0052ff' };

  return (
    <div className="live-proof">
      <div className="live-proof-header">
        <span className="live-dot" />
        <span className="live-label">{isLive ? 'LIVE SIGNALS' : 'SIGNAL EXAMPLES'}</span>
        {isLive && rate !== null && rate !== undefined && total >= 3 ? (
          <span className="live-accuracy">{rate}% accuracy · {total} signals tracked</span>
        ) : (
          <span className="live-accuracy">Example feed — connect wallet to see live signals</span>
        )}
      </div>
      <div className="live-signals-grid">
        {displaySignals.map(s => (
          <div key={s.id} className="live-signal-card">
            <div className="lsc-top">
              <span className="lsc-chain" style={{ color: chainColor[s.token] || '#6c63ff' }}>{s.token}</span>
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
      <div className="live-proof-note">Connected wallets get open beta access. The Base token layer is being prepared — the product runs now.</div>
    </div>
  );
}

function formatAge(ts) {
  const diff = Math.floor((Date.now() - ts * 1000) / 60000);
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  return `${h}h ago`;
}

export default function Landing() {
  // AppKit manages its own modal - handles Coinbase Smart Wallet, WalletConnect,
  // MetaMask, Rainbow, Trust, and 200+ mobile wallets via QR / deep link.
  const { open } = useAppKit();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    open();
    // Reset after 4s in case the user dismisses the modal without connecting
    setTimeout(() => setConnecting(false), 4000);
  };

  return (
    <div className="landing">

      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-header-left">
          <span className="logo">NYTHOS</span>
          <span className="tag">$NYT</span>
        </div>
        <div className="landing-header-right">
          <a className="header-whitelist-link" href="#whitelist-anchor">JOIN FOUNDER LIST</a>
          <button className="header-connect-btn" onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Opening...' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <main className="landing-main">

        {/* ── Hero ── */}
        <div className="hero-section">
          <h1 className="landing-title">NYTHOS</h1>
          <p className="landing-sub">Base-native onchain intelligence. Working product in beta. Three-round token presale opening after audit.</p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-val">ETH · BTC · BASE</span>
              <span className="hero-stat-label">Chains monitored</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-val">HIGH / MED / LOW</span>
              <span className="hero-stat-label">Confidence scoring</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-val">Live now</span>
              <span className="hero-stat-label">No token required yet</span>
            </div>
          </div>

          <div className="hero-value-props">
            <div className="hero-prop">
              <div className="hero-prop-icon">◈</div>
              <div className="hero-prop-text">
                <strong>See smart money move</strong>
                <span>Track large wallet activity, score what matters, and get a usable signal feed across ETH, BTC, and Base.</span>
              </div>
            </div>
            <div className="hero-prop">
              <div className="hero-prop-icon">◈</div>
              <div className="hero-prop-text">
                <strong>Use the beta before the token</strong>
                <span>The product is already usable for connected wallets. The Base token layer is planned, but the app is being sold on product proof first.</span>
              </div>
            </div>
            <div className="hero-prop">
              <div className="hero-prop-icon">◈</div>
              <div className="hero-prop-text">
                <strong>Three rounds, in the right order</strong>
                <span>Founder wallets first at $0.005, early access second at $0.008, public last at $0.010. All rounds open after audit and real product traction, not before.</span>
              </div>
            </div>
          </div>

          <div className="hero-cta-row">
            <button className="connect-btn-main" onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Opening Wallet...' : 'Connect Wallet to Explore Beta'}
            </button>
            <a className="hero-presale-link" href="#whitelist-anchor">
              Founder list is open. Request early access
            </a>
            <a className="hero-presale-link" href="/proof">
              View live proof feed ↗
            </a>
          </div>
          <p className="landing-hint">Works with Coinbase Wallet, MetaMask, Rainbow, and any WalletConnect wallet.</p>
        </div>

        {/* ── Live Signal Proof ── */}
        <LiveSignalPreview />

        {/* ── How It Works ── */}
        <div className="how-section">
          <h2 className="how-title">HOW IT WORKS</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-num">01</div>
              <div className="how-step-title">Connect your wallet</div>
              <div className="how-step-desc">Your wallet is your login. No email. No password. Connect from mobile or desktop - Coinbase Wallet, MetaMask, Rainbow, or any WalletConnect wallet.</div>
            </div>
            <div className="how-step">
              <div className="how-step-num">02</div>
              <div className="how-step-title">Prove retention before launch</div>
              <div className="how-step-desc">Use live signals, proof pages, history, and API workflows to validate demand before any public token event or heavy marketing push.</div>
            </div>
            <div className="how-step">
              <div className="how-step-num">03</div>
              <div className="how-step-title">Launch the access layer later</div>
              <div className="how-step-desc">Once the Base contracts are audited and deployed, NYTHOS can switch from open beta to a real token access model.</div>
            </div>
          </div>
        </div>

        {/* ── Tiers ── */}
        <div className="tiers-section">
          <h2 className="tiers-title">ACCESS ROADMAP</h2>
          <p className="tiers-sub">Today the app runs as an open beta. These are the Base access layers planned after deployment.</p>
          <div className="tiers-grid">

            <div className="tier-card">
              <div className="tier-card-name observer">OPEN BETA</div>
              <div className="tier-card-req">0 $NYT today</div>
              <ul className="tier-card-perks">
                <li>✓ Product demo for connected wallets</li>
                <li>✓ Live signal preview and proof pages</li>
                <li>✓ Founder list and pilot onboarding access</li>
                <li>✓ Fast feedback loop while contracts stay undeployed</li>
                <li className="locked">✗ Permanent token gating not live yet</li>
                <li className="locked">✗ Staking and governance not live yet</li>
              </ul>
            </div>

            <div className="tier-card featured">
              <div className="tier-card-badge">PLANNED FIRST TIER</div>
              <div className="tier-card-name participant">FUTURE PRO</div>
              <div className="tier-card-req">100 $NYT after deploy</div>
              <ul className="tier-card-perks">
                <li>✓ Live signal feed</li>
                <li>✓ Full AI posts</li>
                <li>✓ Wallet scoring</li>
                <li>✓ 30-day signal history</li>
                <li>✓ API and alert access</li>
                <li className="locked">✗ Partner-only monitoring workflows</li>
              </ul>
            </div>

            <div className="tier-card">
              <div className="tier-card-name smart-money">PARTNER</div>
              <div className="tier-card-req">5,000 $NYT after deploy</div>
              <ul className="tier-card-perks">
                <li>✓ Everything in Future Pro</li>
                <li>✓ Priority whale alerts</li>
                <li>✓ Custom wallet tracking</li>
                <li>✓ Team and community monitoring workflows</li>
                <li>✓ Governance and treasury input later</li>
                <li>✓ Revenue share features only after launch</li>
              </ul>
            </div>

          </div>
        </div>

        {/* ── Staking / Revenue Share Callout ── */}
        <div className="revenue-section">
          <div className="revenue-inner">
            <div className="revenue-text">
              <h2>How this becomes a real business.</h2>
              <p>The plan is product proof first, then a structured three-round presale: founder at $0.005, early access at $0.008, public at $0.010. All rounds are sequenced after audit on Base.</p>
              <div className="revenue-points">
                <span>✓ Pilot monitoring for communities</span>
                <span>✓ API access for bots and dashboards</span>
                <span>✓ Token gating after audit and deploy</span>
              </div>
            </div>
            <div className="revenue-card">
              <div className="rev-card-title">EARLY REVENUE WEDGES</div>
              {[
                { days: 'Traders',     apy: 'Signal beta',   mult: '01' },
                { days: 'Builders',    apy: 'API access',    mult: '02' },
                { days: 'Communities', apy: 'Monitoring',    mult: '03' },
                { days: 'Funds',       apy: 'Research view', mult: '04' },
              ].map(r => (
                <div key={r.days} className="rev-row">
                  <span className="rev-days">{r.days}</span>
                  <span className="rev-apy">{r.apy}</span>
                  <span className="rev-mult">{r.mult}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Presale CTA ── */}
        <div className="presale-cta" id="whitelist-anchor">
          <div className="presale-cta-label">FOUNDER LIST OPEN</div>
          <h2>Request early access on Base</h2>
          <p>Three rounds are planned: Founder ($0.005), Early Access ($0.008), and Public ($0.010), opening in sequence after audit. Join the founder list now to lock your spot at the lowest price.</p>
          <div className="presale-cta-rounds">
            <div className="pcr"><span>Founder</span><strong>$0.005</strong></div>
            <div className="pcr-arrow">→</div>
            <div className="pcr"><span>Early Access</span><strong>$0.008</strong></div>
            <div className="pcr-arrow">→</div>
            <div className="pcr"><span>Public</span><strong>$0.010</strong></div>
            <div className="pcr-arrow">→</div>
            <div className="pcr highlight"><span>Base Live</span><strong>After Audit</strong></div>
          </div>
          <button className="connect-btn-main" onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Opening Wallet...' : 'Connect Wallet to Join Founder List'}
          </button>
          <p className="landing-hint">Connect above to access the dashboard and founder list form.</p>
        </div>

        {/* ── Quote ── */}
        <div className="landing-quote-section">
          <p className="landing-quote">
            "The fastest way to kill a good crypto product is to sell the token before the product has earned trust."
          </p>
          <span className="landing-quote-attr">NYTHOS launch principle</span>
        </div>

      </main>

      <footer className="landing-footer">
        <div className="footer-links">
          <a href="https://t.me/NythosAI">Telegram</a>
          <a href="https://x.com/NythosAI">Twitter / X</a>
          <a href="mailto:hello@nythos.io">Email</a>
          <a href="/privacy.html">Privacy Policy</a>
          <a href="/terms.html">Terms of Service</a>
        </div>
        <div className="footer-copy">
          @NythosAI. Base first beta. Working product now, token infrastructure later.
        </div>
      </footer>

    </div>
  );
}
