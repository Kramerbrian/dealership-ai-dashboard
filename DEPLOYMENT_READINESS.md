# Deployment Readiness Checklist

## 🎯 Inevitability Spec - Alpha Deployment

This checklist ensures your DealershipAI platform is ready for the Alpha deployment phase (Naples FL pilot store).

---

## Phase 1: Infrastructure Setup ✅

### Database Migrations
- [ ] Local Supabase running: `npx supabase start`
- [ ] Apply all migrations: `npx supabase db push`
- [ ] Verify tables created:
  - [ ] `pulse_cards` (decision inbox events)
  - [ ] `pulse_threads` (event correlation)
  - [ ] `pulse_mutes` (DND rules)
  - [ ] `pulse_incidents` (auto-promoted incidents)
  - [ ] `dealer_groups` (multi-location)
  - [ ] `dealership_locations` (location mesh)
  - [ ] `integration_providers` (marketplace)
  - [ ] `dealer_integrations` (active connections)
- [ ] Sample data inserted: `node scripts/test-pulse-ingestion.js`

### Environment Configuration
- [ ] `.env.local` file exists with all keys
- [ ] Supabase connection verified
- [ ] Clerk authentication configured
- [ ] API endpoints tested

### Testing Scripts
- [ ] Pulse simulator executable: `chmod +x scripts/pulse-simulator.js`
- [ ] Test Alpha scenario: `node scripts/pulse-simulator.js --scenario alpha`
- [ ] Test Beta scenario: `node scripts/pulse-simulator.js --scenario beta`
- [ ] Test Gamma scenario: `node scripts/pulse-simulator.js --scenario gamma`
- [ ] Live API test: `node scripts/pulse-simulator.js --scenario alpha --live`

---

## Phase 2: Feature Validation 🔍

### Pulse Decision Inbox
- [ ] **Dashboard Integration:**
  - [ ] Pulse Inbox visible on `/dashboard`
  - [ ] Card positioned after Orchestrator View
  - [ ] Height: 500px with scroll
  - [ ] "View Spec" link to `/inevitability`

- [ ] **Core Features:**
  - [ ] Filter tabs working (All, Critical, KPI, Incidents, Market, System)
  - [ ] Keyboard navigation (j/k/Enter/m/h/?)
  - [ ] DND mode with 3 options (30m, 2h, end of day)
  - [ ] Digest mode toggle
  - [ ] Auto-refresh every 30 seconds

