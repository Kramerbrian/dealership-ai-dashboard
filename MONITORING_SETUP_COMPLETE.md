# ✅ Monitoring Setup Complete

Complete Prometheus + Grafana + Alertmanager stack for GNN analytics.

---

## 🎯 What's Included

### **1. Metrics Endpoint**
- ✅ `app/api/metrics/route.ts` - Prometheus-compatible metrics endpoint
- ✅ `lib/gnn/metrics.ts` - Convenience functions for recording metrics

### **2. Prometheus Configuration**
- ✅ `prometheus/prometheus.yml` - Main Prometheus config
- ✅ `prometheus/recording-rules.yml` - Pre-aggregated metrics
- ✅ `prometheus/alert-rules.yml` - Alert conditions

### **3. Alertmanager Configuration**
- ✅ `prometheus/alertmanager.yml` - Routing and notification config
  - Critical alerts → PagerDuty
  - Warning alerts → Slack (#gnn-alerts)
  - Revenue alerts → Slack (#revenue-ops)
  - ML alerts → Slack (#ml-ops)

### **4. Docker Compose**
- ✅ `docker-compose.monitoring.yml` - One-command stack deployment

### **5. Grafana Configuration**
- ✅ `grafana/dashboards/gnn-analytics.json` - Dashboard JSON
- ✅ `grafana/datasources/prometheus.yml` - Auto-configured datasource
- ✅ `grafana/provisioning/dashboards/dashboards.yml` - Auto-import

### **6. Setup Scripts**
- ✅ `scripts/setup-monitoring.sh` - Complete stack setup
- ✅ `scripts/test-metrics.sh` - Test metrics endpoint
- ✅ `scripts/import-grafana-dashboard.sh` - Import dashboard manually

---

## 🚀 Quick Start

### **1. Set Environment Variables**

```bash
# Copy example file
cp .env.monitoring.example .env.monitoring

# Edit with your values
# - SLACK_WEBHOOK_URL (required for Slack alerts)
# - PAGERDUTY_SERVICE_KEY (required for PagerDuty)
# - GRAFANA_ADMIN_PASSWORD (optional, defaults to 'admin')
```

### **2. Start Monitoring Stack**

```bash
# Option A: Use setup script (recommended)
chmod +x scripts/setup-monitoring.sh
./scripts/setup-monitoring.sh

# Option B: Manual Docker Compose
docker-compose -f docker-compose.monitoring.yml up -d
```

### **3. Verify Services**

```bash
# Check Prometheus
curl http://localhost:9090/-/healthy

# Check Alertmanager
curl http://localhost:9093/-/healthy

# Check Grafana
curl http://localhost:3001/api/health

# Check metrics endpoint
curl http://localhost:3000/api/metrics
```

### **4. Access Dashboards**

- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Grafana**: http://localhost:3001 (admin/admin)
- **GNN Dashboard**: http://localhost:3001/d/gnn-analytics

---

## 📊 Recording Metrics

### **From Your Code**

```typescript
import { 
  recordGNNPrediction, 
  recordGNNVerification,
  updateGNNTrainingLoss 
} from '@/lib/gnn/metrics';

// Record a prediction
await recordGNNPrediction({
  dealerId: 'dealer123',
  intent: 'service_price',
  fix: 'add_faq_schema',
  confidence: 0.92
});

// Record verification (accepted fix)
await recordGNNVerification({
  dealerId: 'dealer123',
  intent: 'service_price',
  fix: 'add_faq_schema',
  confidence: 0.92,
  arrGainUsd: 500
});

// Update training loss
await updateGNNTrainingLoss(0.045);
```

### **Direct API Calls**

```bash
# Record metrics via API (if you create endpoints)
curl -X POST http://localhost:3000/api/gnn/predict \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "dealer123",
    "intent": "service_price",
    "fix": "add_faq_schema",
    "confidence": 0.92
  }'
```

---

## 🔔 Configure Alerts

### **Slack Setup**

1. Create Slack webhook:
   - Go to https://api.slack.com/apps
   - Create new app → Incoming Webhooks
   - Copy webhook URL

2. Set environment variable:
   ```bash
   export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Update Alertmanager config:
   ```yaml
   # prometheus/alertmanager.yml
   global:
     slack_api_url: '${SLACK_WEBHOOK_URL}'
   ```

### **PagerDuty Setup**

1. Create PagerDuty service:
   - Go to PagerDuty → Services → New Service
   - Choose "Prometheus" integration
   - Copy Service Key

2. Set environment variable:
   ```bash
   export PAGERDUTY_SERVICE_KEY=your-service-key
   ```

3. Alertmanager already configured in `alertmanager.yml`

---

## 🧪 Testing

### **Test Metrics Endpoint**

```bash
# Test Prometheus format
curl http://localhost:3000/api/metrics

# Test JSON format
curl "http://localhost:3000/api/metrics?format=json"
```

### **Test Prometheus Scraping**

```bash
# Query metrics in Prometheus
curl "http://localhost:9090/api/v1/query?query=gnn_predictions_total"

# Query recording rule
curl "http://localhost:9090/api/v1/query?query=gnn:precision:1h"
```

### **Test Alert Rules**

```bash
# Force an alert (temporarily)
# 1. Stop recording verifications
# 2. Wait for precision to drop
# 3. Check Alertmanager UI for fired alerts
```

### **Test Alertmanager Notifications**

```bash
# Send test alert
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning",
      "component": "gnn"
    },
    "annotations": {
      "summary": "Test alert",
      "description": "This is a test"
    }
  }]'
