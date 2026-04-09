import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './wagmi';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { installChunkRecoveryHandlers } from './chunkRecovery';
import './index.css';

const queryClient = new QueryClient();
installChunkRecoveryHandlers();

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </WagmiProvider>
  </ErrorBoundary>
);
