import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import api, { syncWalletSessionHeader } from '../api';
import {
  clearWalletSession,
  isWalletSessionValid,
  loadWalletSession,
  saveWalletSession,
} from '../authSession';

export function useWalletSession() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [session, setSession] = useState(() => loadWalletSession());

  const syncStoredSession = useEffectEvent(() => {
    const stored = loadWalletSession();

    if (!address) {
      clearWalletSession();
      syncWalletSessionHeader(null);
      setSession(null);
      return;
    }

    if (isWalletSessionValid(stored, address)) {
      syncWalletSessionHeader(stored);
      setSession(stored);
      return;
    }

    clearWalletSession();
    syncWalletSessionHeader(null);
    setSession(null);
  });

  useEffect(() => {
    syncStoredSession();
  }, [address]);

  const ensureSession = useCallback(async () => {
    if (!address) throw new Error('Connect your wallet first.');

    const existing = loadWalletSession();
    if (isWalletSessionValid(existing, address)) {
      syncWalletSessionHeader(existing);
      setSession(existing);
      return existing;
    }

    const nonceRes = await api.post('/api/auth/nonce', { address });
    const signature = await signMessageAsync({ message: nonceRes.data.message });
    const verifyRes = await api.post('/api/auth/verify', {
      address,
      challengeToken: nonceRes.data.challengeToken,
      signature,
    });

    const nextSession = {
      address: verifyRes.data.address,
      expiresAt: verifyRes.data.expiresAt,
      tier: verifyRes.data.tier,
      token: verifyRes.data.token,
    };

    saveWalletSession(nextSession);
    syncWalletSessionHeader(nextSession);
    setSession(nextSession);
    return nextSession;
  }, [address, signMessageAsync]);

  const clearSession = useCallback(() => {
    clearWalletSession();
    syncWalletSessionHeader(null);
    setSession(null);
  }, []);

  return {
    clearSession,
    ensureSession,
    hasSession: isWalletSessionValid(session, address),
    session,
  };
}
