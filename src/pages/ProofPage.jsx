import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import api from '../api';
import { useWalletSession } from '../hooks/useWalletSession';
import './ProofPage.css';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatType(value) {
  return String(value || '').replace(/_/g, ' ');
}

function PctBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const isUp = pct >= 0;
  const label = `${isUp ? '+' : ''}${pct.toFixed(2)}%`;
  return <span className={`proof-pct ${isUp ? 'proof-up' : 'proof-down'}`}>{label}</span>;
}

function ProofOutcome({ signal }) {
  if (signal.proofMode === 'ONCHAIN_FOLLOW_THROUGH') {
    return (
      <div className="proof-prices">
        <div className="proof-price-item">
          <span className="proof-price-label">Proof Mode</span>
          <span className="proof-price-val">On chain</span>
        </div>
        <div className="proof-arrow">→</div>
        <div className="proof-price-item">
          <span className="proof-price-label">24h follow through</span>
          <span className="proof-price-val">{signal.followThrough24h || 0} events</span>
        </div>
      </div>
    );
  }

  return (
    <div className="proof-prices">
      <div className="proof-price-item">
        <span className="proof-price-label">Entry</span>
        <span className="proof-price-val">
          ${signal.priceUSD ? Number(signal.priceUSD).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '-'}
        </span>
      </div>
      <div className="proof-arrow">→</div>
      <div className="proof-price-item">
        <span className="proof-price-label">24h later</span>
        <span className="proof-price-val">
          ${signal.priceCheck24h ? Number(signal.priceCheck24h).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '-'}
        </span>
      </div>
      <PctBadge pct={signal.pctMove} />
    </div>
  );
}

