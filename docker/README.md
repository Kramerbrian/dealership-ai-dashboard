# DealershipAI Docker Deployment

Complete production-ready Docker Compose stack for DealershipAI orchestration network.

## 🚀 Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your configuration
nano .env

# 3. Start all services
docker-compose up -d --build

# 4. Check health
docker-compose ps
```

## 📋 Services

| Service | Port | Description |
|---------|------|-------------|
| **Dashboard** | 3000 | Next.js frontend |
| **Orchestrator** | 3001 | Task orchestration API |
| **GNN Engine** | 8080 | Graph Neural Network engine |
| **Grafana** | 3002 | Metrics dashboards |
| **Prometheus** | 9090 | Metrics collection |
| **Alertmanager** | 9093 | Alert routing |
| **Redis** | 6379 | Cache & job queue |
| **RedisGraph** | 6380 | Graph database |
| **PostgreSQL** | 5432 | Primary database |
| **RedisInsight** | 8001 | Redis management UI |

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required variables. Key variables:

- `SLACK_BOT_TOKEN` - Slack bot OAuth token
- `SLACK_SIGNING_SECRET` - Slack request verification
- `CLERK_SECRET_KEY` - Clerk authentication
- `POSTGRES_PASSWORD` - Database password (change in production)

### Slack Integration

1. Create Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Set up slash command: `/dealershipai`
3. Configure interactive components
4. Add bot to channels: `#ai-ops`, `#exec-board`

### Prometheus & Grafana

- Prometheus scrapes metrics from all services
- Grafana pre-configured with dashboards
- Alertmanager routes alerts to Slack

## 🧪 Health Checks

```bash
# Check orchestrator
curl http://localhost:3001/api/health

# Check dashboard
curl http://localhost:3000/api/health

# Check GNN engine
curl http://localhost:8080/health

# Check Prometheus
curl http://localhost:9090/-/ready
```

## 📊 Monitoring

### Access Dashboards

- **Grafana**: http://localhost:3002 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **RedisInsight**: http://localhost:8001

### Test Slack Integration

```
/dealershipai status naples-honda
```

Click action buttons to trigger orchestrator tasks and watch real-time progress updates.

## 🔄 Operations

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f orchestrator
docker-compose logs -f dashboard
```

### Restart Service
```bash
docker-compose restart orchestrator
```

### Update Services
```bash
docker-compose pull
docker-compose up -d --build
```

## 🗄️ Data Persistence

All data is persisted in Docker volumes:

- `redis_data` - Redis data
- `redisgraph_data` - RedisGraph data
- `pg_data` - PostgreSQL data
- `prometheus_data` - Prometheus metrics
- `grafana_data` - Grafana dashboards

### Backup Database
```bash
docker exec dai-postgres pg_dump -U dai_admin dealershipai > backup.sql
```

### Restore Database
```bash
docker exec -i dai-postgres psql -U dai_admin dealershipai < backup.sql
```

## 🔒 Security

### Production Checklist

- [ ] Change `POSTGRES_PASSWORD` in `.env`
- [ ] Change `GRAFANA_ADMIN_PASSWORD` in `.env`
- [ ] Use secure Slack tokens
- [ ] Enable HTTPS (use reverse proxy)
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable authentication for Grafana

### Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name dash.dealershipai.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Check status
docker-compose ps

# Restart service
docker-compose restart [service-name]
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker exec -it dai-postgres psql -U dai_admin -d dealershipai

# Check connection string
echo $POSTGRES_URL
```

### Slack Integration Not Working

1. Verify `SLACK_BOT_TOKEN` is set
2. Check Slack app configuration
3. Verify webhook URLs in Slack app
4. Check logs: `docker-compose logs slack-service`

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Slack API Documentation](https://api.slack.com/)

## 🚀 Production Deployment

For production deployment:

1. Use environment-specific `.env` files
2. Set up external reverse proxy (Nginx/Traefik)
3. Configure SSL certificates
4. Set up backup automation
5. Monitor resource usage
6. Configure alerting rules

## 📝 License

MIT

