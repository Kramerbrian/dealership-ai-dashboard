# DealershipAI Backend Audit Report

**Generated:** 2025-11-12T02:43:15.851Z
**Duration:** 22s
**Base URL:** https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app

## Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Endpoints | 194 | 100% |
| ✅ Passed | 0 | 0.0% |
| ❌ Failed | 193 | 99.5% |
| ⚠️ Warnings | 0 | 0.0% |
| ⊘ Skipped | 1 | 0.5% |

## Results by Category

| Category | Passed | Failed | Total | Pass Rate |
|----------|--------|--------|-------|-----------|
| AI | 0 | 25 | 25 | 0% |
| Pulse | 0 | 10 | 10 | 0% |
| Metrics | 0 | 8 | 8 | 0% |
| Admin | 0 | 6 | 6 | 0% |
| Integrations | 0 | 6 | 6 | 0% |
| Visibility | 0 | 6 | 6 | 0% |
| Dealership | 0 | 5 | 5 | 0% |
| DriftGuard | 0 | 5 | 5 | 0% |
| Fix | 0 | 5 | 5 | 0% |
| Orchestrator | 0 | 5 | 5 | 0% |
| Origins | 0 | 5 | 5 | 0% |
| Schema | 0 | 5 | 5 | 0% |
| User | 0 | 5 | 5 | 0% |
| Testing | 0 | 4 | 4 | 0% |
| Leads | 0 | 4 | 4 | 0% |
| Claude | 0 | 4 | 4 | 0% |
| Health | 0 | 4 | 4 | 0% |
| Landing | 0 | 4 | 4 | 0% |
| Stripe | 0 | 4 | 4 | 0% |
| Analytics | 0 | 3 | 3 | 0% |
| ElevenLabs | 0 | 3 | 3 | 0% |
| Probe | 0 | 3 | 3 | 0% |
| SiteInject | 0 | 3 | 3 | 0% |
| ZeroClick | 0 | 3 | 3 | 0% |
| Actions | 0 | 2 | 2 | 0% |
| AEO | 0 | 2 | 2 | 0% |
| Audit | 0 | 2 | 2 | 0% |
| Competitors | 0 | 2 | 2 | 0% |
| Cron | 0 | 2 | 2 | 0% |
| Geo | 0 | 2 | 2 | 0% |
| Growth | 0 | 2 | 2 | 0% |
| QAI | 0 | 2 | 2 | 0% |
| Relevance | 0 | 2 | 2 | 0% |
| Scan | 0 | 2 | 2 | 0% |
| Viral | 0 | 2 | 2 | 0% |
| Agentic | 0 | 1 | 1 | 0% |
| Alerts | 0 | 1 | 1 | 0% |
| Automation | 0 | 1 | 1 | 0% |
| Calculator | 0 | 1 | 1 | 0% |
| Chat | 0 | 1 | 1 | 0% |
| Console | 0 | 1 | 1 | 0% |
| Diagnostics | 0 | 1 | 1 | 0% |
| Economics | 0 | 1 | 1 | 0% |
| DAI | 0 | 1 | 1 | 0% |
| Export | 0 | 1 | 1 | 0% |
| FixPack | 0 | 1 | 1 | 0% |
| Formulas | 0 | 1 | 1 | 0% |
| GA4 | 0 | 1 | 1 | 0% |
| Intel | 0 | 1 | 1 | 0% |
| MarketPulse | 0 | 1 | 1 | 0% |
| Migration | 0 | 1 | 1 | 0% |
| MysteryShop | 0 | 1 | 1 | 0% |
| Notifications | 0 | 1 | 1 | 0% |
| Observability | 0 | 1 | 1 | 0% |
| OEL | 0 | 1 | 1 | 0% |
| Opportunities | 0 | 1 | 1 | 0% |
| Optimizer | 0 | 1 | 1 | 0% |
| Parity | 0 | 1 | 1 | 0% |
| Public | 0 | 1 | 1 | 0% |
| Refresh | 0 | 1 | 1 | 0% |
| Reviews | 0 | 1 | 1 | 0% |
| Scenarios | 0 | 1 | 1 | 0% |
| Scores | 0 | 1 | 1 | 0% |
| Share | 0 | 1 | 1 | 0% |
| System | 0 | 1 | 1 | 0% |
| Targeting | 0 | 1 | 1 | 0% |
| Telemetry | 0 | 1 | 1 | 0% |
| Trust | 0 | 1 | 1 | 0% |
| UGC | 0 | 1 | 1 | 0% |
| V1 | 0 | 1 | 1 | 0% |
| WebSocket | 0 | 1 | 1 | 0% |