```

---

## 📈 Grafana Dashboard Features

### **Panels**

1. **Total Predictions** - Counter stat panel
2. **Verified Predictions** - Counter stat panel  
3. **Precision Gauge** - Real-time precision percentage
4. **Training Loss Trend** - Time series graph
5. **Precision Over Time** - Historical precision
6. **ARR Gain** - Revenue impact visualization
7. **Top 10 Fixes** - Table with confidence scores

### **Template Variables**

- `$dealer` - Filter by dealer (multi-select)

### **Auto-Refresh**

Dashboard refreshes every 15 seconds automatically.

---

## 🔧 Customization

### **Add New Metrics**

1. Update `app/api/metrics/route.ts` to expose new metric
2. Add recording rule in `prometheus/recording-rules.yml`
3. Add panel to Grafana dashboard

### **Add New Alerts**

1. Add alert rule to `prometheus/alert-rules.yml`
2. Reload Prometheus: `curl -X POST http://localhost:9090/-/reload`
3. Or restart Prometheus container

### **Change Notification Channels**

Edit `prometheus/alertmanager.yml` route configuration.

---

## 🐛 Troubleshooting

### **Metrics Not Appearing**

1. Check Next.js app is running on port 3000
2. Verify Prometheus is scraping: http://localhost:9090/targets
3. Check metrics endpoint: `curl http://localhost:3000/api/metrics`

### **Alerts Not Firing**

1. Check alert rules are loaded: http://localhost:9090/alerts
2. Verify Alertmanager is running: http://localhost:9093
3. Check Alertmanager logs: `docker logs dealershipai-alertmanager`

### **Grafana Dashboard Not Loading**

1. Verify Prometheus datasource is configured
2. Check dashboard JSON is valid: `jq . grafana/dashboards/gnn-analytics.json`
3. Manually import: `./scripts/import-grafana-dashboard.sh`

---

## 📚 Next Steps

1. ✅ Metrics endpoint created
2. ✅ Prometheus configured
3. ✅ Grafana dashboard ready
4. ✅ Alert rules configured
5. ✅ Notification channels setup

**Start recording metrics in your GNN engine and watch the dashboard populate!** 📊

---

## 🔗 Links

- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093  
- **Grafana**: http://localhost:3001
- **Metrics Endpoint**: http://localhost:3000/api/metrics

