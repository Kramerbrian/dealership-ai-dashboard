# DealershipAI Manifest System

**Location**: `/manifests/`
**Purpose**: Central repository for all system configuration, roadmap, and intelligence orchestration manifests

---

## 📚 Manifest Hierarchy

The DealershipAI platform is governed by a three-tier manifest system:

```
Meta-Intelligence (Evolutionary Layer)
    ↓
Roadmap (Strategic Layer)
    ↓
Master (Operational Layer)
```

### 1. Master Manifest
**File**: [`dealershipai-master-manifest.json`](./dealershipai-master-manifest.json)
**Layer**: Operational
**Purpose**: Single source of truth for current production configuration

**Contains**:
- Application structure and architecture
- Authentication and authorization (Clerk)
- Onboarding workflow (5 steps)
- Dashboard components (Pulse Suite)
- Landing page configuration (Cinematic Hero)
- Theme system (mood-based)
- Deployment pipelines (Vercel + GitHub)
- Self-optimization system
- Observability and monitoring

**Used By**:
- CI/CD pipelines
- Development environment setup
- Production deployment
- Documentation generation

---

### 2. Roadmap Manifest
**File**: [`dealershipai-roadmap-manifest.json`](./dealershipai-roadmap-manifest.json)
**Layer**: Strategic
**Purpose**: Quarterly feature planning and success metrics

**Contains**:
- Q1-Q4 2025 milestones with themes
- Feature flag configuration
- Success metrics per quarter
- Risk management framework
- Dependency tracking
- Governance structure

**Used By**:
- Product management
- Engineering planning
- Executive reporting
- Feature flag management

---

### 3. Meta-Intelligence Manifest
**File**: [`dealershipai-meta-intelligence-manifest.json`](./dealershipai-meta-intelligence-manifest.json)
**Layer**: Evolutionary
**Purpose**: Self-learning and intelligence orchestration

**Contains**:
- Experiment engine (A/B testing + reinforcement learning)
- Dealer knowledge graph
- Executive GPT reports
- Contextual feeds (weather, OEM, events)
- Neuro-feedback system
- Brand voice AI
- Executive console

**Used By**:
- Automated experimentation
- Contextual intelligence
- Executive reporting
- Continuous learning loops

---

## 🔧 Validation

### Run Validation
```bash
npm run manifests:validate
```

This command:
1. Validates JSON syntax for all manifests
2. Checks version numbers are consistent
3. Verifies required fields are present
4. Lists next scheduled tasks
5. Reports on manifest health

### Expected Output
```
🚀 DealershipAI Manifest Validation

✅ dealershipai-master-manifest.json
   Version: 2025-11-04
   Status: Valid
   Next Task: Nightly Lighthouse (0 3 * * *)

✅ dealershipai-roadmap-manifest.json
   Version: 2025-11-14
   Status: Valid
   Current Quarter: Q1_2025
   Active Milestones: 4

✅ dealershipai-meta-intelligence-manifest.json
   Version: 2026-Q2
   Status: Valid
   Active Systems: 7

📊 Summary: 3/3 manifests valid
```

---

## 🔄 Automated Sync

The `.github/workflows/meta-manifest-sync.yml` workflow runs nightly to:

1. **Read** all manifests in `/manifests/`
2. **Update** `lastExecuted` and `success` fields based on cron job results
3. **Commit** changes if any manifest was updated by automation
4. **Notify** Slack `#meta-intel-alerts` of any issues

### Manual Sync
```bash
node scripts/manifest-sync.ts
```

---

## 📝 Version Management

### Automatic Version Bumping
```bash
# Dry run (preview changes)
node scripts/manifest-version-bump.js --dry-run

# Apply version bump
node scripts/manifest-version-bump.js
```

This updates:
- `manifestVersion` field in all manifests
- `governance.currentVersion` in master manifest
- `/docs/CHANGELOG.md` with new entry
- Provides git tag guidance

### Manual Version Update
```bash
# Update specific manifest
jq '.manifestVersion = "2025-11-15"' manifests/dealershipai-master-manifest.json > tmp.json
mv tmp.json manifests/dealershipai-master-manifest.json

# Create git tag
git tag v2025.11.15
git push origin main --tags
```

---

## 🎯 Usage Guide

### For Developers
```bash
# Check what features are enabled
jq '.roadmap.Q1_2025.featureFlags' manifests/dealershipai-roadmap-manifest.json

# View current architecture
jq '.structure' manifests/dealershipai-master-manifest.json

# Check experiment engine config
jq '.systems.experimentEngine' manifests/dealershipai-meta-intelligence-manifest.json
```

### For DevOps
```bash
# Get deployment configuration
jq '.deployment' manifests/dealershipai-master-manifest.json

# List all cron jobs
jq '.deployment.vercel.crons' manifests/dealershipai-master-manifest.json

# Check quality gates
jq '.selfOptimization.qualityGates' manifests/dealershipai-master-manifest.json
```

### For Product Managers
```bash
# View current quarter roadmap
jq '.roadmap.Q1_2025' manifests/dealershipai-roadmap-manifest.json

# Check success metrics
jq '.successMetrics.Q1_2025' manifests/dealershipai-roadmap-manifest.json

# List feature flags
jq '.roadmap.Q1_2025.featureFlags | to_entries[]' manifests/dealershipai-roadmap-manifest.json
```

### For Executives
```bash
# View meta-intelligence systems
jq '.systems | keys' manifests/dealershipai-meta-intelligence-manifest.json

# Check executive report schedule
jq '.systems.executiveGPTReports' manifests/dealershipai-meta-intelligence-manifest.json

# View observability metrics
jq '.observability.metrics' manifests/dealershipai-meta-intelligence-manifest.json
```

---

## 🔗 Integration

### Environment Variables
Many manifest values reference environment variables:

```bash
# Master manifest
VERCEL_TOKEN=@VERCEL_TOKEN
GMAPS_KEY=@GMAPS_KEY
SLACK_WEBHOOK_URL=@SLACK_WEBHOOK_URL

# Roadmap manifest
ENABLE_DAI_COPILOT=true
ENABLE_PULSE_DASHBOARD=true

# Meta-intelligence manifest
META_MANIFEST_PATH=./manifests/dealershipai-meta-intelligence-manifest.json
```

### CI/CD Integration
```yaml
# .github/workflows/example.yml
- name: Load Master Manifest
  run: |
    MANIFEST=$(cat manifests/dealershipai-master-manifest.json)
    echo "VERSION=$(echo $MANIFEST | jq -r '.manifestVersion')" >> $GITHUB_ENV
```

---

## 📊 Governance

### Review Schedule
- **Weekly**: Engineering team reviews master manifest updates
- **Bi-weekly**: Product reviews roadmap milestone progress
- **Monthly**: Leadership reviews meta-intelligence metrics
- **Quarterly**: Full manifest audit and version bump

### Ownership
| Manifest | Owner | Stakeholders |
|----------|-------|--------------|
| Master | Platform Engineering | DevOps, Backend |
| Roadmap | Product Management | Engineering, Design |
| Meta-Intelligence | Data Science | Platform, Growth |

---

## 📖 Related Documentation

- [Master Manifest Guide](../docs/master-manifest-guide.md) - Complete usage guide
- [Deployment Infrastructure](../docs/deployment-infrastructure.md) - Deployment setup
- [Roadmap Guide](../docs/roadmap-guide.md) - Feature planning guide
- [Meta-Intelligence Architecture](../docs/meta-intelligence-architecture.md) - AI systems guide

---

**Last Updated**: 2025-11-14
**Maintained By**: Platform Engineering Team
**Status**: ✅ Production Ready