export default function ProofPage() {
  const { address } = useAccount();
  const { hasSession } = useWalletSession();
  const [scope, setScope] = useState('PUBLIC');
  const [refreshId, setRefreshId] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const canViewPrivate = Boolean(address && hasSession);
  const activeScope = scope === 'PRIVATE' && canViewPrivate ? 'PRIVATE' : 'PUBLIC';
  const requestKey = `${activeScope}:${address || 'anon'}:${refreshId}`;
  const proofFeedParams = useMemo(() => (
    activeScope === 'PRIVATE'
      ? { scope: 'PRIVATE', owner: address }
      : { scope: 'PUBLIC' }
  ), [activeScope, address]);
  const [requestState, setRequestState] = useState({
    error: false,
    key: '',
    signals: [],
    stats: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/api/accuracy/proof-feed', { params: proofFeedParams }),
      api.get('/api/accuracy/stats'),
    ])
      .then(([proofRes, statsRes]) => {
        if (!cancelled) {
          setRequestState({
            error: false,
            key: requestKey,
            signals: proofRes.data.signals || [],
            stats: statsRes.data,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRequestState({
            error: true,
            key: requestKey,
            signals: [],
            stats: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [proofFeedParams, requestKey]);

  async function loadProofDetails(id) {
    try {
      const res = await api.get(`/api/accuracy/proof/${id}`);
      setDetailsById(current => ({
        ...current,
        [id]: res.data.proof,
      }));
    } catch {
      setDetailsById(current => ({
        ...current,
        [id]: { error: true },
      }));
    }
  }

  const signals = requestState.key === requestKey ? requestState.signals : [];
  const stats = requestState.key === requestKey ? requestState.stats : null;
  const error = requestState.key === requestKey ? requestState.error : false;
  const loading = requestState.key !== requestKey;

  function reloadData() {
    setRefreshId(current => current + 1);
  }

  const rate = stats?.overall?.rate24h;
  const total = stats?.overall?.total24h || 0;
  const hits = stats?.overall?.hit24h || 0;

  return (
    <div className="proof-page">
      <div className="proof-hero">
        <div className="proof-hero-tag">VERIFIED ON CHAIN</div>
        <div className="proof-title">Proof of Work</div>
        <p>
          NYTHOS tracks what happened after a signal fired. Public proof shows verified wins and misses across the live feed.
          Private proof is available when your wallet session is active.
        </p>
      </div>

      <div className="proof-scope-tabs">
        <button
          className={`proof-scope-btn ${scope === 'PUBLIC' ? 'active' : ''}`}
          onClick={() => setScope('PUBLIC')}
        >
          PUBLIC PROOF
        </button>
        <button
          className={`proof-scope-btn ${scope === 'PRIVATE' ? 'active' : ''}`}
          onClick={() => hasSession && address ? setScope('PRIVATE') : null}
          disabled={!hasSession || !address}
        >
          PRIVATE PROOF
        </button>
      </div>

      {scope === 'PRIVATE' && !canViewPrivate && (
        <div className="proof-banner">
          Verify your wallet to load private proof for personal signals and monitored workflows.
        </div>
      )}

      {!loading && total > 0 && (
        <div className="proof-headline">
          <div className="proof-hl-stat">
            <span className="proof-hl-num proof-hl-green">{rate !== null ? `${rate}%` : '-'}</span>
            <span className="proof-hl-label">24h accuracy</span>
          </div>
          <div className="proof-hl-div" />
          <div className="proof-hl-stat">
            <span className="proof-hl-num">{hits}</span>
            <span className="proof-hl-label">correct HIGH confidence calls</span>
          </div>
          <div className="proof-hl-div" />
          <div className="proof-hl-stat">
            <span className="proof-hl-num">{total}</span>
            <span className="proof-hl-label">signals verified</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="proof-loading">Loading verified calls...</div>
      ) : error ? (
        <div className="proof-error">
          <p>Could not load proof data.</p>
          <button className="proof-retry-btn" onClick={reloadData}>↺ Try Again</button>
        </div>
      ) : signals.length === 0 ? (
        <div className="proof-empty">
          <div className="proof-empty-icon">◈</div>
          <p>No verified proof is available for this view yet.</p>
          <p className="proof-empty-sub">
            NYTHOS checks every signal after it fires. Come back once the engine has gathered more proof windows.
          </p>
        </div>
      ) : (
        <>
          <div className="proof-intro">
            Showing <strong>{signals.length}</strong> verified signals with proof context, follow through, and what happened next.
          </div>

          <div className="proof-grid">
            {signals.map((signal, index) => {
              const isOpen = expanded === (signal.id || signal._id);
              const detail = detailsById[signal.id || signal._id];
              const pctMove = signal.priceCheck24h && signal.priceUSD
                ? ((signal.priceCheck24h - signal.priceUSD) / signal.priceUSD) * 100
                : null;

              return (
                <div
                  key={signal.id || signal._id}
                  className={`proof-card ${isOpen ? 'proof-card-open' : ''}`}
                  onClick={() => {
                    const nextId = signal.id || signal._id;
                    const nextOpen = expanded === nextId ? null : nextId;
                    setExpanded(nextOpen);
                    if (nextOpen && !detailsById[nextId]) {
                      loadProofDetails(nextId);
                    }
                  }}
                >
                  <div className="proof-card-top">
                    <div className="proof-card-row1">
                      <div className="proof-card-left">
                        <span className="proof-rank">#{index + 1}</span>
                        <span className="proof-token">{signal.token}</span>
                        <span className="proof-score">{formatType(signal.type)}</span>
                      </div>
                      <div className="proof-card-right">
                        <div className={`proof-hit-badge ${signal.outcome24h ? 'hit' : 'miss'}`}>
                          {signal.outcome24h ? '✓ VERIFIED HIT' : '✗ VERIFIED MISS'}
                        </div>
                        <span className="proof-expand-hint">{isOpen ? '▲' : '▼'} view proof</span>
                      </div>
                    </div>
                    <div className="proof-card-row2">
                      <div className="proof-meta">
                        <span className="proof-score">Score {signal.score}</span>
                        <span className="proof-date">{formatDate(signal.timestamp)}</span>
                      </div>
                      <ProofOutcome signal={{ ...signal, pctMove }} />
                    </div>
                  </div>

                  {signal.whatHappenedNext && (
                    <div className="proof-summary">{signal.whatHappenedNext}</div>
                  )}

                  {isOpen && (
                    <div className="proof-post">
                      <div className="proof-post-label">WHY THIS COUNTED</div>
                      <blockquote className="proof-post-text">"{signal.proofContext || 'NYTHOS verified this signal after it fired.'}"</blockquote>

                      {signal.post && (
                        <>
                          <div className="proof-post-label">WHAT NYTHOS SAID</div>
                          <blockquote className="proof-post-text">"{signal.post}"</blockquote>
                        </>
                      )}

                      {signal.whoElseFollowed?.length > 0 && (
                        <>
                          <div className="proof-post-label">WHO ELSE FOLLOWED</div>
                          <div className="proof-pill-row">
                            {signal.whoElseFollowed.map(wallet => (
                              <span key={wallet} className="proof-pill">
                                {wallet.slice(0, 8)}...{wallet.slice(-4)}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {detail?.timeline?.length > 0 && (
                        <>
                          <div className="proof-post-label">TIMELINE</div>
                          <div className="proof-timeline">
                            {detail.timeline.map(item => (
                              <div key={item.id} className="proof-timeline-row">
                                <span className={`proof-timeline-role ${item.outcomeRole.toLowerCase()}`}>{item.outcomeRole}</span>
                                <span className="proof-timeline-type">{formatType(item.type)}</span>
                                <span className="proof-timeline-market">{item.market || item.token}</span>
                                <span className="proof-timeline-time">{formatDate(item.timestamp)}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {detail?.error && (
                        <div className="proof-banner">Could not load deeper proof details for this signal.</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="proof-disclaimer">
        Outcomes are verified automatically by the NYTHOS engine. Price signals are checked by direction. Base launch and flow signals are checked by on chain follow through in the same token or pool. Past accuracy does not guarantee future results.
      </div>
    </div>
  );
}
