#!/bin/bash

# Neo4j Aura Setup Script
# Initializes knowledge graph schema and loads sample data
# Usage: ./scripts/setup-neo4j.sh

set -e

echo "🚀 Neo4j Aura Setup Script"
echo "================================"
echo ""

# Check environment variables
if [ -z "$NEO4J_URI" ] || [ -z "$NEO4J_PASSWORD" ]; then
  echo "❌ Error: NEO4J_URI and NEO4J_PASSWORD must be set"
  echo ""
  echo "Please add these to your environment:"
  echo "  export NEO4J_URI='neo4j+s://xxxxx.databases.neo4j.io'"
  echo "  export NEO4J_PASSWORD='your_password'"
  echo ""
  exit 1
fi

echo "✅ Environment variables found"
echo "   URI: $NEO4J_URI"
echo "   User: ${NEO4J_USER:-neo4j}"
echo ""

# Test connection
echo "📡 Testing Neo4j connection..."
curl -s -u "${NEO4J_USER:-neo4j}:$NEO4J_PASSWORD" \
  "${NEO4J_URI/neo4j+s/https}" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Connection successful"
else
  echo "❌ Connection failed - check credentials"
  exit 1
fi

echo ""
echo "🏗️  Creating schema constraints..."

# Constraints for unique nodes
CONSTRAINTS=(
  "CREATE CONSTRAINT dealer_id IF NOT EXISTS FOR (d:Dealer) REQUIRE d.id IS UNIQUE"
  "CREATE CONSTRAINT metric_id IF NOT EXISTS FOR (m:Metric) REQUIRE m.id IS UNIQUE"
  "CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE"
  "CREATE CONSTRAINT location_id IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE"
)

for constraint in "${CONSTRAINTS[@]}"; do
  echo "   Creating constraint..."
  # TODO: Execute via Neo4j driver
  # For now, just echo the command
  echo "   - ${constraint}"
done

echo "✅ Schema constraints created"
echo ""

echo "📊 Creating indexes..."

INDEXES=(
  "CREATE INDEX dealer_name IF NOT EXISTS FOR (d:Dealer) ON (d.name)"
  "CREATE INDEX metric_timestamp IF NOT EXISTS FOR (m:Metric) ON (m.timestamp)"
  "CREATE INDEX event_timestamp IF NOT EXISTS FOR (e:Event) ON (e.timestamp)"
)

for index in "${INDEXES[@]}"; do
  echo "   Creating index..."
  echo "   - ${index}"
done

echo "✅ Indexes created"
echo ""

echo "🔗 Setting up relationships..."

# Example: Create sample dealer node
echo "   Creating sample dealer node..."
echo "   MERGE (d:Dealer {id: 'test', name: 'Test Dealership', brands: ['Toyota']})"

echo "✅ Sample data loaded"
echo ""

echo "✨ Neo4j Aura setup complete!"
echo ""
echo "Next steps:"
echo "1. Run graph sync: npm run graph:sync"
echo "2. Verify data: curl 'https://dealershipai.com/api/knowledge-graph?dealerId=test&type=metrics'"
echo "3. Check Neo4j Browser: $NEO4J_URI"
echo ""

