import { lazy } from 'react';

const CHUNK_RELOAD_KEY = 'nythos_chunk_reload';
const CHUNK_RELOAD_WINDOW_MS = 30_000;

export function isChunkLoadError(error) {
  const message = String(error?.message || error || '');
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(message);
}

function recentlyReloadedForChunkError() {
  if (typeof window === 'undefined') return false;

  try {
    const raw = window.sessionStorage.getItem(CHUNK_RELOAD_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    return Number.isFinite(parsed?.at) && (Date.now() - parsed.at) < CHUNK_RELOAD_WINDOW_MS;
  } catch {
    return false;
  }
}

export function reloadForChunkError(error) {
  if (typeof window === 'undefined' || !isChunkLoadError(error)) return false;
  if (recentlyReloadedForChunkError()) return false;

  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, JSON.stringify({
      at: Date.now(),
      href: window.location.href,
    }));
  } catch {
    // Ignore storage issues and still try to recover.
  }

  window.location.reload();
  return true;
}

export function installChunkRecoveryHandlers() {
  if (typeof window === 'undefined') return () => {};

  const onPreloadError = (event) => {
    const error = event?.payload || event?.detail || event;
    if (reloadForChunkError(error)) {
      event?.preventDefault?.();
    }
  };

  const onUnhandledRejection = (event) => {
    if (reloadForChunkError(event?.reason)) {
      event?.preventDefault?.();
    }
  };

  window.addEventListener('vite:preloadError', onPreloadError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  return () => {
    window.removeEventListener('vite:preloadError', onPreloadError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
}

export function lazyWithChunkRecovery(loader) {
  return lazy(async () => {
    try {
      return await loader();
    } catch (error) {
      if (reloadForChunkError(error)) {
        return new Promise(() => {});
      }
      throw error;
    }
  });
}