- [ ] **Event Display:**
  - [ ] Color-coded severity levels (🔴🟠🟡🟢🔵)
  - [ ] Actions visible (open, fix, snooze, mute)
  - [ ] Thread indicators for correlated events
  - [ ] At-a-glance banner (today's summary)

### Auto-Promotion Rules
- [ ] **KPI Delta → Incident:**
  - [ ] Test with delta ≥ 6: Creates incident
  - [ ] Test with delta < 6: No incident
  - [ ] Urgency: High for negative, medium for positive
  - [ ] Auto-fix flag: True

- [ ] **SLA Breach → Incident:**
  - [ ] Always creates high-urgency incident
  - [ ] Auto-fix flag: False
  - [ ] Impact points: 5000

### Deduplication & Threading
- [ ] **10-Minute Window:**
  - [ ] Send duplicate event within 10min: Collapsed
  - [ ] Send duplicate event after 10min: New card
  - [ ] `dedupe_key` working correctly

- [ ] **Thread Correlation:**
  - [ ] KPI events thread by `kpi/{id}`
  - [ ] Incident events thread by `incident/{id}`
  - [ ] Market events thread by `market/{id}`
  - [ ] Thread drawer shows history

### Inevitability Spec Deck
- [ ] **Page Access:**
  - [ ] Visit `/inevitability` - page loads
  - [ ] Section tabs working (Overview, Technical, Deployment)
  - [ ] All 6 panels visible

- [ ] **Visualizations:**
  - [ ] Inevitable Loop diagram (circular 6-stage)
  - [ ] Deployment Roadmap (Alpha → Beta → Gamma)
  - [ ] Culture Integration (4 metrics with progress)
  - [ ] All animations smooth (Framer Motion)

---

## Phase 3: Alpha Deployment Prep 🚀

### Pilot Store Selection
- [ ] **Naples FL Identified:**
  - [ ] Leadership buy-in confirmed
  - [ ] Technical contact assigned
  - [ ] Baseline data collection scheduled

- [ ] **Dealer Profile:**
  - [ ] `dealerId` created in system
  - [ ] Domain configured
  - [ ] Initial KPIs captured:
    - [ ] Schema coverage (baseline)
    - [ ] E-E-A-T score (baseline)
    - [ ] AI visibility (baseline)
    - [ ] Trust score (baseline)

### Schema Scanning
- [ ] **Automated Scans:**
  - [ ] Daily scan scheduled
  - [ ] Schema types detected (target: 23/25)
  - [ ] Auto-fix enabled for common issues
  - [ ] Results piped to Pulse Inbox

### Self-Healing Baseline
- [ ] **Configuration:**
  - [ ] `schema_autofix: true` in spec
  - [ ] `latency_reroute_ms: 120` configured
  - [ ] `threshold_adaptivity: 'auto'` enabled

- [ ] **Monitoring:**
  - [ ] Track autofix count (target: 100/week)
  - [ ] Measure latency (target: <120ms sustained)
  - [ ] Log all auto-repairs

### Cultural Integration
- [ ] **Doctrine Principles:**
  - [ ] "Replace belief with math" - baseline: 73%
  - [ ] "Clarity = how well you are seen" - baseline: 82%
  - [ ] "Trust = how much system believes you" - baseline: 78%
  - [ ] "Best End User wins" - baseline: 11

- [ ] **Training Materials:**
  - [ ] Micro-training scripts prepared
  - [ ] Principle-by-principle onboarding
  - [ ] Interactive walkthroughs ready

---

## Phase 4: Success Metrics 📊

### Week 1-2 Targets
- [ ] Schema coverage >90%
- [ ] Zero critical errors
- [ ] Latency <120ms average
- [ ] 50+ pulse events processed
- [ ] 10+ auto-promotions successful

### Week 3-4 Targets
- [ ] Schema autofix count: 100+ repairs
- [ ] Auto-fix accuracy: 95%+
- [ ] Cultural metrics: +5% across all 4 principles
- [ ] Pulse deduplication rate: >30%
- [ ] Thread depth average: 3+ events per incident

### Alpha Success Criteria
- [ ] ✅ Self-healing baseline validated
- [ ] ✅ Schema coverage >90%
- [ ] ✅ Zero critical errors for 7 consecutive days
- [ ] ✅ Latency <120ms sustained
- [ ] ✅ Dealer feedback positive ("I'm checking my clarity")

---

## Phase 5: Testing Playbook 🧪

### Manual Test Flow (15 minutes)

**1. Start Environment:**
```bash
# Terminal 1: Supabase
npx supabase start

# Terminal 2: Dev server
npm run dev
```

**2. Generate Alpha Events:**
```bash
# Terminal 3
node scripts/pulse-simulator.js --scenario alpha --live
```

**3. Verify Dashboard:**
- Visit `http://localhost:3000/dashboard`
- Confirm 5 pulse cards appear
- Check severity colors (🔴 red for SLA breach, 🟠 orange for KPI delta)
- Verify 1 incident auto-promoted (AIV -8 → incident)

**4. Test Interactions:**
- Click filter tabs (All → Critical → KPI)
- Press `?` for keyboard mode
- Press `j` to navigate down, `k` to navigate up
- Press `Enter` to execute action on selected card
- Press `h` to open thread drawer (if card has thread)
- Press `m` to mute card for 24h

**5. Test DND Mode:**
- Click "DND" button
- Select "30 minutes"
- Verify badge shows "DND until HH:MM"
- Send new events - critical still shown, others hidden

**6. Test Digest Mode:**
- Toggle "Digest Mode" button
- Verify cards grouped by category
- Check net KPI changes calculated
- Verify incidents opened vs resolved count

**7. Verify Auto-Promotion:**
- Check `/api/pulse` response
- Confirm `promotedIncidents: 1`
- View incident details (title, urgency, autofix)
- Verify receipts show before/after values

**8. Test Deduplication:**
```bash
# Send same event twice within 10 minutes
node scripts/pulse-simulator.js --scenario alpha --live
node scripts/pulse-simulator.js --scenario alpha --live
# Only 5 cards should appear (not 10)
```

**9. Visit Inevitability Spec:**
- Navigate to `/inevitability`
- Click through 3 sections (Overview, Technical, Deployment)
- Verify Inevitable Loop animates
- Check all 6 panels load
- Confirm responsive layout

**10. Check Database:**
```bash
# Verify data persisted
npx supabase db query "SELECT COUNT(*) FROM pulse_cards"
npx supabase db query "SELECT COUNT(*) FROM pulse_incidents"
npx supabase db query "SELECT * FROM pulse_cards ORDER BY ts DESC LIMIT 5"
```

### Automated Test Suite (Coming Soon)
- [ ] E2E tests with Playwright
- [ ] API integration tests with Jest
- [ ] Performance tests (latency monitoring)
- [ ] Load tests (100+ concurrent events)

---

## Phase 6: Monitoring & Alerts 🔔

### Metrics to Track
- [ ] Pulse events ingested per hour
- [ ] Auto-promotion rate (%)
- [ ] Deduplication rate (%)
- [ ] Thread depth average
- [ ] Mute frequency (DND usage)
- [ ] Digest mode adoption (%)
- [ ] Keyboard navigation usage (%)

### Alerts to Configure
- [ ] Schema autofix failure rate >10%
- [ ] API latency >150ms (warning), >200ms (critical)
- [ ] Auto-promotion errors
- [ ] Database connection failures
- [ ] Critical pulse events not acknowledged within 1h

### Dashboard Widgets
- [ ] Real-time pulse event feed
- [ ] Auto-promotion success rate (gauge)
- [ ] Cultural integration progress (4 metrics)
- [ ] Self-healing repairs timeline
- [ ] Thread lifecycle visualization

---

## Phase 7: Rollback Plan 🔄

### If Alpha Fails
- [ ] **Pause pulse ingestion:** Set `autoRefresh={false}`
- [ ] **Disable auto-promotion:** Comment out rules in `/api/pulse/route.ts`
- [ ] **Collect diagnostics:**
  - Export pulse events: `npx supabase db query "SELECT * FROM pulse_cards"`
  - Export incidents: `npx supabase db query "SELECT * FROM pulse_incidents"`
  - Review API logs
- [ ] **Revert migrations:** `npx supabase db reset`
- [ ] **Communicate issue:** Notify pilot store contact
- [ ] **Debug offline:** Use simulator to reproduce issue

### Recovery Steps
1. Identify root cause (latency, auto-promotion logic, UI bug)
2. Fix in development environment
3. Re-test with simulator
4. Re-deploy to pilot store
5. Monitor closely for 48 hours

---

## Phase 8: Beta Prep (Week 7+)

### When Alpha Succeeds
- [ ] Document lessons learned
- [ ] Refine auto-promotion thresholds
- [ ] Optimize database queries
- [ ] Add 4 more FL stores to mesh
- [ ] Enable federated learning
- [ ] Activate market consciousness map
- [ ] Launch 3D clarity globe visualization

### Beta Success Criteria
- [ ] 5-store mesh operational
- [ ] Cross-store learning verified
- [ ] Anomaly detection 48h ahead
- [ ] Market consciousness map live
- [ ] Zero-fracture identity validated across all stores
- [ ] Cultural integration >75% across all 4 principles

---

## 🎯 Final Checklist Before Go-Live

**Infrastructure:**
- [x] Database migrations applied
- [x] Pulse Inbox integrated on dashboard
- [x] Event simulator tested (Alpha/Beta/Gamma)
- [x] Inevitability Spec deck accessible

**Features:**
- [x] Auto-promotion rules active
- [x] Deduplication working (10-min window)
- [x] Threading enabled (kpi/incident/market)
- [x] Keyboard navigation functional
- [x] DND mode operational
- [x] Digest mode toggle working

**Testing:**
- [ ] Manual test flow completed (15 min)
- [ ] All 10 test steps passed
- [ ] Database verified with sample data
- [ ] API endpoints responding <120ms

**Deployment:**
- [ ] Pilot store identified (Naples FL)
- [ ] Baseline KPIs captured
- [ ] Cultural integration training scheduled
- [ ] Monitoring/alerts configured
- [ ] Rollback plan documented

**Documentation:**
- [x] Deployment roadmap (Alpha → Beta → Gamma)
- [x] Cultural metrics defined (4 principles)
- [x] Success criteria established
- [ ] Training materials prepared
- [ ] Runbook created

---

## 🚀 Go/No-Go Decision

**GO if:**
- ✅ All infrastructure checks pass
- ✅ Manual test flow completes successfully
- ✅ Pilot store ready and committed
- ✅ Rollback plan documented
- ✅ Team trained on Inevitability Spec

**NO-GO if:**
- ❌ Database migrations fail
- ❌ Auto-promotion errors detected
- ❌ Latency >150ms sustained
- ❌ Pilot store not ready
- ❌ Rollback plan incomplete

---

## 📞 Support Contacts

**Technical:**
- Database: Supabase support
- API: Next.js / Vercel support
- Auth: Clerk support

**Business:**
- Pilot Store: Naples FL dealer contact
- Cultural Integration: Internal champion
- Product: DealershipAI leadership

---

**Status:** READY FOR ALPHA DEPLOYMENT ✅

**Next Action:** Complete manual test flow → Schedule pilot store kickoff → Deploy!

**The nervous system is online. Inevitability in motion.** 🌊
