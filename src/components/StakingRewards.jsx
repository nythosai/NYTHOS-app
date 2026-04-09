import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract, useReadContracts } from 'wagmi';
import { base } from 'wagmi/chains';
import { NYT_STAKING_ADDRESS, NYT_STAKING_ABI } from '../config';
import './StakingRewards.css';

const TIER_NAMES  = ['30 Days', '90 Days', '180 Days', '365 Days'];
const TIER_COLORS = ['muted', 'accent', 'accent', 'green'];

const isDeployed = NYT_STAKING_ADDRESS !== '0x0000000000000000000000000000000000000000';

export default function StakingRewards() {
  const { address } = useAccount();
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  // 1. Fetch stake IDs for this user
  const { data: stakeIds } = useReadContract({
    address: NYT_STAKING_ADDRESS,
    abi:     NYT_STAKING_ABI,
    functionName: 'getUserStakes',
    args:    [address],
    chainId: base.id,
    query:   { enabled: !!address && isDeployed },
  });

  const ids = stakeIds ? Array.from(stakeIds) : [];

  // 2. Batch-read all stakes + pending rewards
  const stakeContracts = ids.flatMap(id => [
    { address: NYT_STAKING_ADDRESS, abi: NYT_STAKING_ABI, functionName: 'stakes',        args: [id], chainId: base.id },
    { address: NYT_STAKING_ADDRESS, abi: NYT_STAKING_ABI, functionName: 'pendingReward', args: [id], chainId: base.id },
  ]);

  const { data: batchData } = useReadContracts({
    contracts: stakeContracts,
    query: { enabled: ids.length > 0 && isDeployed },
  });

  if (!address) return null;
  if (!isDeployed) return (
    <div className="sr-placeholder">
      Live staking rewards will appear here after token launch.
    </div>
  );
  if (ids.length === 0) return null;

  // Parse batch results: [stake0, reward0, stake1, reward1, ...]
  const stakes = ids.map((id, i) => {
    const stake   = batchData?.[i * 2]?.result;
    const reward  = batchData?.[i * 2 + 1]?.result;
    if (!stake || !stake.active) return null;
    return {
      id: id.toString(),
      amount:     (Number(stake.amount) / 1e18).toFixed(2),
      tierIndex:  Number(stake.tierIndex),
      endTime:    Number(stake.endTime),
      pendingETH: reward ? (Number(reward) / 1e18).toFixed(6) : '0',
    };
  }).filter(Boolean);

  const totalPending = stakes.reduce((acc, s) => acc + parseFloat(s.pendingETH), 0);

  return (
    <div className="staking-rewards">
      <div className="sr-header">
        <span className="sr-title">YOUR ACTIVE STAKES</span>
        <span className="sr-total">Total Pending: <strong>{totalPending.toFixed(6)} ETH</strong></span>
      </div>

      <div className="sr-list">
        {stakes.map(s => {
          const timeLeft = s.endTime - now;
          const expired  = timeLeft <= 0;
          const days     = expired ? 0 : Math.ceil(timeLeft / 86400);
          return (
            <div key={s.id} className="sr-item">
              <div className={`sr-tier ${TIER_COLORS[s.tierIndex]}`}>{TIER_NAMES[s.tierIndex]}</div>
              <div className="sr-amount">{s.amount} <span>NYT</span></div>
              <div className="sr-countdown">{expired ? 'UNLOCKED' : `${days}d left`}</div>
              <div className="sr-reward">{s.pendingETH} <span>ETH</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
