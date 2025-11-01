# 📊 Grafana GNN Analytics Dashboard Setup

Complete setup guide for visualizing Graph Neural Network (GNN) metrics in Grafana.

---

## 🎯 What This Dashboard Shows

- **Total Predictions** - Cumulative count of GNN edge predictions
- **Verified Predictions** - Count of predictions that were verified/accepted
- **Precision Gauge** - Real-time precision percentage (Verified / Total)
- **Training Loss Trend** - Model loss over time (detects overfitting/drift)
- **Precision Over Time** - Historical precision trend
- **ARR Gain** - Revenue impact from verified fixes
- **Top 10 Fixes** - Highest confidence predicted fixes with details

---

## 📋 Prerequisites

1. **Prometheus** - Metrics collection endpoint
2. **Grafana** - Dashboard visualization (v8.0+)
3. **GNN Engine** - Must expose Prometheus metrics

---

## 🚀 Quick Setup

### **1. Import Dashboard**

1. Open Grafana → **Dashboards** → **Import**
2. Upload `grafana/dashboards/gnn-analytics.json`
3. Select your Prometheus datasource
4. Click **Import**

### **2. Configure Prometheus Recording Rules**

Add to your Prometheus config (`prometheus.yml`):

```yaml
rule_files:
  - "prometheus/recording-rules.yml"
  - "prometheus/alert-rules.yml"
```

Restart Prometheus to load rules.

### **3. Configure Alert Rules** (Optional)

Add alert rules to Prometheus (same config file) or use Grafana Alerting:

```yaml
# Included in prometheus/alert-rules.yml
```

---

## 📊 Required Metrics

Your GNN engine must expose these Prometheus metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `gnn_predictions_total` | Counter | Total number of predicted edges |
| `gnn_predictions_verified` | Counter | Number of verified/accepted predictions |
| `gnn_training_loss` | Gauge | Current training loss value |
| `gnn_arr_gain_usd` | Counter | Cumulative ARR gain from verified fixes |
| `gnn_fix_confidence{dealer, intent, fix}` | Gauge | Confidence score per predicted fix |

### **Example Metric Export (Python/Prometheus Client)**

```python
from prometheus_client import Counter, Gauge, start_http_server

# Metrics
predictions_total = Counter('gnn_predictions_total', 'Total GNN predictions')
predictions_verified = Counter('gnn_predictions_verified', 'Verified predictions')
training_loss = Gauge('gnn_training_loss', 'Training loss')
arr_gain_usd = Counter('gnn_arr_gain_usd', 'ARR gain in USD', ['dealer', 'intent'])
fix_confidence = Gauge('gnn_fix_confidence', 'Fix confidence score', 
                      ['dealer', 'intent', 'fix'])

# Increment on prediction
predictions_total.inc()

# Increment on verification
predictions_verified.inc()
arr_gain_usd.labels(dealer='dealer123', intent='service_price').inc(500)
fix_confidence.labels(dealer='dealer123', intent='service_price', 
                      fix='add_faq_schema').set(0.92)

# Update training loss
training_loss.set(0.045)
```

---

## 🎨 Dashboard Features

### **Dealer Filter**

The dashboard includes a template variable `$dealer` that filters metrics by dealer. Use the dropdown in the top-left to select specific dealers or "All".

### **Auto-Refresh**

Dashboard refreshes every 15 seconds by default. Adjust in dashboard settings.

### **Annotations**

Model retrain events are automatically annotated on graphs when `gnn_model_version_info` metric is updated.

---

## 🔔 Alert Configuration

### **Prometheus Alerts** (Recommended)

Alerts are defined in `prometheus/alert-rules.yml`:

- **GNNPrecisionDrop** - Precision < 75% for 10+ minutes
- **GNNPrecisionCritical** - Precision < 60% for 5+ minutes
- **GNNTrainingLossSpike** - Loss 2x higher than average
- **GNNPredictionRateDrop** - Prediction rate 50% lower than normal
- **GNNARRGainStagnant** - ARR gain < $1K in 24h
- **GNNNoVerifications** - Predictions but no verifications

### **Grafana Alerting** (Alternative)

