#!/bin/bash
# Setup Prometheus/Grafana monitoring for GNN Engine
# Usage: ./scripts/setup-gnn-monitoring.sh

set -e

echo "📊 Setting up GNN Monitoring Stack"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p config/prometheus
mkdir -p config/alertmanager
mkdir -p config/grafana/provisioning/datasources
mkdir -p config/grafana/provisioning/dashboards

# Verify rule files exist
if [ ! -f "config/prometheus/gnn-rules.yml" ]; then
    echo "❌ Missing config/prometheus/gnn-rules.yml"
    exit 1
fi

if [ ! -f "config/prometheus/alerting-rules.yml" ]; then
    echo "❌ Missing config/prometheus/alerting-rules.yml"
    exit 1
fi

# Check for Slack webhook URL
if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "⚠️  SLACK_WEBHOOK_URL not set. Alerts will be disabled."
    echo "   Set it with: export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...'"
fi

# Ensure network exists
echo "📡 Creating Docker network..."
docker network create dealershipai-network 2>/dev/null || echo "Network already exists"

# Start monitoring stack
echo "🚀 Starting monitoring services..."
docker-compose -f config/docker-compose.monitoring.yml up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check Prometheus
echo "🔍 Checking Prometheus..."
if curl -f http://localhost:9090/-/ready > /dev/null 2>&1; then
    echo "✅ Prometheus is ready"
    echo "   URL: http://localhost:9090"
else
    echo "⚠️  Prometheus may not be ready yet"
fi

# Check Grafana
echo "🔍 Checking Grafana..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Grafana is ready"
    echo "   URL: http://localhost:3001"
    echo "   Login: admin / admin"
else
    echo "⚠️  Grafana may not be ready yet (wait 10-15 seconds)"
fi

# Check Alertmanager (if Slack webhook is set)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "🔍 Checking Alertmanager..."
    if curl -f http://localhost:9093/-/ready > /dev/null 2>&1; then
        echo "✅ Alertmanager is ready"
        echo "   URL: http://localhost:9093"
    fi
fi

echo ""
echo "✅ Monitoring stack deployed!"
echo ""
echo "📊 Access URLs:"
echo "   Prometheus:    http://localhost:9090"
echo "   Grafana:       http://localhost:3001 (admin/admin)"
echo "   Alertmanager:  http://localhost:9093"
echo ""
echo "📋 Next steps:"
echo "   1. Import GNN dashboard in Grafana:"
echo "      - Go to Dashboards → Import"
echo "      - Upload: gnn-engine/grafana-dashboard.json"
echo "   2. Configure Slack webhook (optional):"
echo "      export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...'"
echo "      docker-compose -f config/docker-compose.monitoring.yml restart alertmanager"
echo ""
echo "📈 Recording rules are active:"
echo "   - gnn_precision_rolling_1h"
echo "   - gnn_training_loss_smooth"
echo "   - gnn_arr_gain_rate"
echo "   - gnn_roi_estimate"
echo "   - gnn_precision_by_dealer"

