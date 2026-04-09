function normalizeTierName(tier) {
  const normalized = String(tier || '').trim().toUpperCase();

  if (normalized === 'FREE') return 'OBSERVER';
  if (normalized === 'PRO') return 'PARTICIPANT';
  if (normalized === 'WHALE') return 'SMART_MONEY';
  if (['OBSERVER', 'PARTICIPANT', 'SMART_MONEY'].includes(normalized)) return normalized;

  return null;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function normalizeContractAddress(value) {
  const normalized = String(value || '').trim();
  return /^0x[a-fA-F0-9]{40}$/.test(normalized) ? normalized : ZERO_ADDRESS;
}

const ENV_API_URL = import.meta.env.VITE_API_URL?.trim();
export const API_URL = ENV_API_URL || (
  import.meta.env.DEV
    ? 'http://localhost:3001'
    : 'https://nythos-backend.onrender.com'
);
export const BETA_DEFAULT_TIER = normalizeTierName(import.meta.env.VITE_BETA_DEFAULT_TIER) || 'SMART_MONEY';

// ─── Contract Addresses ───────────────────────────────────────────────────────
// Deploy order: NYT → NYTVesting → NYTPresale → NYTStaking → NYTAirdrop
// Run: npx hardhat run scripts/deploy.js --network baseSepolia  (testnet first)
// Run: npx hardhat run scripts/deploy.js --network base          (mainnet after audit)
// Then replace all zero addresses below with the deployed addresses.

export const NYT_ADDRESS = normalizeContractAddress(
  import.meta.env.VITE_NYT_ADDRESS || import.meta.env.VITE_NYT_TOKEN_ADDRESS || import.meta.env.VITE_NYT_CONTRACT_ADDRESS
);
export const NYT_PRESALE_ADDRESS = normalizeContractAddress(import.meta.env.VITE_NYT_PRESALE_ADDRESS);
export const NYT_STAKING_ADDRESS = normalizeContractAddress(import.meta.env.VITE_NYT_STAKING_ADDRESS);
export const NYT_VESTING_ADDRESS = normalizeContractAddress(import.meta.env.VITE_NYT_VESTING_ADDRESS);
export const NYT_AIRDROP_ADDRESS = normalizeContractAddress(import.meta.env.VITE_NYT_AIRDROP_ADDRESS);

// ─── NYT Token ABI (balanceOf + approve, used for tier check and staking) ─────
export const NYT_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ─── NYTPresale ABI ───────────────────────────────────────────────────────────
export const NYT_PRESALE_ABI = [
  // ── Read ──
  {
    inputs: [],
    name: 'HARD_CAP_USD',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SOFT_CAP_USD',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentRound',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'saleOpen',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'finalized',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'softCapReached',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'raisedETH',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'raisedUSD',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSold',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ethPriceUSD',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    // rounds(index) → (priceUSD, maxUSD, soldUSD, active)
    inputs: [{ name: '', type: 'uint256' }],
    name: 'rounds',
    outputs: [
      { name: 'priceUSD', type: 'uint256' },
      { name: 'maxUSD',   type: 'uint256' },
      { name: 'soldUSD',  type: 'uint256' },
      { name: 'active',   type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'nytPurchased',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'ethPaid',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'whitelist',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ── Write ──
  {
    inputs: [],
    name: 'buy',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'refund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ─── NYTStaking ABI ───────────────────────────────────────────────────────────
export const NYT_STAKING_ABI = [
  // ── Read ──
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserStakes',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'stakeId', type: 'uint256' }],
    name: 'pendingReward',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    // stakes(id) → (owner, amount, tierIndex, startTime, endTime, lastClaim, active)
    inputs: [{ name: '', type: 'uint256' }],
    name: 'stakes',
    outputs: [
      { name: 'amount',    type: 'uint256' },
      { name: 'tierIndex', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime',   type: 'uint256' },
      { name: 'lastClaim', type: 'uint256' },
      { name: 'active',    type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    // tiers(index) → (duration, apyBP, multiplierBP, minStake)
    inputs: [{ name: '', type: 'uint256' }],
    name: 'tiers',
    outputs: [
      { name: 'duration',     type: 'uint256' },
      { name: 'apyBP',        type: 'uint256' },
      { name: 'multiplierBP', type: 'uint256' },
      { name: 'minStake',     type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardPool',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalStakers',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalWeightedStake',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PENALTY_BP',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ── Write ──
  {
    // stake(amount, tierIndex) — requires prior NYT approval
    inputs: [
      { name: 'amount',    type: 'uint256' },
      { name: 'tierIndex', type: 'uint256' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'stakeId', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'stakeId', type: 'uint256' }],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ─── Tier definitions (mirrors backend useTier.js) ────────────────────────────
export const TIERS = {
  OBSERVER:    { name: 'OBSERVER',    min: 0,    signalLimit: 5,        color: '#666' },
  PARTICIPANT: { name: 'PARTICIPANT', min: 100,  signalLimit: Infinity, color: '#6c63ff' },
  SMART_MONEY: { name: 'SMART_MONEY', min: 5000, signalLimit: Infinity, color: '#f7931a' },
};
