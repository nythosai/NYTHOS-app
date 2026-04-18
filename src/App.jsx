import React, { Suspense, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { isMobile } from './hooks/useWalletSession';
import Landing from './pages/Landing';
import { lazyWithChunkRecovery } from './chunkRecovery';
import CookieBanner from './components/CookieBanner';
import { useWalletSession } from './hooks/useWalletSession';

const PublicProofShell = lazyWithChunkRecovery(() => import('./pages/PublicProofShell'));
const Dashboard = lazyWithChunkRecovery(() => import('./pages/Dashboard'));
const PresalePage = lazyWithChunkRecovery(() => import('./pages/PresalePage'));

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
function SigningScreen({ signing, signError, onRetry, connectorName }) {
  const walletLabel = connectorName || 'your wallet';
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
      padding: '24px',
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '300px', textAlign: 'center' }}>
          <span style={{ color: '#8892a4', fontSize: '13px', fontFamily: 'Inter, -apple-system, sans-serif', lineHeight: 1.6 }}>
            {isMobile
              ? `A sign request was sent to ${walletLabel}. Open your wallet app and approve it to continue.`
              : `Check ${walletLabel} to approve the sign request.`
            }
          </span>
          {isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ color: '#5a6478', fontSize: '11px', fontFamily: 'Inter, -apple-system, sans-serif', letterSpacing: '0.3px' }}>
                Didn't get a prompt?
              </span>
              <button
                onClick={onRetry}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(108,99,255,0.4)',
                  color: '#a89cff',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  letterSpacing: '0.5px',
                }}
              >
                Resend request
              </button>
            </div>
          )}
        </div>
      )}

      {signError && (
        <>
          <span style={{
            color: '#ff6b6b',
            fontSize: '13px',
            fontFamily: 'Inter, -apple-system, sans-serif',
            maxWidth: '320px',
            textAlign: 'center',
            lineHeight: 1.6,
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
              padding: '12px 32px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Inter, -apple-system, sans-serif',
              letterSpacing: '0.5px',
              minHeight: '44px',
            }}
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

// Shown at /dashboard when wallet is not yet connected.
function ConnectGate() {
  const { open } = useAppKit();
  return (
    <div style={{
      background: '#060912',
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '28px',
      padding: '24px',
      textAlign: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <span style={{ color: '#6c63ff', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '8px', fontSize: '20px', fontWeight: 700 }}>
        NYTHOS
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '340px' }}>
        <h2 style={{ color: '#e8eaf0', fontSize: '22px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.3 }}>
          Connect your wallet to access the app
        </h2>
        <p style={{ color: '#8892a4', fontSize: '14px', lineHeight: 1.7 }}>
          Coinbase Wallet, MetaMask, Rainbow, or any WalletConnect wallet.
        </p>
      </div>
      <button
        onClick={() => open()}
        style={{
          background: 'linear-gradient(135deg, #6c63ff, #5b52e8)',
          border: 'none',
          color: '#fff',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '1px',
          padding: '16px 48px',
          borderRadius: '4px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          minHeight: '52px',
        }}
      >
        Connect Wallet
      </button>
      <a href="/" style={{ color: '#5a6478', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.5px' }}>
        ← Back to landing
      </a>
    </div>
  );
}

// Rendered once wallet is connected.
// Auto-triggers SIWE sign-in immediately — wallet is still "warm" from the
// connect step, so the signature prompt fires without a second deep-link round-trip.
function ConnectedApp() {
  const { connector } = useAccount();
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
        connectorName={connector?.name}
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

  // Presale / founder list — accessible without wallet connect.
  if (window.location.pathname.startsWith('/presale')) {
    return (
      <>
        <Suspense fallback={<LoadingScreen />}>
          <PresalePage />
        </Suspense>
        <CookieBanner />
      </>
    );
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

  // /dashboard — show connect gate if not yet connected, app if connected.
  if (window.location.pathname.startsWith('/dashboard')) {
    return (
      <>
        {isConnected
          ? <Suspense fallback={<LoadingScreen />}><ConnectedApp /></Suspense>
          : <ConnectGate />
        }
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
