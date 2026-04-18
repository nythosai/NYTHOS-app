import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import api, { syncWalletSessionHeader } from '../api';
import {
  clearWalletSession,
  isWalletSessionValid,
  loadWalletSession,
  saveWalletSession,
} from '../authSession';

export const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
// 120s on mobile: WalletConnect deep-link round-trips + user switching apps takes much longer than desktop
const SIGN_TIMEOUT_MS = isMobile ? 120_000 : 30_000;

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
      const raw = err?.shortMessage || err?.message || '';
      const isTimeout   = raw.includes('did not respond');
      const isRejection = raw.includes('rejected') || raw.includes('denied') || err?.code === 4001;
      const msg = isRejection
        ? 'You rejected the signature request. Tap Try Again when ready.'
        : isTimeout && isMobile
          ? 'Your wallet didn\'t respond. Open your wallet app, approve the pending sign request, then tap Try Again.'
          : raw || 'Signature failed. Please try again.';
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
