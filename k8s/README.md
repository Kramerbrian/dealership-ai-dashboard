# Kubernetes Agentic Commerce Resources

This directory contains Kubernetes resources for the agentic commerce flow that analyzes orchestrator logs and posts structured data to the Agent API.

## Quick Start

### 1. Create the Secret

```bash
# Interactive (will prompt for token)
./k8s/create-secret.sh

# Or with token as argument
./k8s/create-secret.sh sk-proj-your-token-here
```

**Or manually:**
```bash
kubectl -n dealershipai create secret generic agentapi-cred \
  --from-literal=AGENTAPI_TOKEN='sk-proj-...' \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 2. Apply Kubernetes Resources

```bash
kubectl apply -f k8s/orchestrator-completions-agent.yaml
```

### 3. Verify

```bash
# Check CronJob
kubectl -n dealershipai get cronjob orchestrator-completions-agent

# Check ServiceAccount
kubectl -n dealershipai get serviceaccount log-reader

# Check Role and RoleBinding
kubectl -n dealershipai get role,rolebinding log-reader

# View CronJob details
kubectl -n dealershipai describe cronjob orchestrator-completions-agent
```

### 4. Test Manually (Optional)

```bash
# Create a one-time job from the CronJob
kubectl -n dealershipai create job --from=cronjob/orchestrator-completions-agent test-run-$(date +%s)

# Watch the job
kubectl -n dealershipai get jobs -w

# View logs
kubectl -n dealershipai logs job/test-run-<timestamp> -f
```

---

## What It Does

The CronJob runs **every Tuesday at 09:00 America/New_York** and:

1. **Scrapes logs** from `deploy/orchestrator` for the last 24 hours
2. **Filters** for lines containing `POST https` and `completions` (top 5 matches)
3. **Builds** a structured Assist payload with:
   - Session ID
   - Tenant context
   - Doctrine (UI limits, depth, performance targets)
   - Available tools (open_pulse_detail, queue_refresh, site_inject, auto_fix, open_incident)
   - Structured output schema
   - System and user messages
4. **POSTs** to `https://agentapi.yourdomain.com/v1/assist` with Bearer token
5. **Logs** the response for review

---

## Configuration

### Update Agent API URL

Edit `k8s/orchestrator-completions-agent.yaml`:

```yaml
env:
  - name: AGENTAPI_BASE
    value: "https://agentapi.yourdomain.com"  # Change this
```

### Update Schedule

For clusters **≥1.27** (supports `timeZone`):
```yaml
schedule: "0 9 * * 2"            # Tuesdays 09:00 ET
timeZone: "America/New_York"
```

For clusters **≤1.26** (no `timeZone` support):
```yaml
schedule: "0 14 * * 2"          # Tuesdays 14:00 UTC (09:00 ET standard time)
# Remove timeZone field
```

**DST Note:** During Daylight Saving Time, use `0 13 * * 2` for 09:00 EDT.

### Update Timeout

```yaml
env:
  - name: AGENTAPI_TIMEOUT_MS
    value: "10000"  # 10 seconds (adjust as needed)
```

---

## Agent API Response Format

The agent responds with structured JSON:

```json
{
  "summary": "Found 3 API errors in last 24h...",
  "error_count": 3,
  "recommendations": [
    "Increase timeout for /completions endpoint",
    "Add retry logic for transient failures"
  ],
  "actions": [
    {
      "id": "action-1",
      "intent": "queue_refresh",
      "confidence": 0.85,
      "requires_approval": false,
      "tool": "queue_refresh",
      "input": { "dealer_id": "crm_naples_toyota" },
      "preview": { "description": "Refresh queue for dealer" }
    }
  ]
}
```

---

## Troubleshooting

### CronJob Not Running

1. **Check CronJob status:**
   ```bash
   kubectl -n dealershipai get cronjob orchestrator-completions-agent
   kubectl -n dealershipai describe cronjob orchestrator-completions-agent
   ```

2. **Check for recent jobs:**
   ```bash
   kubectl -n dealershipai get jobs | grep orchestrator-completions-agent
   ```

3. **Check job logs:**
   ```bash
   kubectl -n dealershipai logs job/orchestrator-completions-agent-<timestamp>
   ```

### Secret Not Found

```bash
# Verify secret exists
kubectl -n dealershipai get secret agentapi-cred

# Check secret key
kubectl -n dealershipai get secret agentapi-cred -o jsonpath='{.data.AGENTAPI_TOKEN}' | base64 -d
```

### Permission Denied

```bash
# Verify ServiceAccount
kubectl -n dealershipai get serviceaccount log-reader

# Verify Role and RoleBinding
kubectl -n dealershipai get role,rolebinding log-reader

# Test permissions
kubectl -n dealershipai auth can-i get pods/logs --as=system:serviceaccount:dealershipai:log-reader
```

### Agent API Errors

1. **Check HTTP status in logs:**
   ```bash
   kubectl -n dealershipai logs job/orchestrator-completions-agent-<timestamp> | grep "HTTP"
   ```

2. **Verify token is valid:**
   ```bash
   curl -H "Authorization: Bearer $(kubectl -n dealershipai get secret agentapi-cred -o jsonpath='{.data.AGENTAPI_TOKEN}' | base64 -d)" \
     https://agentapi.yourdomain.com/v1/assist
   ```

3. **Check network connectivity from cluster:**
   ```bash
   kubectl -n dealershipai run test-curl --image=curlimages/curl --rm -it -- \
     curl -v https://agentapi.yourdomain.com/v1/assist
   ```

---

## Next Steps

1. **Add webhook → Pulse integration** - Post agent summaries as dashboard tiles
2. **Add incident creation tool** - Wire `open_incident` to Slack/Jira/PagerDuty
3. **Add monitoring** - Alert on CronJob failures
4. **Add retry logic** - Handle transient API failures

---

## Files

- `orchestrator-completions-agent.yaml` - CronJob, ServiceAccount, Role, RoleBinding
- `create-secret.sh` - Script to create the Agent API token secret
- `README.md` - This documentation

