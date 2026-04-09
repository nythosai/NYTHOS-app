import React, { useState, useRef } from 'react';
import api from '../api';
import SignalCard from '../components/SignalCard';
import './QueryPage.css';

const SUGGESTIONS = [
  'High confidence whale moves on Base in the last 24 hours',
  'Show me DEX buys from the last 48 hours',
  'BTC whale activity this week with score above 70',
  'Emerging narratives detected recently',
  'Bridge flows into Base in the last 12 hours',
  'High risk launch signals on Base',
];

export default function QueryPage({ tier, onWhaleClick }) {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function runQuery(q) {
    const text = (q || question).trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/api/signals/query', { question: text });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Query failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runQuery();
  }

  function applySuggestion(s) {
    setQuestion(s);
    runQuery(s);
  }

  return (
    <div className="query-page">
      <div className="query-header">
        <h2 className="query-title">ASK NYTHOS</h2>
        <p className="query-sub">
          Ask anything about on-chain signals in plain English. NYTHOS reads your question and searches the intelligence database.
        </p>
      </div>

      <form className="query-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="query-input"
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g. High confidence whale moves on Base today..."
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
        />
        <button className="query-submit" type="submit" disabled={loading || !question.trim()}>
          {loading ? 'READING...' : 'QUERY'}
        </button>
      </form>

      {!result && !loading && !error && (
        <div className="query-suggestions">
          <p className="query-suggest-label">Try one of these:</p>
          <div className="query-suggest-list">
            {SUGGESTIONS.map(s => (
              <button key={s} className="query-suggest-btn" type="button" onClick={() => applySuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="query-error">{error}</div>
      )}

      {result && (
        <div className="query-results">
          {result.interpretation && (
            <div className="query-interpretation">
              <span className="query-interp-label">NYTHOS READ:</span>
              <span className="query-interp-text">{result.interpretation}</span>
            </div>
          )}

          <div className="query-count">
            {result.count === 0
              ? 'No signals matched. Try a different query.'
              : `${result.count} signal${result.count === 1 ? '' : 's'} found.`}
          </div>

          {result.signals?.length > 0 && (
            <div className="query-feed">
              {result.signals.map(signal => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  tier={tier}
                  onWhaleClick={onWhaleClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
