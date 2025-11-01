# GNN Predictive Layer - Deployment Guide

Complete setup and integration guide for the DealershipAI GNN Engine.

## Quick Start

### 1. Deploy GNN Engine

```bash
cd gnn-engine
docker-compose up -d
```

Verify it's running:
```bash
curl http://localhost:8080/health
```

### 2. Configure Environment

Add to `.env.local`:
```bash
NEXT_PUBLIC_GNN_ENABLED=true
GNN_ENGINE_URL=http://gnn-engine:8080
```

For production, set `GNN_ENGINE_URL` to your deployed service URL.

### 3. Integrate in Dashboard

Add the PredictionPanel to your intelligence dashboard:

```tsx
import PredictionPanel from '@/app/(dashboard)/intelligence/widgets/PredictionPanel';

// In your dashboard page
<PredictionPanel dealerId={dealerId} threshold={0.85} />
```

### 4. Monitor Metrics

The GNN engine exposes Prometheus metrics at `/metrics`. Import the Grafana dashboard JSON:

1. Open Grafana
2. Import dashboard from `gnn-engine/grafana-dashboard.json`
3. Configure Prometheus data source pointing to GNN engine

## Architecture Flow

```
┌─────────────────┐
│  Next.js App    │
│  (Orchestrator) │
└────────┬────────┘
         │
         │ HTTP REST
         ▼
┌─────────────────┐
│   GNN Engine     │
│   (FastAPI)      │
└────────┬────────┘
         │
         │ RedisGraph Query
         ▼
┌─────────────────┐
│     Redis        │
│   (Graph Store)  │
└─────────────────┘
```

## Data Flow

1. **Ingestion**: Dealer intents and fixes stored in RedisGraph
2. **Prediction**: GNN engine loads graph → predicts Intent → Fix edges
3. **Execution**: Orchestrator validates → executes fixes
4. **Feedback**: Verification results sent back to GNN engine
5. **Retraining**: Model retrains on verified edges nightly

## Production Deployment

### Option 1: Docker Compose (Single Server)

```bash
docker-compose -f gnn-engine/docker-compose.yml up -d
```

### Option 2: Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gnn-engine
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: gnn-engine
        image: dealershipai/gnn-engine:latest
        ports:
        - containerPort: 8080
```

### Option 3: Vercel (Python Runtime)

Note: GNN engine requires GPU/CPU-intensive operations. Consider:
- AWS Lambda with GPU support
- Google Cloud Run with GPU
- Dedicated EC2/GCE instance

For Vercel serverless, proxy requests to external GNN service.

## Monitoring Checklist

- [ ] Prometheus scraping `/metrics` endpoint
- [ ] Grafana dashboard imported
- [ ] Alert rules for precision < 0.8
- [ ] Alert rules for prediction latency > 1s
- [ ] Alert rules for model training failures

## Troubleshooting

### Model Not Loading

Check logs:
```bash
docker logs dealershipai-gnn-engine
```

Ensure model path is correct:
```bash
ls -la gnn-engine/models/
```

### No Predictions

1. Verify Redis connection
2. Check graph data exists in RedisGraph
3. Verify threshold isn't too high
4. Check model is trained (loss should decrease)

### High Latency

1. Enable GPU support in Docker
2. Reduce `max_predictions` parameter
3. Increase batch size for graph loading
4. Consider model quantization

## Next Steps

- Integrate with Orchestrator auto-fix queue
- Set up nightly retraining cron job
- Configure SHAP explanations in dashboard
- Add A/B testing for prediction confidence thresholds

