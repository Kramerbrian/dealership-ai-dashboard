# DriftGuard Endpoints

- `GET /api/driftguard/run` — compares `public/schema-snapshots/latest.json` vs `baseline.json`, writes to `history.json`, posts Slack alert on drift.
- `GET /api/driftguard/history` — returns last N history points `{ ts, counts }` for sparkline.
- `POST /api/driftguard/promote` — admin-only (via `x-role: admin`) to copy `latest.json` → `baseline.json`; posts Slack confirm.

Ensure you have:

- `public/schema-snapshots/baseline.json`
- `public/schema-snapshots/latest.json`
- `.env.local` contains `SLACK_WEBHOOK_URL=<your webhook>`

