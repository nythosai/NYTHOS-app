import React, { useEffect, useState } from 'react';
import api from '../api';
import './AccuracyStats.css';

export default function AccuracyStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/api/accuracy/stats')
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  if (!stats?.overall) return null;
  const { rate24h, total24h } = stats.overall;
  if (total24h < 3) return null; // not enough data yet

  const cls = rate24h >= 65 ? 'high' : rate24h >= 50 ? 'med' : 'low';

  return (
    <div className="accuracy-bar">
      <span className="acc-label">NYTHOS ACCURACY</span>
      <div className="acc-tokens">
        {stats.byToken.map(t => (
          <span key={t.token} className={`acc-token ${t.rate >= 60 ? 'hit' : 'miss'}`}>
            {t.token} {t.rate}%
          </span>
        ))}
      </div>
      <span className={`acc-rate ${cls}`}>{rate24h}% 24h</span>
      <span className="acc-sample">{total24h} signals tracked</span>
    </div>
  );
}
