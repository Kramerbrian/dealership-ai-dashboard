# ⚡ Quick Start: GNN Monitoring Setup

Complete monitoring stack setup in 5 minutes.

---

## 🎯 5-Step Setup

### **1. Set Environment Variables**

```bash
# Copy example
cp .env.monitoring.example .env.monitoring

# Edit with your values
nano .env.monitoring
```

Required:
- `SLACK_WEBHOOK_URL` (for alerts)
- `PAGERDUTY_SERVICE_KEY` (optional, for critical alerts)

### **2. Start Monitoring Stack**

```bash
chmod +x scripts/setup-monitoring.sh
./scripts/setup-monitoring.sh
```

Or manually:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### **3. Import Grafana Dashboard**

```bash
./scripts/import-grafana-dashboard.sh
```

Or manually:
1. Open Grafana: http://localhost:3001 (admin/admin)
2. Dashboards → Import
3. Upload `grafana/dashboards/gnn-analytics.json`

### **4. Test Metrics Endpoint**

```bash
# Check metrics are exposed
curl http://localhost:3000/api/metrics

# Should see Prometheus format metrics
```

### **5. Verify Prometheus Scraping**

```bash
# Check targets
curl http://localhost:9090/api/v1/targets

# Query metrics
curl "http://localhost:9090/api/v1/query?query=gnn_predictions_total"
```

---

## ✅ Verify Everything Works

### **Check Services**

```bash
# Prometheus
curl http://localhost:9090/-/healthy

# Alertmanager  
curl http://localhost:9093/-/healthy

# Grafana
curl http://localhost:3001/api/health

# Metrics endpoint
curl http://localhost:3000/api/metrics
```

### **View Dashboard**

1. Open: http://localhost:3001
2. Login: admin/admin
3. Navigate: Dashboards → GNN Analytics
4. Should see: Empty metrics (will populate as you record predictions)

---

## 📊 Record Test Metrics

```typescript
// From your code
import { recordGNNPrediction, recordGNNVerification } from '@/lib/gnn/metrics';

// Record a prediction
await recordGNNPrediction({
  dealerId: 'dealer123',
  intent: 'service_price',
  fix: 'add_faq_schema',
  confidence: 0.92
});

// Record verification (when fix is applied)
await recordGNNVerification({
  dealerId: 'dealer123',
  intent: 'service_price',
  fix: 'add_faq_schema',
  confidence: 0.92,
  arrGainUsd: 500
});
```

Or via API:
```bash
# Make a prediction (triggers metrics)
curl -X POST http://localhost:3000/api/gnn/predict \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "dealer123", "threshold": 0.85}'

# Verify prediction (triggers metrics)
curl -X POST http://localhost:3000/api/gnn/verify \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "dealer123",
    "intent": "service_price",
    "fix": "add_faq_schema",
    "verified": true,
    "confidence": 0.92,
    "arrGainUsd": 500
  }'
```

---

## 🔔 Configure Alerts (Optional)

### **Slack Setup**

1. Create webhook: https://api.slack.com/apps → Incoming Webhooks
2. Update `.env.monitoring`:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```
3. Restart Alertmanager:
   ```bash
   docker-compose -f docker-compose.monitoring.yml restart alertmanager
   ```

### **PagerDuty Setup**

1. Create service in PagerDuty → Prometheus integration
2. Update `.env.monitoring`:
   ```bash
   PAGERDUTY_SERVICE_KEY=your-service-key
   ```
3. Restart Alertmanager

---

## 📈 Dashboard URLs

- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **Grafana**: http://localhost:3001 (admin/admin)
- **GNN Dashboard**: http://localhost:3001/d/gnn-analytics
- **Metrics Endpoint**: http://localhost:3000/api/metrics

---

## ✅ Status

- ✅ Metrics endpoint exposed at `/api/metrics`
- ✅ Prometheus configured to scrape metrics
- ✅ Grafana dashboard ready to import
- ✅ Recording rules enabled for performance
- ✅ Alert rules configured
- ✅ GNN endpoints integrated with metrics recording

**Ready to monitor!** Start recording predictions and watch the dashboard populate. 📊

