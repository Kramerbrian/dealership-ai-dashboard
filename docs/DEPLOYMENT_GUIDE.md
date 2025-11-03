# Production Deployment Guide

## Quick Start

### 1. Pre-Deployment Checklist
```bash
# Run verification script
./scripts/verify-production.sh

# Or manually:
npm run build
npm run type-check
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.production.example .env.production

# Edit and fill in all values
nano .env.production
```

### 3. Database Setup
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Verify connection
npm run db:push --dry-run
```

### 4. Build & Test
```bash
# Build for production
npm run build

# Test production server locally
npm run start
```

### 5. Deploy

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Manual Deployment
1. Build: `npm run build`
2. Start: `npm run start`
3. Configure process manager (PM2, systemd, etc.)

---

## Environment Variables

See `.env.production.example` for complete list.

**Critical Variables:**
- `DATABASE_URL` - Supabase PostgreSQL connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXTAUTH_SECRET` - NextAuth secret (32+ chars)

---

## Post-Deployment

1. Verify health endpoint: `GET /api/health`
2. Check logs for errors
3. Test authentication flow
4. Verify monitoring is active
5. Test critical API endpoints

---

## Rollback Procedure

```bash
# If using Vercel
vercel rollback

# If using manual deployment
git checkout <previous-commit>
npm run build
npm run start
```

