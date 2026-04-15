import React from 'react';
import './TierBadge.css';
import { TIERS } from '../config';

/**
 * Shows the user's current tier as a small badge.
 * Clicking it opens a tooltip explaining the tiers.
 */
export default function TierBadge({ tier, balanceNYT }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    function handleOutside(e) {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className="tier-badge-wrap" ref={wrapRef}>
      <button
        className={`tier-badge tier-${tier.name.toLowerCase()}`}
        onClick={() => setOpen(o => !o)}
        title="View tier info"
      >
        {tier.name === 'SMART_MONEY' ? 'SMART MONEY' : tier.name}
      </button>

      {open && (
        <div className="tier-tooltip">
          <div className="tier-tooltip-title">Your Tier</div>
          <div className="tier-tooltip-bal">
            {balanceNYT.toLocaleString()} <span>$NYT</span>
          </div>

          <div className="tier-rows">
            {Object.values(TIERS).map(t => (
              <div key={t.name} className={`tier-row ${tier.name === t.name ? 'active' : ''}`}>
                <span className={`tier-dot tier-dot-${t.name.toLowerCase()}`} />
                <span className="tier-row-name">{t.name === 'SMART_MONEY' ? 'SMART MONEY' : t.name}</span>
                <span className="tier-row-req">
                  {t.min === 0 ? 'Free' : `${t.min.toLocaleString()}+ NYT`}
                </span>
              </div>
            ))}
          </div>

          <div className="tier-perks">
            {tier.name === 'OBSERVER' && (
              <>
                <div className="tier-perk">✓ Last 5 signals (15 min delay)</div>
                <div className="tier-perk locked">✗ AI posts (Participant+)</div>
                <div className="tier-perk locked">✗ Full feed (Participant+)</div>
                <div className="tier-perk locked">✗ Whale tracking (Smart Money)</div>
              </>
            )}
            {tier.name === 'PARTICIPANT' && (
              <>
                <div className="tier-perk">✓ Real-time signal feed</div>
                <div className="tier-perk">✓ AI posts + copy</div>
                <div className="tier-perk">✓ Wallet scoring</div>
                <div className="tier-perk locked">✗ Whale tracking (Smart Money)</div>
              </>
            )}
            {tier.name === 'SMART_MONEY' && (
              <>
                <div className="tier-perk">✓ Real-time signal feed</div>
                <div className="tier-perk">✓ AI posts + copy</div>
                <div className="tier-perk">✓ Custom wallet tracking</div>
                <div className="tier-perk">✓ Revenue share staking</div>
              </>
            )}
          </div>

          {tier.name === 'OBSERVER' && (
            <div className="tier-upgrade">
              Hold 100+ $NYT to unlock Participant tier
            </div>
          )}
        </div>
      )}
    </div>
  );
}
