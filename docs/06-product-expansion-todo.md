# NYTHOS Product Expansion TODO

This is a temporary execution backlog for turning NYTHOS into a stronger Base-first intelligence product.

Delete this file when the items here are completed and the final state has been written into the permanent docs:

- `README.md`
- `../NYTHOS/NYTHOS_BUILD_GUIDE.md`
- product-facing docs and pages
- backend API docs and ops notes

Do not keep this file as a permanent artifact once the implementation work is done.

---

## Objective

Build the next version of NYTHOS around the features most likely to create a real edge in a crowded crypto market:

- Base-native intelligence
- stronger signal quality
- personalized delivery
- a premium smart money layer
- community workflows
- clear proof of value
- stable operational foundations

Status note:

- `March 23, 2026`: Base swap signals, liquidity flow signals, bridge flow signals, conviction reasons, clustering, and per-user Telegram/webhook delivery are now live in the backend and visible in the app history/feed.
- `March 23, 2026`: Minimum-confidence delivery thresholds and signal-type filtering are already supported in the backend delivery settings. The next personalization work is broader alert tuning, saved views, and better UI exposure for newer signal classes.
- `March 23, 2026`: Launch radar, richer signal explanations, saved views, broader delivery controls, wallet intelligence, expanded proof tracking, and more actionable signal cards are now implemented. Community Alpha Rooms and USDC subscriptions remain paused for a later pass.
- `March 24, 2026`: Conviction scoring now combines wallet quality, token context, bridge alignment, Base-native behavior, and market context. Wallet intelligence now includes cohort benchmarking, hold-time analysis, follow-through quality, relationship graphs, and coordination flags.
- `March 24, 2026`: Proof now has public and private feeds, deeper signal detail, what-happened-next summaries, who-else-followed context, health diagnostics, in-memory job queues, retry/backoff, and admin ops endpoints.

---

## Recommended Order

1. Launch intelligence and Base Launch Radar
2. Signal quality, event narratives, and AI explanation
3. Personal alert controls and saved intelligence views
4. Smart money labeling and reputation
5. Proof of Signal and actionable alerts
6. Community Alpha Rooms and USDC subscriptions
7. Production hardening and documentation refresh

---

## Phase 1: Base Native Intelligence

### Base swaps

- [x] Detect large swaps on Base
- [x] Support Aerodrome swap detection
- [x] Support Uniswap on Base swap detection
- [x] Store token in, token out, amount, route, pool, and initiator
- [x] Label swap direction in user-facing signals
- [x] Link swap signals to external explorers

Acceptance:

- High-value Base swaps show up as first-class signals, not generic transfers
- Signals tell the user what was swapped, where it happened, and why it matters

### Liquidity intelligence

- [x] Detect LP adds on Base
- [x] Detect LP removals on Base
- [x] Track pool creation events for relevant DEXes
- [x] Flag large liquidity withdrawals as risk events
- [x] Group LP activity with related wallet or token activity

Acceptance:

- NYTHOS can explain whether liquidity is entering or leaving a market

### Bridge intelligence

- [x] Detect bridge inflows into Base
- [x] Detect bridge outflows from Base
- [x] Label major bridge contracts and wallets
- [x] Surface large bridge flows as separate signal types

Acceptance:

- NYTHOS can show whether money is rotating into Base or leaving it

### Launch intelligence

- [x] Detect new token launches on Base
- [x] Detect deployer funding patterns
- [x] Detect first smart wallet entries into fresh tokens
- [x] Flag suspicious launch patterns

Acceptance:

- NYTHOS can power a `Base Launch Radar` feature with real backend support

---

## Phase 2: Signal Quality

### Dedupe and clustering

- [x] Deduplicate repeated or near-identical signals
- [x] Cluster related signals into one event narrative
- [x] Merge raw transfer, swap, LP, bridge, and price events when they belong together
- [x] Add signal cooldown logic to avoid noisy repeats

Acceptance:

- Users see fewer duplicate alerts and more event-level intelligence

### Conviction scoring

- [x] Introduce a multi-factor conviction model
- [x] Combine wallet quality, token context, volume, bridge flow, and price context
- [x] Add weights for Base-native behavior
- [x] Expose score reasons in API responses

Acceptance:

- Every high-confidence signal has understandable reasons behind its score

### AI explanation

- [x] Add `Why this matters` summaries for high-value signals
- [x] Add `What to watch next` summaries where confidence is high
- [x] Keep private signals private
- [x] Avoid generating AI copy for low-signal noise

Acceptance:

- NYTHOS explains signals in human language without sounding generic

---

## Phase 3: Personalization

### Private alert delivery

- [x] Add private Telegram delivery per user
- [x] Add webhook delivery per user
- [x] Add email digest support if needed later
- [x] Support alert destinations per user