## Failed Endpoints

| Endpoint | Method | Status | Error | Duration |
|----------|--------|--------|-------|----------|
| /api/admin/flags | GET | 404 | - | 323ms |
| /api/admin/integrations/visibility | GET | 404 | - | 47ms |
| /api/admin/integrations/visibility | POST | 404 | - | 45ms |
| /api/admin/seed | POST | 404 | - | 51ms |
| /api/admin/setup | GET | 404 | - | 48ms |
| /api/admin/setup | POST | 404 | - | 51ms |
| /api/actions/draft-reviews | POST | 404 | - | 89ms |
| /api/actions/generate-schema | POST | 404 | - | 51ms |
| /api/aeo/breakdown | GET | 404 | - | 56ms |
| /api/aeo/leaderboard | GET | 404 | - | 47ms |
| /api/agentic/checkout | POST | 404 | - | 47ms |
| /api/ai-chat | POST | 404 | - | 50ms |
| /api/ai-scores | GET | 404 | - | 119ms |
| /api/ai-visibility | GET | 404 | - | 42ms |
| /api/ai/advanced-analysis | POST | 404 | - | 47ms |
| /api/ai/analysis | POST | 404 | - | 43ms |
| /api/ai/analyze | POST | 404 | - | 47ms |
| /api/ai/answer-intel | GET | 404 | - | 49ms |
| /api/ai/automated-alerts | GET | 404 | - | 52ms |
| /api/ai/automated-alerts | POST | 404 | - | 47ms |
| /api/ai/chat | POST | 404 | - | 50ms |
| /api/ai/competitor-intelligence | GET | 404 | - | 53ms |
| /api/ai/compute | GET | 404 | - | 51ms |
| /api/ai/customer-behavior | GET | 404 | - | 52ms |
| /api/ai/enhanced-analytics | GET | 404 | - | 60ms |
| /api/ai/finetuning | POST | 404 | - | 46ms |
| /api/ai/health | GET | 404 | - | 55ms |
| /api/ai/market-trends | GET | 404 | - | 55ms |
| /api/ai/metrics | GET | 404 | - | 48ms |
| /api/ai/offer/validate | POST | 404 | - | 55ms |
| /api/ai/performance-monitoring | GET | 404 | - | 102ms |
| /api/ai/predictive-analytics | GET | 404 | - | 47ms |
| /api/ai/predictive-optimization | POST | 404 | - | 48ms |
| /api/ai/real-time-monitoring | GET | 404 | - | 38ms |
| /api/ai/trust-optimization | GET | 404 | - | 51ms |
| /api/ai/visibility-index | GET | 404 | - | 52ms |
| /api/alerts/prioritization | GET | 404 | - | 42ms |
| /api/analytics/ga4 | GET | 404 | - | 56ms |
| /api/analytics/trends | GET | 404 | - | 56ms |
| /api/analyze | POST | 404 | - | 99ms |
| /api/audit | GET | 404 | - | 45ms |
| /api/quick-audit | GET | 404 | - | 61ms |
| /api/test | GET | 404 | - | 50ms |
| /api/test-analytics | GET | 404 | - | 45ms |
| /api/test-oauth | GET | 404 | - | 121ms |
| /api/performance-test | GET | 404 | - | 50ms |
| /api/automation/fix | POST | 404 | - | 50ms |
| /api/calculator/ai-scores | GET | 404 | - | 43ms |
| /api/capture-email | POST | 404 | - | 45ms |
| /api/leads | GET | 404 | - | 64ms |
| /api/leads | POST | 404 | - | 47ms |
| /api/leads/capture | POST | 404 | - | 51ms |
| /api/chat | POST | 404 | - | 51ms |
| /api/claude/download | GET | 404 | - | 45ms |
| /api/claude/export | GET | 404 | - | 59ms |
| /api/claude/manifest | GET | 404 | - | 51ms |
| /api/claude/stats | GET | 404 | - | 42ms |
| /api/competitors | GET | 404 | - | 51ms |
| /api/competitors/intelligence | GET | 404 | - | 57ms |
| /api/console/query | POST | 404 | - | 42ms |
| /api/cron/fleet-refresh | GET | 404 | - | 51ms |
| /api/cron/nurture | GET | 404 | - | 51ms |
| /api/dealership/profile | GET | 404 | - | 55ms |
| /api/dealership/profile | POST | 404 | - | 54ms |
| /api/dealerships/[id]/competitors | GET | 404 | - | 43ms |
| /api/dealerships/[id]/qai | GET | 404 | - | 54ms |
| /api/dealerships/[id]/quick-wins | GET | 404 | - | 76ms |
| /api/diagnostics | GET | 404 | - | 42ms |
| /api/driftguard/ack | POST | 404 | - | 123ms |
| /api/driftguard/history | GET | 404 | - | 43ms |
| /api/driftguard/promote | POST | 404 | - | 50ms |
| /api/driftguard/run | POST | 404 | - | 48ms |
| /api/driftguard/status | GET | 404 | - | 48ms |
| /api/econ/tsm | GET | 404 | - | 54ms |
| /api/elevenlabs/agent | POST | 404 | - | 45ms |
| /api/elevenlabs/text-to-speech | POST | 404 | - | 40ms |
| /api/elevenlabs/voices | GET | 404 | - | 51ms |
| /api/enhanced-dai | POST | 404 | - | 43ms |
| /api/export/data | GET | 404 | - | 54ms |
| /api/fix-pack/roi | GET | 404 | - | 50ms |
| /api/fix/action | POST | 404 | - | 57ms |
| /api/fix/apply | POST | 404 | - | 72ms |
| /api/fix/deploy | POST | 404 | - | 598ms |
| /api/fix/estimate | POST | 404 | - | 48ms |
| /api/fix/pack | POST | 404 | - | 340ms |
| /api/formulas/weights | GET | 404 | - | 75ms |
| /api/ga4/summary | GET | 404 | - | 117ms |
| /api/geo/domain-location | GET | 404 | - | 72ms |
| /api/geo/market-analysis | GET | 404 | - | 89ms |
| /api/growth/analytics | GET | 404 | - | 70ms |
| /api/growth/viral-reports | GET | 404 | - | 50ms |
| /api/health | GET | 404 | - | 50ms |
| /api/status | GET | 404 | - | 50ms |
| /api/system/status | GET | 404 | - | 53ms |
| /api/v1/health | GET | 404 | - | 61ms |
| /api/integrations/ai-platforms | GET | 404 | - | 50ms |
| /api/integrations/ai-platforms | POST | 404 | - | 49ms |
| /api/integrations/google | GET | 404 | - | 43ms |
| /api/integrations/google | POST | 404 | - | 46ms |
| /api/integrations/reviews | GET | 404 | - | 45ms |
| /api/integrations/reviews | POST | 404 | - | 50ms |
| /api/intel/simulate | POST | 404 | - | 60ms |
| /api/landing/email-unlock | POST | 404 | - | 47ms |
| /api/landing/session-stats | GET | 404 | - | 60ms |
| /api/landing/track-onboarding-start | POST | 404 | - | 43ms |
| /api/landing/track-share | POST | 404 | - | 54ms |
| /api/marketpulse/compute | GET | 404 | - | 54ms |
| /api/metrics/agentic/emit | POST | 404 | - | 63ms |
| /api/metrics/eeat | GET | 404 | - | 51ms |
| /api/metrics/oel | GET | 404 | - | 48ms |
| /api/metrics/oel/channels | GET | 404 | - | 50ms |
| /api/metrics/piqr | GET | 404 | - | 42ms |
| /api/metrics/qai | GET | 404 | - | 55ms |
| /api/metrics/rar | GET | 404 | - | 44ms |
| /api/migrate | POST | 404 | - | 61ms |
| /api/mystery-shop | POST | 404 | - | 54ms |
| /api/notifications/workflow-status | POST | 404 | - | 55ms |
| /api/observability | GET | 404 | - | 70ms |
| /api/oel | GET | 404 | - | 47ms |
| /api/opportunities | GET | 404 | - | 43ms |
| /api/optimizer/top-opportunity | GET | 404 | - | 46ms |
| /api/orchestrator | POST | 404 | - | 49ms |
| /api/orchestrator/autonomy | GET | 404 | - | 48ms |
| /api/orchestrator/autonomy | POST | 404 | - | 48ms |
| /api/orchestrator/run | POST | 404 | - | 47ms |
| /api/orchestrator/status | GET | 404 | - | 63ms |
| /api/origins | GET | 404 | - | 55ms |
| /api/origins | POST | 404 | - | 46ms |
| /api/origins/bulk | POST | 404 | - | 45ms |
| /api/origins/bulk-csv | POST | 404 | - | 102ms |
| /api/origins/bulk-csv/commit | POST | 404 | - | 47ms |
| /api/parity/ingest | POST | 404 | - | 62ms |
| /api/probe/verify | POST | 404 | - | 74ms |
| /api/probe/verify-bulk | POST | 404 | - | 52ms |
| /api/v1/probe/status | GET | 404 | - | 54ms |
| /api/public/v1/insights | GET | 404 | - | 47ms |
| /api/pulse/events | GET | 404 | - | 52ms |
| /api/pulse/events | POST | 404 | - | 53ms |
| /api/pulse/impacts | GET | 404 | - | 42ms |
| /api/pulse/impacts/compute | POST | 404 | - | 43ms |
| /api/pulse/radar | GET | 404 | - | 47ms |
| /api/pulse/scenario | POST | 404 | - | 46ms |
| /api/pulse/score | GET | 404 | - | 48ms |
| /api/pulse/simulate | POST | 404 | - | 55ms |
| /api/pulse/snapshot | GET | 404 | - | 62ms |
| /api/pulse/trends | GET | 404 | - | 79ms |
| /api/qai/calculate | GET | 404 | - | 48ms |
| /api/qai/simple | GET | 404 | - | 59ms |
| /api/refresh | POST | 404 | - | 45ms |
| /api/relevance/overlay | GET | 404 | - | 55ms |
| /api/relevance/scenarios | GET | 404 | - | 50ms |
| /api/reviews/summary | GET | 404 | - | 45ms |
| /api/save-metrics | POST | 404 | - | 50ms |
| /api/scan/quick | GET | 404 | - | 59ms |
| /api/scan/stream | GET | 404 | - | 45ms |
| /api/scenarios/templates | GET | 404 | - | 55ms |
| /api/schema | GET | 404 | - | 44ms |
| /api/schema-validation | POST | 404 | - | 54ms |
| /api/schema/request | POST | 404 | - | 42ms |
| /api/schema/status | GET | 404 | - | 41ms |
| /api/schema/validate | POST | 404 | - | 41ms |
| /api/scores/history | GET | 404 | - | 53ms |
| /api/share/track | POST | 404 | - | 40ms |
| /api/site-inject | POST | 404 | - | 42ms |
| /api/site-inject/rollback | POST | 404 | - | 42ms |
| /api/site-inject/versions | GET | 404 | - | 53ms |
| /api/stripe/checkout | POST | 404 | - | 60ms |
| /api/stripe/create-checkout | POST | 404 | - | 88ms |
| /api/stripe/portal | POST | 404 | - | 56ms |
| /api/stripe/verify-session | GET | 404 | - | 55ms |
| /api/system/endpoints | GET | 404 | - | 43ms |
| /api/targeting/underperforming-dealers | GET | 404 | - | 47ms |
| /api/telemetry | POST | 404 | - | 45ms |
| /api/trust/calculate | POST | 404 | - | 48ms |
| /api/ugc | GET | 404 | - | 55ms |
| /api/user/onboarding-complete | POST | 404 | - | 44ms |
| /api/user/profile | GET | 404 | - | 49ms |
| /api/user/profile | POST | 404 | - | 58ms |
| /api/user/subscription | GET | 404 | - | 40ms |
| /api/user/usage | GET | 404 | - | 47ms |
| /api/v1/analyze | POST | 404 | - | 54ms |
| /api/viral/audit-complete | POST | 404 | - | 45ms |
| /api/viral/metrics | GET | 404 | - | 49ms |
| /api/visibility-roi | GET | 404 | - | 97ms |
| /api/visibility/aeo | GET | 404 | - | 53ms |
| /api/visibility/geo | GET | 404 | - | 47ms |
| /api/visibility/history | GET | 404 | - | 49ms |
| /api/visibility/presence | GET | 404 | - | 45ms |
| /api/visibility/seo | GET | 404 | - | 166ms |
| /api/websocket | GET | 404 | - | 46ms |
| /api/zero-click | GET | 404 | - | 48ms |
| /api/zero-click/recompute | POST | 404 | - | 48ms |
| /api/zero-click/summary | GET | 404 | - | 51ms |

