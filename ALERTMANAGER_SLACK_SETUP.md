# 🔔 Alertmanager + Slack Integration Complete

Production-ready Slack integration with multi-channel routing and severity-based escalation.

---

## ✅ What's Included

### **Enhanced Routing**

1. **Critical ARR/ROI Alerts** → `#exec-board` (Executive channel)
   - Immediate notifications
   - Business impact focus
   - Executive-friendly formatting

2. **Critical GNN Alerts** → PagerDuty + `#ai-ops`
   - Dual notification (on-call + Slack)
   - Immediate escalation
   - Technical details included

3. **Warning GNN Alerts** → `#ai-ops`
   - Standard AI operations channel
   - Technical details
   - Runbook links

4. **Revenue Alerts** → `#revenue-ops`
   - Revenue-focused channel
   - Business metrics emphasis

5. **ML Ops Alerts** → `#ml-ops`
   - Model-specific channel
   - Training and inference focus

---

## 🚀 Quick Setup

### **1. Configure Slack Webhook**

1. Go to https://api.slack.com/apps
2. Create app → **Incoming Webhooks**
3. Activate and add to workspace
4. Copy webhook URL

### **2. Set Environment Variable**

```bash
# In .env.monitoring or docker-compose environment
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Or update `docker-compose.monitoring.yml`:

```yaml
environment:
  - SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### **3. Create Slack Channels**

Create these channels in your Slack workspace:
- `#ai-ops` (default, AI operations)
- `#exec-board` (executive alerts)
- `#revenue-ops` (revenue team)
- `#ml-ops` (ML team)

### **4. Start Alertmanager**

```bash
# Restart Alertmanager to load new config
docker-compose -f docker-compose.monitoring.yml restart alertmanager

# Or start fresh
docker-compose -f docker-compose.monitoring.yml up -d alertmanager
```

### **5. Verify Configuration**

```bash
# Check Alertmanager is healthy
curl http://localhost:9093/-/healthy

# Check config is loaded
curl http://localhost:9093/api/v2/status/config
```

---

## 📊 Alert Routing Flow

```
Prometheus Alert Rules
    ↓
Alertmanager Routes
    ↓
┌─────────────────────────────────────┐
│ Critical ARR/ROI                    │ → #exec-board
│ Critical GNN                       │ → PagerDuty + #ai-ops
│ Warning GNN                        │ → #ai-ops
│ Revenue Team                        │ → #revenue-ops
│ ML Ops Team                         │ → #ml-ops
│ Default                             │ → #ai-ops
└─────────────────────────────────────┘
```

---

## 🎨 Alert Format Examples

### **Critical ARR Alert** (→ #exec-board)

```
🔥 CRITICAL ALERT - Executive Summary

Alert: GNNARRGainStagnant
Impact: ARR gain from GNN predictions is less than $1,000 in the last 24 hours
Dealer: All

Business Impact:
• ARR gain from GNN predictions is less than $1,000 in the last 24 hours. Expected higher impact.
• Detected: Jan 15, 3:45 PM EST

Actions Required:
• Review runbook: https://wiki.dealershipai.com/runbooks/gnn-arr-stagnant
• Dashboard: https://grafana.dealershipai.com/d/gnn-analytics
• Contact: #ai-ops for technical details
```

### **Warning GNN Alert** (→ #ai-ops)

```
⚠️ GNN Alert: GNNPrecisionDrop

Status: Firing ⚠️

Alert: GNNPrecisionDrop
Severity: Warning
Dealer: dealer123
Component: gnn

Details:
• Expr: GNN model precision has dropped to 72.3% for the last 10 minutes. Expected threshold: 75%
• Starts: 2025-01-15 15:45:00 EST
• Dealer: dealer123

Runbook: https://wiki.dealershipai.com/runbooks/gnn-precision-drop
```

---

## 🔧 Customization

### **Add Custom Routes**

Edit `prometheus/alertmanager.yml`:

```yaml
routes:
  # Your custom route
  - match:
      team: custom-team
    receiver: 'slack_custom_team'
    group_wait: 1m
```

### **Add Custom Receiver**

```yaml
receivers:
  - name: 'slack_custom_team'
    slack_configs:
      - channel: '#custom-channel'
        username: 'CustomBot'
        title: 'Custom Alert'
        text: 'Your custom format here'
```

### **Change Default Channel**

```yaml
route:
  receiver: 'slack_your_default'  # Change from 'slack_ai_ops'
```

---

## 🧪 Testing

### **Send Test Alert**

```bash
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning",
      "component": "gnn",
      "dealer": "dealer123"
    },
    "annotations": {
      "summary": "Test alert",
      "description": "This is a test alert to verify Slack integration"
    }
  }]'
```

### **Verify Alert in Slack**

Check your configured Slack channel for the test alert.

### **Test Resolved Alert**

Wait 5 minutes (resolve_timeout) and check Slack for the resolved notification.

---

## 🐛 Troubleshooting

### **Alerts Not Reaching Slack**

1. **Check webhook URL:**
   ```bash
   # Test webhook manually
   curl -X POST ${SLACK_WEBHOOK_URL} \
     -H "Content-Type: application/json" \
     -d '{"text":"Test message"}'
   ```

2. **Check Alertmanager logs:**
   ```bash
   docker logs dealershipai-alertmanager
   ```

3. **Verify config is loaded:**
   ```bash
   curl http://localhost:9093/api/v2/status/config
   ```

4. **Check Prometheus → Alertmanager connection:**
   ```bash
   # In Prometheus UI: Status → Targets
   # Alertmanager target should be "UP"
   ```

### **Wrong Channel Receiving Alerts**

1. Check route matching in `alertmanager.yml`
2. Verify alert labels match route conditions
3. Check `continue: false` to prevent multiple routes

### **No Resolved Notifications**

1. Ensure `send_resolved: true` in receiver config
2. Wait for `resolve_timeout` (default 5m)
3. Check alert actually resolved in Prometheus

---

## 🔐 Security Notes

### **Slack Webhook Security**

- Webhook URLs are sensitive - store in environment variables
- Use different webhooks for different environments
- Rotate webhooks periodically

### **Alertmanager Access**

- Default: No authentication on Alertmanager UI
- For production: Add reverse proxy with auth (NGINX)
- Or use Alertmanager's native authentication (v0.24+)

---

## 📈 Next Steps

1. ✅ Alertmanager configured
2. ✅ Slack integration active
3. ✅ Multi-channel routing enabled
4. ✅ PagerDuty integration ready (optional)

**Test alerts and verify Slack notifications are working!** 🔔

---

## 📚 Resources

- **Alertmanager Docs**: https://prometheus.io/docs/alerting/latest/alertmanager/
- **Slack Webhook Setup**: https://api.slack.com/messaging/webhooks
- **Prometheus Alerting**: https://prometheus.io/docs/alerting/latest/overview/

