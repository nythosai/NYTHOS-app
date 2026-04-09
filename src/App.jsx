import React, { Suspense, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Landing from './pages/Landing';
import { lazyWithChunkRecovery } from './chunkRecovery';
import CookieBanner from './components/CookieBanner';

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

export default function App() {
  const { isConnected, status } = useAccount();
  useReferralCapture();

  function renderLoadingScreen() {
    return (
      <div style={{
        background: '#080b12',
        height: '100vh',
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

  // Show a silent loading screen while wagmi restores session from localStorage.
  // Using null caused a blank page when the user cancelled the connect modal.
  if (status === 'reconnecting') {
    return renderLoadingScreen();
  }

  return (
    <>
      {isConnected ? (
        <Suspense fallback={renderLoadingScreen()}>
          <Dashboard />
        </Suspense>
      ) : <Landing />}
      <CookieBanner />
    </>
  );
}
