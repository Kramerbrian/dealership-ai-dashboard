#!/bin/bash
# Deploy GNN Engine Service
# Usage: ./scripts/deploy-gnn.sh

set -e

echo "🚀 Deploying DealershipAI GNN Engine"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Navigate to gnn-engine directory
cd "$(dirname "$0")/../gnn-engine" || exit 1

# Create network if it doesn't exist
echo "📡 Creating Docker network..."
docker network create dealershipai-network 2>/dev/null || echo "Network already exists"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p models data
touch models/.gitkeep data/.gitkeep

# Build and start services
echo "🔨 Building GNN engine..."
docker-compose build

echo "🚀 Starting GNN engine services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check health
echo "🏥 Checking service health..."
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ GNN Engine is healthy!"
    curl http://localhost:8080/health | jq '.' 2>/dev/null || curl http://localhost:8080/health
else
    echo "⚠️  GNN Engine health check failed. Check logs with:"
    echo "   docker logs dealershipai-gnn-engine"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "   GNN Engine API: http://localhost:8080"
echo "   Health Check:  http://localhost:8080/health"
echo "   Metrics:        http://localhost:8080/metrics"
echo ""
echo "📝 Next steps:"
echo "   1. Set GNN_ENGINE_URL=http://localhost:8080 in .env.local"
echo "   2. Set NEXT_PUBLIC_GNN_ENABLED=true in .env.local"
echo "   3. Train initial model: curl -X POST http://localhost:8080/train"
echo ""
echo "📋 Useful commands:"
echo "   View logs:      docker logs -f dealershipai-gnn-engine"
echo "   Stop services:  docker-compose down"
echo "   Restart:        docker-compose restart"