## Detailed Results

<details>
<summary>Click to expand full results</summary>

| Endpoint | Method | Status | Duration | Category |
|----------|--------|--------|----------|----------|
| ❌ /api/admin/flags | GET | 404 | 323ms | Admin |
| ❌ /api/admin/integrations/visibility | GET | 404 | 47ms | Admin |
| ❌ /api/admin/integrations/visibility | POST | 404 | 45ms | Admin |
| ❌ /api/admin/seed | POST | 404 | 51ms | Admin |
| ❌ /api/admin/setup | GET | 404 | 48ms | Admin |
| ❌ /api/admin/setup | POST | 404 | 51ms | Admin |
| ❌ /api/actions/draft-reviews | POST | 404 | 89ms | Actions |
| ❌ /api/actions/generate-schema | POST | 404 | 51ms | Actions |
| ❌ /api/aeo/breakdown | GET | 404 | 56ms | AEO |
| ❌ /api/aeo/leaderboard | GET | 404 | 47ms | AEO |
| ❌ /api/agentic/checkout | POST | 404 | 47ms | Agentic |
| ❌ /api/ai-chat | POST | 404 | 50ms | AI |
| ❌ /api/ai-scores | GET | 404 | 119ms | AI |
| ❌ /api/ai-visibility | GET | 404 | 42ms | AI |
| ❌ /api/ai/advanced-analysis | POST | 404 | 47ms | AI |
| ❌ /api/ai/analysis | POST | 404 | 43ms | AI |
| ❌ /api/ai/analyze | POST | 404 | 47ms | AI |
| ❌ /api/ai/answer-intel | GET | 404 | 49ms | AI |
| ❌ /api/ai/automated-alerts | GET | 404 | 52ms | AI |
| ❌ /api/ai/automated-alerts | POST | 404 | 47ms | AI |
| ❌ /api/ai/chat | POST | 404 | 50ms | AI |
| ❌ /api/ai/competitor-intelligence | GET | 404 | 53ms | AI |
| ❌ /api/ai/compute | GET | 404 | 51ms | AI |
| ❌ /api/ai/customer-behavior | GET | 404 | 52ms | AI |
| ❌ /api/ai/enhanced-analytics | GET | 404 | 60ms | AI |
| ❌ /api/ai/finetuning | POST | 404 | 46ms | AI |
| ❌ /api/ai/health | GET | 404 | 55ms | AI |
| ❌ /api/ai/market-trends | GET | 404 | 55ms | AI |
| ❌ /api/ai/metrics | GET | 404 | 48ms | AI |
| ❌ /api/ai/offer/validate | POST | 404 | 55ms | AI |
| ❌ /api/ai/performance-monitoring | GET | 404 | 102ms | AI |
| ❌ /api/ai/predictive-analytics | GET | 404 | 47ms | AI |
| ❌ /api/ai/predictive-optimization | POST | 404 | 48ms | AI |
| ❌ /api/ai/real-time-monitoring | GET | 404 | 38ms | AI |
| ❌ /api/ai/trust-optimization | GET | 404 | 51ms | AI |
| ❌ /api/ai/visibility-index | GET | 404 | 52ms | AI |
| ❌ /api/alerts/prioritization | GET | 404 | 42ms | Alerts |
| ❌ /api/analytics/ga4 | GET | 404 | 56ms | Analytics |
| ❌ /api/analytics/trends | GET | 404 | 56ms | Analytics |
| ❌ /api/analyze | POST | 404 | 99ms | Analytics |
| ❌ /api/audit | GET | 404 | 45ms | Audit |
| ❌ /api/quick-audit | GET | 404 | 61ms | Audit |
| ❌ /api/test | GET | 404 | 50ms | Testing |
| ❌ /api/test-analytics | GET | 404 | 45ms | Testing |
| ❌ /api/test-oauth | GET | 404 | 121ms | Testing |
| ❌ /api/performance-test | GET | 404 | 50ms | Testing |
| ❌ /api/automation/fix | POST | 404 | 50ms | Automation |
| ❌ /api/calculator/ai-scores | GET | 404 | 43ms | Calculator |
| ❌ /api/capture-email | POST | 404 | 45ms | Leads |
| ❌ /api/leads | GET | 404 | 64ms | Leads |
| ❌ /api/leads | POST | 404 | 47ms | Leads |
| ❌ /api/leads/capture | POST | 404 | 51ms | Leads |
| ❌ /api/chat | POST | 404 | 51ms | Chat |
| ❌ /api/claude/download | GET | 404 | 45ms | Claude |
| ❌ /api/claude/export | GET | 404 | 59ms | Claude |
| ❌ /api/claude/manifest | GET | 404 | 51ms | Claude |
| ❌ /api/claude/stats | GET | 404 | 42ms | Claude |
| ❌ /api/competitors | GET | 404 | 51ms | Competitors |
| ❌ /api/competitors/intelligence | GET | 404 | 57ms | Competitors |
| ❌ /api/console/query | POST | 404 | 42ms | Console |
| ❌ /api/cron/fleet-refresh | GET | 404 | 51ms | Cron |
| ❌ /api/cron/nurture | GET | 404 | 51ms | Cron |
| ❌ /api/dealership/profile | GET | 404 | 55ms | Dealership |
| ❌ /api/dealership/profile | POST | 404 | 54ms | Dealership |
| ❌ /api/dealerships/[id]/competitors | GET | 404 | 43ms | Dealership |
| ❌ /api/dealerships/[id]/qai | GET | 404 | 54ms | Dealership |
| ❌ /api/dealerships/[id]/quick-wins | GET | 404 | 76ms | Dealership |
| ❌ /api/diagnostics | GET | 404 | 42ms | Diagnostics |
| ❌ /api/driftguard/ack | POST | 404 | 123ms | DriftGuard |
| ❌ /api/driftguard/history | GET | 404 | 43ms | DriftGuard |
| ❌ /api/driftguard/promote | POST | 404 | 50ms | DriftGuard |
| ❌ /api/driftguard/run | POST | 404 | 48ms | DriftGuard |
| ❌ /api/driftguard/status | GET | 404 | 48ms | DriftGuard |
| ❌ /api/econ/tsm | GET | 404 | 54ms | Economics |
| ❌ /api/elevenlabs/agent | POST | 404 | 45ms | ElevenLabs |
| ❌ /api/elevenlabs/text-to-speech | POST | 404 | 40ms | ElevenLabs |
| ❌ /api/elevenlabs/voices | GET | 404 | 51ms | ElevenLabs |
| ❌ /api/enhanced-dai | POST | 404 | 43ms | DAI |
| ❌ /api/export/data | GET | 404 | 54ms | Export |
| ❌ /api/fix-pack/roi | GET | 404 | 50ms | FixPack |
| ❌ /api/fix/action | POST | 404 | 57ms | Fix |
| ❌ /api/fix/apply | POST | 404 | 72ms | Fix |
| ❌ /api/fix/deploy | POST | 404 | 598ms | Fix |
| ❌ /api/fix/estimate | POST | 404 | 48ms | Fix |
| ❌ /api/fix/pack | POST | 404 | 340ms | Fix |
| ❌ /api/formulas/weights | GET | 404 | 75ms | Formulas |
| ❌ /api/ga4/summary | GET | 404 | 117ms | GA4 |
| ❌ /api/geo/domain-location | GET | 404 | 72ms | Geo |
| ❌ /api/geo/market-analysis | GET | 404 | 89ms | Geo |
| ❌ /api/growth/analytics | GET | 404 | 70ms | Growth |
| ❌ /api/growth/viral-reports | GET | 404 | 50ms | Growth |
| ❌ /api/health | GET | 404 | 50ms | Health |
| ❌ /api/status | GET | 404 | 50ms | Health |
| ❌ /api/system/status | GET | 404 | 53ms | Health |
| ❌ /api/v1/health | GET | 404 | 61ms | Health |
| ❌ /api/integrations/ai-platforms | GET | 404 | 50ms | Integrations |
| ❌ /api/integrations/ai-platforms | POST | 404 | 49ms | Integrations |
| ❌ /api/integrations/google | GET | 404 | 43ms | Integrations |
| ❌ /api/integrations/google | POST | 404 | 46ms | Integrations |
| ❌ /api/integrations/reviews | GET | 404 | 45ms | Integrations |
| ❌ /api/integrations/reviews | POST | 404 | 50ms | Integrations |
| ❌ /api/intel/simulate | POST | 404 | 60ms | Intel |
| ❌ /api/landing/email-unlock | POST | 404 | 47ms | Landing |
| ❌ /api/landing/session-stats | GET | 404 | 60ms | Landing |
| ❌ /api/landing/track-onboarding-start | POST | 404 | 43ms | Landing |
| ❌ /api/landing/track-share | POST | 404 | 54ms | Landing |
| ❌ /api/marketpulse/compute | GET | 404 | 54ms | MarketPulse |
| ❌ /api/metrics/agentic/emit | POST | 404 | 63ms | Metrics |
| ❌ /api/metrics/eeat | GET | 404 | 51ms | Metrics |
| ❌ /api/metrics/oel | GET | 404 | 48ms | Metrics |
| ❌ /api/metrics/oel/channels | GET | 404 | 50ms | Metrics |
| ❌ /api/metrics/piqr | GET | 404 | 42ms | Metrics |
| ❌ /api/metrics/qai | GET | 404 | 55ms | Metrics |
| ❌ /api/metrics/rar | GET | 404 | 44ms | Metrics |
| ❌ /api/migrate | POST | 404 | 61ms | Migration |
| ❌ /api/mystery-shop | POST | 404 | 54ms | MysteryShop |
| ❌ /api/notifications/workflow-status | POST | 404 | 55ms | Notifications |
| ❌ /api/observability | GET | 404 | 70ms | Observability |
| ❌ /api/oel | GET | 404 | 47ms | OEL |
| ❌ /api/opportunities | GET | 404 | 43ms | Opportunities |
| ❌ /api/optimizer/top-opportunity | GET | 404 | 46ms | Optimizer |
| ❌ /api/orchestrator | POST | 404 | 49ms | Orchestrator |
| ❌ /api/orchestrator/autonomy | GET | 404 | 48ms | Orchestrator |
| ❌ /api/orchestrator/autonomy | POST | 404 | 48ms | Orchestrator |
| ❌ /api/orchestrator/run | POST | 404 | 47ms | Orchestrator |
| ❌ /api/orchestrator/status | GET | 404 | 63ms | Orchestrator |
| ❌ /api/origins | GET | 404 | 55ms | Origins |
| ❌ /api/origins | POST | 404 | 46ms | Origins |
| ❌ /api/origins/bulk | POST | 404 | 45ms | Origins |
| ❌ /api/origins/bulk-csv | POST | 404 | 102ms | Origins |
| ❌ /api/origins/bulk-csv/commit | POST | 404 | 47ms | Origins |
| ❌ /api/parity/ingest | POST | 404 | 62ms | Parity |
| ❌ /api/probe/verify | POST | 404 | 74ms | Probe |
| ❌ /api/probe/verify-bulk | POST | 404 | 52ms | Probe |
| ❌ /api/v1/probe/status | GET | 404 | 54ms | Probe |
| ❌ /api/public/v1/insights | GET | 404 | 47ms | Public |
| ❌ /api/pulse/events | GET | 404 | 52ms | Pulse |
| ❌ /api/pulse/events | POST | 404 | 53ms | Pulse |
| ❌ /api/pulse/impacts | GET | 404 | 42ms | Pulse |
| ❌ /api/pulse/impacts/compute | POST | 404 | 43ms | Pulse |
| ❌ /api/pulse/radar | GET | 404 | 47ms | Pulse |
| ❌ /api/pulse/scenario | POST | 404 | 46ms | Pulse |
| ❌ /api/pulse/score | GET | 404 | 48ms | Pulse |
| ❌ /api/pulse/simulate | POST | 404 | 55ms | Pulse |
| ❌ /api/pulse/snapshot | GET | 404 | 62ms | Pulse |
| ❌ /api/pulse/trends | GET | 404 | 79ms | Pulse |
| ❌ /api/qai/calculate | GET | 404 | 48ms | QAI |
| ❌ /api/qai/simple | GET | 404 | 59ms | QAI |
| ❌ /api/refresh | POST | 404 | 45ms | Refresh |
| ❌ /api/relevance/overlay | GET | 404 | 55ms | Relevance |
| ❌ /api/relevance/scenarios | GET | 404 | 50ms | Relevance |
| ❌ /api/reviews/summary | GET | 404 | 45ms | Reviews |
| ❌ /api/save-metrics | POST | 404 | 50ms | Metrics |
| ❌ /api/scan/quick | GET | 404 | 59ms | Scan |
| ❌ /api/scan/stream | GET | 404 | 45ms | Scan |
| ❌ /api/scenarios/templates | GET | 404 | 55ms | Scenarios |
| ❌ /api/schema | GET | 404 | 44ms | Schema |
| ❌ /api/schema-validation | POST | 404 | 54ms | Schema |
| ❌ /api/schema/request | POST | 404 | 42ms | Schema |
| ❌ /api/schema/status | GET | 404 | 41ms | Schema |
| ❌ /api/schema/validate | POST | 404 | 41ms | Schema |
| ❌ /api/scores/history | GET | 404 | 53ms | Scores |
| ❌ /api/share/track | POST | 404 | 40ms | Share |
| ❌ /api/site-inject | POST | 404 | 42ms | SiteInject |
| ❌ /api/site-inject/rollback | POST | 404 | 42ms | SiteInject |
| ❌ /api/site-inject/versions | GET | 404 | 53ms | SiteInject |
| ❌ /api/stripe/checkout | POST | 404 | 60ms | Stripe |
| ❌ /api/stripe/create-checkout | POST | 404 | 88ms | Stripe |
| ❌ /api/stripe/portal | POST | 404 | 56ms | Stripe |
| ❌ /api/stripe/verify-session | GET | 404 | 55ms | Stripe |
| ❌ /api/system/endpoints | GET | 404 | 43ms | System |
| ❌ /api/targeting/underperforming-dealers | GET | 404 | 47ms | Targeting |
| ❌ /api/telemetry | POST | 404 | 45ms | Telemetry |
| ❌ /api/trust/calculate | POST | 404 | 48ms | Trust |
| ❌ /api/ugc | GET | 404 | 55ms | UGC |
| ❌ /api/user/onboarding-complete | POST | 404 | 44ms | User |
| ❌ /api/user/profile | GET | 404 | 49ms | User |
| ❌ /api/user/profile | POST | 404 | 58ms | User |
| ❌ /api/user/subscription | GET | 404 | 40ms | User |
| ❌ /api/user/usage | GET | 404 | 47ms | User |
| ❌ /api/v1/analyze | POST | 404 | 54ms | V1 |
| ❌ /api/viral/audit-complete | POST | 404 | 45ms | Viral |
| ❌ /api/viral/metrics | GET | 404 | 49ms | Viral |
| ❌ /api/visibility-roi | GET | 404 | 97ms | Visibility |
| ❌ /api/visibility/aeo | GET | 404 | 53ms | Visibility |
| ❌ /api/visibility/geo | GET | 404 | 47ms | Visibility |
| ❌ /api/visibility/history | GET | 404 | 49ms | Visibility |
| ❌ /api/visibility/presence | GET | 404 | 45ms | Visibility |
| ❌ /api/visibility/seo | GET | 404 | 166ms | Visibility |
| ❌ /api/websocket | GET | 404 | 46ms | WebSocket |
| ❌ /api/zero-click | GET | 404 | 48ms | ZeroClick |
| ❌ /api/zero-click/recompute | POST | 404 | 48ms | ZeroClick |
| ❌ /api/zero-click/summary | GET | 404 | 51ms | ZeroClick |

</details>

## Recommendations

1. **Fix 193 failed endpoints** - Review error messages and fix root causes
3. **Add authentication tests** - Implement proper auth header testing
4. **Add integration tests** - Test endpoint interactions and data flow
5. **Monitor performance** - Some endpoints >1000ms response time

---

**Next Steps:**
- Review failed endpoints in detail
- Add unit tests for critical endpoints
- Set up automated testing in CI/CD
- Monitor production endpoints with health checks
