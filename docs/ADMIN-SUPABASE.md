# DealershipAI · Admin / Supabase setup

## 1) Create tables (one-time)
Open **Supabase → SQL** and paste `supabase/schema.sql`, then click **Run**.

Tables created:
- `public.telemetry_events` (PLG funnel + UX events)
- `public.pulse_events` (optional demo dataset)
- `public.v_telemetry_daily` view

> **Note**: RLS is commented for convenience while you wire things up. Enable and tailor policies before production.

---

## 2) Environment Variables
Set these in Vercel or `.env.local`:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SCHEMA_ENGINE_URL=
```

- `SUPABASE_SERVICE_KEY`: use **service role** key for server API routes only (never expose to client).
- Upstash tokens are used for simple rate-limit on public endpoints.

---

## 3) Seed demo data (optional)
After deploying (or in dev):

- Visit: `/api/admin/seed` → should return `{ ok:true, telemetrySeeded:..., pulseSeeded:... }`
- Then open `/admin` to see charts; **Download CSV** to verify export.

If `/admin` shows an empty chart:
- Confirm telemetry rows exist in Supabase → **Table Editor**
- Ensure env vars are available in the deployment
- Inspect `/api/telemetry` (POST) from your app flows

---

## 4) Telemetry writes (from app flows)
Example (client-side):

```ts
await fetch('/api/telemetry', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ type: 'scan_completed', payload: { url } })
});
```

This will insert a row with `type`, `payload`, server timestamp, and client IP (if present).

---

## 5) Pulse + Schema validate
- `/api/pulse/radar` and `/api/pulse/impacts` return **prod-shaped** JSON stubs you can replace with your compute output.
- `/api/schema/validate` proxies to your **dAI Schema Engine** (`SCHEMA_ENGINE_URL`).

---

## 6) Hardening (before production)
- Enable RLS and define policies per table
- Add API auth/keys for **admin** routes
- Add structured logging (Sentry or OTEL)
- Keep **service key** on server only

---

## 7) Quick sanity checklist
- `/admin` shows charts with today/last 48h data
- CSV download has rows and correct headers
- `/api/telemetry` returns 200 in browser console when events fire
- `/api/pulse/*` responses match your UI contracts
