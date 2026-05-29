import React, { Suspense, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { isMobile } from './hooks/useWalletSession';
import Landing from './pages/Landing';
import { lazyWithChunkRecovery } from './chunkRecovery';
import CookieBanner from './components/CookieBanner';
import { useWalletSession } from './hooks/useWalletSession';
import { useSeoHead } from './hooks/useSeoHead';

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

function SkipLink() {
  return <a className="skip-link" href="#main">Skip to content</a>;
}

function LoadingScreen() {
  return (
    <div className="auth-screen">
      <span className="auth-wordmark muted">NYTHOS</span>
    </div>
  );
}

// Shown between wallet connect and successful SIWE sign-in
function SigningScreen({ signing, signError, onRetry, connectorName }) {
  const walletLabel = connectorName || 'your wallet';
  return (
    <div className="auth-screen">
      <span className="auth-wordmark">NYTHOS</span>

      {signing && (
        <div className="auth-block">
          <span className="auth-body">
            {isMobile
              ? `A sign request was sent to ${walletLabel}. Open your wallet app and approve it to continue.`
              : `Check ${walletLabel} to approve the sign request.`
            }
          </span>
          {isMobile && (
            <div className="auth-block" style={{ gap: 6, marginTop: 4 }}>
              <span className="auth-hint">Didn't get a prompt?</span>
              <button className="auth-btn" onClick={onRetry}>Resend request</button>
            </div>
          )}
        </div>
      )}

      {signError && (
        <>
          <span className="auth-error">{signError}</span>
          <button className="auth-btn-primary" onClick={onRetry}>Try Again</button>
        </>
      )}
    </div>
  );
}

// Shown at /dashboard when wallet is not yet connected.
function ConnectGate() {
  useSeoHead({ noindex: true });
  const { open } = useAppKit();
  return (
    <div className="auth-screen" style={{ gap: 28 }}>
      <span className="auth-wordmark sm">NYTHOS</span>
      <div className="auth-block" style={{ gap: 10, maxWidth: 340 }}>
        <h2 className="auth-heading">Connect your wallet to access the app</h2>
        <p className="auth-body lg">
          Coinbase Wallet, MetaMask, Rainbow, or any WalletConnect wallet.
        </p>
      </div>
      <button className="auth-btn-cta" onClick={() => open()}>Connect Wallet</button>
      <a className="auth-link" href="/">← Back to landing</a>
    </div>
  );
}

// Rendered once wallet is connected.
// Auto-triggers SIWE sign-in immediately — wallet is still "warm" from the
// connect step, so the signature prompt fires without a second deep-link round-trip.
function ConnectedApp() {
  useSeoHead({ noindex: true });
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
        <SkipLink />
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
        <SkipLink />
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
        <SkipLink />
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
      <SkipLink />
      {isConnected ? <ConnectedApp /> : <Landing />}
      <CookieBanner />
    </>
  );
}
