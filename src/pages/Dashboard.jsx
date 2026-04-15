import React, { Suspense, useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import api from '../api';
import { useTier } from '../hooks/useTier';
import SignalCard from '../components/SignalCard';
import PriceBar from '../components/PriceBar';
import WalletScore from '../components/WalletScore';
import TierBadge from '../components/TierBadge';
import TierGate from '../components/TierGate';
import AccuracyStats from '../components/AccuracyStats';
import OnboardingOverlay from '../components/OnboardingOverlay';
import AskWidget from '../components/AskWidget';
import { useWalletSession } from '../hooks/useWalletSession';
import { lazyWithChunkRecovery } from '../chunkRecovery';
import './Dashboard.css';

const WhaleProfileModal = lazyWithChunkRecovery(() => import('../components/WhaleProfileModal'));
const TokenPage = lazyWithChunkRecovery(() => import('./TokenPage'));
const PresalePage = lazyWithChunkRecovery(() => import('./PresalePage'));
const StakingPage = lazyWithChunkRecovery(() => import('./StakingPage'));
const AboutPage = lazyWithChunkRecovery(() => import('./AboutPage'));
const HistoryPage = lazyWithChunkRecovery(() => import('./HistoryPage'));
const WatchlistPage = lazyWithChunkRecovery(() => import('./WatchlistPage'));
const AlertsPage = lazyWithChunkRecovery(() => import('./AlertsPage'));
const ApiPage = lazyWithChunkRecovery(() => import('./ApiPage'));
const RoadmapPage = lazyWithChunkRecovery(() => import('./RoadmapPage'));
const ProofPage = lazyWithChunkRecovery(() => import('./ProofPage'));
const LaunchRadarPage = lazyWithChunkRecovery(() => import('./LaunchRadarPage'));
const WalletGraphPage = lazyWithChunkRecovery(() => import('./WalletGraphPage'));
const QueryPage = lazyWithChunkRecovery(() => import('./QueryPage'));

export default function Dashboard() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { clearSession, session, hasSession } = useWalletSession();
  const { tier, balanceNYT } = useTier(address, session);
  const [signals, setSignals] = useState([]);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [chainFilter, setChainFilter] = useState('ALL');
  const [tab, setTab] = useState('feed');
  const [menuOpen, setMenuOpen] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [whaleTarget, setWhaleTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const liveParams = address && hasSession ? { owner: address } : {};
        const historyParams = { limit: 50 };
        if (address && hasSession) historyParams.owner = address;

        const livePromise = api.get('/api/signals', { params: liveParams }).catch(() => (
          address && hasSession
            ? api.get('/api/signals')
            : Promise.resolve({ data: { signals: [] } })
        ));

        const historyPromise = api.get('/api/signals/history', { params: historyParams }).catch(() => (
          address && hasSession
            ? api.get('/api/signals/history', { params: { limit: 50 } })
            : Promise.resolve({ data: { signals: [] } })
        ));

        const [liveRes, historyRes, pricesRes] = await Promise.all([
          livePromise,
          historyPromise,
          api.get('/api/signals/prices').catch(() => ({ data: {} })),
        ]);

        if (cancelled) return;

        const live = liveRes.data.signals || [];
        const history = historyRes.data.signals || [];
        const seen = new Set();
        const merged = [...live, ...history].filter(s => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
        merged.sort((a, b) => b.timestamp - a.timestamp);

        setSignals(merged);
        setPrices(pricesRes.data.prices || null);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch data:', err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [address, hasSession]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  function handleDisconnect() {
    clearSession();
    disconnect();
  }

  const holdingTokens = portfolio?.holdings?.map(h => h.symbol) || [];

  const allFiltered = signals
    .filter(s => filter === 'ALL' || s.confidence === filter)
    .filter(s => chainFilter === 'ALL' || s.token === chainFilter || s.chain === chainFilter);

  // OBSERVER tier: only show first 5 signals
  const filtered = tier.name === 'OBSERVER'
    ? allFiltered.slice(0, tier.signalLimit)
    : allFiltered;

  const isLimitedFeed = tier.name === 'OBSERVER' && allFiltered.length > tier.signalLimit;

  function renderTabFallback() {
    return (
      <div className="dash-main">
        <div className="empty">
          <p>Loading section...</p>
        </div>
      </div>
    );
  }

  function renderLazyTab() {
    switch (tab) {
      case 'token':
        return <TokenPage onJoinPresale={() => setTab('presale')} />;
      case 'presale':
        return <PresalePage />;
      case 'staking':
        return <StakingPage />;
      case 'history':
        return <HistoryPage tier={tier} />;
      case 'radar':
        return <LaunchRadarPage tier={tier} onWhaleClick={setWhaleTarget} />;
      case 'watchlist':
        return <WatchlistPage address={address} tier={tier} />;
      case 'alerts':
        return <AlertsPage prices={prices} />;
      case 'api':
        return <ApiPage tier={tier} />;
      case 'proof':
        return <ProofPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'about':
        return <AboutPage onViewRoadmap={() => setTab('roadmap')} />;
      case 'graph':
        return <WalletGraphPage onWhaleClick={setWhaleTarget} />;
      case 'query':
        return <QueryPage tier={tier} onWhaleClick={setWhaleTarget} />;
      default:
        return null;
    }
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        {/* Top row: logo + wallet info */}
        <div className="dash-header-top">
          <div className="dash-logo">
            <span className="logo">NYTHOS</span>
            <span className="tag">$NYT</span>
          </div>
          <div className="dash-right">
            <TierBadge tier={tier} balanceNYT={balanceNYT} />
            <span className="wallet-address">{shortAddress}</span>
            <button className="disconnect-btn" onClick={handleDisconnect}>✕ Disconnect</button>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>

        {/* Bottom row: nav tabs - grouped by function */}
        <nav className="dash-nav">
          {/* Intelligence */}
          <button className={`nav-btn ${tab === 'feed'      ? 'active' : ''}`} onClick={() => setTab('feed')}>SIGNALS</button>
          <button className={`nav-btn ${tab === 'radar'     ? 'active' : ''}`} onClick={() => setTab('radar')}>RADAR</button>
          <button className={`nav-btn ${tab === 'history'   ? 'active' : ''}`} onClick={() => setTab('history')}>HISTORY</button>
          <button className={`nav-btn ${tab === 'proof'     ? 'active' : ''}`} onClick={() => setTab('proof')}>PROOF</button>
          <button className={`nav-btn ${tab === 'graph'     ? 'active' : ''}`} onClick={() => setTab('graph')}>GRAPH</button>
          <button className={`nav-btn ${tab === 'query'     ? 'active' : ''}`} onClick={() => setTab('query')}>QUERY</button>
          <span className="nav-sep" />
          {/* My Setup */}
          <button className={`nav-btn ${tab === 'watchlist' ? 'active' : ''}`} onClick={() => setTab('watchlist')}>WATCHLIST</button>
          <button className={`nav-btn ${tab === 'alerts'    ? 'active' : ''}`} onClick={() => setTab('alerts')}>ALERTS</button>
          <span className="nav-sep" />
          {/* Token */}
          <button className={`nav-btn ${tab === 'token'     ? 'active' : ''}`} onClick={() => setTab('token')}>$NYT</button>
          <button className={`nav-btn ${tab === 'presale'   ? 'active' : ''}`} onClick={() => setTab('presale')}>PRESALE</button>
          <button className={`nav-btn ${tab === 'staking'   ? 'active' : ''}`} onClick={() => setTab('staking')}>STAKING</button>
          <span className="nav-sep" />
          {/* Platform */}
          <button className={`nav-btn ${tab === 'api'       ? 'active' : ''}`} onClick={() => setTab('api')}>API</button>
          <button className={`nav-btn ${tab === 'about'     ? 'active' : ''}`} onClick={() => setTab('about')}>ABOUT</button>
        </nav>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-group-label">INTELLIGENCE</div>
          <button onClick={() => { setTab('feed'); setMenuOpen(false); }}>Signals</button>
          <button onClick={() => { setTab('radar'); setMenuOpen(false); }}>Launch Radar</button>
          <button onClick={() => { setTab('history'); setMenuOpen(false); }}>History</button>
          <button onClick={() => { setTab('proof'); setMenuOpen(false); }}>Proof</button>
          <button onClick={() => { setTab('graph'); setMenuOpen(false); }}>Wallet Graph</button>
          <button onClick={() => { setTab('query'); setMenuOpen(false); }}>Query</button>
          <div className="mobile-menu-group-label">MY SETUP</div>
          <button onClick={() => { setTab('watchlist'); setMenuOpen(false); }}>Watchlist</button>
          <button onClick={() => { setTab('alerts'); setMenuOpen(false); }}>Alerts</button>
          <div className="mobile-menu-group-label">TOKEN</div>
          <button onClick={() => { setTab('token'); setMenuOpen(false); }}>$NYT Token</button>
          <button onClick={() => { setTab('presale'); setMenuOpen(false); }}>Presale</button>
          <button onClick={() => { setTab('staking'); setMenuOpen(false); }}>Staking</button>
          <div className="mobile-menu-group-label">PLATFORM</div>
          <button onClick={() => { setTab('api'); setMenuOpen(false); }}>API</button>
          <button onClick={() => { setTab('about'); setMenuOpen(false); }}>About</button>
          <div className="mobile-tier-row">
            <TierBadge tier={tier} balanceNYT={balanceNYT} />
            <span className="wallet-address">{shortAddress}</span>
          </div>
          <button className="disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}

      {prices && <PriceBar prices={prices} />}

      {tab === 'feed' && (
        <main className="dash-main">
          <WalletScore address={address} chain="BASE" onPortfolioLoad={setPortfolio} />

          <div className="stats-row">
            <div className="stat">
              <span className="stat-num">{signals.length}</span>
              <span className="stat-label">Total Signals</span>
            </div>
            <div className="stat">
              <span className="stat-num">{signals.filter(s => s.confidence === 'HIGH').length}</span>
              <span className="stat-label">High Confidence</span>
            </div>
            <div className="stat">
              <span className="stat-num">{signals.filter(s => s.proofMode).length}</span>
              <span className="stat-label">Verified Outcomes</span>
            </div>
            <div className="stat">
              <span className="stat-num">{signals.filter(s => s.type === 'WHALE_ACTIVITY').length}</span>
              <span className="stat-label">Whale Moves</span>
            </div>
          </div>

          <div className="chain-row">
            {['ALL', 'ETH', 'BTC', 'BASE'].map(c => (
              <button
                key={c}
                className={`chain-btn ${chainFilter === c ? 'active' : ''} ${holdingTokens.includes(c) ? 'held' : ''}`}
                onClick={() => setChainFilter(c)}
              >
                {c}
                {holdingTokens.includes(c) && <span className="held-dot" />}
              </button>
            ))}
          </div>

          <div className="section-header">
            <h2 className="section-title">Signal Feed</h2>
            <div className="filter-row">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >{f}</button>
              ))}
            </div>
          </div>

          <AccuracyStats />

          {loading ? (
            <div className="skeleton-list">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-score">
                    <div className="skeleton-block" style={{ width: 40, height: 34 }} />
                    <div className="skeleton-block" style={{ width: 32, height: 10 }} />
                  </div>
                  <div className="skeleton-body">
                    <div className="skeleton-block" style={{ width: '40%', height: 12 }} />
                    <div className="skeleton-block" style={{ width: '80%', height: 12 }} />
                    <div className="skeleton-block" style={{ width: '55%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p>The chain is quiet.</p>
              <p>No signals match this filter.</p>
            </div>
          ) : (
            <>
              <div className="signal-feed">
                {filtered.map(signal => (
                  <SignalCard key={signal.id} signal={signal} tier={tier} onWhaleClick={setWhaleTarget} />
                ))}
              </div>
              {isLimitedFeed && (
                <TierGate
                  required="PARTICIPANT"
                  tier={tier}
                  message={`${allFiltered.length - tier.signalLimit} more signals hidden. Hold 100+ $NYT to unlock the full feed.`}
                >
                  <div className="signal-feed">
                    {allFiltered.slice(tier.signalLimit, tier.signalLimit + 3).map(signal => (
                      <SignalCard key={signal.id} signal={signal} tier={tier} onWhaleClick={setWhaleTarget} />
                    ))}
                  </div>
                </TierGate>
              )}
            </>
          )}
        </main>
      )}

      {tab !== 'feed' && (
        <Suspense fallback={renderTabFallback()}>
          {renderLazyTab()}
        </Suspense>
      )}

      {whaleTarget?.address && (
        <Suspense fallback={null}>
          <WhaleProfileModal
            address={whaleTarget.address}
            chain={whaleTarget.chain}
            onClose={() => setWhaleTarget(null)}
          />
        </Suspense>
      )}

      <OnboardingOverlay />

      <AskWidget tier={tier} onWhaleClick={addr => setWhaleTarget({ address: addr, chain: 'BASE' })} />

      <footer className="dash-footer">
        NYTHOS - The Dark Intelligence of the Blockchain · @NythosAI · $NYT · Pattern observation, not prediction.
        <div className="dash-footer-links">
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <span>·</span>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
