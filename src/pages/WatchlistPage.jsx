import React, { useCallback, useEffect, useState } from 'react';
import api from '../api';
import TierGate from '../components/TierGate';
import { useWalletSession } from '../hooks/useWalletSession';
import './WatchlistPage.css';

const CHAIN_OPTIONS = ['ETH', 'BASE'];

export default function WatchlistPage({ address, tier }) {
  const { ensureSession, hasSession } = useWalletSession();
  const [wallets, setWallets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [watchAddr, setWatchAddr]   = useState('');
  const [watchLabel, setWatchLabel] = useState('');
  const [watchChain, setWatchChain] = useState('ETH');
  const [adding, setAdding]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const loadWallets = useCallback(async () => {
    if (!address) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/api/watchlist/${address}`);
      setWallets(res.data.wallets || []);
    } catch {
      setError('Could not load watchlist.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address && hasSession) {
      loadWallets();
    } else {
      setWallets([]);
      setLoading(false);
    }
  }, [address, hasSession, loadWallets]);

  async function addWallet(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!watchAddr.trim()) return;
    setAdding(true);
    try {
      await ensureSession();
      await api.post('/api/watchlist', {
        ownerAddress: address,
        watchAddress: watchAddr.trim(),
        label: watchLabel.trim(),
        chain: watchChain,
      });
      setSuccess('Wallet added. NYTHOS will alert you on any movement.');
      setWatchAddr('');
      setWatchLabel('');
      await loadWallets();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add wallet.');
    } finally {
      setAdding(false);
    }
  }

  async function removeWallet(id) {
    try {
      await ensureSession();
      await api.delete(`/api/watchlist/${id}`, { params: { ownerAddress: address } });
      setWallets(w => w.filter(x => x._id !== id));
    } catch {
      setError('Could not remove wallet.');
    }
  }

  async function verifyWallet() {
    setError('');
    try {
      await ensureSession();
      await loadWallets();
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Wallet verification was cancelled.');
    }
  }

  const content = (
    <div className="watchlist-page">
      <div className="wl-hero">
        <p>
          Add up to 10 wallets. NYTHOS will alert you in the signal feed every
          time they move funds on ETH or Base.
        </p>
        <div className="wl-tier-note">{hasSession ? 'VERIFIED SESSION ACTIVE' : 'VERIFY WALLET TO MANAGE WATCHLIST'}</div>
      </div>

      {/* Add wallet form */}
      <div className="wl-add-card">
        <div className="wl-add-title">Track a New Wallet</div>
        {!hasSession && address && (
          <button type="button" className="wl-submit" onClick={verifyWallet}>
            VERIFY WALLET
          </button>
        )}
        <form className="wl-form" onSubmit={addWallet}>
          <input
            className="wl-input"
            type="text"
            placeholder="0x wallet address to watch"
            value={watchAddr}
            onChange={e => setWatchAddr(e.target.value)}
            required
          />
          <input
            className="wl-input"
            type="text"
            placeholder="Nickname (optional), for example Vitalik"
            value={watchLabel}
            onChange={e => setWatchLabel(e.target.value)}
          />
          <div className="wl-chain-row">
            <span className="wl-chain-label">Chain:</span>
            {CHAIN_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                className={`wl-chain-btn ${watchChain === c ? 'active' : ''}`}
                onClick={() => setWatchChain(c)}
              >{c}</button>
            ))}
          </div>
          <button type="submit" className="wl-submit" disabled={adding || !hasSession}>
            {adding ? 'ADDING...' : 'ADD WALLET'}
          </button>
        </form>
        {error   && <div className="wl-error">{error}</div>}
        {success && <div className="wl-success">{success}</div>}
      </div>

      {/* Watched wallets list */}
      <div className="wl-list-header">
        <span className="wl-list-title">WATCHING ({wallets.length}/10)</span>
      </div>

      {loading ? (
        <div className="wl-empty">Loading watchlist...</div>
      ) : wallets.length === 0 ? (
        <div className="wl-empty">
          No wallets tracked yet. Add one above to get started.
        </div>
      ) : (
        <div className="wl-list">
          {wallets.map(w => (
            <div key={w._id} className="wl-row">
              <div className="wl-row-info">
                <span className="wl-row-label">{w.label || 'Unnamed Wallet'}</span>
                <span className="wl-row-addr">{w.watchAddress}</span>
              </div>
              <div className="wl-row-right">
                <span className={`wl-row-chain ${w.chain.toLowerCase()}`}>{w.chain}</span>
                <button className="wl-remove" onClick={() => removeWallet(w._id)} title="Stop watching">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="wl-note">
        Alerts appear in your Signal Feed when a watched wallet moves funds.
        Alerts are private. Only visible to you.
      </div>
    </div>
  );

  return (
    <TierGate
      required="SMART_MONEY"
      tier={tier}
      message="Custom wallet tracking is exclusive to Smart Money tier. Hold 5,000+ $NYT to unlock."
    >
      {content}
    </TierGate>
  );
}
