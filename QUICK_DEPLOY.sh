#!/bin/bash
# Quick deploy script for GNN monitoring stack

echo "🚀 Deploying GNN Monitoring Stack"
echo "=================================="
echo ""

# Check Docker
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Create network
echo "📡 Creating Docker network..."
docker network create dealershipai-network 2>/dev/null || echo "Network already exists"

# Start services
echo "🚀 Starting monitoring services..."
cd "$(dirname "$0")"
docker-compose -f config/docker-compose.monitoring.yml up -d

# Wait
echo "⏳ Waiting 5 seconds for services to start..."
sleep 5

# Check status
echo ""
echo "📊 Service Status:"
echo "=================="

if curl -f http://localhost:9090/-/ready >/dev/null 2>&1; then
    echo "✅ Prometheus: http://localhost:9090"
    RULES=$(curl -s http://localhost:9090/api/v1/rules 2>/dev/null | jq '.data.groups | length' 2>/dev/null || echo "?")
    echo "   Rules loaded: $RULES groups"
else
    echo "⚠️  Prometheus: Starting..."
fi

if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ Grafana: http://localhost:3001 (admin/admin)"
else
    echo "⚠️  Grafana: Starting... (may take 10-15 seconds)"
fi

if curl -f http://localhost:9093/-/ready >/dev/null 2>&1; then
    echo "✅ Alertmanager: http://localhost:9093"
else
    echo "⚠️  Alertmanager: Not running (optional)"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Verify rules: curl http://localhost:9090/api/v1/rules | jq '.data.groups[]'"
echo "   2. Import Grafana dashboard: Upload gnn-engine/grafana-dashboard.json"
echo "   3. Set Slack webhook (optional): export SLACK_WEBHOOK_URL='...'"

