import { useReadContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { BETA_DEFAULT_TIER, NYT_ADDRESS, NYT_ABI, TIERS } from '../config';

function normalizeTierName(tier) {
  const normalized = String(tier || '').trim().toUpperCase();

  if (normalized === 'FREE') return 'OBSERVER';
  if (normalized === 'PRO') return 'PARTICIPANT';
  if (normalized === 'WHALE') return 'SMART_MONEY';
  if (Object.prototype.hasOwnProperty.call(TIERS, normalized)) return normalized;

  return null;
}

/**
 * Reads the connected wallet's $NYT balance on Base chain
 * and returns the user's tier.
 *
 * Returns: { tier, balanceNYT, loading, isDeployed }
 *   tier       - one of TIERS.FREE / TIERS.PRO / TIERS.WHALE
 *   balanceNYT - raw balance as a number (whole tokens, not wei)
 *   loading    - true while fetching
 */
export function useTier(address, session) {
  const isDeployed = NYT_ADDRESS !== '0x0000000000000000000000000000000000000000';

  const { data, isLoading } = useReadContract({
    address: NYT_ADDRESS,
    abi: NYT_ABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: base.id,
    // Only call if contract is actually deployed and we have an address
    query: { enabled: !!address && isDeployed },
  });

  // Convert from wei to whole tokens
  const balanceNYT = data ? Number(data / 10n ** 18n) : 0;
  const betaTierName = normalizeTierName(session?.tier) || BETA_DEFAULT_TIER;

  if (!isDeployed) {
    return {
      tier: TIERS[betaTierName] || TIERS.OBSERVER,
      balanceNYT: 0,
      loading: false,
      isDeployed: false,
    };
  }

  let tier = TIERS.OBSERVER;
  if (balanceNYT >= TIERS.SMART_MONEY.min) tier = TIERS.SMART_MONEY;
  else if (balanceNYT >= TIERS.PARTICIPANT.min) tier = TIERS.PARTICIPANT;

  return { tier, balanceNYT, loading: isLoading, isDeployed };
}
