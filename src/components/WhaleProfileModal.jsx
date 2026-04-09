import React, { useEffect, useState } from 'react';
import api from '../api';
import './WhaleProfileModal.css';

export default function WhaleProfileModal({ address, chain = 'BASE', onClose }) {
  const requestKey = address ? `${address.toLowerCase()}:${chain}` : '';
  const [requestState, setRequestState] = useState({ key: '', profile: null });

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    api.get(`/api/intelligence/wallet/${address}`, { params: { chain } })
      .then(r => {
        if (!cancelled) {
          setRequestState({ key: requestKey, profile: r.data.intelligence });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRequestState({ key: requestKey, profile: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, chain, requestKey]);

  const profile = requestState.key === requestKey ? requestState.profile : null;
  const loading = Boolean(address) && requestState.key !== requestKey;

  const scoreCls = !profile ? '' : profile.score >= 70 ? 'high' : profile.score >= 45 ? 'med' : 'low';
  const short    = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '';

  return (
    <div className="wpm-overlay" onClick={onClose}>
      <div className="wpm-modal" onClick={e => e.stopPropagation()}>
        <button className="wpm-close" onClick={onClose}>✕</button>

        <div className="wpm-header">
          <span className="wpm-title">WHALE PROFILE</span>
          <span className="wpm-addr">{short}</span>
          <span className="wpm-addr">{chain}</span>
          <button className="wpm-copy" onClick={() => navigator.clipboard.writeText(address)}>
            Copy
          </button>
        </div>

        {loading ? (
          <div className="wpm-loading">Reading wallet data...</div>
        ) : !profile ? (
          <div className="wpm-loading">Profile unavailable.</div>
        ) : (
          <>
            <div className="wpm-score-row">
              <div className={`wpm-score ${scoreCls}`}>{profile.score}</div>
              <div className="wpm-label-col">
                <span className={`wpm-label ${scoreCls}`}>{profile.displayName}</span>
                <span className="wpm-insight">{profile.insight}</span>
                <div className="wpm-entity-row">
                  <span className="wpm-entity-pill">{profile.cohort.replace(/_/g, ' ')}</span>
                  <span className="wpm-entity-pill muted">{profile.entityType.replace(/_/g, ' ')}</span>
                  {profile.reviewStatus && <span className="wpm-entity-pill muted">{profile.reviewStatus}</span>}
                </div>
              </div>
            </div>

            {(profile.metrics?.totalSignals || 0) < 3 ? (
              <div className="wpm-emerging">
                <span className="wpm-emerging-icon">◈</span>
                <div>
                  <p className="wpm-emerging-title">Not enough history yet</p>
                  <p className="wpm-emerging-text">NYTHOS has seen this wallet in {profile.metrics?.totalSignals || 0} signal{profile.metrics?.totalSignals === 1 ? '' : 's'}. Behavioral metrics build over time as the wallet appears in more signals and outcomes are tracked.</p>
                </div>
              </div>
            ) : (
            <div className="wpm-stats">
              <div className="wpm-stat">
                <span>{profile.metrics?.totalSignals || 0}</span>
                <span>Signals Seen</span>
              </div>
              <div className="wpm-stat">
                <span>{profile.metrics?.highConfidenceSignals || 0}</span>
                <span>High Conviction</span>
              </div>
              <div className="wpm-stat">
                <span>{profile.metrics?.hits24h || 0}</span>
                <span>Verified Hits</span>
              </div>
              <div className="wpm-stat">
                <span>{profile.metrics?.firstEntryBias || 0}%</span>
                <span>Entry Bias</span>
              </div>
              <div className="wpm-stat">
                <span>{profile.metrics?.winRate != null ? `${profile.metrics.winRate}%` : 'Building'}</span>
                <span>Win Rate</span>
              </div>
              <div className="wpm-stat">
                <span>{profile.metrics?.averageHoldHours != null ? `${profile.metrics.averageHoldHours}h` : 'Building'}</span>
                <span>Avg Hold</span>
              </div>
              <div className="wpm-stat">
                <span>{profile.metrics?.followThroughQuality ?? 0}</span>
                <span>Follow Through</span>
              </div>
              <div className="wpm-stat">
                <span>{profile.metrics?.cohortWinRate != null ? `${profile.metrics.cohortWinRate}%` : 'Building'}</span>
                <span>Cohort Bench</span>
              </div>
            </div>
            )}

            {profile.tags?.length > 0 && (
              <div className="wpm-tags">
                {profile.tags.map(tag => (
                  <span key={tag} className="wpm-tag">{tag}</span>
                ))}
              </div>
            )}

            {profile.coMovers?.length > 0 && (
              <div className="wpm-recent">
                <div className="wpm-recent-title">CO MOVERS</div>
                {profile.coMovers.map(item => (
                  <div key={item.address} className="wpm-tx">
                    <span className="wpm-tx-value">{item.address.slice(0, 8)}...{item.address.slice(-4)}</span>
                    <span className="wpm-tx-time">{item.sharedSignals} shared signals</span>
                  </div>
                ))}
              </div>
            )}

            {profile.coordinationFlags?.length > 0 && (
              <div className="wpm-recent">
                <div className="wpm-recent-title">COORDINATION FLAGS</div>
                {profile.coordinationFlags.map(flag => (
                  <div key={`${flag.market}-${flag.action}-${flag.timestamp}`} className="wpm-tx">
                    <span className="wpm-tx-value">{flag.market}</span>
                    <span className="wpm-tx-time">{flag.summary}</span>
                  </div>
                ))}
              </div>
            )}

            {profile.relationshipGraph?.edges?.length > 0 && (
              <div className="wpm-recent">
                <div className="wpm-recent-title">RELATIONSHIP GRAPH</div>
                {profile.relationshipGraph.edges.slice(0, 5).map(edge => (
                  <div key={edge.id} className="wpm-tx">
                    <span className="wpm-tx-value">{edge.target.slice(0, 8)}...{edge.target.slice(-4)}</span>
                    <span className="wpm-tx-time">{edge.sharedSignals} shared signals</span>
                  </div>
                ))}
              </div>
            )}

            {profile.recentSignals?.length > 0 && (
              <div className="wpm-recent">
                <div className="wpm-recent-title">RECENT SIGNALS</div>
                {profile.recentSignals.map(tx => (
                  <div key={tx.id} className="wpm-tx">
                    <span className="wpm-tx-value">{tx.type.replace(/_/g, ' ')}</span>
                    <span className="wpm-tx-time">
                      {new Date(tx.timestamp * 1000).toLocaleDateString()}
                    </span>
                    {tx.explorerUrl && (
                      <a
                        className="wpm-tx-link"
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
