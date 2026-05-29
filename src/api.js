import axios from 'axios';
import { API_URL } from './config';
import { isWalletSessionValid, loadWalletSession } from './authSession';

const isMobileDevice = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Steady-state timeout: short, so a hung request doesn't block the UI.
// First-request (cold-start) timeout gets bumped automatically — see below.
const STEADY_TIMEOUT_MS = isMobileDevice ? 20_000 : 10_000;
// Render free spins the service down after 15 minutes of idle. A cold boot
// can take 45-60s while it allocates a container and reconnects to Mongo,
// so the very first request after a quiet period needs a longer timeout
// or it will fail with ECONNABORTED and the UI will look broken.
const COLD_START_TIMEOUT_MS = 60_000;

let hasSucceededOnce = false;

const api = axios.create({
  baseURL: API_URL,
  timeout: STEADY_TIMEOUT_MS,
});

// Bump timeout for the very first request — Render free cold starts are slow.
api.interceptors.request.use((cfg) => {
  if (!hasSucceededOnce && cfg.timeout === STEADY_TIMEOUT_MS) {
    cfg.timeout = COLD_START_TIMEOUT_MS;
  }
  return cfg;
});

// One automatic retry on cold-start failures (timeout / 5xx). Only fires before
// we've ever seen a successful response — after that the user is definitely
// on a warm server and a failure is real.
api.interceptors.response.use(
  (res) => {
    hasSucceededOnce = true;
    return res;
  },
  async (err) => {
    const cfg = err.config;
    if (!cfg || cfg.__retried || hasSucceededOnce) return Promise.reject(err);

    const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
    const isServerError = err.response?.status >= 500;
    const isNetworkError = !err.response && err.message?.includes('Network');

    if (!isTimeout && !isServerError && !isNetworkError) return Promise.reject(err);

    cfg.__retried = true;
    cfg.timeout = COLD_START_TIMEOUT_MS;
    return api.request(cfg);
  }
);

export function syncWalletSessionHeader(session) {
  if (session && isWalletSessionValid(session)) {
    api.defaults.headers.common.Authorization = `Bearer ${session.token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

syncWalletSessionHeader(loadWalletSession());

export default api;
