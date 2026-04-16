import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import api, { syncWalletSessionHeader } from '../api';
import {
  clearWalletSession,
  isWalletSessionValid,
  loadWalletSession,
  saveWalletSession,
} from '../authSession';

// Mobile wallets need more time to handle deep-link round-trips
const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const SIGN_TIMEOUT_MS = isMobile ? 60000 : 30000;

export function useWalletSession() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [session, setSession] = useState(() => loadWalletSession());
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState(null);

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

    setSigning(true);
    setSignError(null);

    try {
      const nonceRes = await api.post('/api/auth/nonce', { address });

      // Race the signature against a timeout — prevents indefinite hang on mobile
      // when the wallet deep-link fails to open or the user doesn't respond
      const signature = await Promise.race([
        signMessageAsync({ message: nonceRes.data.message }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Wallet did not respond in time. Please try again.')),
            SIGN_TIMEOUT_MS,
          )
        ),
      ]);

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
      setSigning(false);
      return nextSession;
    } catch (err) {
      setSigning(false);
      const msg = err?.shortMessage || err?.message || 'Signature failed. Please try again.';
      setSignError(msg);
      throw err;
    }
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
    signing,
    signError,
  };
}
