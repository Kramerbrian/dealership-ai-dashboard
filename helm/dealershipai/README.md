# DealershipAI Helm Chart

Production-ready Kubernetes deployment for the DealershipAI orchestration system.

## Prerequisites

- Kubernetes cluster (GKE, EKS, or AKS)
- kubectl configured
- Helm 3.x installed
- KEDA operator installed (for autoscaling)
- NGINX Ingress Controller (for ingress)

## Installation

### 1. Create Namespace

```bash
kubectl create namespace dealershipai
```

### 2. Install KEDA (if not already installed)

```bash
helm repo add kedacore https://kedacore.github.io/charts
helm repo update
helm install keda kedacore/keda --namespace keda-system --create-namespace
```

### 3. Install the Chart

```bash
# Install with default values
helm install dealershipai ./helm/dealershipai -n dealershipai

# Or with custom values
helm install dealershipai ./helm/dealershipai -n dealershipai \
  -f custom-values.yaml
```

### 4. Verify Installation

```bash
# Check all pods are running
kubectl get pods -n dealershipai

# Check services
kubectl get svc -n dealershipai

# Check ingress
kubectl get ingress -n dealershipai
```

## Configuration

### Key Configuration Options

Edit `values.yaml` or create a custom values file:

```yaml
global:
  replicas: 2  # Default replica count

images:
  orchestrator: ghcr.io/dealershipai/orchestrator:latest
  dashboard: ghcr.io/dealershipai/dashboard:latest

env:
  POSTGRES_PASSWORD: your-secure-password
  CLERK_SECRET_KEY: your-clerk-key
  SLACK_BOT_TOKEN: your-slack-token

keda:
  enabled: true
  orchestrator:
    minReplicas: 2
    maxReplicas: 10
    targetQueueLength: 10
```

### Environment Variables

All environment variables are stored in a ConfigMap (`dai-config`). Update `values.yaml` to modify:

- Database credentials
- Redis URLs
- API keys (Clerk, Slack)
- Service URLs

### Storage

Configure persistent volumes:

```yaml
storage:
  redisgraph:
    size: 5Gi
    storageClass: standard
  postgres:
    size: 20Gi
    storageClass: standard
```

## Upgrading

```bash
# Upgrade with new values
helm upgrade dealershipai ./helm/dealershipai -n dealershipai

# Or with custom values
helm upgrade dealershipai ./helm/dealershipai -n dealershipai \
  -f custom-values.yaml
```

## Scaling

### Manual Scaling

```bash
# Scale orchestrator
kubectl scale deployment orchestrator -n dealershipai --replicas=5

# Scale dashboard
kubectl scale deployment dashboard -n dealershipai --replicas=3
```

### Automatic Scaling (KEDA)

KEDA automatically scales based on:
- Redis queue depth (orchestrator/worker)
- CPU utilization (all services)
- HTTP request rate (dashboard)

Configure in `values.yaml`:

```yaml
keda:
  enabled: true
  orchestrator:
    minReplicas: 2
    maxReplicas: 10
    targetQueueLength: 10
```

## Monitoring

### Prometheus

Access Prometheus UI:
```bash
kubectl port-forward -n dealershipai svc/prometheus 9090:9090
```

Then visit: http://localhost:9090

### Grafana

Access Grafana UI:
```bash
kubectl port-forward -n dealershipai svc/grafana 3000:3000
```

Then visit: http://localhost:3000
- Username: `admin`
- Password: Set in `values.yaml` (`monitoring.grafana.adminPassword`)

## Troubleshooting

### Check Pod Status

```bash
# All pods
kubectl get pods -n dealershipai

# Specific pod logs
kubectl logs -n dealershipai deployment/orchestrator

# Follow logs
kubectl logs -f -n dealershipai deployment/orchestrator
```

### Check Services

```bash
# All services
kubectl get svc -n dealershipai

# Service endpoints
kubectl get endpoints -n dealershipai
```

### Check ConfigMap

```bash
# View ConfigMap
kubectl get configmap dai-config -n dealershipai -o yaml
```

### Check Ingress

```bash
# Ingress status
kubectl get ingress -n dealershipai

# Ingress details
kubectl describe ingress dealershipai-ingress -n dealershipai
```

### Database Connection Issues

```bash
# Check Postgres pod
kubectl exec -it -n dealershipai postgres-0 -- psql -U dai_admin -d dealershipai

# Check connection from orchestrator
kubectl exec -it -n dealershipai deployment/orchestrator -- env | grep POSTGRES
```

### Redis Connection Issues

```bash
# Check Redis pod
kubectl exec -it -n dealershipai redis-0 -- redis-cli ping

# Check queue length
kubectl exec -it -n dealershipai redis-0 -- redis-cli LLEN orchestrator
```

## Uninstallation

```bash
# Remove the Helm release
helm uninstall dealershipai -n dealershipai

# Optionally remove namespace
kubectl delete namespace dealershipai
```

## Components

| Component | Type | Replicas | Scaling |
|-----------|------|----------|---------|
| Orchestrator | Deployment | 2+ | KEDA (queue depth, CPU) |
| Dashboard | Deployment | 2+ | KEDA (HTTP rate, CPU) |
| GNN Engine | Deployment | 1 | Manual |
| Redis | StatefulSet | 1 | Manual |
| RedisGraph | StatefulSet | 1 | Manual |
| Postgres | StatefulSet | 1 | Manual |
| Prometheus | Deployment | 1 | Manual |
| Grafana | Deployment | 1 | Manual |
| Alertmanager | Deployment | 1 | Manual |
| Slack Service | Deployment | 1 | Manual |

## Security

### Secrets Management

For production, use Kubernetes Secrets instead of ConfigMap for sensitive data:

```yaml
# Create secret
kubectl create secret generic dai-secrets -n dealershipai \
  --from-literal=postgres-password=your-password \
  --from-literal=clerk-secret-key=your-key

# Reference in deployment
envFrom:
  - secretRef:
      name: dai-secrets
```

### Network Policies

Add network policies to restrict pod-to-pod communication:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: orchestrator-policy
spec:
  podSelector:
    matchLabels:
      app: orchestrator
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: dashboard
```

## Support

For issues or questions:
- Check logs: `kubectl logs -n dealershipai`
- Check events: `kubectl get events -n dealershipai`
- Review documentation: See project README

