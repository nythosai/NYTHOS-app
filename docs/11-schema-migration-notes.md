# NYTHOS Schema Migration Notes

Updated: 2026-03-24

These notes capture the backend model changes introduced during the March 24 expansion pass so deployments and database reviews stay aligned.

## DeliverySettings

New fields:

- `emailAddress`
- `emailDigestEnabled`
- `digestHourUtc`
- `digestLastSentAt`

Operational note:

- Existing delivery records will keep working without changes.
- Digest fields default safely and do not require backfilling.

## Signal

Recent additions used by proof, follow-through, and signal detail:

- `scoreBreakdown`
- `supportingSignalIds`
- `opposingSignalIds`
- `whoElseFollowed`
- `followedByCount`
- `coordinatedAddresses`
- `whatHappenedNext`

Operational note:

- Existing signals do not need to be rewritten.
- Proof pages and signal detail views already handle missing values.

## WalletLabel

Reputation snapshots now may include:

- `winRate`
- `averageHoldHours`
- `followThroughQuality`

Operational note:

- Older reputation snapshots can remain as-is.
- New snapshots fill these fields over time as wallet intelligence refreshes.

## ScannerCursor

No schema shape change was required, but scanner cursor tests now verify:

- chain normalization
- upsert behavior
- timestamp updates

## Deployment Checklist

1. Deploy backend code before expecting digest or cache settings in the UI.
2. Add new env vars only if you want the new infrastructure paths:
   - `RESEND_API_KEY`
   - `DIGEST_FROM_EMAIL`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. No destructive data migration is required for existing MongoDB collections.
