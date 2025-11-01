#!/bin/bash
# Import Grafana dashboard via API
# Usage: ./scripts/import-grafana-dashboard.sh [GRAFANA_URL] [USER] [PASSWORD]

set -e

GRAFANA_URL=${1:-http://localhost:3001}
GRAFANA_USER=${2:-admin}
GRAFANA_PASSWORD=${3:-admin}

echo "📊 Importing Grafana dashboard..."

# Check if dashboard file exists
if [ ! -f "grafana/dashboards/gnn-analytics.json" ]; then
  echo "❌ Dashboard file not found: grafana/dashboards/gnn-analytics.json"
  exit 1
fi

# Check if Grafana is accessible
if ! curl -f -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" "${GRAFANA_URL}/api/health" > /dev/null 2>&1; then
  echo "❌ Grafana is not accessible at ${GRAFANA_URL}"
  echo "   Is Grafana running? Try: docker-compose -f docker-compose.monitoring.yml up -d"
  exit 1
fi

# Read and prepare dashboard JSON
DASHBOARD_JSON=$(cat grafana/dashboards/gnn-analytics.json)

# Create import payload
IMPORT_PAYLOAD=$(jq -n \
  --argjson dashboard "$DASHBOARD_JSON" \
  '{dashboard: $dashboard, overwrite: true}')

# Import dashboard
echo "📥 Uploading dashboard..."
RESPONSE=$(curl -s -X POST \
  -u "${GRAFANA_USER}:${GRAFANA_PASSWORD}" \
  -H "Content-Type: application/json" \
  -d "$IMPORT_PAYLOAD" \
  "${GRAFANA_URL}/api/dashboards/db")

# Check response
if echo "$RESPONSE" | jq -e '.uid' > /dev/null 2>&1; then
  DASHBOARD_UID=$(echo "$RESPONSE" | jq -r '.uid')
  DASHBOARD_URL="${GRAFANA_URL}/d/${DASHBOARD_UID}"
  
  echo "✅ Dashboard imported successfully!"
  echo "📈 View dashboard: ${DASHBOARD_URL}"
else
  echo "❌ Failed to import dashboard"
  echo "Response: $RESPONSE"
  exit 1
fi

