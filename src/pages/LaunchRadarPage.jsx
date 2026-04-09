import React, { useCallback, useEffect, useRef, useState } from 'react';
import SignalCard from '../components/SignalCard';
import './LaunchRadarPage.css';
import api from '../api';

const CONFIDENCES = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
const RISKS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
const RECENCY = [
  { label: '24H', value: 24 },
  { label: '72H', value: 72 },
  { label: '7D', value: 168 },
];

export default function LaunchRadarPage({ tier, onWhaleClick }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confidence, setConfidence] = useState('ALL');
  const [risk, setRisk] = useState('ALL');
  const [recencyHours, setRecencyHours] = useState(72);
  const searchRef = useRef(search);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const loadSignals = useCallback(async (searchValue = searchRef.current) => {
    setLoading(true);
    try {
      const params = { recencyHours };
      if (confidence !== 'ALL') params.confidence = confidence;
      if (risk !== 'ALL') params.risk = risk;
      if (searchValue.trim()) params.search = searchValue.trim();

      const res = await api.get('/api/signals/launch-radar', { params });
      setSignals(res.data.signals || []);
    } catch {
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [recencyHours, confidence, risk]);

  useEffect(() => {
    loadSignals();
  }, [loadSignals]);

  function handleSearch(e) {
    e.preventDefault();
    loadSignals(search);
  }

  const launches = signals.filter(signal => signal.type === 'POOL_LAUNCH').length;
  const smartEntries = signals.filter(signal => signal.type === 'LAUNCH_SMART_ENTRY').length;
  const riskSignals = signals.filter(signal => signal.type === 'LAUNCH_RISK').length;

  return (
    <div className="launch-radar-page">
      <div className="launch-radar-hero">
        <div className="launch-radar-title">Base Launch Radar</div>
        <p>Fresh Base pools, early smart-wallet entries, and launch risk signals in one feed.</p>
      </div>

      <div className="launch-radar-stats">
        <div className="launch-stat">
          <span>{launches}</span>
          <span>Fresh launches</span>
        </div>
        <div className="launch-stat">
          <span>{smartEntries}</span>
          <span>Smart entries</span>
        </div>
        <div className="launch-stat">
          <span>{riskSignals}</span>
          <span>Risk events</span>
        </div>
      </div>

      <form className="launch-radar-search" onSubmit={handleSearch}>
        <input
          className="launch-radar-input"
          type="text"
          placeholder="Search token, market, or launch context"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="launch-radar-btn" type="submit">SEARCH</button>
      </form>

      <div className="launch-radar-filters">
        <div className="launch-filter-group">
          <span>Recency</span>
          <div className="launch-filter-row">
            {RECENCY.map(item => (
              <button
                key={item.value}
                className={`launch-filter-btn ${recencyHours === item.value ? 'active' : ''}`}
                onClick={() => setRecencyHours(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="launch-filter-group">
          <span>Confidence</span>
          <div className="launch-filter-row">
            {CONFIDENCES.map(item => (
              <button
                key={item}
                className={`launch-filter-btn ${confidence === item ? 'active' : ''}`}
                onClick={() => setConfidence(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="launch-filter-group">
          <span>Risk</span>
          <div className="launch-filter-row">
            {RISKS.map(item => (
              <button
                key={item}
                className={`launch-filter-btn ${risk === item ? 'active' : ''}`}
                onClick={() => setRisk(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="launch-radar-empty">Loading launch radar...</div>
      ) : signals.length === 0 ? (
        <div className="launch-radar-empty">No launch activity matched these filters.</div>
      ) : (
        <div className="launch-radar-feed">
          {signals.map(signal => (
            <SignalCard key={signal.id} signal={signal} tier={tier} onWhaleClick={onWhaleClick} />
          ))}
        </div>
      )}
    </div>
  );
}
