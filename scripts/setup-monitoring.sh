#!/bin/bash
# Setup script for Prometheus + Grafana monitoring stack
# Run: chmod +x scripts/setup-monitoring.sh && ./scripts/setup-monitoring.sh

set -e

echo "🚀 Setting up DealershipAI Monitoring Stack..."

# Check for required environment variables
if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo "⚠️  Warning: SLACK_WEBHOOK_URL not set. Alerts will not send to Slack."
fi

if [ -z "$PAGERDUTY_SERVICE_KEY" ]; then
  echo "⚠️  Warning: PAGERDUTY_SERVICE_KEY not set. Critical alerts will not send to PagerDuty."
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p prometheus/data
mkdir -p alertmanager/data
mkdir -p grafana/data
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/provisioning/datasources

# Set permissions
echo "🔒 Setting permissions..."
chmod 755 prometheus/data
chmod 755 alertmanager/data
chmod 755 grafana/data

# Copy datasource configuration
echo "📊 Configuring Grafana datasources..."
cp grafana/datasources/prometheus.yml grafana/provisioning/datasources/prometheus.yml 2>/dev/null || true

# Copy dashboard provisioning
echo "📈 Configuring Grafana dashboards..."
cp grafana/provisioning/dashboards/dashboards.yml grafana/provisioning/dashboards/dashboards.yml 2>/dev/null || true

# Start services
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check Prometheus health
echo "🔍 Checking Prometheus..."
if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
  echo "✅ Prometheus is healthy"
else
  echo "❌ Prometheus health check failed"
  exit 1
fi

# Check Alertmanager health
echo "🔍 Checking Alertmanager..."
if curl -f http://localhost:9093/-/healthy > /dev/null 2>&1; then
  echo "✅ Alertmanager is healthy"
else
  echo "❌ Alertmanager health check failed"
  exit 1
fi

# Check Grafana health
echo "🔍 Checking Grafana..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "✅ Grafana is healthy"
else
  echo "❌ Grafana health check failed"
  exit 1
fi

# Import Grafana dashboard
echo "📊 Importing Grafana dashboard..."
DASHBOARD_JSON=$(cat grafana/dashboards/gnn-analytics.json | jq -c '.')

curl -X POST \
  http://admin:admin@localhost:3001/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d "{\"dashboard\": ${DASHBOARD_JSON}, \"overwrite\": true}" \
  > /dev/null 2>&1 || echo "⚠️  Dashboard import failed (may already exist)"

echo ""
echo "✅ Monitoring stack setup complete!"
echo ""
echo "📊 Services:"
echo "  • Prometheus:    http://localhost:9090"
echo "  • Alertmanager: http://localhost:9093"
echo "  • Grafana:      http://localhost:3001 (admin/admin)"
echo ""
echo "📈 Dashboard:"
echo "  • GNN Analytics: http://localhost:3001/d/gnn-analytics"
echo ""
echo "🧪 Test metrics endpoint:"
echo "  curl http://localhost:3000/api/metrics"
echo ""

