# DealershipAI SEO Enhancer v2 — Stubs

## Install

```bash
npm i recharts jsonwebtoken @prisma/client
npm i -D prisma vitest ts-node
npx prisma generate
npx prisma migrate dev -n "seo_persistence"
SEED_TENANT_ID=00000000-0000-0000-0000-000000000000 ts-node prisma/seed.ts
```

## Env
- SUPABASE_JWT_SECRET: used to decode tenant_id
- SEED_TENANT_ID: for seeding priors

## cURL
- POST /api/seo/priors/upsert — Idempotency-Key required
- POST /api/seo/ab/allocate
- POST /api/seo/hooks/metrics
- GET  /api/seo/metrics/query?variantId=v1&group=week&format=json|csv&uci=90|95|99

## New hardening
- Idempotency store: `0010_idempotency.sql` + helper `app/api/_utils/idempotency.ts`.
- HMAC verification for `/api/seo/hooks/metrics` via `X-Signature` and `WEBHOOK_SECRET`.
- JWT guard in `middleware.ts` with `JWT_AUD` and `JWT_ISS`.
- Weekly MV `mv_weekly_variant` for fast queries.

## Env additions
- JWT_AUD, JWT_ISS, WEBHOOK_SECRET

## Migrate
```bash
npx prisma migrate dev -n "idempotency_and_weekly_mv"
```

## Report endpoint
- `GET /api/seo/report?variantId=v1` streams CSV from `mv_weekly_variant`.

## Webhook secrets
- Per-tenant secret in `tenant_webhook_secrets`. Rotate by updating row.

## SLO headers
- Add `Server-Timing` header hints: `target=150` for reads, `target=400` for writes.

## Next steps
- Wire real scoring behind /api/ai-scores
- Add idempotency table
- Add CSV download in UI and sparkline
