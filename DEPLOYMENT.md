# Deployment Guide

## Production Deployment Checklist

### Prerequisites
- [ ] Domain name configured
- [ ] SSL certificate setup (handled by Traefik)
- [ ] Server with Docker and Docker Compose
- [ ] All API keys obtained
- [ ] Database backup strategy planned

### Environment Configuration
- [ ] Copy `.env.example` to `.env.production`
- [ ] Set all required API keys
- [ ] Configure database credentials
- [ ] Set secure JWT secrets
- [ ] Configure domain and email settings

### Deployment Steps

1. **Server Setup**
   ```bash
   # Clone repository
   git clone <repo-url>
   cd dealership-ai-dashboard
   
   # Configure environment
   cp .env.example .env.production
   nano .env.production
   ```

2. **Deploy Services**
   ```bash
   # Production deployment
   docker-compose -f docker-compose.prod.yml up -d
   
   # Check all services are running
   docker-compose -f docker-compose.prod.yml ps
   ```

3. **Initialize Database**
   ```bash
   # Run migrations
   docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
   
   # Create initial admin user
   docker-compose -f docker-compose.prod.yml exec backend python scripts/create_admin.py
   ```

4. **Verify Deployment**
   ```bash
   # Test health endpoints
   curl https://api.yourdomain.com/health
   curl https://yourdomain.com
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Post-Deployment

1. **Monitoring Setup**
   - Configure log aggregation
   - Set up uptime monitoring
   - Enable error tracking (Sentry)

2. **Backup Configuration**
   ```bash
   # Database backup script
   docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U dealership_user dealership_ai > backup_$(date +%Y%m%d).sql
   ```

3. **Security Hardening**
   - Enable firewall rules
   - Configure fail2ban
   - Set up automatic security updates

### Scaling Considerations

- Use Docker Swarm or Kubernetes for multi-node deployment
- Implement database read replicas
- Add load balancer for high availability
- Configure CDN for static assets

### Maintenance

- Regular security updates
- Database maintenance and optimization  
- Log rotation and cleanup
- Performance monitoring and tuning