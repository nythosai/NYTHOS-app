import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import './WalletScore.css';

// ── Score breakdown calculator (mirrors backend formula) ──────────────────────
function getBreakdown(score, chain, txCount, balanceETH, ageMonths) {
  if (score == null) return null;
  const base = 30;

  if (chain === 'BASE' || chain === 'ETH') {
    const txScore      = Math.min((txCount ?? 0) * 3, 45);
    const balanceScore = (balanceETH ?? 0) >= 1   ? 20
                       : (balanceETH ?? 0) >= 0.1 ? 12
                       : (balanceETH ?? 0) > 0    ? 6
                       : 0;
    const ageScore     = Math.min((ageMonths ?? 0) * 1, 5);
    return [
      { label: 'Base',         value: base,         max: 30 },
      { label: 'TX Activity',  value: txScore,       max: 45 },
      { label: 'Balance',      value: balanceScore,  max: 20 },
      { label: 'Wallet Age',   value: ageScore,      max: 5  },
    ];
  }
  return null;
}

function getActions(score, chain, txCount, balanceETH, ageMonths) {
  if (score == null || score >= 100) return [];
  if (chain !== 'BASE' && chain !== 'ETH') return [];

  const currentTx  = txCount    ?? 0;
  const currentBal = balanceETH ?? 0;
  const currentAge = ageMonths  ?? 0;
  const actions = [];

  // TX activity — 3 pts each, cap 45
  const txScore     = Math.min(currentTx * 3, 45);
  const txPotential = 45 - txScore;
  if (txPotential > 0) {
    const targetScore  = score < 45 ? 45 : score < 70 ? 70 : 100;
    const needed       = Math.max(1, Math.min(Math.ceil((targetScore - score) / 3), Math.floor(txPotential / 3)));
    actions.push({ label: `Make ${needed} more tx${needed === 1 ? '' : 's'} on ${chain}`, gain: needed * 3, passive: false });
  }

  // Balance
  if (currentBal === 0)       actions.push({ label: 'Hold any ETH in wallet',  gain: 6,  passive: false });
  else if (currentBal < 0.1)  actions.push({ label: 'Hold at least 0.1 ETH',   gain: 6,  passive: false });
  else if (currentBal < 1)    actions.push({ label: 'Hold 1 ETH or more',       gain: 8,  passive: false });

  // Wallet age — passive
  const agePotential = Math.max(0, 5 - Math.min(currentAge, 5));
  if (agePotential > 0) {
    const mo = agePotential === 1 ? '1 month' : `${agePotential} months`;
    actions.push({ label: `Stay active ${mo} more`, gain: agePotential, passive: true });
  }

  actions.sort((a, b) => (a.passive ? 1 : 0) - (b.passive ? 1 : 0) || b.gain - a.gain);
  return actions.slice(0, 3);
}

function getNextMilestone(score, label, chain, txCount, balanceETH, ageMonths) {
  if (label === 'SMART MONEY') return null;
  if (chain === 'BASE') {
    const balanceScore = (balanceETH ?? 0) >= 1 ? 20 : (balanceETH ?? 0) >= 0.1 ? 12 : (balanceETH ?? 0) > 0 ? 6 : 0;
    if (label === 'NEWCOMER') {
      const needed = Math.max(1, Math.ceil((15 - balanceScore) / 3));
      return { text: `${needed} tx${needed === 1 ? '' : 's'} on Base reaches PARTICIPANT.`, from: score, to: 45 };
    }
    if (score < 70) {
      const needed = Math.ceil(Math.max(0, 40 - balanceScore) / 3);
      const more = Math.max(0, needed - (txCount ?? 0));
      if (more === 0) return { text: 'Building towards SMART MONEY.', from: score, to: 70 };
      return { text: `${more} more tx${more === 1 ? '' : 's'} on Base reaches SMART MONEY.`, from: score, to: 70 };
    }
  }
  if (score < 45) return { text: 'More on-chain activity needed to reach PARTICIPANT.', from: score, to: 45 };
  if (score < 70) return { text: 'Continued activity builds towards SMART MONEY.', from: score, to: 70 };
  return null;
}

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [displayed, setDisplayed] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target == null) { setDisplayed(0); return; }
    const start     = performance.now();
    const startVal  = 0;

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return displayed;
}

