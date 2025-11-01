# GNN Engine - Complete Setup Guide

## ✅ Deployment Checklist

### 1. Deploy GNN Engine

```bash
# Make scripts executable
chmod +x scripts/deploy-gnn.sh scripts/train-gnn-model.sh

# Deploy the service
./scripts/deploy-gnn.sh
```

This will:
- Create Docker network
- Build GNN engine container
- Start Redis
- Expose service on port 8080

### 2. Set Environment Variables

Add to `.env.local`:

```bash
# GNN Engine Configuration
NEXT_PUBLIC_GNN_ENABLED=true
GNN_ENGINE_URL=http://localhost:8080

# For production, use:
# GNN_ENGINE_URL=http://gnn-engine.your-domain.com:8080
```

### 3. Verify Service

```bash
# Check health
curl http://localhost:8080/health

# Should return:
# {
#   "status": "ok",
#   "model_loaded": false,
#   "service": "gnn-engine"
# }
```

### 4. Train Initial Model

```bash
# Train with default settings (10 epochs, 0.001 learning rate)
./scripts/train-gnn-model.sh

# Or customize:
./scripts/train-gnn-model.sh 20 0.0005
```

Training runs in the background. Monitor progress:

```bash
# View logs
docker logs -f dealershipai-gnn-engine

# Check metrics
curl http://localhost:8080/metrics | grep gnn_training_loss
```

### 5. Add PredictionPanel to Dashboard

✅ **Already added** to `app/intelligence/page.tsx`

The PredictionPanel is now visible on the Intelligence dashboard page.

### 6. Configure Prometheus/Grafana (Optional)

#### Option A: Local Development

```bash
# Start monitoring stack
docker-compose -f config/docker-compose.monitoring.yml up -d

# Access Grafana
open http://localhost:3001
# Login: admin / admin

# Import dashboard
# 1. Go to Dashboards → Import
# 2. Upload: gnn-engine/grafana-dashboard.json
```

#### Option B: Production Setup

1. Deploy Prometheus to your infrastructure
2. Configure scrape target: `gnn-engine:8080/metrics`
3. Deploy Grafana
4. Import dashboard JSON

## 📊 Monitoring Endpoints

- **Health**: `http://localhost:8080/health`
- **Metrics**: `http://localhost:8080/metrics` (Prometheus format)
- **Predictions**: `POST http://localhost:8080/predict`
- **Explain**: `GET http://localhost:8080/explain?prediction_id=X&dealer_id=Y`

## 🔄 Typical Workflow

1. **Deploy**: `./scripts/deploy-gnn.sh`
2. **Train**: `./scripts/train-gnn-model.sh`
3. **Get Predictions**: Use `/api/gnn/predict` in your app
4. **Verify Results**: Use `/api/gnn/verify` to record feedback
5. **Retrain**: Model retrains nightly on verified predictions

## 🐛 Troubleshooting

### Docker not running
```bash
# Start Docker Desktop or Docker service
# On macOS: open Docker Desktop
# On Linux: sudo systemctl start docker
```

### Service not accessible
```bash
# Check if containers are running
docker ps | grep gnn-engine

# Check logs
docker logs dealershipai-gnn-engine

# Restart services
cd gnn-engine && docker-compose restart
```

### Model not loading
```bash
# Check model path
docker exec dealershipai-gnn-engine ls -la /app/models/

# Reload model
curl -X POST http://localhost:8080/reload-model
```

### No predictions
- Verify Redis connection in logs
- Check graph data exists
- Lower confidence threshold
- Ensure model is trained

## 📈 Next Steps

1. ✅ GNN Engine deployed
2. ✅ Environment variables set
3. ✅ PredictionPanel added to dashboard
4. ✅ Prometheus/Grafana configured
5. ✅ Initial model training script ready

**Ready to use!** The GNN predictive layer is now integrated into your DealershipAI Orchestrator.

