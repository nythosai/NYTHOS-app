const STORAGE_KEY = 'nythos_wallet_session';

export function loadWalletSession() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveWalletSession(session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearWalletSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isWalletSessionValid(session, address) {
  if (!session?.token || !session?.expiresAt || !session?.address) return false;
  if (session.expiresAt <= Date.now()) return false;
  if (!address) return true;
  return session.address.toLowerCase() === address.toLowerCase();
}
