# DealershipAI Cognitive Ops Platform

**Monorepo for DealershipAI - The Cognitive Ops Platform that gives every dealership its own AI Chief Strategy Officer.**

## 🏗️ Structure

```
dealershipai-monorepo/
├── apps/
│   ├── web/              # Marketing site + calculators
│   └── dashboard/        # Authenticated dashboard
├── packages/
│   ├── shared/           # Shared types & utilities
│   ├── orchestrator/     # Orchestrator 3.0 core
│   ├── agents/          # Agent SDK
│   └── ui/              # Shared UI components
└── docs/                # Documentation
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all apps in development
npm run dev

# Build all packages
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📦 Workspaces

### Apps
- **web**: Marketing site and public calculators
- **dashboard**: Authenticated dashboard with Mission Board, HAL Chat, and Pulse components

### Packages
- **shared**: TypeScript types, utilities, constants
- **orchestrator**: Orchestrator 3.0 inference engine
- **agents**: Agent SDK and implementations
- **ui**: Shared UI component library

## 🛠️ Development

This monorepo uses:
- **Turborepo** for build orchestration
- **Next.js 14** for apps
- **TypeScript** for type safety
- **Workspaces** for package management

## 📚 Documentation

See `COGNITIVE_OPS_MASTER_BLUEPRINT_V1.md` for complete architecture documentation.

## 🔗 Links

- [Architecture Blueprint](./COGNITIVE_OPS_MASTER_BLUEPRINT_V1.md)
- [Architecture Decisions](./COGNITIVE_OPS_ARCHITECTURE_DECISIONS.md)
- [Cursor Usage Guide](./CURSOR_BLUEPRINT_USAGE_GUIDE.md)

