import React, { Suspense, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Landing from './pages/Landing';
import { lazyWithChunkRecovery } from './chunkRecovery';
import CookieBanner from './components/CookieBanner';
import { useWalletSession } from './hooks/useWalletSession';

const PublicProofShell = lazyWithChunkRecovery(() => import('./pages/PublicProofShell'));
const Dashboard = lazyWithChunkRecovery(() => import('./pages/Dashboard'));

// Capture ?ref=CODE from URL and persist to localStorage so the presale
// signup form can credit the referrer automatically.
function useReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && /^[0-9a-f]{8}$/i.test(ref.trim())) {
      localStorage.setItem('nythos_ref', ref.trim().toLowerCase());
    }
  }, []);
}

function LoadingScreen() {
  return (
    <div style={{
      background: '#080b12',
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        color: '#6c63ff',
        fontFamily: "'Courier New', monospace",
        letterSpacing: '8px',
        fontSize: '24px',
        opacity: 0.6,
      }}>
        NYTHOS
      </span>
    </div>
  );
}

// Shown between wallet connect and successful SIWE sign-in
function SigningScreen({ signing, signError, onRetry }) {
  return (
    <div style={{
      background: '#080b12',
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    }}>
      <span style={{
        color: '#6c63ff',
        fontFamily: "'Courier New', monospace",
        letterSpacing: '8px',
        fontSize: '24px',
      }}>
        NYTHOS
      </span>
      {signing && (
        <span style={{
          color: '#888',
          fontSize: '13px',
          fontFamily: 'Inter, -apple-system, sans-serif',
        }}>
          Check your wallet to sign in...
        </span>
      )}
      {signError && (
        <>
          <span style={{
            color: '#ff6b6b',
            fontSize: '13px',
            fontFamily: 'Inter, -apple-system, sans-serif',
            maxWidth: '300px',
            textAlign: 'center',
          }}>
            {signError}
          </span>
          <button
            onClick={onRetry}
            style={{
              background: '#6c63ff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 28px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Inter, -apple-system, sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

// Rendered once wallet is connected.
// Auto-triggers SIWE sign-in immediately — wallet is still "warm" from the
// connect step, so the signature prompt fires without a second deep-link round-trip.
function ConnectedApp() {
  const { hasSession, signing, signError, ensureSession } = useWalletSession();

  useEffect(() => {
    if (!hasSession && !signing) {
      ensureSession().catch(() => {});
    }
  // Only run when hasSession changes — not on every signing state tick
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSession]);

  if (!hasSession) {
    return (
      <SigningScreen
        signing={signing}
        signError={signError}
        onRetry={() => ensureSession().catch(() => {})}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Dashboard />
    </Suspense>
  );
}

export default function App() {
  const { isConnected, status } = useAccount();
  useReferralCapture();

  // Show a silent loading screen while wagmi restores session from localStorage.
  if (status === 'reconnecting') {
    return <LoadingScreen />;
  }

  // Public proof feed — accessible without wallet connect.
  if (window.location.pathname === '/proof') {
    return (
      <>
        <Suspense fallback={<LoadingScreen />}>
          <PublicProofShell />
        </Suspense>
        <CookieBanner />
      </>
    );
  }

  return (
    <>
      {isConnected ? <ConnectedApp /> : <Landing />}
      <CookieBanner />
    </>
  );
}