export default function WalletScore({ address, chain = 'BASE', onPortfolioLoad }) {
  const requestKey = address ? `${address.toLowerCase()}:${chain}` : '';
  const [requestState, setRequestState] = useState({ key: '', portfolio: null, score: null });
  const [barWidth, setBarWidth]         = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

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
        setRequestState({ key: requestKey, portfolio: nextPortfolio, score: scoreRes.data });
        if (onPortfolioLoad) onPortfolioLoad(nextPortfolio);
      })
      .catch(() => {
        if (!cancelled) {
          setRequestState({
            key: requestKey, portfolio: null,
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

  // Animate bar after score arrives — delay one frame so CSS transition fires
  useEffect(() => {
    if (score?.score != null) {
      setBarWidth(0);
      const id = setTimeout(() => setBarWidth(score.score), 60);
      return () => clearTimeout(id);
    } else {
      setBarWidth(0);
    }
  }, [score?.score]);

  const displayedScore = useCountUp(score?.score ?? null);

  if (loading) return <div className="ws-loading">NYTHOS is reading your wallet...</div>;
  if (!score)  return null;

  const tier          = score.score >= 70 ? 'high' : score.score >= 45 ? 'medium' : 'low';
  const isUnavailable = score.score === null;
  const milestone     = isUnavailable ? null : getNextMilestone(score.score, score.label, score.chain, score.txCount, score.balanceETH, score.ageMonths);
  const breakdown     = isUnavailable ? null : getBreakdown(score.score, score.chain, score.txCount, score.balanceETH, score.ageMonths);
  const actions       = isUnavailable ? []   : getActions(score.score, score.chain, score.txCount, score.balanceETH, score.ageMonths);

  // Milestone bar: progress from tier-floor to tier-ceiling
  const milestoneMin  = milestone?.from  ?? score.score;
  const milestoneTo   = milestone?.to    ?? 100;
  const tierFloor     = milestoneTo === 45 ? 0 : milestoneTo === 70 ? 45 : 70;
  const milestoneRange = milestoneTo - tierFloor;
  const milestonePct  = milestoneRange > 0 ? Math.min(100, Math.round(((score.score - tierFloor) / milestoneRange) * 100)) : 100;

  const stats = [];
  if (score.txCount  != null) stats.push(`${score.txCount} TXs`);
  if (score.balanceETH != null) stats.push(`${score.balanceETH} ETH`);
  if (score.ageMonths  != null && score.ageMonths > 0) stats.push(`${score.ageMonths}mo on-chain`);

  return (
    <div className={`wallet-score-card ${isUnavailable ? 'unavailable' : tier}`}>

      {/* ── LEFT: score ring area ── */}
      <div className="ws-left">
        <div className="ws-label">WALLET SCORE</div>

        {isUnavailable ? (
          <div className="ws-score low">—</div>
        ) : (
          <button
            className={`ws-score ${tier} ws-score-btn`}
            onClick={() => setShowBreakdown(s => !s)}
            title="Click to see score breakdown"
            aria-expanded={showBreakdown}
          >
            {displayedScore}
            <span className="ws-score-hint">{showBreakdown ? '▲' : '▼'}</span>
          </button>
        )}

        {!isUnavailable && (
          <div className="ws-bar-track">
            <div className={`ws-bar-fill ${tier}`} style={{ width: `${barWidth}%` }} />
            <div className="ws-bar-marker" style={{ left: '45%' }} data-tier="PARTICIPANT 45+" />
            <div className="ws-bar-marker" style={{ left: '70%' }} data-tier="SMART MONEY 70+" />
          </div>
        )}

        <div className={`ws-tier ${isUnavailable ? 'low' : tier}`}>{score.label}</div>
      </div>

      {/* ── RIGHT: insight + stats + milestone ── */}
      <div className="ws-right">
        <p className="ws-insight">{score.insight}</p>

        {stats.length > 0 && (
          <div className="ws-stats">
            {stats.map((s, i) => <span key={i} className="ws-stat">{s}</span>)}
          </div>
        )}

        {/* Score breakdown drawer */}
        {showBreakdown && breakdown && (
          <div className="ws-breakdown">
            <div className="ws-breakdown-title">SCORE BREAKDOWN</div>
            {breakdown.map(row => (
              <div key={row.label} className="ws-breakdown-row">
                <span className="ws-breakdown-label">{row.label}</span>
                <div className="ws-breakdown-bar-track">
                  <div
                    className={`ws-breakdown-bar-fill ${tier}`}
                    style={{ width: `${(row.value / row.max) * 100}%` }}
                  />
                </div>
                <span className="ws-breakdown-val">{row.value}<span className="ws-breakdown-max">/{row.max}</span></span>
              </div>
            ))}

            {actions.length > 0 && (
              <>
                <div className="ws-breakdown-divider" />
                <div className="ws-breakdown-title">HOW TO IMPROVE</div>
                {actions.map((a, i) => (
                  <div key={i} className={`ws-action-row${a.passive ? ' passive' : ''}`}>
                    <span className="ws-action-label">{a.label}</span>
                    <span className="ws-action-gain">+{a.gain} pts</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Milestone progress */}
        {milestone && (
          <div className="ws-milestone">
            <div className="ws-milestone-bar-track">
              <div className={`ws-milestone-bar-fill ${tier}`} style={{ width: `${milestonePct}%` }} />
            </div>
            <p className="ws-next">
              <span className="ws-milestone-pct">{milestonePct}%</span>
              {' '}{milestone.text}
            </p>
          </div>
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
