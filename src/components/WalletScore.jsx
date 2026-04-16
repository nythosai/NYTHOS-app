import React, { useEffect, useState } from 'react';
import api from '../api';
import './WalletScore.css';

// Compute a one-line prompt telling the user what gets them to the next tier.
// Uses the same scoring formula as the backend so numbers are accurate.
function getNextMilestone(score, label, chain, txCount, balanceETH, ageMonths) {
  if (label === 'SMART MONEY') return null;

  if (chain === 'BASE') {
    const balanceScore = balanceETH >= 1 ? 20 : balanceETH >= 0.1 ? 12 : balanceETH > 0 ? 6 : 0;

    if (label === 'NEWCOMER') {
      // Need score 45: 30 + txCount*3 + balanceScore >= 45  →  txCount >= ceil((15 - balanceScore) / 3)
      const needed = Math.max(1, Math.ceil((15 - balanceScore) / 3));
      return `${needed} tx${needed === 1 ? '' : 's'} on Base reaches PARTICIPANT.`;
    }

    if (score < 70) {
      // Need score 70: 30 + min(txCount*3, 45) + balanceScore >= 70  →  txCount*3 >= 40 - balanceScore
      const needed = Math.ceil(Math.max(0, 40 - balanceScore) / 3);
      const more = Math.max(0, needed - (txCount ?? 0));
      if (more === 0) return 'Building towards SMART MONEY.';
      return `${more} more tx${more === 1 ? '' : 's'} on Base reaches SMART MONEY.`;
    }
  }

  // ETH — score-based only (no simple tx formula exposed)
  if (score < 45) return 'More on-chain activity needed to reach PARTICIPANT.';
  if (score < 70) return 'Continued activity builds towards SMART MONEY.';
  return null;
}

export default function WalletScore({ address, chain = 'BASE', onPortfolioLoad }) {
  const requestKey = address ? `${address.toLowerCase()}:${chain}` : '';
  const [requestState, setRequestState] = useState({
    key: '',
    portfolio: null,
    score: null,
  });

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    Promise.all([
      api.get(`/api/signals/wallet/${address}`, { params: { chain } }),
      api.get(`/api/signals/portfolio/${address}`, { params: { chain } }),
    ])
      .then(([scoreRes, portfolioRes]) => {
        if (cancelled) return;
        const nextPortfolio = portfolioRes.data.portfolio;
        setRequestState({
          key: requestKey,
          portfolio: nextPortfolio,
          score: scoreRes.data,
        });
        if (onPortfolioLoad) onPortfolioLoad(nextPortfolio);
      })
      .catch(() => {
        if (!cancelled) {
          setRequestState({
            key: requestKey,
            portfolio: null,
            score: { score: null, label: 'UNAVAILABLE', insight: 'Wallet scoring is temporarily unavailable. Check back shortly.', chain },
          });
          if (onPortfolioLoad) onPortfolioLoad(null);
        }
      });

    return () => { cancelled = true; };
  }, [address, chain, onPortfolioLoad, requestKey]);

  const score     = requestState.key === requestKey ? requestState.score    : null;
  const portfolio = requestState.key === requestKey ? requestState.portfolio : null;
  const loading   = Boolean(address) && requestState.key !== requestKey;

  if (loading) return <div className="ws-loading">NYTHOS is reading your wallet...</div>;
  if (!score)  return null;

  const tier        = score.score >= 70 ? 'high' : score.score >= 45 ? 'medium' : 'low';
  const isUnavailable = score.score === null;
  const milestone   = isUnavailable ? null : getNextMilestone(
    score.score, score.label, score.chain,
    score.txCount, score.balanceETH, score.ageMonths,
  );

  // Stat pills — only show values that exist
  const stats = [];
  if (score.txCount != null) stats.push(`${score.txCount} TXs`);
  if (score.balanceETH != null) stats.push(`${score.balanceETH} ETH`);
  if (score.ageMonths  != null && score.ageMonths > 0) stats.push(`${score.ageMonths}mo on-chain`);

  return (
    <div className={`wallet-score-card ${isUnavailable ? 'unavailable' : tier}`}>

      <div className="ws-left">
        <div className="ws-label">WALLET SCORE</div>
        {isUnavailable ? (
          <div className="ws-score low"></div>
        ) : (
          <div className={`ws-score ${tier}`}>{score.score}</div>
        )}
        {!isUnavailable && (
          <div className="ws-bar-track">
            <div
              className={`ws-bar-fill ${tier}`}
              style={{ width: `${score.score}%` }}
            />
            <div className="ws-bar-marker" style={{ left: '45%' }} />
            <div className="ws-bar-marker" style={{ left: '70%' }} />
          </div>
        )}
        <div className={`ws-tier ${isUnavailable ? 'low' : tier}`}>{score.label}</div>
      </div>

      <div className="ws-right">
        <p className="ws-insight">{score.insight}</p>

        {stats.length > 0 && (
          <div className="ws-stats">
            {stats.map((s, i) => (
              <span key={i} className="ws-stat">{s}</span>
            ))}
          </div>
        )}

        {milestone && (
          <p className="ws-next">{milestone}</p>
        )}

        {portfolio && portfolio.holdings.length > 0 && (
          <div className="ws-holdings">
            <span className="ws-holdings-label">DETECTED HOLDINGS:</span>
            <div className="ws-tokens">
              {portfolio.holdings.map(h => (
                <span key={h.symbol} className="ws-token">{h.symbol}</span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
