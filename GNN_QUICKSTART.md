# GNN Engine - Quick Start Guide

## 🚀 Complete Setup in 5 Steps

### Step 1: Deploy GNN Engine

```bash
./scripts/deploy-gnn.sh
```

This will:
- ✅ Check Docker is running
- ✅ Create Docker network
- ✅ Build and start GNN engine container
- ✅ Start Redis for graph storage
- ✅ Verify health status

### Step 2: Configure Environment

```bash
./scripts/setup-gnn-env.sh
```

Or manually add to `.env.local`:
```bash
NEXT_PUBLIC_GNN_ENABLED=true
GNN_ENGINE_URL=http://localhost:8080
```

### Step 3: Train Initial Model

```bash
./scripts/train-gnn-model.sh
```

This starts training with default settings (10 epochs). Training runs in the background.

### Step 4: Verify Integration

The **PredictionPanel** is already integrated in `app/intelligence/page.tsx`.

Visit `/intelligence` to see:
- Real-time GNN predictions
- Confidence scores
- Verify/reject buttons
- SHAP explanations on demand

### Step 5: Monitor (Optional)

Start Prometheus/Grafana:
```bash
docker-compose -f config/docker-compose.monitoring.yml up -d
```

Access Grafana: http://localhost:3001 (admin/admin)
Import dashboard: `gnn-engine/grafana-dashboard.json`

## ✅ Verification Checklist

- [ ] GNN engine running: `curl http://localhost:8080/health`
- [ ] Environment variables set in `.env.local`
- [ ] PredictionPanel visible on `/intelligence` page
- [ ] Model training started: `docker logs dealershipai-gnn-engine | grep training`
- [ ] Prometheus scraping metrics: `curl http://localhost:8080/metrics`

## 📊 Test Predictions

```bash
# Get predictions
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{"dealer_id": "test", "threshold": 0.85}'

# Verify a prediction
curl -X POST http://localhost:8080/verify \
  -H "Content-Type: application/json" \
  -d '{
    "dealer_id": "test",
    "intent": "ev_inventory_search",
    "fix": "add_schema_markup",
    "verified": true,
    "confidence": 0.91
  }'
```

## 🔗 Service URLs

- **GNN Engine API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Metrics (Prometheus)**: http://localhost:8080/metrics
- **Next.js API Proxy**: http://localhost:3000/api/gnn/predict

## 📝 Production Deployment

For production, update:
1. `GNN_ENGINE_URL` to your deployed service URL
2. Docker Compose network configuration
3. Prometheus scrape targets
4. Grafana data source URL

Full details: See `GNN_DEPLOYMENT_GUIDE.md`

