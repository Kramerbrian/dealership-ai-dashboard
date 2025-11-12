# DealershipAI Architecture Documentation

## System Overview

DealershipAI is a Next.js 14 application built with TypeScript, providing AI-powered visibility tracking and optimization for automotive dealerships.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom Clay UI system
- **State Management**: Zustand (global), React Query (server)
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js (Vercel Edge/Serverless)
- **Database**: PostgreSQL (Supabase)
- **Cache**: Upstash Redis
- **ORM**: Prisma
- **Authentication**: Clerk

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics, Sentry, PostHog
- **CI/CD**: GitHub Actions

---

## Architecture Layers

### 1. Presentation Layer

**Location**: `app/`, `components/`

- **Pages**: Next.js App Router pages
- **Components**: React components organized by feature
- **Layouts**: Root and nested layouts
- **Templates**: Page templates

**Key Patterns:**
- Server Components by default
- Client Components for interactivity (`'use client'`)
- Error Boundaries for error handling
- Loading states with Suspense

---

### 2. Application Layer

**Location**: `lib/`, `app/api/`

- **API Routes**: Next.js API routes (`app/api/`)
- **Business Logic**: Service functions (`lib/services/`)
- **Hooks**: Custom React hooks (`lib/hooks/`)
- **Utilities**: Helper functions (`lib/utils/`)

**Key Patterns:**
- RESTful API design
- Server-side validation (Zod)
- Authentication middleware
- Rate limiting
- Error handling

---

### 3. Data Layer

**Location**: `lib/db/`, `prisma/`

- **Database**: Supabase PostgreSQL
- **ORM**: Prisma Client
- **Migrations**: Prisma migrations
- **Queries**: Database query functions

**Key Patterns:**
- Row Level Security (RLS)
- Multi-tenant isolation
- Connection pooling
- Query optimization

---

### 4. Integration Layer

**Location**: `lib/integrations/`

- **External APIs**: Google APIs, Review Services, etc.
- **Webhooks**: Incoming webhook handlers
- **Orchestrator**: OpenAI GPT integration
- **Marketplace**: Pulse/ATI/CIS integration

---

## Data Flow

### Request Flow

```
Client Request
  ↓
Middleware (Auth, Rate Limiting)
  ↓
API Route Handler
  ↓
Service Layer (Business Logic)
  ↓
Data Layer (Database/External APIs)
  ↓
Response
```

### State Management Flow

```
Server State (React Query)
  ↓
Global State (Zustand)
  ↓
Local State (useState)
  ↓
UI Components
```

---

## Key Systems

### 1. Authentication & Authorization

**Technology**: Clerk

**Features:**
- Multi-tenant organizations
- Role-based access control (RBAC)
- Session management
- Middleware protection

**Implementation:**
- `middleware.ts`: Route protection
- `lib/authOrg.ts`: Organization utilities
- `components/OrgSwitcher.tsx`: Org switching UI

---

### 2. Multi-Tenant Architecture

**Database**: Row Level Security (RLS) policies

**Features:**
- Tenant isolation at database level
- Organization-based access
- Shared resources with tenant context

**Implementation:**
- `tenant_id` column on all tables
- RLS policies in Supabase
- Tenant context in API routes

---

### 3. Cognitive Interface

**Components**: Drive Mode, Pulse Stream, Action Drawer

**Features:**
- Incident triage
- Real-time pulse updates
- Agentic recommendations
- Context-aware actions

**State**: `lib/store/cognitive.ts`

---

### 4. Pulse Digest Framework

**Storage**: Redis (Upstash)

**Features:**
- Daily agentic updates
- Topic-based organization
- Dismissal tracking
- Context expansion

**API**: `/api/pulse/digest`

---

### 5. Performance Monitoring

**Tracking**: Core Web Vitals

**Features:**
- Real-time LCP, CLS, INP tracking
- Performance budgets
- Automated fix playbooks
- Trend analysis

**Implementation:**
- `lib/hooks/useVitals.ts`
- `lib/web-vitals.ts`
- `/api/web-vitals`

---

## Security

### Authentication
- Clerk session-based auth
- JWT tokens for API
- Organization-scoped access

### Data Protection
- Row Level Security (RLS)
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS protection (React)

### API Security
- Rate limiting (Upstash)
- HMAC signature verification
- Idempotency keys
- CORS configuration

---

## Performance Optimizations

### Frontend
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Font optimization (next/font)
- Bundle size optimization
- Tree shaking

### Backend
- Edge runtime for APIs
- Database connection pooling
- Redis caching
- Query optimization
- Response compression

---

## Deployment

### Vercel Configuration

**Build Settings:**
- Framework: Next.js
- Build Command: `prisma generate && next build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables:**
- Database URLs
- API Keys
- Service credentials

---

## Monitoring & Observability

### Error Tracking
- Sentry (client & server)
- Error boundaries
- Structured logging

### Analytics
- Vercel Analytics
- PostHog (product analytics)
- Google Analytics (optional)

### Performance
- Core Web Vitals
- API response times
- Database query performance

---

## Development Workflow

### Local Development
```bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run type-check   # TypeScript check
npm run lint         # Linting
```

### Testing
```bash
npm run test:unit    # Unit tests
npm run test:e2e     # E2E tests
npm run test:all     # All tests
```

### Deployment
```bash
npm run build        # Production build
npm run deploy       # Deploy to Vercel
```

---

## Future Enhancements

1. **Real-time Updates**: WebSocket/SSE for live data
2. **Advanced Analytics**: Custom dashboards
3. **AI Enhancements**: More orchestrator actions
4. **Mobile App**: React Native companion
5. **API Versioning**: v2 API with backward compatibility

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
