import { useState, useEffect } from 'react';
import api from '../api';
import './TokenPage.css';

const allocations = [
  { label: 'Sale & Access Allocation', pct: 27, amount: '27,000,000', color: 'accent', desc: 'Held by NYTPresale contract. Covers the founder round, early access, and any public sale. Distributed across presale rounds, not all at once.' },
  { label: 'Community Airdrop',        pct: 18, amount: '18,000,000', color: 'green',  desc: 'Held by NYTAirdrop contract. Founder list rewards, early community activation, and batch claim campaigns.' },
  { label: 'Ecosystem & Rewards',      pct: 18, amount: '18,000,000', color: 'yellow', desc: 'Held by NYTStaking contract. Platform incentives and pro-rata staking rewards pool, activated only after the platform earns recurring revenue.' },
  { label: 'Team (Vested)',            pct: 15, amount: '15,000,000', color: 'muted',  desc: 'Held by NYTVesting contract. 1-year cliff then 2-year linear vest. Founder and core team allocation.' },
  { label: 'Liquidity Pool',           pct: 15, amount: '15,000,000', color: 'green',  desc: 'Held by liquidity wallet (Gnosis Safe). Earmarked for Aerodrome and Uniswap Base pools at launch. Not circulating before DEX deploy.' },
  { label: 'Treasury',                 pct: 7,  amount: '7,000,000',  color: 'muted',  desc: 'Held by treasury wallet (Gnosis Safe). Audit costs, legal, emergency runway, and operational expenses.' },
];

const fundingTracks = [
  { channel: 'Builder Grants', goal: '1 to 5 ETH', dilution: '0%', unlock: 'Audit and product hardening', timing: 'Now', status: 'ACTIVE' },
  { channel: 'Pilot Revenue', goal: '$500 to $1,500 / month', dilution: '0%', unlock: 'Retention proof and customer signal', timing: 'Now', status: 'ACTIVE' },
  { channel: 'Strategic Round', goal: '$10k to $50k', dilution: 'Small private allocation', unlock: 'Runway, deployment, and launch prep', timing: 'After pilots', status: 'LATER' },
  { channel: 'Public Launch', goal: 'Only if justified', dilution: 'Token launch mechanics', unlock: 'Broader access and liquidity', timing: 'After audit + traction', status: 'LATER' },
];

const roadmap = [
  { phase: '01', label: 'Working Beta', desc: 'Signal engine, proof pages, and frontend live today', done: true },
  { phase: '02', label: 'Base Setup', desc: 'Contracts configured for Base and locally tested', done: true },
  { phase: '03', label: 'Founder List', desc: 'Capture wallets, referrals, and early pilot demand', done: false },
  { phase: '04', label: 'Base Grants', desc: 'Use Base ecosystem funding before paid marketing', done: false },
  { phase: '05', label: 'Pilot Revenue', desc: 'Sell monitoring and API access before a public token story', done: false },
  { phase: '06', label: 'Audit', desc: 'External contract review and Base deployment readiness', done: false },
  { phase: '07', label: 'Strategic Round', desc: 'Raise a smaller founder focused round if needed', done: false },
  { phase: '08', label: 'Deploy Access Layer', desc: 'Publish real token addresses and enable gating on Base', done: false },
  { phase: '09', label: 'Staking Later', desc: 'Turn on staking only after revenue and token deployment exist', done: false },
  { phase: '10', label: 'Expansion', desc: 'Deepen Base distribution, then expand to broader channels', done: false },
];

