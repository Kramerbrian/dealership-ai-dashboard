# DealershipAI – Deployment Validation Checklist

## 1. Manifests

- [ ] All four manifest files exist and parse as valid JSON.
- [ ] Version numbers synchronized across manifests.
- [ ] `lastUpdated` timestamps < 24 hours.

## 2. GitHub Workflows

- [ ] CI pipelines pass linting and last run succeeded.
- [ ] Self-Optimization workflow ran overnight.
- [ ] Slack summary message received in `#deployments`.

## 3. Vercel Deployment

- [ ] `dealershipai.com` and `dash.dealershipai.com` online.
- [ ] Environment variables correctly populated.
- [ ] Cron jobs active (quarterly + nightly Lighthouse).
- [ ] p95 latency under 120 ms.

## 4. Authentication

- [ ] Clerk sign-in works; onboarding redirect correct.
- [ ] Returning users land on Pulse Dashboard.
- [ ] Session metadata (dealerId, brand, region) populated.

## 5. Onboarding Workflow

- [ ] All steps render and progress properly.
- [ ] KPI data fetched from /api/marketpulse/compute.
- [ ] PVR values saved to Clerk metadata.
- [ ] Completion routes to /preview/orchestrator.

## 6. Pulse Dashboard

- [ ] Live data visible in AI Visibility and Forecast cards.
- [ ] Agent inbox tiles appear above baseline tiles.
- [ ] Real-time updates via SSE or WebSocket.
- [ ] Analytics graphs update correctly.

## 7. Edge Functions

- [ ] Edge APIs respond in < 150 ms.
- [ ] No 500/timeout errors in logs.

## 8. Self-Optimization Loop

- [ ] Nightly tone-training complete.
- [ ] Weekly benchmark refresh executed.
- [ ] Mood analytics JSON updated.
- [ ] Slack success summary present.

## 9. Meta-Intelligence Layer

- [ ] Knowledge Graph queries respond < 50 ms.
- [ ] Daily executive PDF generated.
- [ ] Contextual feeds (weather, OEM, events) < 2 h old.
- [ ] Executive Console dashboard shows fresh data.

## 10. Security & Accessibility

- [ ] HTTPS enforced across domains.
- [ ] No PII in telemetry logs.
- [ ] Audio muted by default.
- [ ] `axe-core` or Lighthouse accessibility score ≥ 95 %.

---

### Sign-Off

| Team | Reviewer | Date | Status |
|------|-----------|------|--------|
| Platform Engineering |  |  |  |
| Data Science |  |  |  |
| Design Systems |  |  |  |
| Growth |  |  |  |

After all boxes checked and 3 of 4 teams sign off, export the PDF report and upload it to `/reports/deployment-validation-report.pdf`.

Slack notification will post automatically to `#deployments`.

