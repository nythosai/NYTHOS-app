import React, { useState, useMemo, useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { baseSepolia as base } from 'wagmi/chains';
import { parseEther } from 'viem';
import {
  NYT_STAKING_ADDRESS,
  NYT_STAKING_ABI,
  NYT_ADDRESS,
  NYT_ABI,
} from '../config';
import './StakingPage.css';

const TIER_DEFS = [
  { index: 0, label: '30 Days',  apy: '12%',  multiplier: '1×',   minStr: '100 $NYT',   minWhole: 100  },
  { index: 1, label: '90 Days',  apy: '28%',  multiplier: '1.5×', minStr: '500 $NYT',   minWhole: 500  },
  { index: 2, label: '180 Days', apy: '52%',  multiplier: '2×',   minStr: '1,000 $NYT', minWhole: 1000, popular: true },
  { index: 3, label: '365 Days', apy: '100%', multiplier: '3×',   minStr: '5,000 $NYT', minWhole: 5000 },
];

export default function StakingPage() {
  const { address } = useAccount();
  const isDeployed = NYT_STAKING_ADDRESS !== '0x0000000000000000000000000000000000000000';

  const [selectedTier, setSelectedTier] = useState(null);
  const [stakeAmount, setStakeAmount]   = useState('');
  // txStep: 'idle' | 'approving' | 'approved' | 'staking' | 'done'
  const [txStep, setTxStep] = useState('idle');

  // ── Global contract stats ─────────────────────────────────────────────────
  const { data: rewardPool, refetch: refetchPool } = useReadContract({
    address: NYT_STAKING_ADDRESS,
    abi: NYT_STAKING_ABI,
    functionName: 'rewardPool',
    chainId: base.id,
    query: { enabled: isDeployed },
  });

  const { data: totalWeighted, refetch: refetchWeighted } = useReadContract({
    address: NYT_STAKING_ADDRESS,
    abi: NYT_STAKING_ABI,
    functionName: 'totalWeightedStake',
    chainId: base.id,
    query: { enabled: isDeployed },
  });

  const { data: totalStakersRaw } = useReadContract({
    address: NYT_STAKING_ADDRESS,
    abi: NYT_STAKING_ABI,
    functionName: 'totalStakers',
    chainId: base.id,
    query: { enabled: isDeployed },
  });

  // ── User's NYT balance ────────────────────────────────────────────────────
  const { data: nytBalance, refetch: refetchBalance } = useReadContract({
    address: NYT_ADDRESS,
    abi: NYT_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: base.id,
    query: { enabled: isDeployed && !!address },
  });

  // ── User's stake IDs ──────────────────────────────────────────────────────
  const { data: stakeIds, refetch: refetchStakeIds } = useReadContract({
    address: NYT_STAKING_ADDRESS,
    abi: NYT_STAKING_ABI,
    functionName: 'getUserStakes',
    args: [address],
    chainId: base.id,
    query: { enabled: isDeployed && !!address },
  });

  // ── Per-stake details (batched read) ─────────────────────────────────────
  const stakeContracts = useMemo(() => {
    if (!stakeIds?.length) return [];
    return stakeIds.flatMap(id => [
      { address: NYT_STAKING_ADDRESS, abi: NYT_STAKING_ABI, functionName: 'stakes',        args: [id], chainId: base.id },
      { address: NYT_STAKING_ADDRESS, abi: NYT_STAKING_ABI, functionName: 'pendingReward', args: [id], chainId: base.id },
    ]);
  }, [stakeIds]);

  const { data: stakeData, refetch: refetchStakeData } = useReadContracts({
    contracts: stakeContracts,
    query: { enabled: stakeContracts.length > 0 },
  });

  const myStakes = useMemo(() => {
    if (!stakeIds?.length || !stakeData?.length) return [];
    return stakeIds.map((id, i) => {
      const s      = stakeData[i * 2]?.result;
      const reward = stakeData[i * 2 + 1]?.result ?? 0n;
      if (!s) return null;
      return {
        id,
        amount:     s.amount,
        tierIndex:  s.tierIndex,
        startTime:  s.startTime,
        endTime:    s.endTime,
        active:     s.active,
        pendingReward: reward,
      };
    }).filter(Boolean).filter(s => s.active);
  }, [stakeIds, stakeData]);

  // ── Write (approve + stake, unstake, claimRewards) ────────────────────────
  const {
    writeContract,
    data: txHash,
    isPending: isTxPending,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: txConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  // After approval confirmed → unlock "Confirm Stake" button
  useEffect(() => {
    if (!txConfirmed) return;
    if (txStep === 'approving') {
      setTxStep('approved');
    } else if (txStep === 'staking') {
      setTxStep('done');
      refetchStakeIds();
      refetchStakeData();
      refetchBalance();
      refetchWeighted();
      refetchPool();
    }
  }, [txConfirmed, txStep, refetchStakeIds, refetchStakeData, refetchBalance, refetchWeighted, refetchPool]);

  function handleApprove() {
    const amountWei = parseEther(stakeAmount);
    setTxStep('approving');
    writeContract({
      address: NYT_ADDRESS,
      abi: NYT_ABI,
      chainId: base.id,
      functionName: 'approve',
      args: [NYT_STAKING_ADDRESS, amountWei],
    });
  }

  function handleStake() {
    const amountWei = parseEther(stakeAmount);
    setTxStep('staking');
    writeContract({
      address: NYT_STAKING_ADDRESS,
      abi: NYT_STAKING_ABI,
      chainId: base.id,
      functionName: 'stake',
      args: [amountWei, BigInt(selectedTier)],
    });
  }

  function handleUnstake(stakeId) {
    writeContract({
      address: NYT_STAKING_ADDRESS,
      abi: NYT_STAKING_ABI,
      chainId: base.id,
      functionName: 'unstake',
      args: [stakeId],
    });
  }

  function handleClaimRewards(stakeId) {
    writeContract({
      address: NYT_STAKING_ADDRESS,
      abi: NYT_STAKING_ABI,
      chainId: base.id,
      functionName: 'claimRewards',
      args: [stakeId],
    });
  }

  function closeForm() {
    setSelectedTier(null);
    setStakeAmount('');
    setTxStep('idle');
    resetWrite();
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const nytBal         = nytBalance   ? Number(nytBalance   / 10n ** 18n) : 0;
  const totalStaked    = totalWeighted ? Number(totalWeighted / 10n ** 18n) : 0;
  const rewardPoolETH  = rewardPool   ? Number(rewardPool) / 1e18 : 0;
  const totalStakersCnt = totalStakersRaw ? Number(totalStakersRaw) : 0;
  const isBusy = isTxPending || isConfirming;
  const tier   = selectedTier !== null ? TIER_DEFS[selectedTier] : null;

  const amountNum = Number(stakeAmount) || 0;
  const amountValid = tier && amountNum >= tier.minWhole && amountNum <= nytBal;

  return (
    <div className="staking-page">

      {/* Hero */}
      <div className="staking-hero">
        <h1>Stake $NYT</h1>
        <p>Lock your $NYT tokens and earn an APY-weighted share of the live NYTHOS revenue pool. Longer locks raise your target reward rate, but payouts always depend on real ETH available in the pool.</p>
        {!isDeployed && <div className="staking-status">STAKING OPENS AFTER TOKEN LAUNCH</div>}
      </div>

      {/* Global stats */}
      <div className="staking-stats">
        <div className="ss">
          <span className="ss-num">{isDeployed ? totalStaked.toLocaleString() : '-'}</span>
          <span className="ss-label">Total Weighted Stake</span>
        </div>
        <div className="ss">
          <span className="ss-num">{isDeployed ? totalStakersCnt.toLocaleString() : '-'}</span>
          <span className="ss-label">Total Stakes Created</span>
        </div>
        <div className="ss">
          <span className="ss-num">{isDeployed && rewardPoolETH > 0 ? rewardPoolETH.toFixed(4) + ' ETH' : '-'}</span>
          <span className="ss-label">Reward Pool</span>
        </div>
        <div className="ss">
          <span className="ss-num">Up to 100%</span>
          <span className="ss-label">Max Target APY*</span>
        </div>
      </div>

      {/* APY caveat */}
      <div className="staking-apy-caveat">
        <span className="apy-caveat-icon">⚠</span>
        <span>
          APY figures are <strong>targets</strong>, not guarantees. Actual rewards are your pro-rata share of ETH deposited into the revenue pool by the platform. If the pool has no ETH, payouts are zero regardless of tier. Staking only makes sense after NYTHOS earns consistent recurring revenue.
        </span>
      </div>

      {/* Tier cards */}
      <div className="staking-tiers">
        {TIER_DEFS.map(t => {
          const canSelect = isDeployed && !!address;
          const isSelected = selectedTier === t.index;
          return (
            <div
              key={t.index}
              className={`stake-card ${t.popular ? 'popular' : ''} ${isSelected ? 'selected' : ''}`}
            >
              {t.popular && <div className="stake-badge">BEST RATE</div>}
              <div className="stake-duration">{t.label}</div>
              <div className={`stake-apy ${t.index === 0 ? 'muted' : t.index === 3 ? 'green' : 'accent'}`}>
                {t.apy} <span>Target APY</span>
              </div>
              <div className="stake-details">
                <div><span>Reward Multiplier</span><span className={t.index === 3 ? 'green' : 'accent'}>{t.multiplier}</span></div>
                <div><span>Minimum Stake</span><span>{t.minStr}</span></div>
                <div><span>Early Unstake</span><span className="muted">20% penalty</span></div>
              </div>
              {canSelect ? (
                <button
                  className={`stake-btn enabled ${isSelected ? 'active' : ''}`}
                  onClick={() => { setSelectedTier(t.index); setStakeAmount(''); setTxStep('idle'); resetWrite(); }}
                >
                  {isSelected ? '✓ Selected' : 'Select Tier'}
                </button>
              ) : (
                <button className="stake-btn" disabled>
                  {!address ? 'Connect Wallet' : 'Coming Soon'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stake form - appears when a tier is selected */}
      {isDeployed && address && selectedTier !== null && (
        <div className="stake-form-wrap">
            <div className="stake-form">
              <div className="stake-form-header">
              <span>Stake in {tier.label} Tier: {tier.apy} target APY, {tier.multiplier} multiplier</span>
              <button className="close-btn" onClick={closeForm}>✕</button>
            </div>

            <div className="stake-balance">
              Your balance: <strong>{nytBal.toLocaleString()} $NYT</strong>
            </div>

            <div className="stake-input-row">
              <input
                type="number"
                placeholder={`Min ${tier.minStr}`}
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                min={tier.minWhole}
                max={nytBal}
                disabled={isBusy || txStep === 'done'}
              />
              <button
                className="max-btn"
                onClick={() => setStakeAmount(String(nytBal))}
                disabled={isBusy || txStep === 'done'}
              >
                MAX
              </button>
            </div>

            {txStep === 'done' ? (
              <div className="stake-success">
                <span>✓ Staked successfully! Your position is now active.</span>
                <button onClick={closeForm}>Close</button>
              </div>
            ) : txStep === 'approved' ? (
              <button
                className="stake-submit-btn stake-step2"
                onClick={handleStake}
                disabled={isBusy}
              >
                {isBusy ? 'Confirming stake...' : 'Step 2: Confirm Stake'}
              </button>
            ) : (
              <button
                className="stake-submit-btn"
                onClick={handleApprove}
                disabled={isBusy || !amountValid}
              >
                {txStep === 'approving' && isBusy ? 'Confirming approval...' : 'Step 1: Approve $NYT'}
              </button>
            )}

            <div className="stake-note">
              Staking requires 2 wallet confirmations: Approve spending, then Stake.
              Lock period: <strong>{tier.label}</strong>. Early unstake incurs a 20% penalty (burned).
              Reward claims are paid from the live ETH pool and are not fixed guarantees.
            </div>
          </div>
        </div>
      )}

      {/* My active stakes */}
      {isDeployed && address && myStakes.length > 0 && (
        <div className="my-stakes">
          <h2>My Active Stakes</h2>
          <div className="my-stakes-list">
            {myStakes.map(s => {
              const t = TIER_DEFS[Number(s.tierIndex)];
              const unlockDate  = new Date(Number(s.endTime) * 1000);
              const isUnlocked  = Date.now() >= Number(s.endTime) * 1000;
              const rewardETH   = Number(s.pendingReward) / 1e18;
              const amountNYT   = Number(s.amount) / 1e18;
              return (
                <div key={s.id.toString()} className="my-stake-card">
                  <div className="my-stake-header">
                    <span className="my-stake-tier">{t.label}, {t.apy} target APY</span>
                    <span className={`my-stake-status ${isUnlocked ? 'unlocked' : 'locked'}`}>
                      {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                  <div className="my-stake-details">
                    <div><span>Staked</span><span>{amountNYT.toLocaleString()} $NYT</span></div>
                    <div><span>Pending Reward</span><span className="green">{rewardETH.toFixed(6)} ETH</span></div>
                    <div><span>Unlocks</span><span>{unlockDate.toLocaleDateString()}</span></div>
                    <div><span>Multiplier</span><span>{t.multiplier}</span></div>
                  </div>
                  <div className="my-stake-actions">
                    <button
                      className="claim-btn"
                      onClick={() => handleClaimRewards(s.id)}
                      disabled={isBusy || rewardETH < 1e-9}
                    >
                      Claim {rewardETH.toFixed(6)} ETH
                    </button>
                    <button
                      className={`unstake-btn ${!isUnlocked ? 'penalty' : ''}`}
                      onClick={() => handleUnstake(s.id)}
                      disabled={isBusy}
                    >
                      {isUnlocked ? 'Unstake' : '⚠ Early Unstake (20% burned)'}
                    </button>
                  </div>
                  {!isUnlocked && (
                    <div className="my-stake-burn-warn">
                      Early exit permanently burns 20% of your staked $NYT. This cannot be undone.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="staking-how">
        <h2>How Staking Works</h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-num">01</div>
            <h3>Hold $NYT</h3>
            <p>Buy $NYT during presale or from the DEX. You need $NYT to participate in staking.</p>
          </div>
          <div className="how-card">
            <div className="how-num">02</div>
            <h3>Choose Lock Period</h3>
            <p>Select how long you want to stake. Longer locks increase your APY target and reward multiplier inside the shared revenue pool.</p>
          </div>
          <div className="how-card">
            <div className="how-num">03</div>
            <h3>Earn Revenue Share</h3>
            <p>When revenue is deposited into the pool, active stakes earn a weighted share based on stake size, lock multiplier, and tier APY target.</p>
          </div>
          <div className="how-card">
            <div className="how-num">04</div>
            <h3>Compound or Withdraw</h3>
            <p>Claim rewards anytime from the available pool. At lock expiry, unstake your full principal with no penalty.</p>
          </div>
        </div>
      </div>

      {/* Revenue sources */}
      <div className="staking-revenue">
        <h2>Revenue Sources</h2>
        <p>Staking rewards come from real platform revenue, not printed tokens. APY tiers shape how rewards are weighted, but every payout is still capped by what has actually been deposited into the pool.</p>
        <div className="rev-list">
          {[
            { source: 'Token Access Fees', detail: '100 NYT min to access Pro tier signals' },
            { source: 'Partner Monitoring', detail: '5,000 NYT min for team and custom wallet tracking' },
            { source: 'API Access',         detail: 'Paid API keys for bot builders and dashboards' },
            { source: 'Community Packages', detail: 'Bulk monitoring and alert workflows for DAOs' },
          ].map(r => (
            <div key={r.source} className="rev-row">
              <span className="rev-dot" />
              <span className="rev-source">{r.source}</span>
              <span className="rev-detail">{r.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue projection */}
      <div className="staking-projection">
        <h2>APY Projection: What the numbers actually mean</h2>
        <p className="proj-note">
          APY is only as real as the ETH in the pool. Here is what different revenue levels mean for stakers, assuming ~18M NYT staked at an average 1.5× multiplier and ETH at $2,000.
        </p>
        <div className="proj-table-wrap">
          <table className="proj-table">
            <thead>
              <tr>
                <th>Monthly Platform Revenue</th>
                <th>ETH into Pool (quarterly)</th>
                <th>Effective APY on 18M NYT</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$3,000 / mo</td>
                <td>~2.25 ETH</td>
                <td className="proj-muted">~2–4%</td>
                <td className="proj-muted">Early beta</td>
              </tr>
              <tr>
                <td>$15,000 / mo</td>
                <td>~11 ETH</td>
                <td className="proj-yellow">~10–18%</td>
                <td className="proj-yellow">Growth target</td>
              </tr>
              <tr className="proj-highlight">
                <td>$50,000 / mo</td>
                <td>~37.5 ETH</td>
                <td className="proj-green">~35–55%</td>
                <td className="proj-green">Scaled product</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="proj-note">
          These are honest estimates. The 100% APY tier is a maximum weight multiplier, not a guarantee. Actual payout grows proportionally with platform revenue. Staking before revenue exists means waiting for real deposits, because the contract does not print rewards.
        </p>
      </div>

    </div>
  );
}
