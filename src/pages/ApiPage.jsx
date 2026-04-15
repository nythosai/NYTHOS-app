import React, { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import api from '../api';
import { API_URL } from '../config';
import { useWalletSession } from '../hooks/useWalletSession';
import './ApiPage.css';

const BACKEND_URL = API_URL;

export default function ApiPage({ tier }) {
  const { address } = useAccount();
  const { ensureSession, hasSession } = useWalletSession();
  const [keys, setKeys]           = useState([]);
  const [newKey, setNewKey]       = useState('');
  const [generating, setGen]      = useState(false);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState('');

  const loadKeys = useCallback(async () => {
    if (!address) return;
    try {
      const r = await api.get(`/api/keys/${address}`);
      setKeys(r.data.keys || []);
    } catch {
      // ignore
    }
  }, [address]);

  useEffect(() => {
    if (address && hasSession) loadKeys();
    if (!hasSession) setKeys([]);
  }, [address, hasSession, loadKeys]);

  async function generate() {
    setError(''); setGen(true);
    try {
      await ensureSession();
      const r = await api.post('/api/keys/generate', {
        ownerAddress: address,
      });
      setNewKey(r.data.key);
      loadKeys();
    } catch (err) {
      setError(err?.response?.data?.message || err?.shortMessage || err?.message || 'Could not generate key.');
    } finally { setGen(false); }
  }

  async function revoke(id) {
    try {
      await ensureSession();
      await api.delete(`/api/keys/${id}`, { params: { ownerAddress: address } });
      setKeys(k => k.filter(x => x._id !== id));
      setNewKey('');
    } catch { setError('Could not revoke key.'); }
  }

  async function verifyWallet() {
    setError('');
    try {
      await ensureSession();
      await loadKeys();
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Wallet verification was cancelled.');
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(newKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const LIMITS = { OBSERVER: 200, PARTICIPANT: 2000, SMART_MONEY: 'Unlimited' };
  const limit  = LIMITS[tier?.name] || 200;

  return (
    <div className="api-page">
      <div className="api-hero">
        <p>Access NYTHOS signals from your own apps, bots and scripts via API key.</p>
      </div>

      <div className="api-limits">
        <div className="apl-item">
          <span>OBSERVER</span>
          <span>200 req/day</span>
        </div>
        <div className="apl-item">
          <span>PARTICIPANT</span>
          <span>2,000 req/day</span>
        </div>
        <div className={`apl-item ${tier?.name === 'SMART_MONEY' ? 'active' : ''}`}>
          <span>SMART MONEY</span>
          <span>Unlimited</span>
        </div>
        <div className="apl-current">
          Your limit: <strong>{limit} req/day</strong>
        </div>
      </div>

      {!address ? (
        <div className="api-connect-msg">Connect your wallet to generate an API key.</div>
      ) : !hasSession ? (
        <div className="api-connect-msg">
          <div>Verify your wallet to manage developer keys.</div>
          <button className="api-generate-btn" onClick={verifyWallet}>Verify Wallet</button>
        </div>
      ) : (
        <>
          {newKey && (
            <div className="api-key-reveal">
              <div className="akr-label">YOUR API KEY. Save this now, it won't be shown again</div>
              <div className="akr-key">
                <code>{newKey}</code>
                <button className="akr-copy" onClick={copyKey}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {keys.length === 0 ? (
            <button className="api-generate-btn" onClick={generate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate API Key'}
            </button>
          ) : (
            <div className="api-key-list">
              {keys.map(k => (
                <div key={k._id} className="api-key-item">
                  <div className="aki-left">
                    <code className="aki-prefix">{k.keyPrefix}</code>
                    <div className="aki-stats">
                      <span>{k.requestsToday} today</span>
                      <span>{k.requestCount} total</span>
                      <span>Tier: {k.tier}</span>
                    </div>
                  </div>
                  <button className="aki-revoke" onClick={() => revoke(k._id)}>Revoke</button>
                </div>
              ))}
            </div>
          )}

          {error && <div className="api-error">{error}</div>}
        </>
      )}

      {!hasSession && error && <div className="api-error">{error}</div>}

      <div className="api-docs">
        <div className="docs-title">USAGE</div>

        <div className="docs-section">
          <div className="docs-sub">Get live signals</div>
          <pre>{`curl -H "x-api-key: YOUR_KEY" ${BACKEND_URL}/api/developer/signals`}</pre>
        </div>

        <div className="docs-section">
          <div className="docs-sub">Get signal history (with filters)</div>
          <pre>{`curl -H "x-api-key: YOUR_KEY" "${BACKEND_URL}/api/developer/signals/history?confidence=HIGH&chain=BASE&limit=50"`}</pre>
        </div>

        <div className="docs-section">
          <div className="docs-sub">Get token prices</div>
          <pre>{`curl -H "x-api-key: YOUR_KEY" ${BACKEND_URL}/api/developer/signals/prices`}</pre>
        </div>

        <div className="docs-section">
          <div className="docs-sub">Session protected key management</div>
          <pre>{`1. Connect wallet\n2. Verify wallet signature once\n3. Generate and use your key in headers`}</pre>
        </div>

        <div className="docs-section">
          <div className="docs-sub">Response format</div>
          <pre>{`{
  "status": "OK",
  "signals": [
    {
      "id": "whale_0xabc...",
      "type": "WHALE_ACTIVITY",
      "token": "ETH",
      "amountUSD": 2500000,
      "confidence": "HIGH",
      "score": 88,
      "timestamp": 1710000000,
      "description": "2,500 ETH moved..."
    }
  ]
}`}</pre>
        </div>
      </div>
    </div>
  );
}
