# DealershipAI Board Report Generator

Automated quarterly executive PDF reports generated from Prometheus/Grafana metrics.

## 🎯 Overview

Generates professional, board-ready PDF reports with:
- Summary metrics (uptime, ARR error, self-heal rate, automation)
- Reliability charts (uptime trends, incidents)
- AI performance metrics (GNN precision, ARR forecasts)
- Automation breakdown (auto vs manual fixes)
- Financial impact (ARR gain by segment)
- Executive summaries

## 📋 Requirements

```bash
pip install -r requirements.txt
```

## 🚀 Usage

### Manual Generation

```bash
python generate_board_report.py
```

### Environment Variables

```bash
export PROMETHEUS_URL=http://prometheus:9090
export GRAFANA_URL=http://grafana:3002
export GRAFANA_API_KEY=your-api-key
export SLACK_WEBHOOK_URL=https://hooks.slack.com/...
export S3_BUCKET=dealershipai-reports
export S3_REGION=us-east-1
```

### Kubernetes CronJob

Deploy the CronJob to run automatically each quarter:

```bash
kubectl apply -f k8s/board-report-cronjob.yaml
```

The CronJob runs on:
- January 1st (Q1 report)
- April 1st (Q2 report)
- July 1st (Q3 report)
- October 1st (Q4 report)

## 📊 Report Structure

1. **Summary Metrics** - Key KPIs with quarter-over-quarter deltas
2. **Reliability Overview** - Uptime trends, MTTD/MTTR, top incidents
3. **AI Performance** - GNN precision, ARR forecasts, RL updates
4. **Automation & Self-Healing** - Breakdown of auto vs manual fixes
5. **Financial Impact** - ARR gain trends and dealer segment analysis
6. **Upcoming Objectives** - Next quarter goals

## 🔧 Customization

### Adding Custom Metrics

Edit `generate_board_report.py`:

```python
# Add to fetch_metrics()
custom_metric = prom.custom_query('your_prometheus_query')
metrics['custom'] = float(custom_metric[0]['value'][1])
```

### Adding Custom Charts

Edit `generate_charts.py`:

```python
def generate_custom_chart(self, data):
    # Your chart generation logic
    pass
```

### Modifying Template

Edit `templates/board_report.html` to customize layout, styling, or add sections.

## 📤 Output

- **PDF File**: `/tmp/reports/board_report_Q{quarter}_{year}.pdf`
- **S3 Upload**: `s3://dealershipai-reports/quarterly/board_report_Q{quarter}_{year}.pdf`
- **Slack Notification**: Posted to `#exec-board` channel

## 🔒 Security

- Report hash included for integrity verification
- Secrets stored in Kubernetes secrets
- S3 access via IAM roles (EKS IRSA) or access keys

## 📈 Metrics Tracked

| Metric | Prometheus Query | Description |
|--------|-----------------|-------------|
| Uptime | `avg_over_time(up{job="orchestrator"}[30d])` | System availability |
| ARR Forecast Error | `avg(arr_forecast_error)` | Forecast accuracy |
| Self-Heal Rate | `sum(rate(auto_remediation_success[30d])) / sum(rate(incidents_total[30d]))` | Auto-fix success |
| Automation Coverage | `sum(rate(automated_tasks_total[30d])) / sum(rate(tasks_total[30d]))` | Task automation |
| GNN Precision | `avg(gnn_precision_by_dealer)` | Model accuracy |
| ARR Gain | `sum(gnn_arr_gain_by_dealer)` | Revenue impact |

## 🐛 Troubleshooting

### Charts Not Generating

- Check Prometheus connectivity
- Verify queries return data
- Check chart output directory permissions

### PDF Generation Fails

- Ensure WeasyPrint dependencies installed
- Check HTML template syntax
- Verify font availability

### S3 Upload Fails

- Verify AWS credentials
- Check bucket permissions
- Verify network connectivity

## 📚 Additional Resources

- [Prometheus API Client Docs](https://github.com/4n4nd/prometheus-api-client-python)
- [WeasyPrint Documentation](https://weasyprint.org/)
- [Jinja2 Template Documentation](https://jinja.palletsprojects.com/)

---

**Status**: ✅ **PRODUCTION READY**

Automated quarterly reports keep executives informed with zero manual effort.

