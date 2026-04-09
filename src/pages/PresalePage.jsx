import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import api from '../api';
import './PresalePage.css';

const ROUNDS = [
  {
    id: 0,
    name: 'Founder Round',
    tag: 'WHITELIST ONLY',
    price: '$0.005',
    priceNote: 'per $NYT',
    allocation: '5,000,000',
    allocationNote: 'NYT',
    raise: '$25,000',
    access: 'Invited wallets only',
    cliff: 'No cliff. Claim after finalization.',
    color: 'green',
    status: 'UPCOMING',
  },
  {
    id: 1,
    name: 'Early Access',
    tag: 'BEST PRICE PUBLIC',
    price: '$0.008',
    priceNote: 'per $NYT',
    allocation: '13,000,000',
    allocationNote: 'NYT',
    raise: '$104,000',
    access: 'Open to all',
    cliff: 'No cliff. Claim after finalization.',
    color: 'accent',
    status: 'UPCOMING',
    highlight: true,
  },
  {
    id: 2,
    name: 'Public Round',
    tag: 'PUBLIC',
    price: '$0.010',
    priceNote: 'per $NYT',
    allocation: '9,000,000',
    allocationNote: 'NYT',
    raise: '$90,000',
    access: 'Open to all',
    cliff: '30-day cliff before claim',
    color: 'muted',
    status: 'UPCOMING',
  },
];

