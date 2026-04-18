import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, mainnet } from '@reown/appkit/networks';

// Get your free project ID at https://cloud.reown.com
// Set VITE_WALLETCONNECT_PROJECT_ID in your .env file
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
const fallbackAppUrl = import.meta.env.VITE_APP_URL || 'https://nythos.io';
const appUrl = typeof window !== 'undefined' ? window.location.origin : fallbackAppUrl;
const appIconUrl = new URL('/favicon.svg', `${appUrl}/`).toString();

const networks = [base, baseSepolia, mainnet];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

// AppKit powers the wallet modal - supports:
//  • Coinbase Smart Wallet (Base-native, passkey login, no seed phrase)
//  • WalletConnect v2 (Rainbow, Trust, MetaMask mobile, 200+ wallets)
//  • Injected wallets (MetaMask, Rabby, etc. browser extensions)
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name:        'NYTHOS',
    description: 'Base-native blockchain intelligence',
    url:         appUrl,
    icons:       [appIconUrl],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix':            '#6c63ff',
    '--w3m-color-mix-strength':   20,
    '--w3m-font-family':          'Inter, -apple-system, sans-serif',
    '--w3m-border-radius-master': '4px',
    '--w3m-z-index':              9999,   // above all app UI on mobile
  },
  features: {
    analytics: false,  // No telemetry
    socials:   false,  // Wallet-only, no social login
    email:     false,
  },
  // Surface the most-used mobile wallets at the top of the connect modal.
  // On mobile browsers AppKit automatically switches from QR to deep-link/redirect
  // for these wallets, so users can open their wallet app with one tap.
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet — works in-browser, no deep-link needed
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
  // Allow connection regardless of active chain — we handle network switching after connect.
  // false causes the modal to lock up for mobile users on Polygon, Arbitrum, etc.
  allowUnsupportedChain: true,
  // Default to Base so Coinbase Smart Wallet / Base users connect immediately
  defaultNetwork: base,
});

// Re-export wagmiConfig so WagmiProvider in main.jsx doesn't need to change
export const wagmiConfig = wagmiAdapter.wagmiConfig;
