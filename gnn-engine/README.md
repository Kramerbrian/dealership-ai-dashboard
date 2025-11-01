# DealershipAI GNN Engine

Graph Neural Network microservice for predicting optimal fixes based on dealer intent patterns.

## Architecture

The GNN Engine is a standalone Python FastAPI microservice that:
- Loads dealer-intent-fix graph data from RedisGraph
- Predicts optimal fixes for dealer intents using a heterogeneous GNN
- Provides explainability via SHAP and gradient-based attribution
- Feeds predictions back to the Orchestrator for execution

## Setup

### 1. Build and Run with Docker

```bash
cd gnn-engine
docker-compose up -d
```

This will:
- Build the GNN engine container
- Start Redis for graph storage
- Expose the service on port 8080

### 2. Environment Variables

Set in `.env` or `docker-compose.yml`:

```bash
REDIS_URL=redis://redis:6379
MODEL_PATH=/app/models/visibility_gnn.pt
LOG_LEVEL=info
```

### 3. Initialize Model

The model will auto-load on startup. If no checkpoint exists, it initializes randomly.

To train an initial model:
```bash
curl -X POST http://localhost:8080/train \
  -H "Content-Type: application/json" \
  -d '{"epochs": 10, "learning_rate": 0.001}'
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Get Predictions
```bash
POST /predict
{
  "dealer_id": "dealer123",
  "threshold": 0.85,
  "max_predictions": 50
}
```

### Verify Prediction
```bash
POST /verify
{
  "dealer_id": "dealer123",
  "intent": "ev_inventory_search",
  "fix": "add_schema_markup",
  "verified": true,
  "confidence": 0.91
}
```

### Get Explanation
```bash
GET /explain?prediction_id=0_5&dealer_id=dealer123
```

### Training
```bash
POST /train
{
  "epochs": 10,
  "learning_rate": 0.001,
  "batch_size": 32
}
```

### Metrics (Prometheus)
```bash
GET /metrics
```

## Integration

The GNN engine integrates with the Next.js Orchestrator via:

1. **TypeScript Delegate** (`lib/delegates/gnnDelegate.ts`)
   - `runGNNPrediction()` - Get predictions
   - `verifyPrediction()` - Record feedback
   - `getPredictionExplanation()` - Get SHAP explanations

2. **API Routes** (`app/api/gnn/`)
   - `/api/gnn/predict` - Proxy to GNN engine
   - `/api/gnn/verify` - Record verification
   - `/api/gnn/explain` - Get explanations

3. **Dashboard Component** (`app/(dashboard)/intelligence/widgets/PredictionPanel.tsx`)
   - Displays predictions with confidence scores
   - Allows verification/rejection
   - Shows explainability on demand

## Monitoring

Prometheus metrics are exposed at `/metrics`:

- `gnn_predictions_total` - Total predictions made
- `gnn_precision` - Model precision
- `gnn_recall` - Model recall
- `gnn_training_loss` - Current training loss
- `gnn_predictions_verified` - Verified predictions count
- `gnn_prediction_latency_seconds` - Prediction latency histogram

## Feedback Loop

1. GNN predicts Intent → Fix edges
2. Orchestrator validates and executes fixes
3. Success/failure is recorded via `/verify` endpoint
4. Model retrains nightly on verified edges
5. Precision/recall metrics track improvement

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app:app --reload --host 0.0.0.0 --port 8080

# Run tests
pytest tests/
```

## Model Architecture

- **Heterogeneous GNN** with 3 node types: Dealer, Intent, Fix
- **Edge types**: HAS_INTENT, RESOLVED_BY, APPLIES_FIX
- **2-layer GCN** for message passing
- **MLP predictor** for Intent → Fix edge classification

## Future Enhancements

- Node2Vec embeddings for better link prediction
- Temporal GNN for intent decay modeling
- RL agent for ROI-based prioritization
- Federated learning for multi-dealer insights