export default function TokenPage({ onJoinPresale }) {
  const [activeTab, setActiveTab]         = useState('overview');
  const [whitelistCount, setWhitelistCount] = useState(null);

  useEffect(() => {
    api.get('/api/presale/count')
      .then(r => setWhitelistCount(r.data.count))
      .catch(() => {});
  }, []);

  return (
    <div className="token-page">
      <div className="token-hero">
        <h1 className="token-title">$NYT</h1>
        <p className="token-sub">Planned access and governance infrastructure for a Base first intelligence product. The contracts are written and tested; deployment waits for audit, traction, and a cleaner launch window.</p>
        <div className="token-stats">
          <div className="ts"><span className="ts-num">100,000,000</span><span className="ts-label">Planned Fixed Supply</span></div>
          <div className="ts"><span className="ts-num">108</span><span className="ts-label">Local Tests Passing</span></div>
          <div className="ts"><span className="ts-num">Base</span><span className="ts-label">Launch Chain</span></div>
          <div className="ts"><span className="ts-num">Not live</span><span className="ts-label">Deploy Status</span></div>
          {whitelistCount !== null && (
            <div className="ts">
              <span className="ts-num ts-highlight">{whitelistCount.toLocaleString()}</span>
              <span className="ts-label">Founder List</span>
            </div>
          )}
        </div>
      </div>

      <div className="token-tabs">
        {['overview', 'sales', 'allocations', 'roadmap'].map(t => (
          <button key={t} className={`token-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="tiers-grid">
            {[
              { name: 'OPEN BETA',   nyt: '0 $NYT today',            color: 'muted',  features: ['Beta access for connected wallets', 'Proof pages and live signal preview', 'Founder list and pilot onboarding', 'Fast feedback while contracts remain undeployed'], cta: null },
              { name: 'FUTURE PRO',  nyt: '100 $NYT after deploy',   color: 'accent', features: ['Live signals', 'Full AI posts', 'Wallet scoring and history', 'API and alert access', 'Most likely first onchain tier'], highlight: true, cta: 'JOIN FOUNDER LIST →' },
              { name: 'PARTNER',     nyt: '5,000 $NYT after deploy', color: 'green',  features: ['Priority alerts', 'Custom wallet tracking', 'More direct monitoring workflows', 'Governance input later', 'Built for serious users, not casual hype'], cta: 'JOIN FOUNDER LIST →' },
            ].map(tier => (
              <div key={tier.name} className={`tier-card ${tier.highlight ? 'highlight' : ''}`}>
                {tier.highlight && <div className="tier-badge">MOST LIKELY FIRST TIER</div>}
                <div className={`tier-name ${tier.color}`}>{tier.name}</div>
                <div className="tier-nyt">{tier.nyt}</div>
                <ul className="tier-features">
                  {tier.features.map(f => (
                    <li key={f}><span className={`tier-dot ${tier.color}`} />{f}</li>
                  ))}
                </ul>
                {tier.cta ? (
                  <button className={`tier-cta-btn tier-cta-${tier.color}`} onClick={onJoinPresale}>
                    {tier.cta}
                  </button>
                ) : (
                  <div className="tier-status-current">CURRENT PRODUCT MODE</div>
                )}
              </div>
            ))}
          </div>

          <div className="burn-tracker">
            <div className="bt-header">
              <div className="bt-title-row">
                <span className="bt-label">BASE TOKEN READINESS</span>
                <span className="bt-status">NOT DEPLOYED. AUDIT AND TRACTION FIRST</span>
              </div>
              <p className="bt-desc">The token architecture exists to support access, governance, and later revenue features. Deployment happens only after the launch story is stronger than the hype risk.</p>
            </div>
            <div className="bt-stats">
              <div className="bt-stat">
                <span className="bt-stat-num">5</span>
                <span className="bt-stat-label">Contracts</span>
              </div>
              <div className="bt-arrow">→</div>
              <div className="bt-stat">
                <span className="bt-stat-num bt-burned">108</span>
                <span className="bt-stat-label">Local Tests</span>
              </div>
              <div className="bt-arrow">→</div>
              <div className="bt-stat">
                <span className="bt-stat-num">0</span>
                <span className="bt-stat-label">Mainnet Deploys</span>
              </div>
            </div>
            <div className="bt-burn-bar-wrap">
              <div className="bt-burn-bar" style={{ width: '68%' }} />
            </div>
            <div className="bt-next">
              <span className="bt-next-label">Next milestone</span>
              <span className="bt-next-val">Founder traction + external audit readiness</span>
            </div>
          </div>

          <div className="token-info">
            <h2>Why keep the token at all?</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">◈</div>
                <h3>ACCESS LAYER</h3>
                <p>The token is useful if it controls product access after users already want the product. It should not be the substitute for demand.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">◈</div>
                <h3>RETENTION TOOL</h3>
                <p>Tokenized access works best when it deepens usage, not when it becomes the only reason people arrive.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">◈</div>
                <h3>GOVERNANCE LATER</h3>
                <p>Governance matters after there is a real user base, a treasury, and decisions worth making together.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">◈</div>
                <h3>BASE NATIVE ROLLOUT</h3>
                <p>Keeping the token plan on Base gives NYTHOS a coherent chain story for grants, builder intros, and future launch mechanics.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="tab-content">
          <div className="sales-note">
            Near term capital should come from grants, pilots, and a smaller strategic round.
            A public token sale is intentionally later, not the opening move.
          </div>
          <div className="sales-table">
            <div className="sales-header">
              <span>Channel</span><span>Capital</span><span>Dilution</span><span>Unlocks</span><span>Timing</span><span>Status</span>
            </div>
            {fundingTracks.map(track => (
              <div key={track.channel} className="sales-row">
                <span className="sales-round">{track.channel}</span>
                <span className="sales-price">{track.goal}</span>
                <span>{track.dilution}</span>
                <span>{track.unlock}</span>
                <span>{track.timing}</span>
                <span className="sales-status">{track.status}</span>
              </div>
            ))}
          </div>

          <div className="cex-section">
            <h2>Why Base First</h2>
            <p className="cex-sub">The best growth path is Base aligned distribution and funding before exchange talk. That means ecosystem grants, founder traction, and cleaner deployment timing.</p>
            <div className="cex-grid">
              {[
                { name: 'Builder Rewards', type: 'Base funding', status: 'LIVE',      color: 'green',  icon: '◈' },
                { name: 'Builder Grants',  type: 'No dilution', status: 'LIVE',      color: 'green',  icon: '◈' },
                { name: 'Pilot Customers', type: 'Revenue proof', status: 'NEXT',     color: 'yellow', icon: '◉' },
                { name: 'Strategic Round', type: 'Founder capital', status: 'LATER',  color: 'muted',  icon: '○' },
              ].map(item => (
                <div key={item.name} className="cex-card">
                  <div className="cex-icon">{item.icon}</div>
                  <div className="cex-info">
                    <div className="cex-name">{item.name}</div>
                    <div className="cex-type">{item.type}</div>
                  </div>
                  <div className={`cex-status cex-status-${item.color}`}>{item.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'allocations' && (
        <div className="tab-content">
          <div className="alloc-total">Planned total supply: <strong>100,000,000 $NYT</strong></div>
          <div className="alloc-list">
            {allocations.map(a => (
              <div key={a.label} className="alloc-row">
                <div className="alloc-left">
                  <span className={`alloc-dot ${a.color}`} />
                  <div>
                    <div className="alloc-label">{a.label}</div>
                    <div className="alloc-desc">{a.desc}</div>
                  </div>
                </div>
                <div className="alloc-right">
                  <div className="alloc-pct">{a.pct}%</div>
                  <div className="alloc-amount">{a.amount}</div>
                  <div className="alloc-bar-wrap">
                    <div className={`alloc-bar ${a.color}`} style={{ width: `${a.pct * 3}px` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className="tab-content">
          <div className="roadmap-list">
            {roadmap.map(item => (
              <div key={item.phase} className={`roadmap-item ${item.done ? 'done' : ''}`}>
                <div className="roadmap-phase">{item.phase}</div>
                <div className="roadmap-body">
                  <div className="roadmap-label">{item.label}</div>
                  <div className="roadmap-desc">{item.desc}</div>
                </div>
                <div className={`roadmap-status ${item.done ? 'done' : ''}`}>{item.done ? 'LIVE' : 'NEXT'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