1. Open dashboard → **Alert** tab
2. Create alert rules based on panel queries
3. Configure notification channels (Slack, PagerDuty, etc.)

---

## 🧪 Testing

### **1. Verify Metrics Are Exposed**

```bash
# Check Prometheus endpoint
curl http://localhost:9090/api/v1/query?query=gnn_predictions_total

# Should return:
# {"status":"success","data":{"resultType":"vector","result":[...]}}
```

### **2. Test Recording Rules**

```bash
# Query a recording rule
curl http://localhost:9090/api/v1/query?query=gnn:precision:1h

# Should compute precision from base metrics
```

### **3. Simulate Metrics** (Development)

```python
# test_gnn_metrics.py
from prometheus_client import Counter, Gauge
import time

predictions_total = Counter('gnn_predictions_total', 'Total predictions')
predictions_verified = Counter('gnn_predictions_verified', 'Verified')
training_loss = Gauge('gnn_training_loss', 'Loss')
arr_gain = Counter('gnn_arr_gain_usd', 'ARR gain', ['dealer'])
fix_conf = Gauge('gnn_fix_confidence', 'Fix confidence', 
                 ['dealer', 'intent', 'fix'])

# Simulate predictions
for i in range(100):
    predictions_total.inc()
    if i % 10 == 0:
        predictions_verified.inc()
        arr_gain.labels(dealer='dealer123').inc(50)
    
    training_loss.set(0.05 + (i % 5) * 0.01)
    fix_conf.labels(dealer='dealer123', intent='service_price', 
                   fix='add_faq_schema').set(0.85 + (i % 10) * 0.01)
    time.sleep(1)
```

Run and check Grafana dashboard updates in real-time.

---

## 📈 Performance Optimization

### **Recording Rules**

Pre-aggregated metrics in `prometheus/recording-rules.yml` reduce query load:

- `gnn:precision:1h` - Pre-computed hourly precision
- `gnn:arr_gain:delta:1h` - Pre-computed hourly ARR delta
- `gnn:training_loss:avg:10` - Moving average of loss

These rules run every 30 seconds and cache results, making Grafana queries instant even at scale.

### **Metric Retention**

Configure Prometheus retention for optimal performance:

```yaml
# prometheus.yml
storage:
  tsdb:
    retention.time: 30d
    retention.size: 50GB
```

---

## 🔧 Customization

### **Add Custom Panels**

1. Click **Add** → **Visualization** in Grafana
2. Choose panel type (stat, graph, gauge, etc.)
3. Write PromQL query:
   ```promql
   # Example: Precision by intent
   sum(gnn_fix_confidence{dealer="$dealer"}) by (intent)
   ```
4. Save to dashboard

### **Change Refresh Interval**

Dashboard → Settings → **Time options** → **Auto-refresh** → Select interval

### **Add Annotation Sources**

Dashboard → Settings → **Annotations** → Add new source:

- Query: `gnn_model_version_info`
- Tag keys: `version, commit`
- Text format: `Model {{version}} ({{commit}}) deployed`

---

## 🚨 Troubleshooting

### **"No data" in panels**

1. Check Prometheus is scraping GNN metrics:
   ```bash
   curl http://prometheus:9090/api/v1/targets
   ```
2. Verify metric names match exactly (case-sensitive)
3. Check time range (try "Last 1 hour")

### **Recording rules not appearing**

1. Check Prometheus logs for rule evaluation errors
2. Verify rule file path in `prometheus.yml`
3. Query raw metrics to ensure they exist:
   ```promql
   gnn_predictions_total
   ```

### **Alerts not firing**

1. Check alert rule syntax in Prometheus UI → Alerts
2. Verify `for` duration has elapsed
3. Check alertmanager is configured and running

---

## 📚 Additional Resources

- [Prometheus Query Language (PromQL)](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboard JSON Schema](https://grafana.com/docs/grafana/latest/dashboards/json-model/)
- [Recording Rules Best Practices](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)

---

## ✅ Status

- ✅ Dashboard JSON created
- ✅ Recording rules configured
- ✅ Alert rules configured
- ✅ Documentation complete

**Ready to import and visualize!** 📊

