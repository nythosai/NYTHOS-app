import React, { useState } from 'react';
import './SignalCard.css';

export default function SignalCard({ signal, tier, onWhaleClick }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSeePost = tier && (tier.name === 'PARTICIPANT' || tier.name === 'SMART_MONEY');
  const isEvmAddress = value => /^0x[0-9a-fA-F]{40}$/.test(value || '');
  const protocolLabel = signal.protocol ? signal.protocol.replace(/_/g, ' ') : null;
  const hasDexContext = Boolean(signal.market || signal.route || protocolLabel || signal.explorerUrl || signal.poolAddress);
  const visibleReasons = Array.isArray(signal.reasons) ? signal.reasons.slice(0, 3) : [];
  const visibleRiskFlags = Array.isArray(signal.riskFlags) ? signal.riskFlags.slice(0, 3) : [];
  const visibleFollowers = Array.isArray(signal.whoElseFollowed) ? signal.whoElseFollowed.slice(0, 3) : [];
  const hasExpandableContent = Boolean(
    signal.post || signal.whyItMatters || signal.whatToWatchNext || signal.whatHappenedNext ||
    visibleReasons.length > 0 || visibleRiskFlags.length > 0 || visibleFollowers.length > 0 ||
    hasDexContext || (signal.from && isEvmAddress(signal.from))
  );

  // Build a one-click trade URL for DEX signals with a known output token address
  function buildTradeUrl() {
    const addr = signal.tokenOutAddress || signal.tokenInAddress;
    if (!addr || !/^0x[0-9a-fA-F]{40}$/.test(addr)) return null;
    const protocol = signal.protocol?.toUpperCase();
    if (signal.chain === 'BASE') {
      if (protocol === 'AERODROME') return `https://aerodrome.finance/swap?to=${addr}`;
      if (protocol === 'PANCAKESWAP') return `https://pancakeswap.finance/swap?outputCurrency=${addr}&chain=base`;
      if (protocol === 'BASESWAP') return `https://baseswap.fi/#/swap?outputCurrency=${addr}`;
      return `https://app.uniswap.org/swap?outputCurrency=${addr}&chain=base`;
    }
    if (signal.chain === 'ETH') {
      return `https://app.uniswap.org/swap?outputCurrency=${addr}&chain=ethereum`;
    }
    return null;
  }
  function getTradeLabel() {
    const protocol = signal.protocol?.toUpperCase();
    if (protocol === 'AERODROME') return 'TRADE ON AERODROME ↗';
    if (protocol === 'PANCAKESWAP') return 'TRADE ON PANCAKESWAP ↗';
    if (protocol === 'BASESWAP') return 'TRADE ON BASESWAP ↗';
    return 'TRADE ON UNISWAP ↗';
  }
  const tradeUrl = buildTradeUrl();
  const tradeLabel = getTradeLabel();

  const cls = signal.confidence === 'HIGH' ? 'high' : signal.confidence === 'MEDIUM' ? 'medium' : 'low';
  const riskCls = signal.riskLevel ? signal.riskLevel.toLowerCase() : '';
  const timeStr = new Date(signal.timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  function getExplorerBase() {
    if (signal.chain === 'BASE') return 'https://basescan.org';
    if (signal.chain === 'ETH') return 'https://etherscan.io';
    return 'https://basescan.org';
  }

  const poolUrl = signal.poolAddress ? `${getExplorerBase()}/address/${signal.poolAddress}` : null;
  const initiatorUrl = signal.initiator && isEvmAddress(signal.initiator) ? `${getExplorerBase()}/address/${signal.initiator}` : null;
  const walletChain = signal.chain === 'BASE' ? 'BASE' : 'ETH';

  function copyPost(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(signal.post).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCardClick() {
    if (!hasExpandableContent) return;
    setExpanded(prev => !prev);
  }

  return (
    <div
      className={`signal-card ${signal.post ? 'has-post' : ''} ${expanded ? 'expanded' : ''} ${hasExpandableContent ? 'clickable' : ''}`}
      onClick={handleCardClick}
    >
      <div className="sc-score">
        <span className={`score-num ${cls}`}>{signal.score}</span>
        <span className={`score-label ${cls}`}>{signal.confidence}</span>
      </div>

      <div className="sc-body">
        <div className="sc-type-row">
          <span className="sc-type">{signal.type.replace(/_/g, ' ')}</span>
          <span className={`sc-token ${signal.token === 'BTC' ? 'btc' : signal.token === 'SOL' ? 'sol' : signal.chain === 'BASE' ? 'base' : ''}`}>{signal.token}</span>
          {signal.chain && signal.chain !== signal.token && (
            <span className={`sc-chain ${signal.chain === 'BASE' ? 'base' : signal.chain === 'SOL' ? 'sol' : ''}`}>{signal.chain}</span>
          )}
          {signal.post && <span className="sc-badge">NYTHOS</span>}
          {signal.riskLevel && <span className={`sc-risk ${riskCls}`}>{signal.riskLevel} RISK</span>}
        </div>

        {/* Trade button - always visible when token address is known */}
        {tradeUrl && (
          <a
            className="sc-trade-visible"
            href={tradeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {tradeLabel}
          </a>
        )}

        {/* Always visible: brief description or truncated post preview */}
        {signal.post ? (
          canSeePost ? (
            !expanded ? (
              <p className="sc-preview">{signal.post.split('\n').find(l => l.trim() && !l.startsWith('🚨') && l !== 'NYTHOS' && !l.startsWith('Signal score') && !l.startsWith('Confidence')) || signal.description}</p>
            ) : null
          ) : (
            <div className="sc-post-locked">
              <span className="sc-lock-icon">◈</span>
              <span>AI analysis · <strong>PRO tier required</strong></span>
            </div>
          )
        ) : (
          <p className="sc-desc">{signal.description}</p>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="sc-expanded">
            {signal.post && canSeePost && (
              <div className="sc-post-wrap">
                <button className="sc-copy" onClick={copyPost} title="Copy post">
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  )}
                </button>
                <p className="sc-post">{signal.post}</p>
              </div>
            )}

            {hasDexContext && (
              <div className="sc-context-row">
                {protocolLabel && <span className="sc-context-pill">{protocolLabel}</span>}
                {signal.action && <span className="sc-context-pill">{signal.action}</span>}
                {signal.clusterSize > 1 && <span className="sc-context-pill">GROUPED x{signal.clusterSize}</span>}
                {signal.market && <span className="sc-context-text">{signal.market}</span>}
                {signal.route && <span className="sc-context-route">{signal.route}</span>}
                {signal.explorerUrl && (
                  <a className="sc-link" href={signal.explorerUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                    VIEW TX
                  </a>
                )}
                {poolUrl && (
                  <a className="sc-link" href={poolUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                    VIEW POOL
                  </a>
                )}
                {initiatorUrl && (
                  <a className="sc-link" href={initiatorUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                    VIEW WALLET
                  </a>
                )}
                {tradeUrl && (
                  <a className="sc-trade-btn" href={tradeUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                    TRADE ↗
                  </a>
                )}
              </div>
            )}

            {visibleReasons.length > 0 && (
              <div className="sc-reasons">
                {visibleReasons.map(reason => (
                  <div key={reason} className="sc-reason">{reason}</div>
                ))}
              </div>
            )}

            {visibleRiskFlags.length > 0 && (
              <div className="sc-risk-flags">
                {visibleRiskFlags.map(flag => (
                  <div key={flag} className="sc-risk-flag">{flag}</div>
                ))}
              </div>
            )}

            {signal.whyItMatters && (
              <div className="sc-insight-block">
                <span className="sc-insight-label">Why It Matters</span>
                <p>{signal.whyItMatters}</p>
              </div>
            )}

            {signal.whatToWatchNext && (
              <div className="sc-insight-block">
                <span className="sc-insight-label">What To Watch Next</span>
                <p>{signal.whatToWatchNext}</p>
              </div>
            )}

            {signal.whatHappenedNext && (
              <div className="sc-insight-block">
                <span className="sc-insight-label">What Happened Next</span>
                <p>{signal.whatHappenedNext}</p>
              </div>
            )}

            {visibleFollowers.length > 0 && (
              <div className="sc-reasons">
                {visibleFollowers.map(address => (
                  <div key={address} className="sc-reason">FOLLOWED BY {address.slice(0, 8)}...{address.slice(-4)}</div>
                ))}
                {signal.followedByCount > visibleFollowers.length && (
                  <div className="sc-reason">AND {signal.followedByCount - visibleFollowers.length} MORE</div>
                )}
              </div>
            )}

            {signal.from && onWhaleClick && (isEvmAddress(signal.from) || isEvmAddress(signal.to)) && (
              <div className="sc-addresses">
                {isEvmAddress(signal.from) && (
                  <button
                    className="sc-addr"
                    onClick={e => { e.stopPropagation(); onWhaleClick({ address: signal.from, chain: walletChain }); }}
                    title="View whale profile"
                  >
                    FROM: {signal.from.slice(0, 8)}...{signal.from.slice(-4)}
                  </button>
                )}
                {isEvmAddress(signal.to) && (
                  <button
                    className="sc-addr"
                    onClick={e => { e.stopPropagation(); onWhaleClick({ address: signal.to, chain: walletChain }); }}
                    title="View whale profile"
                  >
                    TO: {signal.to.slice(0, 8)}...{signal.to.slice(-4)}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <span className="sc-meta">
          {signal.amountUSD ? '$' + signal.amountUSD.toLocaleString() + ' · ' : ''}
          Score: {signal.score}/100 · {signal.confidence}
          {signal.proofMode === 'ONCHAIN_FOLLOW_THROUGH' && typeof signal.followThrough24h === 'number' && (
            <span className="sc-proof"> · {signal.followThrough24h} follow-through</span>
          )}
          {signal.outcome24h !== undefined && (
            <span className={`sc-outcome ${signal.outcome24h ? 'hit' : 'miss'}`}>
              {signal.outcome24h ? ' · ✓ Called it' : ' · ✗ Miss'}
            </span>
          )}
        </span>
      </div>

      <div className="sc-right-col">
        <div className="sc-time">{timeStr}</div>
        {hasExpandableContent && (
          <div className={`sc-chevron ${expanded ? 'open' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
