# NYTHOS API And Ops Notes

Updated: 2026-03-24

## Purpose

This file captures the main API and operations endpoints that matter after the latest product expansion work.

## Delivery Settings

- `GET /api/delivery/:ownerAddress`
  Returns private delivery settings for the authenticated wallet, including Telegram, webhook, and digest configuration.

- `POST /api/delivery`
  Saves private delivery rules, tracked tokens and addresses, quiet hours, and optional daily email digest settings.

## Proof Endpoints

- `GET /api/accuracy/stats`
  Returns overall accuracy, by-type accuracy, by-token accuracy, and proof-mode breakdowns.

- `GET /api/accuracy/history`
  Returns recent verified signals with proof context and outcome summaries.

- `GET /api/accuracy/proof-feed?scope=PUBLIC`
  Returns the public proof feed.

- `GET /api/accuracy/proof-feed?scope=PRIVATE&owner=0x...`
  Returns the private proof feed when the wallet session is valid.

- `GET /api/accuracy/proof/:id`
  Returns one proof item with supporting signals, opposing signals, and timeline data.

## Intelligence Endpoints

- `GET /api/intelligence/wallet/:address?chain=BASE`
  Returns the richer wallet intelligence payload now used by the whale profile modal.

Current intelligence data includes:

- reputation score
- cohort
- verified hit rate
- average hold time
- follow-through quality
- cohort benchmark
- co-movers
- relationship graph
- coordination flags

## Ops Endpoints

- `GET /health`
  Lightweight uptime and database readiness check.

- `GET /api/admin/stats`
  High-level founder-list, signal, and accuracy snapshot.

- `GET /api/admin/ops`
  Admin-only diagnostics for:
  - engine telemetry
  - cache provider and cache stats
  - ingestion telemetry
  - queue stats
  - retry counters
  - scanner cursors
  - scanner lag
  - database ready state

## Runtime Notes

The backend now includes:

- in-memory queues for image generation and private delivery
- queued daily digest processing for private signal summaries
- retry and backoff helpers for unstable third-party calls
- telemetry for engine runs, deliveries, retries, and scanner activity
- optional Redis-compatible cache support through Upstash REST env vars with memory fallback
- a debounced Base block ingestion coordinator with a timed fallback loop for faster signal freshness

## Next Infrastructure Work

Intentionally deferred:

- Community Alpha Rooms — shared watchlists, room-level alert feeds, and scoreboards for trading groups
- USDC subscriptions — subscription tiers payable in USDC, gating premium delivery features
