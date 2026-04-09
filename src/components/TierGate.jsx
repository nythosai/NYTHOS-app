import React from 'react';
import './TierGate.css';

/**
 * Wraps content that requires a minimum tier.
 * If the user's tier is below the required tier, shows a lock overlay.
 *
 * Usage:
 *   <TierGate required="PRO" tier={tier} message="Full signal feed requires Pro tier.">
 *     ... content ...
 *   </TierGate>
 */
export default function TierGate({ required, tier, message, children }) {
  const ORDER = { OBSERVER: 0, PARTICIPANT: 1, SMART_MONEY: 2 };
  const hasAccess = ORDER[tier.name] >= ORDER[required];

  const DISPLAY = { OBSERVER: 'OBSERVER', PARTICIPANT: 'PARTICIPANT', SMART_MONEY: 'SMART MONEY' };
  const HINT = {
    PARTICIPANT: 'Hold 100+ $NYT to unlock',
    SMART_MONEY: 'Hold 5,000+ $NYT to unlock',
  };

  if (hasAccess) return children;

  return (
    <div className="tier-gate">
      <div className="tier-gate-blur">{children}</div>
      <div className="tier-gate-overlay">
        <div className="tier-gate-lock">◈</div>
        <div className="tier-gate-label">{DISPLAY[required] || required} TIER REQUIRED</div>
        <div className="tier-gate-msg">{message || `This feature requires ${DISPLAY[required] || required} tier.`}</div>
        <div className="tier-gate-hint">{HINT[required] || ''}</div>
      </div>
    </div>
  );
}