Acceptance:

- Alerts can be delivered outside the app without sharing a global channel

### Alert controls

- [x] Allow `minimum conviction` rules
- [x] Allow chain filters per alert
- [x] Allow signal-type filters in delivery settings
- [x] Allow token, wallet, and contract watch rules
- [x] Support quiet hours or digest mode

Acceptance:

- Users can tune NYTHOS to their own style instead of taking every alert
- Current gap: the backend can already filter by confidence and signal type, but the UI and settings model still need broader control over chains, specific assets, digest timing, and richer signal classes

### Saved intelligence views

- [x] Saved watchlists by wallet
- [x] Saved watchlists by token
- [x] Saved watchlists by contract
- [x] Saved filters and custom dashboards

Acceptance:

- Returning users can pick up their workflow immediately

---

## Phase 4: Smart Money Layer

### Wallet and entity labeling

- [x] Add wallet tags
- [x] Add entity types such as exchange, bridge, deployer, LP, KOL wallet, smart wallet
- [x] Add a review flow for internal label accuracy
- [x] Persist labels in the backend

Acceptance:

- Signals show who is acting, not just raw addresses
- Current foundation: lightweight wallet score and profile endpoints exist, but labels and reputation are not yet persistent product features

### Reputation and performance

- [x] Build wallet reputation history
- [x] Track win rate by wallet cohort
- [x] Track first-entry and exit behavior
- [x] Track hold time and follow-through quality

Acceptance:

- NYTHOS can tell users which wallets deserve attention and why

### Wallet graph

- [x] Build wallet relationship graph data
- [x] Surface repeated co-movement between wallets
- [x] Detect likely coordinated behavior

Acceptance:

- Users can see groups and patterns, not isolated addresses

---

## Phase 5: Market-Differentiating Product Features

### Community Alpha Rooms

- [ ] Create room model in the backend
- [ ] Add room membership and access control
- [ ] Add shared wallet watchlists
- [ ] Add shared token and contract watchlists
- [ ] Add room-level alert feeds
- [ ] Add room-level scoreboards and weekly summaries

Acceptance:

- NYTHOS becomes usable by communities, teams, and trading groups, not just solo users

### Base Launch Radar

- [x] Create a dedicated launch radar feed
- [x] Highlight new launches, early smart-wallet entries, LP seeding, and exits
- [x] Add filters for risk, conviction, and recency

Acceptance:

- Users can use NYTHOS specifically for early Base opportunity discovery

### Proof of Signal

- [x] Track outcomes for more signal types
- [x] Build public and private proof pages
- [x] Add verified performance summaries
- [x] Show misses alongside hits

Acceptance:

- NYTHOS earns trust by proving signal quality, not only claiming it

### Actionable alerts

- [x] Add one-tap actions from alerts
- [x] Add context links for token, pool, wallet, or explorer views
- [x] Add `who else followed` and `what happened next` support where possible

Acceptance:

- Alerts help the user act, not just observe

### USDC subscriptions

- [ ] Define subscription tiers payable in USDC
- [ ] Gate premium rooms or delivery features by subscription
- [ ] Add billing state and access checks
- [ ] Document revenue flows clearly

Acceptance:

- NYTHOS can monetize product usage without relying on token hype

---

## Phase 6: Production Hardening

### Performance and resilience

- [x] Add Redis cache
- [x] Move heavy background work into queues
- [x] Add retry logic for external API failures
- [x] Add rate-limit aware backoff
- [x] Add event-driven ingestion where practical

Acceptance:

- The system remains useful during load spikes and third-party API problems

### Observability

- [x] Add metrics for signal generation volume
- [x] Add metrics for signal quality and delivery success
- [x] Add logs for failed scanners and failed deliveries
- [x] Add uptime and health monitoring
- [x] Add admin diagnostics for scanner lag

Acceptance:

- We can see when the system is strong, weak, delayed, or failing

### Data integrity

- [x] Add more backend tests
- [x] Add route-level auth tests
- [x] Add scanner cursor tests
- [x] Add signal dedupe tests
- [x] Add migration notes for schema changes

Acceptance:

- New product depth does not break trust in the data layer

---

## Docs and Cleanup

When all major items above are implemented:

- [ ] Delete this file
- [x] Update `README.md`
- [x] Update `../NYTHOS/NYTHOS_BUILD_GUIDE.md`
- [ ] Update investor and grant docs if positioning changed
- [x] Update API and ops documentation
- [ ] Replace temporary TODO language with permanent product and architecture documentation

---

## Notes

- Stay Base-first until NYTHOS clearly wins one wedge
- Prefer product value over adding more chains
- Favor trust, proof, and daily usefulness over noise or hype
