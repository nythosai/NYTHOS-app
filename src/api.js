import axios from 'axios';
import { API_URL } from './config';
import { isWalletSessionValid, loadWalletSession } from './authSession';

// Central axios instance - all backend calls go through this
// 10s timeout prevents indefinite hangs when the server is slow or down
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
