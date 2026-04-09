import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import SignalCard from './SignalCard';
import './AskWidget.css';

export default function AskWidget({ tier, onWhaleClick }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // { type: 'user'|'result'|'error', text?, signals?, count?, interpretation? }
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Focus input whenever panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Scroll to bottom after new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = question.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { type: 'user', text }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/api/signals/query', { question: text });
      const { signals = [], count = 0, interpretation } = res.data;
      setMessages(prev => [...prev, { type: 'result', signals, count, interpretation }]);
    } catch {
      setMessages(prev => [...prev, { type: 'error', text: 'Query failed. Try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const SUGGESTIONS = [
    'High confidence whale moves today',
    'DEX buys on Base in the last 6 hours',
    'BTC whale activity this week',
    'Emerging narratives detected recently',
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={`ask-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label="Ask NYTHOS"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <span className="ask-trigger-label">ASK</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="ask-panel">
          <div className="ask-panel-header">
            <span className="ask-panel-title">ASK NYTHOS</span>
            <span className="ask-panel-sub">Query the signal database in plain English</span>
          </div>

          <div className="ask-messages">
            {messages.length === 0 && (
              <div className="ask-suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="ask-suggest" onClick={() => { setQuestion(s); inputRef.current?.focus(); }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.type === 'user') {
                return (
                  <div key={i} className="ask-msg ask-msg-user">
                    <span>{msg.text}</span>
                  </div>
                );
              }
              if (msg.type === 'error') {
                return (
                  <div key={i} className="ask-msg ask-msg-error">{msg.text}</div>
                );
              }
              // result
              return (
                <div key={i} className="ask-msg ask-msg-result">
                  {msg.interpretation && (
                    <p className="ask-interp">{msg.interpretation}</p>
                  )}
                  <p className="ask-count">
                    {msg.count === 0
                      ? 'No signals matched.'
                      : `${msg.count} signal${msg.count === 1 ? '' : 's'} found`}
                  </p>
                  {msg.signals?.length > 0 && (
                    <div className="ask-results">
                      {msg.signals.map(signal => (
                        <SignalCard
                          key={signal.id}
                          signal={signal}
                          tier={tier}
                          onWhaleClick={addr => { onWhaleClick?.(addr); setOpen(false); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="ask-msg ask-msg-loading">
                <span className="ask-loading-dots"><span /><span /><span /></span>
                Reading the chain...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="ask-input-row">
            <input
              ref={inputRef}
              className="ask-input"
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. whale moves on Base today..."
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              className="ask-send"
              onClick={send}
              disabled={loading || !question.trim()}
              aria-label="Send"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
