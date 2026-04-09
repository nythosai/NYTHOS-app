import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import api from '../api';
import SignalCard from '../components/SignalCard';
import TierGate from '../components/TierGate';
import WhaleProfileModal from '../components/WhaleProfileModal';
import { useWalletSession } from '../hooks/useWalletSession';
import './HistoryPage.css';

const SIGNAL_TYPES = ['ALL', 'WHALE_ACTIVITY', 'PRICE_MOMENTUM', 'BRIDGE_FLOW', 'DEX_SWAP', 'LIQUIDITY_FLOW', 'POOL_LAUNCH', 'LAUNCH_SMART_ENTRY', 'LAUNCH_RISK', 'WATCHED_WALLET', 'PRICE_ALERT'];
const CHAINS       = ['ALL', 'ETH', 'BTC', 'SOL', 'BASE'];
const CONFIDENCES  = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];
const RISKS        = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

export default function HistoryPage({ tier }) {
  const { address } = useAccount();
  const { hasSession } = useWalletSession();
  const [whaleTarget, setWhaleTarget] = useState(null);
  const [signals, setSignals]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [confidence, setConfidence] = useState('ALL');
  const [chain, setChain]         = useState('ALL');
  const [type, setType]           = useState('ALL');
  const [risk, setRisk]           = useState('ALL');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const searchRef = useRef(search);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const fetchHistory = useCallback(async (p = 1, searchValue = searchRef.current) => {
    setLoading(true);
    try {
      const params = { limit: 20, page: p };
      if (confidence !== 'ALL') params.confidence = confidence;
      if (chain !== 'ALL')      params.chain = chain;
      if (type !== 'ALL')       params.type = type;
      if (risk !== 'ALL')       params.risk = risk;
      if (searchValue.trim())   params.search = searchValue.trim();
      if (dateFrom)             params.from = Math.floor(new Date(dateFrom).getTime() / 1000);
      if (dateTo)               params.to   = Math.floor(new Date(dateTo).getTime() / 1000 + 86399);
      if (address && hasSession) params.owner = address;

      const res = await api.get('/api/signals/history', { params });
      setSignals(res.data.signals || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
      setPage(p);
    } catch (err) {
      console.error('History fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [address, hasSession, confidence, chain, type, risk, dateFrom, dateTo]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  useEffect(() => {
    const raw = localStorage.getItem('nythos_history_view');
    if (!raw) return;
    try {
      const view = JSON.parse(raw);
      if (view.search) setSearch(view.search);
      if (view.confidence) setConfidence(view.confidence);
      if (view.chain) setChain(view.chain);
      if (view.type) setType(view.type);
      if (view.risk) setRisk(view.risk);
      localStorage.removeItem('nythos_history_view');
    } catch {
      localStorage.removeItem('nythos_history_view');
    }
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchHistory(1, search);
  }

  function clearFilters() {
    setSearch('');
    setConfidence('ALL');
    setChain('ALL');
    setType('ALL');
    setRisk('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  const hasFilters = search || confidence !== 'ALL' || chain !== 'ALL' || type !== 'ALL' || risk !== 'ALL' || dateFrom || dateTo;

  return (
    <div className="history-page">
      <div className="history-hero">
        <div className="history-title">Signal History</div>
        <p>Every pattern NYTHOS has observed. Searchable, filterable, permanent.</p>
      </div>

      {/* Search + Filters */}
      <div className="history-controls">
        <form className="history-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="history-input"
            placeholder="Search signals, descriptions, AI posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="history-search-btn">SEARCH</button>
        </form>

        <div className="history-filters">
          <div className="hf-group">
            <span className="hf-label">CHAIN</span>
            <div className="hf-btns">
              {CHAINS.map(c => (
                <button
                  key={c}
                  className={`hf-btn ${chain === c ? 'active' : ''}`}
                  onClick={() => setChain(c)}
                >{c}</button>
              ))}
            </div>
          </div>

          <div className="hf-group">
            <span className="hf-label">CONFIDENCE</span>
            <div className="hf-btns">
              {CONFIDENCES.map(c => (
                <button
                  key={c}
                  className={`hf-btn ${confidence === c ? 'active' : ''}`}
                  onClick={() => setConfidence(c)}
                >{c}</button>
              ))}
            </div>
          </div>

          <div className="hf-group">
            <span className="hf-label">TYPE</span>
            <div className="hf-btns">
              {SIGNAL_TYPES.map(t => (
                <button
                  key={t}
                  className={`hf-btn ${type === t ? 'active' : ''}`}
                  onClick={() => setType(t)}
                >{t === 'ALL' ? 'ALL' : t.replace(/_/g, ' ')}</button>
              ))}
            </div>
          </div>

          <div className="hf-group">
            <span className="hf-label">RISK</span>
            <div className="hf-btns">
              {RISKS.map(level => (
                <button
                  key={level}
                  className={`hf-btn ${risk === level ? 'active' : ''}`}
                  onClick={() => setRisk(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="hf-group">
            <span className="hf-label">DATE RANGE</span>
            <div className="hf-dates">
              <input
                type="date"
                className="hf-date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <span className="hf-date-sep">→</span>
              <input
                type="date"
                className="hf-date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {hasFilters && (
            <button className="hf-clear" onClick={clearFilters}>CLEAR FILTERS</button>
          )}
        </div>

        <div className="history-meta">
          {!loading && (
            <span>{total.toLocaleString()} signal{total !== 1 ? 's' : ''} found</span>
          )}
        </div>
      </div>

      {/* Results - PRO+ only for full history */}
      {tier.name === 'OBSERVER' ? (
        <TierGate
          required="PARTICIPANT"
          tier={tier}
          message="Full signal history requires Participant tier. Hold 100+ $NYT to search and browse all past signals."
        >
          <div className="history-feed">
            {signals.slice(0, 3).map(s => (
              <SignalCard key={s.id} signal={s} tier={tier} onWhaleClick={setWhaleTarget} />
            ))}
          </div>
        </TierGate>
      ) : (
        <>
          {loading ? (
            <div className="history-feed">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-score">
                    <div className="skeleton-block" style={{ width: 40, height: 34 }} />
                    <div className="skeleton-block" style={{ width: 32, height: 10 }} />
                  </div>
                  <div className="skeleton-body">
                    <div className="skeleton-block" style={{ width: '40%', height: 12 }} />
                    <div className="skeleton-block" style={{ width: '80%', height: 12 }} />
                    <div className="skeleton-block" style={{ width: '55%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : signals.length === 0 ? (
            <div className="history-empty">
              <p>No signals match your search.</p>
              {hasFilters && <button className="hf-clear" onClick={clearFilters}>Clear filters</button>}
            </div>
          ) : (
            <div className="history-feed">
              {signals.map(s => (
                <SignalCard key={s.id} signal={s} tier={tier} onWhaleClick={setWhaleTarget} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="history-pagination">
              <button
                className="page-btn"
                onClick={() => fetchHistory(page - 1)}
                disabled={page <= 1}
              >← PREV</button>

              <span className="page-info">
                {page} / {totalPages}
              </span>

              <button
                className="page-btn"
                onClick={() => fetchHistory(page + 1)}
                disabled={page >= totalPages}
              >NEXT →</button>
            </div>
          )}
        </>
      )}
      {whaleTarget?.address && (
        <WhaleProfileModal
          address={whaleTarget.address}
          chain={whaleTarget.chain}
          onClose={() => setWhaleTarget(null)}
        />
      )}
    </div>
  );
}