export default function PresalePage() {
  const { address } = useAccount();
  const [email, setEmail]           = useState('');
  const [wallet, setWallet]         = useState(address || '');
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [whitelistCount, setWhitelistCount] = useState(null);
  const [referralData, setReferralData]     = useState(null);
  const [refCopied, setRefCopied]           = useState(false);

  const storedRef = localStorage.getItem('nythos_ref') || '';

  useEffect(() => {
    if (address && !submitted) setWallet(address);
  }, [address, submitted]);

  useEffect(() => {
    api.get('/api/presale/count')
      .then(r => setWhitelistCount(r.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!address) return;
    api.get(`/api/presale/referral/${address}`)
      .then(r => setReferralData(r.data))
      .catch(() => {});
  }, [address]);

  function copyReferralLink() {
    if (!referralData?.code) return;
    const link = `${window.location.origin}/?ref=${referralData.code}`;
    navigator.clipboard.writeText(link).then(() => {
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    });
  }

  async function handleWhitelist(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body = { email, walletAddress: wallet };
      if (storedRef) body.referredBy = storedRef;
      const r = await api.post('/api/presale/whitelist', body);
      if (r.data.status === 'ALREADY_REGISTERED') {
        setError('This email or wallet is already on the founder list.');
      } else {
        setSubmitted(true);
        if (r.data.count) setWhitelistCount(r.data.count);
        if (wallet) {
          api.get(`/api/presale/referral/${wallet}`)
            .then(r2 => setReferralData(r2.data))
            .catch(() => {});
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="presale-page">

      {/* Hero */}
      <div className="presale-hero">
        <div className="presale-status">DEPLOYED ON BASE SEPOLIA TESTNET</div>
        <h1>$NYT Token Presale</h1>
        <p>Three rounds. Fixed supply. Base native. Get in early at the founder price before the public round opens.</p>
      </div>

      {/* Key numbers */}
      <div className="presale-stats">
        <div className="ps"><span className="ps-num">100,000,000</span><span className="ps-label">Fixed Supply</span></div>
        <div className="ps"><span className="ps-num">27,000,000</span><span className="ps-label">For Sale (27%)</span></div>
        <div className="ps"><span className="ps-num">$100,000</span><span className="ps-label">Soft Cap</span></div>
        <div className="ps"><span className="ps-num">$219,000</span><span className="ps-label">Hard Cap</span></div>
      </div>

      {/* Not deployed banner */}
      <div className="presale-not-deployed">
        <span className="pnd-dot" />
        <span>Presale is live on Base Sepolia testnet for testing. Mainnet launch opens after external audit. Join the founder list below for priority access when it goes live on Base mainnet.</span>
      </div>

      {/* Round cards */}
      <div className="sale-rounds">
        {ROUNDS.map(r => (
          <div key={r.id} className={`round-card ${r.highlight ? 'highlight' : ''}`}>
            {r.highlight && <div className="round-featured-tag">BEST PUBLIC PRICE</div>}
            <div className={`round-name round-${r.color}`}>{r.name}</div>
            <div className="round-price">{r.price}<span>{r.priceNote}</span></div>
            <div className="round-details">
              <div><span>Allocation</span><span className={`round-${r.color}`}>{r.allocation} {r.allocationNote}</span></div>
              <div><span>Round Raise</span><span>{r.raise}</span></div>
              <div><span>Access</span><span>{r.access}</span></div>
              <div><span>Claim</span><span>{r.cliff}</span></div>
            </div>
            <div className={`round-badge ${r.status === 'ACTIVE NOW' ? 'open' : 'closed'}`}>{r.status}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="presale-how">
        <h2>How It Works</h2>
        <div className="phow-grid">
          {[
            { num: '01', title: 'Choose Your Round', body: 'The founder round is whitelist only. Apply below. Early Access and Public rounds are open to anyone once deployed.' },
            { num: '02', title: 'Send ETH', body: 'The presale contract accepts ETH. It calculates your $NYT allocation at that round\'s fixed USD price using a live ETH/USD feed.' },
            { num: '03', title: 'Wait for Finalization', body: 'Once the sale ends, the owner calls finalize(). If the $100k soft cap is hit, ETH is released and claims open. If not, full refunds.' },
            { num: '04', title: 'Claim Your $NYT', body: 'Founder and Early Access buyers claim immediately after finalization. Public round buyers wait 30 days (cliff), then claim.' },
          ].map(s => (
            <div key={s.num} className="phow-card">
              <div className="phow-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation context */}
      <div className="presale-allocation">
        <h2>Where Does The Money Go?</h2>
        <div className="palloc-grid">
          {[
            { label: 'Smart Contract Audit', pct: '25%', desc: 'External security review before Base mainnet deploy', color: 'yellow' },
            { label: 'Base Liquidity Pool', pct: '40%', desc: 'Aerodrome + Uniswap Base, covering the 15% liquidity allocation', color: 'green' },
            { label: 'Product & Infrastructure', pct: '20%', desc: 'Backend reliability, Base deployment, and launch prep', color: 'accent' },
            { label: 'Runway Reserve', pct: '15%', desc: 'Operations, legal, and contingency buffer', color: 'muted' },
          ].map(a => (
            <div key={a.label} className="palloc-row">
              <div className="palloc-meta">
                <span className="palloc-label">{a.label}</span>
                <span className={`palloc-pct palloc-${a.color}`}>{a.pct}</span>
              </div>
              <div className="palloc-bar-wrap">
                <div className={`palloc-bar palloc-bar-${a.color}`} style={{ width: a.pct }} />
              </div>
              <div className="palloc-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Founder list signup */}
      <div className="whitelist-section">
        <h2>Join The Founder List</h2>
        <p>Get first notice when the presale goes live, priority access to the founder round, and updates as Base deployment milestones are hit.</p>

        {whitelistCount !== null && (
          <div className="whitelist-counter">
            <span className="wl-count-dot" />
            <span><strong>{whitelistCount.toLocaleString()}</strong> wallets already registered</span>
          </div>
        )}

        {storedRef && !submitted && (
          <div className="referral-banner">◈ You were referred by an existing founder list member</div>
        )}

        {submitted ? (
          <div className="whitelist-success">
            ✓ You're on the list. We'll notify you when the presale goes live on Base.
          </div>
        ) : (
          <form className="whitelist-form" onSubmit={handleWhitelist}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Your EVM wallet address (0x...)"
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              readOnly={!!address}
              title={address ? 'Auto-filled from your connected wallet' : ''}
              required
            />
            {error && <div className="whitelist-error">{error}</div>}
            <button type="submit" disabled={submitting}>
              {submitting ? 'REGISTERING...' : 'JOIN FOUNDER LIST →'}
            </button>
          </form>
        )}
      </div>

      {/* Referral section */}
      {referralData && (
        <div className="referral-section">
          <h2>Your Referral Link</h2>
          <p>Share your link. Every wallet that joins through it moves you up the founder round priority list.</p>
          <div className="referral-stats">
            <div className="ref-stat">
              <span className="ref-num">{referralData.referralCount}</span>
              <span className="ref-label">Wallets Referred</span>
            </div>
            <div className="ref-stat">
              <span className="ref-num">{referralData.code}</span>
              <span className="ref-label">Your Code</span>
            </div>
          </div>
          <div className="referral-link-row">
            <div className="referral-link-box">
              {window.location.origin}/?ref={referralData.code}
            </div>
            <button className="copy-ref-btn" onClick={copyReferralLink}>
              {refCopied ? '✓ COPIED' : 'COPY'}
            </button>
          </div>
          <div className="referral-note">
            Top referrers get priority access to the founder round when contracts deploy on Base.
          </div>
        </div>
      )}

    </div>
  );
}
