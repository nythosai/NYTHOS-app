import React, { useEffect, useState } from 'react';
import api from '../api';
import './WalletScore.css';

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
            score: null,
          });
          if (onPortfolioLoad) onPortfolioLoad(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, chain, onPortfolioLoad, requestKey]);

  const score = requestState.key === requestKey ? requestState.score : null;
  const portfolio = requestState.key === requestKey ? requestState.portfolio : null;
  const loading = Boolean(address) && requestState.key !== requestKey;

  if (loading) return <div className="ws-loading">NYTHOS is reading your wallet...</div>;
  if (!score) return null;

  const tier = score.score >= 70 ? 'high' : score.score >= 45 ? 'medium' : 'low';

  return (
    <div className={`wallet-score-card ${tier}`}>
      <div className="ws-left">
        <div className="ws-label">WALLET SCORE</div>
        <div className={`ws-score ${tier}`}>{score.score}</div>
        <div className={`ws-tier ${tier}`}>{score.label}</div>
      </div>
      <div className="ws-right">
        <p className="ws-insight">{score.insight}</p>
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
