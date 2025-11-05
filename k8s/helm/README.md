# DealershipAI Helm Chart

Complete Kubernetes deployment with KEDA autoscaling for the DealershipAI orchestration cloud.

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (1.24+)
- Helm 3.8+
- kubectl configured

### Installation

```bash
# 1. Add dependencies
helm dependency update

# 2. Install with default values
helm install dealershipai . -n dealershipai --create-namespace

# 3. Install with custom values
helm install dealershipai . -n dealershipai \
  --set autoscaling.orchestrator.maxReplicaCount=20 \
  --set autoscaling.worker.maxReplicaCount=50

# 4. Verify installation
kubectl get all -n dealershipai
kubectl get scaledobjects -n dealershipai
```

## 📋 Configuration

### Key Values

Edit `values.yaml` or use `--set` flags:

```yaml
# Autoscaling
autoscaling:
  orchestrator:
    minReplicaCount: 2
    maxReplicaCount: 10
    queueLength: 50

  worker:
    minReplicaCount: 1
    maxReplicaCount: 20
    queueLength: 25

  gnnEngine:
    minReplicaCount: 1
    maxReplicaCount: 5
    cpuUtilization: 75

# Resources
orchestrator:
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "2Gi"
      cpu: "1000m"
```

## 🔧 Autoscaling

### KEDA ScaledObjects

The chart creates three ScaledObjects:

1. **Orchestrator Queue Scaler** - Scales based on Redis queue depth
2. **Worker Queue Scaler** - Scales workers based on queue length
3. **GNN Engine CPU Scaler** - Scales based on CPU utilization

### Verify Autoscaling

```bash
# Check ScaledObjects
kubectl get scaledobjects -n dealershipai

# Check HPA (created by KEDA)
kubectl get hpa -n dealershipai

# Watch scaling in action
kubectl get pods -w -n dealershipai

# Trigger load test
kubectl run -it --rm load-test --image=curlimages/curl \
  -- curl -X POST http://orchestrator:3001/api/orchestrate \
  -d '{"type":"schema_fix","payload":{"dealerId":"test"}}'
```

## 📊 Monitoring

### Access Dashboards

- **Grafana**: Port-forward or via Ingress
- **Prometheus**: http://prometheus:9090
- **Alertmanager**: http://alertmanager:9093

### View Metrics

```bash
# Port-forward Grafana
kubectl port-forward svc/grafana 3002:3000 -n dealershipai

# Port-forward Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n dealershipai
```

## 🔄 Upgrades

```bash
# Update dependencies
helm dependency update

# Upgrade release
helm upgrade dealershipai . -n dealershipai

# Rollback if needed
helm rollback dealershipai -n dealershipai
```

## 🗑️ Uninstallation

```bash
# Remove release
helm uninstall dealershipai -n dealershipai

# Remove namespace (if needed)
kubectl delete namespace dealershipai
```

## 📚 Values Reference

See `values.yaml` for all configurable options:

- Service configurations
- Resource limits
- Autoscaling thresholds
- Environment variables
- Ingress settings
- Storage configurations

## 🔒 Security

### Production Checklist

- [ ] Change default passwords
- [ ] Enable TLS/Ingress
- [ ] Configure RBAC
- [ ] Set resource limits
- [ ] Enable secret rotation
- [ ] Configure network policies
- [ ] Enable audit logging

### Secrets Management

```bash
# Create secrets
kubectl create secret generic slack-secrets \
  --from-literal=SLACK_BOT_TOKEN=xoxb-xxx \
  --from-literal=SLACK_SIGNING_SECRET=xxx \
  -n dealershipai

# Reference in values.yaml
env:
  - name: SLACK_BOT_TOKEN
    valueFrom:
      secretKeyRef:
        name: slack-secrets
        key: SLACK_BOT_TOKEN
```

## 🐛 Troubleshooting

### Pods Not Scaling

```bash
# Check KEDA operator
kubectl get pods -n keda

# Check ScaledObject status
kubectl describe scaledobject orchestrator-queue-scaler -n dealershipai

# Check HPA
kubectl describe hpa orchestrator -n dealershipai

# Check Redis connection
kubectl exec -it redis-0 -n dealershipai -- redis-cli LLEN dealershipai_tasks
```

### Services Not Starting

```bash
# Check pod logs
kubectl logs -f orchestrator-0 -n dealershipai

# Check events
kubectl get events -n dealershipai --sort-by='.lastTimestamp'

# Check resource constraints
kubectl describe pod orchestrator-0 -n dealershipai
```

## 📖 Additional Resources

- [KEDA Documentation](https://keda.sh/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Status**: ✅ **PRODUCTION READY**

Deploy with confidence. The chart handles all dependencies, autoscaling, and monitoring automatically.

