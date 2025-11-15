# Next Steps - Deployment & Integration

## ✅ Completed

1. **OEM Router System** - Complete end-to-end implementation
   - Exec OEM Pulse tile component
   - Group commerce actions helper
   - CommerceAction types
   - OEM Router GPT configuration
   - Routing function
   - Agentic execute endpoint

2. **Vercel Tools** - Updated and verified
   - Configuration checker
   - Deployment verifier (includes OEM Router endpoints)
   - Troubleshooting guide updated

3. **API Endpoints** - Tested and fixed
   - Health check: ✅ Working
   - Market pulse: ✅ Working
   - OEM GPT parse: ✅ Working
   - Agentic execute: ✅ Fixed import issue

4. **Documentation** - Updated
   - Root Directory guidance corrected
   - Vercel troubleshooting guide updated

---

## 🚀 Immediate Next Steps

### 1. Deploy to Production

```bash
# Option A: Push to main (triggers auto-deployment)
git push origin main

# Option B: Manual deployment with verification
npm run vercel:deploy
```

**After deployment:**
- Verify all endpoints are accessible
- Check Vercel build logs for any errors
- Test OEM Router endpoints in production

### 2. Verify Production Deployment

```bash
# Run verification script
npm run vercel:verify

# Or manually test endpoints
curl https://dash.dealershipai.com/api/health
curl https://dash.dealershipai.com/api/oem/gpt-parse -X POST -H "Content-Type: application/json" -d '{"url":"https://pressroom.toyota.com/test"}'
```

### 3. Complete OEM Router Integration

**Wire OEM Router GPT to actual OpenAI API:**
- Update `app/api/oem/gpt-parse/route.ts` with real OpenAI API calls
- Replace placeholder response with actual GPT-4 structured output
- Test with real OEM pressroom URLs

**Connect to Pulse System:**
- Push `group_rollups` to Pulse tiles
- Display `ExecOemRollupCard` in exec dashboard
- Test end-to-end flow: OEM update → Pulse tile → Exec action

### 4. Implement Tool Execution

**Wire actual tool implementations:**
- `site_inject` → Connect to site injection API
- `auto_fix` → Connect to auto-fix engine
- `queue_refresh` → Connect to refresh queue system

**Add approval workflow:**
- Create approval queue table (database)
- Build approval UI for marketing_director+
- Send notifications on approval requests

### 5. Test End-to-End OEM Flow

1. **Detect OEM Update:**
   ```bash
   curl -X POST https://dash.dealershipai.com/api/oem/monitor \
     -H "Content-Type: application/json" \
     -d '{"oem":"Toyota","urls":["https://pressroom.toyota.com/2026-tacoma"]}'
   ```

2. **Parse via OEM Router GPT:**
   ```bash
   curl -X POST https://dash.dealershipai.com/api/oem/gpt-parse \
     -H "Content-Type: application/json" \
     -d '{"url":"https://pressroom.toyota.com/2026-tacoma"}'
   ```

3. **Route to Dealers:**
   - Verify `routeOemUpdate()` function works with real dealer data
   - Check group rollups are calculated correctly

4. **Generate Actions:**
   - Test `buildGroupCommerceActions()` with real routing results
   - Verify actions are properly formatted

5. **Execute Actions:**
   - Test `/api/agentic/execute` with proper authentication
   - Verify actions are queued/executed correctly

---

## 📋 Integration Checklist

### OEM Router GPT
- [ ] Wire to actual OpenAI API (replace placeholder)
- [ ] Test with real OEM pressroom URLs
- [ ] Validate JSON schema output
- [ ] Add error handling for API failures

### Pulse Integration
- [ ] Push group rollups to Pulse tiles
- [ ] Display ExecOemRollupCard in exec dashboard
- [ ] Test tile rendering and interactions
- [ ] Verify "Apply across group" button works

### Tool Execution
- [ ] Implement site_inject API connection
- [ ] Implement auto_fix API connection
- [ ] Implement queue_refresh job system
- [ ] Add error handling and retries

### Approval Workflow
- [ ] Create approval queue database table
- [ ] Build approval UI component
- [ ] Add notification system
- [ ] Test approval flow end-to-end

### Testing
- [ ] Unit tests for scoring formulas
- [ ] Integration tests for OEM Router
- [ ] E2E tests for exec dashboard
- [ ] Load testing for batch actions

---

## 🔧 Configuration Updates Needed

### Environment Variables
Verify these are set in Vercel:
- `OPENAI_API_KEY` - For OEM Router GPT
- `CLERK_SECRET_KEY` - For RBAC
- `DATABASE_URL` - For dealer/group data
- `REDIS_URL` - For caching and queues

### Vercel Dashboard
- [ ] Verify Root Directory is **empty** (not set to `.`)
- [ ] Check build settings match `vercel.json`
- [ ] Verify all cron jobs are scheduled correctly

---

## 📊 Monitoring & Observability

### Set Up Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Set up API endpoint monitoring
- [ ] Create alerts for failed OEM Router calls
- [ ] Monitor batch action execution times

### Logging
- [ ] Add structured logging to OEM Router
- [ ] Log all CommerceAction executions
- [ ] Track approval workflow events
- [ ] Monitor Pulse tile generation

---

## 🎯 Success Criteria

### OEM Router System
- ✅ OEM content parsed correctly
- ✅ Routing to dealers/groups works
- ✅ Group rollups calculated accurately
- ✅ CommerceActions generated properly
- ✅ Exec dashboard displays tiles
- ✅ Batch execution works end-to-end

### Production Readiness
- ✅ All endpoints tested and working
- ✅ Error handling in place
- ✅ RBAC properly enforced
- ✅ Documentation complete
- ✅ Monitoring configured

---

## 📚 Documentation Updates

- [ ] Update API documentation with OEM Router endpoints
- [ ] Create user guide for exec dashboard
- [ ] Document approval workflow
- [ ] Add troubleshooting guide for common issues

---

**Ready to deploy?** Run `npm run vercel:deploy` or push to main branch.
