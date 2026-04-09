# NYTHOS App

NYTHOS is a Base-first onchain intelligence product. This frontend is now positioned around a more credible launch sequence: working beta first, founder-list growth next, then grants, pilots, and later token deployment.

## What this app is for

- Show live and historical onchain signals in a wallet-aware React app
- Demonstrate product proof for grants, pilot users, and strategic backers
- Prepare a Base launch path for the `$NYT` access layer after audit and traction

## Current state

- Frontend builds successfully with Vite
- Contract addresses in the frontend are still placeholders until deployment
- Founder-list and referral flows are live through backend API endpoints
- The app runs in open beta mode for connected wallets while the Base contracts remain undeployed
- Proof now supports public and private verified feeds with deeper follow-through detail
- Wallet intelligence now includes cohort benchmarks, hold-time analysis, relationship graphs, and coordination flags
- Backend ops now expose `/health` and `/api/admin/ops` for uptime, queue, and scanner diagnostics
- Private delivery now supports Telegram, webhooks, and optional daily email digests
- Optional Redis-backed cache support is available through Upstash REST env vars
- Base ingestion now reacts to fresh Base blocks with a debounced event-driven runner instead of relying only on the one-minute fallback loop

## Local development

### Frontend

1. Copy `.env.example` to `.env`
2. Set `VITE_WALLETCONNECT_PROJECT_ID`
3. Run:

```bash
npm install
npm run dev
```

### Backend

The frontend expects the NYTHOS backend to be available. Backend source lives in `../NYTHOS/backend`.

Typical backend env vars:

- `PORT`
- `MONGODB_URI`
- `ETHERSCAN_API_KEY`
- `ANTHROPIC_API_KEY`
- `ALLOWED_ORIGIN`
- `AUTH_SESSION_SECRET`
- `BASE_RPC_URL`
- `ADMIN_SECRET`

Run the backend with:

```bash
cd ../NYTHOS/backend
npm install
npm run dev
```

### Contracts

Contract source lives in `../NYTHOS-contracts`.

Useful commands:

```bash
cd ../NYTHOS-contracts
npx hardhat test
npx hardhat run scripts/deploy.js --network baseSepolia
```

## Product positioning

This repo now reflects a cleaner fundraising story:

1. Working beta and founder-list growth
2. Grants and pilot revenue
3. Audit and deployment readiness on Base
4. Small strategic raise if needed
5. Token-gated access only after traction

## Key files

- `src/pages/Landing.jsx` - investor and founder-facing landing page
- `src/pages/PresalePage.jsx` - founder-list and funding path page
- `src/pages/TokenPage.jsx` - token plan, allocations, and Base launch framing
- `public/whitepaper.html` - project brief / whitepaper
- `src/config.js` - frontend contract placeholders that must be replaced after deployment
- `docs/06-product-expansion-todo.md` - temporary execution backlog for the next major product buildout. Delete it after implementation and roll the final state into the permanent docs
- `docs/10-api-ops-notes.md` - current API, proof, and operations endpoints
- `docs/11-schema-migration-notes.md` - migration notes for the latest schema and delivery setting additions
