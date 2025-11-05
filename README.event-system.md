# DealershipAI Orchestrator Event System

## Overview

The orchestrator event system provides real-time synchronization across all ecosystem agents using Redis Streams and BullMQ. The system is configured declaratively via `orchestrator_event_system.json`.

## Architecture

```
┌─────────────┐
│   Events    │
│  (Sources)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Redis Streams  │ ◄─── dai-events stream
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Event Consumer │ ◄─── Reads from stream
│   (Deployment)  │
└──────┬──────────┘
       │
       ├──► Update Database
       ├──► Queue BullMQ Tasks
       └──► Push to Prometheus
```

## Configuration

The system is configured via `orchestrator_event_system.json`:

- **Stream**: Redis Stream configuration and consumer groups
- **Queue**: BullMQ queue settings for async tasks
- **Database**: Orchestrator state table schema
- **Metrics**: Prometheus pushgateway integration
- **Event Types**: Canonical event taxonomy
- **Handlers**: Event type → action mapping
- **Integration Points**: External system endpoints

## Deployment

### Kubernetes (ConfigMap)

```bash
# Apply ConfigMap
kubectl apply -f k8s/configmap-orchestrator-events.yaml

# Deploy event consumer
kubectl apply -f k8s/deployment-event-consumer.yaml
```

### Helm Chart

```bash
# Install with event bus enabled
helm install dealershipai ./k8s/helm \
  --set eventBus.enabled=true \
  --set eventBus.replicas=3
```

The Helm chart automatically:
- Creates ConfigMap from `orchestrator_event_system.json`
- Mounts it to the event-consumer deployment
- Sets up autoscaling based on queue depth
- Configures health checks

## Event Types

| Event Type | Description | Handlers |
|------------|-------------|----------|
| `prometheus.alert` | Metric update from Prometheus/Alertmanager | `updateDB`, `pushToPrometheus` |
| `model.update` | GNN or RL model retrain notification | `updateDB` |
| `snapshot.ingest` | New JSON snapshot export available | `queue.sync_snapshot` |
| `slack.action` | ChatOps trigger or user command | `queue.process_slack_action` |
| `autoscale.event` | KEDA scaling or pod count change | `updateDB` |

## Integration Points

- **GNN Engine**: `http://gnn-engine:8080/predict` → `model.update`
- **Exporter**: S3 bucket → `snapshot.ingest` Lambda trigger
- **Slack Service**: Webhook → `slack.action`
- **Prometheus**: Alert webhook → `prometheus.alert`

## Usage in Code

```typescript
import fs from "fs";

// Load configuration
const config = JSON.parse(
  fs.readFileSync("/config/orchestrator_event_system.json", "utf8")
);

console.log("Event bus spec:", config.spec_version);

// Use configuration
const streamName = config.components.stream.name;
const consumerGroup = config.components.stream.consumer_groups[0].name;

// Register handlers
config.components.handlers["prometheus.alert"].forEach(handler => {
  // Register handler function
});
```

## Monitoring

- **Grafana Dashboard**: `dai-orchestrator-eventbus`
- **Log Labels**: `event_type`, `status`, `latency_ms`
- **Retention**: 30 days

## Health Checks

The event consumer exposes a `/health` endpoint that:
- Checks Redis connection
- Verifies database connectivity
- Reports queue depth
- Returns 200 OK if healthy

## Autoscaling

KEDA autoscaling is configured based on:
- **Trigger**: Queue depth
- **Min Replicas**: 1
- **Max Replicas**: 5
- **Scale Target**: Redis Stream pending messages

## Security

- **Auth**: Service token authentication
- **Encryption**: TLSv1.3 for all connections
- **Secrets**: Managed via Vault

## Troubleshooting

1. **Check ConfigMap**: `kubectl get configmap orchestrator-event-config -o yaml`
2. **View Logs**: `kubectl logs -l component=event-consumer`
3. **Check Health**: `curl http://event-consumer:8080/health`
4. **Redis Stream**: `redis-cli XINFO STREAM dai-events`

