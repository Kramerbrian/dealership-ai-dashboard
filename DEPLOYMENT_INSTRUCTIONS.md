# GNN Monitoring Stack - Deployment Instructions

## Prerequisites

1. **Docker Desktop** must be running
2. **Rule files** must exist:
   - `config/prometheus/gnn-rules.yml`
   - `config/prometheus/alerting-rules.yml`
   - `config/alertmanager/alertmanager.yml`

## Deployment Steps

### Step 1: Start Docker Desktop

**macOS**: Open Docker Desktop application

**Verify Docker is running**:
```bash
docker info
```

### Step 2: Deploy Monitoring Stack

```bash
# Make script executable
chmod +x scripts/setup-gnn-monitoring.sh

# Run deployment
./scripts/setup-gnn-monitoring.sh
```

**Or manually**:
```bash
# Create network
docker network create dealershipai-network

# Start services
docker-compose -f config/docker-compose.monitoring.yml up -d
```

### Step 3: Set Slack Webhook (Optional)

```bash
export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

# Restart Alertmanager to pick up webhook
docker-compose -f config/docker-compose.monitoring.yml restart alertmanager
```

### Step 4: Verify Rules

```bash
# Check Prometheus rules
curl http://localhost:9090/api/v1/rules | jq '.data.groups[]'

# Check specific rule group
curl http://localhost:9090/api/v1/rules | jq '.data.groups[] | select(.name=="dealershipai_gnn_recording_rules")'

# Check alerts
curl http://localhost:9090/api/v1/rules | jq '.data.groups[] | select(.name=="gnn_alerts")'
```

### Step 5: Access Services

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Alertmanager**: http://localhost:9093

## Troubleshooting

### Docker Not Running

```bash
# Check Docker status
docker info

# Start Docker Desktop (macOS)
open -a Docker

# Wait for Docker to start
sleep 10
```

### Prometheus Not Ready

```bash
# Check container status
docker ps | grep prometheus

# Check logs
docker logs dealershipai-prometheus

# Restart if needed
docker-compose -f config/docker-compose.monitoring.yml restart prometheus
```

### Rules Not Loading

```bash
# Validate Prometheus config
docker exec dealershipai-prometheus promtool check config /etc/prometheus/prometheus.yml

# Validate rules syntax
docker exec dealershipai-prometheus promtool check rules /etc/prometheus/rules/*.yml

# Reload config (without restart)
curl -X POST http://localhost:9090/-/reload
```

### Service Not Accessible

```bash
# Check if containers are running
docker ps --filter "name=dealershipai"

# Check network
docker network inspect dealershipai-network

# Restart all services
docker-compose -f config/docker-compose.monitoring.yml restart
```

## Verification Checklist

- [ ] Docker Desktop is running
- [ ] Network `dealershipai-network` exists
- [ ] Prometheus container is running
- [ ] Grafana container is running
- [ ] Alertmanager container is running (if webhook set)
- [ ] Prometheus rules are loaded
- [ ] Grafana accessible at http://localhost:3001
- [ ] Prometheus accessible at http://localhost:9090

## Quick Health Check

```bash
#!/bin/bash
# Quick health check script

echo "🔍 Checking GNN Monitoring Stack..."

# Docker
if docker info >/dev/null 2>&1; then
  echo "✅ Docker is running"
else
  echo "❌ Docker is not running"
  exit 1
fi

# Prometheus
if curl -f http://localhost:9090/-/ready >/dev/null 2>&1; then
  echo "✅ Prometheus is ready"
  RULES=$(curl -s http://localhost:9090/api/v1/rules | jq '.data.groups | length')
  echo "   Rules loaded: $RULES groups"
else
  echo "❌ Prometheus is not ready"
fi

# Grafana
if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
  echo "✅ Grafana is ready"
else
  echo "⚠️  Grafana is not ready (may take 10-15 seconds)"
fi

# Alertmanager
if curl -f http://localhost:9093/-/ready >/dev/null 2>&1; then
  echo "✅ Alertmanager is ready"
else
  echo "⚠️  Alertmanager not running (optional if no Slack webhook)"
fi

echo ""
echo "📊 Access URLs:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana:    http://localhost:3001"
echo "   Alertmanager: http://localhost:9093"
```

