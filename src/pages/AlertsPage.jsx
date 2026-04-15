import React, { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import api from '../api';
import { useWalletSession } from '../hooks/useWalletSession';
import './AlertsPage.css';

const TOKENS = ['ETH', 'BTC'];
const DIRECTIONS = ['above', 'below'];
const CONFIDENCE_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
const DELIVERY_TYPES = [
  { value: 'PRICE_ALERT', label: 'Price alerts' },
  { value: 'WATCHED_WALLET', label: 'Watched wallets' },
  { value: 'BRIDGE_FLOW', label: 'Bridge flow' },
  { value: 'DEX_SWAP', label: 'DEX swaps' },
  { value: 'LIQUIDITY_FLOW', label: 'Liquidity' },
  { value: 'POOL_LAUNCH', label: 'Pool launches' },
  { value: 'LAUNCH_SMART_ENTRY', label: 'Smart entries' },
  { value: 'LAUNCH_RISK', label: 'Launch risk' },
];
const DELIVERY_CHAINS = ['ETH', 'BTC', 'BASE'];

function splitCommaValues(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export default function AlertsPage({ prices }) {
  const { address } = useAccount();
  const { ensureSession, hasSession } = useWalletSession();
  const [alerts, setAlerts] = useState([]);
  const [token, setToken] = useState('ETH');
  const [direction, setDirection] = useState('above');
  const [targetPrice, setTarget] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
  const [digestHourUtc, setDigestHourUtc] = useState('8');
  const [minimumConfidence, setMinimumConfidence] = useState('MEDIUM');
  const [deliveryTypes, setDeliveryTypes] = useState(['PRICE_ALERT', 'WATCHED_WALLET', 'POOL_LAUNCH', 'LAUNCH_SMART_ENTRY', 'LAUNCH_RISK']);
  const [deliveryChains, setDeliveryChains] = useState([]);
  const [trackedTokens, setTrackedTokens] = useState('');
  const [trackedAddresses, setTrackedAddresses] = useState('');
  const [quietHoursStart, setQuietHoursStart] = useState('');
  const [quietHoursEnd, setQuietHoursEnd] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [deliverySuccess, setDeliverySuccess] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);

  const loadAlerts = useCallback(async () => {
    if (!address) return;
    try {
      const r = await api.get(`/api/alerts/${address}`);
      setAlerts(r.data.alerts || []);
    } catch {
      // ignore
    }
  }, [address]);

  const loadDelivery = useCallback(async () => {
    if (!address) return;
    try {
      const r = await api.get(`/api/delivery/${address}`);
      const settings = r.data.settings || {};
      setDeliveryEnabled(settings.enabled !== false);
      setTelegramChatId(settings.telegramChatId || '');
      setWebhookUrl(settings.webhookUrl || '');
      setWebhookSecret(settings.webhookSecret || '');
      setEmailAddress(settings.emailAddress || '');
      setEmailDigestEnabled(settings.emailDigestEnabled === true);
      setDigestHourUtc(settings.digestHourUtc ?? 8);
      setMinimumConfidence(settings.minimumConfidence || 'MEDIUM');
      setDeliveryTypes(Array.isArray(settings.signalTypes) && settings.signalTypes.length > 0
        ? settings.signalTypes
        : ['PRICE_ALERT', 'WATCHED_WALLET', 'POOL_LAUNCH', 'LAUNCH_SMART_ENTRY', 'LAUNCH_RISK']);
      setDeliveryChains(Array.isArray(settings.chains) ? settings.chains : []);
      setTrackedTokens(Array.isArray(settings.trackedTokens) ? settings.trackedTokens.join(', ') : '');
      setTrackedAddresses(Array.isArray(settings.trackedAddresses) ? settings.trackedAddresses.join(', ') : '');
      setQuietHoursStart(settings.quietHoursStart ?? '');
      setQuietHoursEnd(settings.quietHoursEnd ?? '');
    } catch {
      // ignore
    }
  }, [address]);

  useEffect(() => {
    if (address && hasSession) {
      loadAlerts();
      loadDelivery();
    }
    if (!hasSession) setAlerts([]);
  }, [address, hasSession, loadAlerts, loadDelivery]);

  async function addAlert(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!address) return setError('Connect your wallet first.');
    if (!targetPrice || parseFloat(targetPrice) <= 0) return setError('Enter a valid price.');
    setAdding(true);
    try {
      await ensureSession();
      await api.post('/api/alerts', {
        ownerAddress: address,
        token,
        direction,
        targetPrice: parseFloat(targetPrice),
      });
      setSuccess(`Alert set: ${token} ${direction} $${parseFloat(targetPrice).toLocaleString()}. It will show up in your private NYTHOS feed when triggered.`);
      setTarget('');
      loadAlerts();
    } catch (err) {
      setError(err?.response?.data?.message || err?.shortMessage || err?.message || 'Could not create alert.');
    } finally {
      setAdding(false);
    }
  }

  async function deleteAlert(id) {
    try {
      await ensureSession();
      await api.delete(`/api/alerts/${id}`, { params: { ownerAddress: address } });
      setAlerts(current => current.filter(item => item._id !== id));
    } catch {
      setError('Could not delete alert.');
    }
  }

  async function verifyWallet() {
    setError('');
    setDeliveryError('');
    try {
      await ensureSession();
      await Promise.all([loadAlerts(), loadDelivery()]);
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Wallet verification was cancelled.');
    }
  }

  function toggleDeliveryType(type) {
    setDeliveryTypes(current => (
      current.includes(type)
        ? current.filter(value => value !== type)
        : [...current, type]
    ));
  }

  function toggleDeliveryChain(chain) {
    setDeliveryChains(current => (
      current.includes(chain)
        ? current.filter(value => value !== chain)
        : [...current, chain]
    ));
  }

  async function saveDelivery(e) {
    e.preventDefault();
    setDeliveryError('');
    setDeliverySuccess('');
    if (!address) return setDeliveryError('Connect your wallet first.');

    try {
      setSavingDelivery(true);
      await ensureSession();
      await api.post('/api/delivery', {
        ownerAddress: address,
        enabled: deliveryEnabled,
        telegramChatId,
        webhookUrl,
        webhookSecret,
        emailAddress,
        emailDigestEnabled,
        digestHourUtc: digestHourUtc === '' ? null : Number(digestHourUtc),
        minimumConfidence,
        signalTypes: deliveryTypes,
        chains: deliveryChains,
        trackedTokens: splitCommaValues(trackedTokens),
        trackedAddresses: splitCommaValues(trackedAddresses),
        quietHoursStart: quietHoursStart === '' ? null : Number(quietHoursStart),
        quietHoursEnd: quietHoursEnd === '' ? null : Number(quietHoursEnd),
      });
      setDeliverySuccess('Private delivery settings saved. NYTHOS will use them for launch radar, smart entries, bridge flow, and your other private alerts.');
      await loadDelivery();
    } catch (err) {
      setDeliveryError(err?.response?.data?.message || err?.shortMessage || err?.message || 'Could not save delivery settings.');
    } finally {
      setSavingDelivery(false);
    }
  }

  const active = alerts.filter(alert => alert.active);
  const triggered = alerts.filter(alert => !alert.active && alert.triggeredAt);

  const currentPrice = token === 'ETH' ? prices?.ETH?.price : prices?.BTC?.price;

  return (
    <div className="alerts-page">
      <div className="alerts-hero">
        <p>Get private NYTHOS alerts the moment ETH or BTC hits your target, then route launch radar, Base flow, and watched-wallet intelligence to Telegram or your own webhook.</p>
      </div>

      <form className="alert-form" onSubmit={addAlert}>
        <div className="af-row">
          <div className="af-group">
            <label>Token</label>
            <div className="af-toggle">
              {TOKENS.map(item => (
                <button
                  key={item}
                  type="button"
                  className={token === item ? 'active' : ''}
                  onClick={() => setToken(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="af-group">
            <label>Condition</label>
            <div className="af-toggle">
              {DIRECTIONS.map(item => (
                <button
                  key={item}
                  type="button"
                  className={direction === item ? 'active' : ''}
                  onClick={() => setDirection(item)}
                >
                  {item === 'above' ? '▲ Above' : '▼ Below'}
                </button>
              ))}
            </div>
          </div>

          <div className="af-group">
            <label>
              Target Price
              {currentPrice && <span className="af-current"> (now ${currentPrice.toLocaleString()})</span>}
            </label>
            <input
              type="number"
              placeholder="e.g. 4000"
              value={targetPrice}
              onChange={e => setTarget(e.target.value)}
              min="0"
              step="any"
              className="af-input"
            />
          </div>

          <button type="submit" className="af-submit" disabled={adding || !address || !hasSession}>
            {adding ? '...' : 'SET ALERT'}
          </button>
        </div>

        {error && <div className="af-error">{error}</div>}
        {success && <div className="af-success">{success}</div>}
        {!address && <div className="af-error">Connect your wallet to set alerts.</div>}
        {address && !hasSession && (
          <button type="button" className="af-submit" onClick={verifyWallet}>
            VERIFY WALLET
          </button>
        )}
      </form>

      <form className="alert-form" onSubmit={saveDelivery}>
        <div className="delivery-header">
          <div>
            <div className="as-title">PRIVATE DELIVERY</div>
            <p className="delivery-copy">Tune delivery by confidence, chain, signal class, token, contract, or wallet. Use quiet hours when you want intelligence without constant pings.</p>
          </div>
          <label className="delivery-switch">
            <input
              type="checkbox"
              checked={deliveryEnabled}
              onChange={e => setDeliveryEnabled(e.target.checked)}
            />
            <span>Enabled</span>
          </label>
        </div>

        <div className="delivery-grid">
          <div className="af-group delivery-field">
            <label>Telegram Chat ID</label>
            <input
              type="text"
              className="af-input delivery-input"
              placeholder="e.g. 123456789"
              value={telegramChatId}
              onChange={e => setTelegramChatId(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field">
            <label>Webhook URL</label>
            <input
              type="url"
              className="af-input delivery-input wide"
              placeholder="https://example.com/nythos"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field">
            <label>Webhook Secret</label>
            <input
              type="text"
              className="af-input delivery-input wide"
              placeholder="Optional shared secret"
              value={webhookSecret}
              onChange={e => setWebhookSecret(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field">
            <label>Email Digest Address</label>
            <input
              type="email"
              className="af-input delivery-input wide"
              placeholder="you@example.com"
              value={emailAddress}
              onChange={e => setEmailAddress(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field">
            <label>Digest Hour (UTC)</label>
            <input
              type="number"
              min="0"
              max="23"
              className="af-input delivery-input"
              placeholder="8"
              value={digestHourUtc}
              onChange={e => setDigestHourUtc(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field full">
            <label className="delivery-switch">
              <input
                type="checkbox"
                checked={emailDigestEnabled}
                onChange={e => setEmailDigestEnabled(e.target.checked)}
              />
              <span>Send a daily email digest instead of relying only on real time delivery</span>
            </label>
          </div>

          <div className="af-group delivery-field">
            <label>Minimum Confidence</label>
            <div className="af-toggle">
              {CONFIDENCE_LEVELS.map(level => (
                <button
                  key={level}
                  type="button"
                  className={minimumConfidence === level ? 'active' : ''}
                  onClick={() => setMinimumConfidence(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="af-group delivery-field full">
            <label>Chains</label>
            <div className="delivery-checks">
              {DELIVERY_CHAINS.map(item => (
                <label key={item} className="delivery-check">
                  <input
                    type="checkbox"
                    checked={deliveryChains.includes(item)}
                    onChange={() => toggleDeliveryChain(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="af-group delivery-field full">
            <label>Signal Types</label>
            <div className="delivery-checks">
              {DELIVERY_TYPES.map(typeItem => (
                <label key={typeItem.value} className="delivery-check">
                  <input
                    type="checkbox"
                    checked={deliveryTypes.includes(typeItem.value)}
                    onChange={() => toggleDeliveryType(typeItem.value)}
                  />
                  <span>{typeItem.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="af-group delivery-field full">
            <label>Tracked Tokens</label>
            <input
              type="text"
              className="af-input delivery-input wide"
              placeholder="AERO, DEGEN, ETH"
              value={trackedTokens}
              onChange={e => setTrackedTokens(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field full">
            <label>Tracked Wallets, Pools, Or Contracts</label>
            <input
              type="text"
              className="af-input delivery-input wide"
              placeholder="0x123..., 0xabc..., 0xpool..."
              value={trackedAddresses}
              onChange={e => setTrackedAddresses(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field">
            <label>Quiet Hours Start (UTC)</label>
            <input
              type="number"
              min="0"
              max="23"
              className="af-input delivery-input"
              placeholder="22"
              value={quietHoursStart}
              onChange={e => setQuietHoursStart(e.target.value)}
            />
          </div>

          <div className="af-group delivery-field">
            <label>Quiet Hours End (UTC)</label>
            <input
              type="number"
              min="0"
              max="23"
              className="af-input delivery-input"
              placeholder="7"
              value={quietHoursEnd}
              onChange={e => setQuietHoursEnd(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="af-submit" disabled={savingDelivery || !address || !hasSession}>
          {savingDelivery ? '...' : 'SAVE DELIVERY'}
        </button>

        {deliveryError && <div className="af-error">{deliveryError}</div>}
        {deliverySuccess && <div className="af-success">{deliverySuccess}</div>}
      </form>

      {active.length > 0 && (
        <div className="alerts-section">
          <div className="as-title">ACTIVE ALERTS ({active.length}/10)</div>
          {active.map(alert => (
            <div key={alert._id} className="alert-item active">
              <span className="ai-token">{alert.token}</span>
              <span className="ai-cond">{alert.direction === 'above' ? '▲' : '▼'} ${alert.targetPrice.toLocaleString()}</span>
              <span className="ai-date">{new Date(alert.createdAt).toLocaleDateString()}</span>
              <button className="ai-delete" onClick={() => deleteAlert(alert._id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {triggered.length > 0 && (
        <div className="alerts-section">
          <div className="as-title">TRIGGERED</div>
          {triggered.slice(0, 10).map(alert => (
            <div key={alert._id} className="alert-item triggered">
              <span className="ai-token">{alert.token}</span>
              <span className="ai-cond">{alert.direction === 'above' ? '▲' : '▼'} ${alert.targetPrice.toLocaleString()}</span>
              <span className="ai-hit">hit at ${alert.priceAtTrigger?.toLocaleString() || '?'}</span>
              <span className="ai-date">{new Date(alert.triggeredAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {active.length === 0 && triggered.length === 0 && address && hasSession && (
        <div className="alerts-empty">No alerts yet. Set one above.</div>
      )}
    </div>
  );
}
