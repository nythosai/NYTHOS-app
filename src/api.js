import axios from 'axios';
import { API_URL } from './config';
import { isWalletSessionValid, loadWalletSession } from './authSession';

const isMobileDevice = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Mobile gets 20s — Render cold starts and slower 4G networks need the headroom
const api = axios.create({
  baseURL: API_URL,
  timeout: isMobileDevice ? 20_000 : 10_000,
});

export function syncWalletSessionHeader(session) {
  if (session && isWalletSessionValid(session)) {
    api.defaults.headers.common.Authorization = `Bearer ${session.token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

syncWalletSessionHeader(loadWalletSession());

export default api;
