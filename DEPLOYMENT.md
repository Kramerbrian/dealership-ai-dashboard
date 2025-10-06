# DealershipAI Deployment Guide

## 🚀 Complete Deployment Checklist

### Prerequisites
- [ ] Domain name registered (e.g., dealership-ai.com)
- [ ] SSL certificates obtained
- [ ] Cloud provider account (AWS/GCP/Azure)
- [ ] Docker Hub account
- [ ] PostgreSQL database instance
- [ ] Redis cache instance
- [ ] SMTP email service configured

### 1. Environment Setup

#### Required API Keys
- [ ] OpenAI API Key
- [ ] Google Search API Key & Engine ID
- [ ] Perplexity API Key
- [ ] Google Gemini API Key
- [ ] Anthropic API Key (Claude)
- [ ] Clerk Authentication Keys
- [ ] Stripe Payment Keys (if monetizing)

#### Configuration Steps
1. Copy `.env.example` to `.env`
2. Fill in all API keys and secrets
3. Update database connection strings
4. Configure SMTP settings

### 2. Local Development Setup

```bash
# Backend setup
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
npm install

# Database setup
docker-compose up -d postgres redis
psql -h localhost -U dealershipai -f init.sql

# Run development servers
# Terminal 1 - Backend
uvicorn api.main:app --reload --port 8000

# Terminal 2 - Frontend
npm run dev
```

### 3. Docker Deployment

```bash
# Build images
docker build -t dealershipai/backend -f Dockerfile --target backend .
docker build -t dealershipai/frontend -f Dockerfile --target frontend .

# Run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### 4. Production Deployment

#### Option A: Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace dealership-ai

# Create secrets
kubectl create secret generic dealership-ai-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=redis-url=$REDIS_URL \
  --from-literal=jwt-secret=$JWT_SECRET_KEY \
  --from-literal=clerk-publishable-key=$CLERK_PUBLISHABLE_KEY \
  -n dealership-ai

# Deploy
kubectl apply -f kubernetes/deployment.yaml

# Check status
kubectl get pods -n dealership-ai
kubectl get services -n dealership-ai
```

#### Option B: Cloud Platform Deployment

**AWS ECS/Fargate:**
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [YOUR_ECR_URI]
docker tag dealershipai/backend:latest [YOUR_ECR_URI]/dealershipai-backend:latest
docker push [YOUR_ECR_URI]/dealershipai-backend:latest

# Deploy using ECS CLI or Console
ecs-cli compose up
```

**Google Cloud Run:**
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/[PROJECT_ID]/dealershipai-backend
gcloud run deploy dealershipai-backend --image gcr.io/[PROJECT_ID]/dealershipai-backend --platform managed
```

**Azure Container Instances:**
```bash
# Push to Azure Container Registry
az acr build --registry [REGISTRY_NAME] --image dealershipai-backend .
az container create --resource-group [RG_NAME] --name dealershipai-backend --image [REGISTRY_NAME].azurecr.io/dealershipai-backend:latest
```

### 5. DNS & SSL Configuration

1. Point domain to load balancer IP
2. Configure SSL certificates:
   ```bash
   # Let's Encrypt with Certbot
   certbot certonly --standalone -d dealership-ai.com -d www.dealership-ai.com
   ```

### 6. Database Migration

```bash
# Run Alembic migrations
alembic upgrade head

# Verify database
psql -h [DB_HOST] -U dealershipai -c "\dt"
```

### 7. Monitoring Setup

#### Prometheus & Grafana
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'dealership-ai'
    static_configs:
      - targets: ['backend:8000']
```

#### Application Monitoring
- [ ] Set up Sentry error tracking
- [ ] Configure CloudWatch/Stackdriver logging
- [ ] Enable APM (Application Performance Monitoring)

### 8. Security Checklist

- [ ] Enable WAF (Web Application Firewall)
- [ ] Configure rate limiting
- [ ] Set up DDoS protection
- [ ] Enable database encryption
- [ ] Rotate all secrets and API keys
- [ ] Configure backup strategy
- [ ] Set up intrusion detection

### 9. Performance Optimization

- [ ] Enable CDN for static assets
- [ ] Configure Redis caching
- [ ] Enable database connection pooling
- [ ] Optimize image sizes
- [ ] Enable Gzip compression
- [ ] Configure auto-scaling rules

### 10. Testing Production

```bash
# Health check
curl https://dealership-ai.com/api/health

# Load testing
k6 run loadtest.js

# Security scanning
npm audit
pip check
trivy image dealershipai/backend:latest
```

### 11. Backup & Disaster Recovery

```bash
# Database backup
pg_dump -h [DB_HOST] -U dealershipai dealershipai > backup_$(date +%Y%m%d).sql

# Automated backup script
0 2 * * * /usr/local/bin/backup-dealershipai.sh
```

### 12. Go-Live Checklist

- [ ] All tests passing
- [ ] SSL certificates active
- [ ] Monitoring dashboards configured
- [ ] Error tracking enabled
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] Security scan completed
- [ ] Load testing passed
- [ ] Documentation updated
- [ ] Team trained on deployment procedures

## 📊 Monitoring URLs

- Application: https://dealership-ai.com
- API Docs: https://dealership-ai.com/api/docs
- Health Check: https://dealership-ai.com/api/health
- Metrics: https://dealership-ai.com/api/metrics

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   # Check connection string
   psql $DATABASE_URL
   ```

2. **API Keys Not Working**
   ```bash
   # Verify environment variables
   env | grep API_KEY
   # Test individual services
   python -c "import openai; openai.api_key='YOUR_KEY'; print(openai.Model.list())"
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

## 📞 Support

- Technical Issues: tech-support@dealership-ai.com
- Sales: sales@dealership-ai.com
- Documentation: https://docs.dealership-ai.com

## 📈 Performance Benchmarks

- API Response Time: < 200ms (p95)
- Frontend Load Time: < 2s
- Uptime SLA: 99.9%
- Concurrent Users: 10,000+

## 🔄 Continuous Deployment

GitHub Actions automatically deploys to production on merge to main branch.
Monitor deployment status: https://github.com/[YOUR_REPO]/actions

---

Last Updated: October 2024
Version: 1.0.0