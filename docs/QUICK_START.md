# Team Quick Start Guide
**Get productive in 15 minutes**

## For Developers

### 1. Clone & Install (5 min)
```bash
git clone https://github.com/Kramerbrian/dealership-ai-dashboard.git
cd dealership-ai-dashboard
npm install --legacy-peer-deps
```

### 2. Environment Setup (2 min)
```bash
cp .env.example .env.local
# Add your keys (ask team lead)
```

### 3. Start Development (1 min)
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Key Commands
```bash
npm run build              # Production build
npm run type-check         # TypeScript validation
npm run manifests:validate # Validate manifest files
npm run graph:sync         # Sync knowledge graph
```

## For Product Managers

### Where to Find Things

**📊 Metrics & Analytics**: `/dash`
- AI Visibility Index
- Trust Score
- Zero-Click Coverage

**🎯 Dealer Management**: `/fleet`
- Upload dealer lists
- View dealer twins
- Configure brands

**⚙️ Settings**: `/dash/settings`
- Feature flags
- Integration status
- API configuration

**🔔 Pulse Inbox**: `/pulse`
- OEM updates
- Action items
- Task streams

### Feature Flags

Edit `manifests/dealershipai-roadmap-manifest.json`:
```json
{
  "featureFlags": {
    "ENABLE_CINEMATIC_LANDING": true,
    "ENABLE_DAI_COPILOT": false,
    "ENABLE_PULSE_INBOX": true
  }
}
```

## For Designers

### Theme System

**Mood-Based Themes**: `lib/theme-controller.ts`
- Positive: Green accent
- Reflective: Purple accent
- Urgent: Red accent

**Design Tokens**: `lib/design-tokens.ts`
- Colors
- Typography
- Spacing

**CSS Variables**:
```css
--accent-rgb: Mood-based color
--vignette-brightness: Mood-based intensity
```

### Studio Mode (Week 9-10)

Visual theme editor coming in Phase 6:
- Live preview
- Export JSON
- One-click deploy

## For DevOps/Infrastructure

### Deployment

**Production**: Auto-deploys from `main` branch
**Staging**: Manual deploy from `staging` branch

```bash
# Manual production deploy
vercel --prod

# Check deployment status
vercel ls --prod
```

### Cron Jobs

**Configured in** `vercel.json`:
- OEM Monitor: 9am UTC daily
- Executive Digest: 1pm UTC daily (8am EST)
- Training Queue: Every 15 minutes

**View logs**:
```bash
vercel logs [deployment-url] --follow
```

### Environment Variables

**Required**:
- `NEO4J_URI`, `NEO4J_PASSWORD` (knowledge graph)
- `CRON_SECRET` (job authentication)

**See**: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

## For QA/Testing

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing Checklist

**Phase 1-2**:
- [ ] `/api/knowledge-graph` returns data
- [ ] `/api/dealer-twin` calculates health
- [ ] `/api/ai-scores` returns metrics

**Phase 3**:
- [ ] Weather context works
- [ ] Copilot mood changes
- [ ] Theme adapts to mood

**Phase 5**:
- [ ] Executive digest sends
- [ ] Training queue processes
- [ ] Experiments track variants

### Test Endpoints
```bash
# Knowledge graph
curl "https://dealershipai.com/api/knowledge-graph?dealerId=test&type=metrics"

# Dealer twin
curl "https://dealershipai.com/api/dealer-twin?dealerId=test"

# AI scores
curl "https://dealershipai.com/api/ai-scores?origin=https://example.com"
```

## Useful Links

- **Documentation**: `/docs` folder
- **API Directory**: [API_DIRECTORY.md](./API_DIRECTORY.md) (coming in Week 11)
- **Architecture**: [INFRASTRUCTURE_AUDIT.md](./INFRASTRUCTURE_AUDIT.md)
- **Roadmap**: [ACCELERATED_TIMELINE.md](./ACCELERATED_TIMELINE.md)
- **Integration Plan**: [INTEGRATION_MANIFEST.md](./INTEGRATION_MANIFEST.md)

## Common Issues

**Build fails**: Run `rm -rf .next && npm run build`
**Type errors**: Run `npm run type-check` to find issues
**API 503**: Check environment variables
**Cron not running**: Verify CRON_SECRET is set

## Getting Help

1. Check `/docs` folder
2. Search GitHub issues
3. Ask in #dealershipai-dev Slack channel
4. Tag @tech-lead for urgent issues

---

**Last Updated**: 2025-11-14
**Version**: 1.0
