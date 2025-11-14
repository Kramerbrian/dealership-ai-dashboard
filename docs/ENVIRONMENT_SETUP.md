# Environment Setup Guide
**Time Required**: ~30 minutes | **Priority**: CRITICAL

## Quick Start

```bash
# 1. Generate cron secret
openssl rand -base64 32

# 2. Add environment variables
vercel env add NEO4J_URI production
vercel env add NEO4J_PASSWORD production
vercel env add WEATHER_API_KEY production
vercel env add SLACK_WEBHOOK_URL production
vercel env add CRON_SECRET production

# 3. Redeploy
vercel --prod
```

## 1. Neo4j Aura (15 min) - CRITICAL

**Setup**:
1. Visit https://neo4j.com/cloud/aura/
2. Create free instance: "dealershipai-knowledge-graph"
3. Save credentials (shown once!)

**Add to Vercel**:
```bash
vercel env add NEO4J_URI production
# Paste: neo4j+s://xxxxx.databases.neo4j.io

vercel env add NEO4J_PASSWORD production
# Paste: [generated password]
```

**Test**: `curl "https://dealershipai.com/api/knowledge-graph?dealerId=test&type=metrics"`

## 2. Weather API (5 min) - HIGH

1. Visit https://openweathermap.org/api → Sign up
2. Get key from https://home.openweathermap.org/api_keys
3. `vercel env add WEATHER_API_KEY production`

## 3. Slack Webhook (5 min) - MEDIUM

1. Visit https://api.slack.com/messaging/webhooks
2. Create app → Add webhook to #executive-daily-digest
3. `vercel env add SLACK_WEBHOOK_URL production`

## 4. Cron Secret (1 min) - CRITICAL

```bash
openssl rand -base64 32
vercel env add CRON_SECRET production
```

## Verification

- [ ] Neo4j: Returns real data (not 503)
- [ ] Weather: Shows live data (not mock)
- [ ] Cron jobs: Appear in Vercel dashboard
- [ ] Slack: First digest arrives 8am EST

## Troubleshooting

**503 Error**: Check Neo4j credentials
**Mock Weather**: Wait 10min for API activation
**No Slack**: Verify webhook URL and channel access

See [INTEGRATION_MANIFEST.md](./INTEGRATION_MANIFEST.md) for full details.
