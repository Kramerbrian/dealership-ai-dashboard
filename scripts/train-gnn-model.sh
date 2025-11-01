#!/bin/bash
# Train initial GNN model
# Usage: ./scripts/train-gnn-model.sh [epochs] [learning_rate]

set -e

EPOCHS=${1:-10}
LEARNING_RATE=${2:-0.001}
MAX_WAIT=${3:-300}  # 5 minutes max wait

GNN_URL="${GNN_ENGINE_URL:-http://localhost:8080}"

echo "🧠 Training GNN Model"
echo "===================="
echo ""
echo "Configuration:"
echo "  Epochs:        $EPOCHS"
echo "  Learning Rate: $LEARNING_RATE"
echo "  GNN Engine:    $GNN_URL"
echo ""

# Check if GNN engine is running
echo "🏥 Checking GNN engine health..."
if ! curl -f "$GNN_URL/health" > /dev/null 2>&1; then
    echo "❌ GNN Engine is not running or not accessible at $GNN_URL"
    echo "   Please start it with: ./scripts/deploy-gnn.sh"
    exit 1
fi

HEALTH=$(curl -s "$GNN_URL/health")
MODEL_LOADED=$(echo "$HEALTH" | grep -o '"model_loaded":[^,}]*' | cut -d: -f2)

if [ "$MODEL_LOADED" = "false" ]; then
    echo "⚠️  Model is not loaded. Training will start with random initialization."
fi

# Start training
echo "🚀 Starting training..."
TRAIN_RESPONSE=$(curl -s -X POST "$GNN_URL/train" \
    -H "Content-Type: application/json" \
    -d "{
        \"epochs\": $EPOCHS,
        \"learning_rate\": $LEARNING_RATE,
        \"batch_size\": 32
    }")

echo "$TRAIN_RESPONSE" | jq '.' 2>/dev/null || echo "$TRAIN_RESPONSE"

STATUS=$(echo "$TRAIN_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" != "training_started" ]; then
    echo "❌ Failed to start training"
    exit 1
fi

echo ""
echo "✅ Training started in background"
echo ""
echo "📊 Monitor progress:"
echo "   Metrics:   curl $GNN_URL/metrics | grep gnn_training_loss"
echo "   Health:    curl $GNN_URL/health"
echo ""
echo "⏳ Training will run in the background. Check logs with:"
echo "   docker logs -f dealershipai-gnn-engine"

