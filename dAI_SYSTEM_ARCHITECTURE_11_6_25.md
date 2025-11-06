# DealershipAI System Architecture
## Version: 11.6.25 | Last Updated: November 6, 2025

## 🎯 Executive Summary

This document defines the complete system architecture for DealershipAI, a multi-tenant SaaS platform for automotive dealership AI visibility analytics. The architecture supports 5,000+ dealerships with enterprise-grade security, scalability, and performance.

---

## 🏗️ Core Architecture Principles

### 1. **Multi-Tenant First**
- Every feature must support tenant isolation
- Row Level Security (RLS) at database level
- Tenant context in all API routes
- Isolated data access patterns

### 2. **Server-Side Logic Protection**
- Business logic never exposed to client
- Scoring algorithms server-side only
- API routes for all data operations
- Protected intellectual property

### 3. **Type Safety Throughout**
- TypeScript for all code
- Type-safe API routes
- Shared types between frontend/backend
- Runtime validation with Zod

### 4. **Performance & Scalability**
- Edge caching with proper TTLs
- Redis for session/quota management
- Database connection pooling
- Lazy loading and code splitting

### 5. **Security by Default**
- Authentication required for all routes
- RBAC for feature access
- Input validation on all endpoints
- Audit logging for sensitive operations

---

## 📐 System Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Next.js 14 App Router | React | TypeScript | Tailwind  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                        │
│  Clerk Auth | Tenant Resolution | RBAC | Rate Limiting  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API LAYER                              │
│  Next.js API Routes | Server Actions | Type-Safe APIs    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 BUSINESS LOGIC LAYER                     │
│  Scoring Engines | Analytics | AI Processing | Services  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER                              │
│  Supabase/PostgreSQL | Redis | Row Level Security       │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5.9+
- **Styling**: Tailwind CSS 4.1+
- **UI Components**: Radix UI + Custom components
- **State Management**: React Context + SWR
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **API Framework**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Cache/Queue**: Redis (Upstash)
- **Authentication**: Clerk
- **Billing**: Stripe
- **File Storage**: Supabase Storage

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Custom logging
- **CI/CD**: GitHub Actions → Vercel

---

## 📁 Directory Structure

```
dealership-ai-dashboard/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── intelligence/         # AI visibility analytics
│   │   ├── onboarding/           # User onboarding flow
│   │   └── layout.tsx            # Dashboard layout wrapper
│   ├── (public)/                 # Public marketing routes
│   │   ├── page.tsx              # Landing page
│   │   └── marketing/            # Marketing pages
│   ├── api/                      # API routes
│   │   ├── ai-scores/            # Scoring endpoints
│   │   ├── onboarding/           # Onboarding endpoints
│   │   └── auth/                 # Auth endpoints
│   ├── sign-in/                  # Clerk sign-in
│   ├── sign-up/                  # Clerk sign-up
│   ├── layout.tsx                 # Root layout (ClerkProvider)
│   └── middleware.ts              # Auth & routing middleware
│
├── components/                    # React components
│   ├── ui/                       # Base UI components
│   ├── dashboard/                # Dashboard-specific components
│   ├── landing/                  # Landing page components
│   └── shared/                   # Shared components
│
├── lib/                          # Core libraries
│   ├── auth.ts                   # Auth utilities (Clerk)
│   ├── db/                       # Database clients
│   │   ├── pool.ts               # Prisma client with pooling
│   │   └── prisma.ts             # Prisma client
│   ├── scoring/                  # Scoring algorithms
│   ├── services/                 # Business logic services
│   └── utils.ts                  # Utility functions
│
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema
│
├── types/                        # TypeScript types
│   └── *.ts                      # Shared type definitions
│
├── public/                       # Static assets
│   ├── images/
│   └── favicon.ico
│
└── docs/                         # Documentation
    └── *.md
```

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User visits protected route
2. Middleware checks Clerk session
3. If not authenticated → redirect to `/sign-in`
4. If authenticated → resolve tenant from Clerk org
5. Load user permissions from database
6. Render dashboard with RBAC

### Multi-Tenant Structure
```
SuperAdmin (Platform)
├── Enterprise Group A
│   ├── Dealership 1 (tenant_id: ent-a-deal-1)
│   ├── Dealership 2 (tenant_id: ent-a-deal-2)
│   └── ... (up to 350 rooftops)
├── Enterprise Group B
└── Independent Dealerships
    ├── Dealership X (tenant_id: ind-deal-x)
    └── Dealership Y (tenant_id: ind-deal-y)
```

### RBAC Roles
- **SuperAdmin**: Platform management, all tenants
- **Enterprise Admin**: Group analytics, sub-dealership management
- **Dealership Admin**: Single rooftop, team management
- **User**: Limited access, view own data

### Implementation
```typescript
// app/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();
  
  // Resolve tenant from orgId
  // Check permissions
  // Apply tenant isolation
});
```

---

## 🗄️ Database Architecture

### Core Tables
- `tenants` - Multi-tenant hierarchy
- `users` - User accounts with RBAC
- `onboarding_progress` - Onboarding state
- `dealership_data` - Analytics data (tenant-scoped)
- `score_history` - Historical scores
- `api_usage` - Usage tracking

### Row Level Security (RLS)
All tenant-scoped tables have RLS policies:
```sql
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON dealership_data
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### Connection Management
- Prisma client with connection pooling
- Lazy initialization (allows builds without DB)
- Graceful error handling
- Health check endpoints

---

## 🔌 API Architecture

### Route Structure
```
/api/
├── ai-scores/           # Scoring endpoints
├── onboarding/          # Onboarding flow
│   ├── start/          # Start onboarding
│   └── complete/        # Complete onboarding
├── auth/                # Auth endpoints
└── health/              # Health checks
```

### API Patterns

#### 1. Authentication Required
```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Process request...
}
```

#### 2. Tenant Isolation
```typescript
// Always filter by tenant_id
const data = await prisma.dealership_data.findMany({
  where: {
    tenant_id: tenantId, // From Clerk org
  },
});
```

#### 3. Input Validation
```typescript
import { z } from 'zod';

const schema = z.object({
  domain: z.string().url(),
  dealerName: z.string().min(1),
});

const body = await req.json();
const validated = schema.parse(body);
```

#### 4. Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error('API Error:', error);
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

#### 5. Dynamic Routes
```typescript
// Prevent build-time evaluation
export const dynamic = 'force-dynamic';
```

---

## 🎨 Frontend Architecture

### Component Structure
- **Server Components**: Default for data fetching
- **Client Components**: Only when needed (`'use client'`)
- **Shared Components**: Reusable UI elements
- **Page Components**: Route-specific pages

### Data Fetching
```typescript
// Server Component (preferred)
export default async function Dashboard() {
  const data = await fetchData(); // Server-side only
  return <DashboardClient data={data} />;
}

// Client Component (when needed)
'use client';
export function DashboardClient({ data }) {
  const [state, setState] = useState();
  // Interactive logic
}
```

### Styling Guidelines
- Tailwind CSS utility classes
- Cupertino aesthetic (Apple-inspired)
- Consistent design tokens
- Responsive by default
- Dark mode support

### State Management
- Server state: SWR or React Query
- Client state: React useState/useReducer
- Global state: Context API (minimal)
- URL state: Next.js router

---

## 🔒 Security Architecture

### Authentication
- Clerk handles all authentication
- JWT tokens managed by Clerk
- Session management server-side
- Secure cookie handling

### Authorization
- RBAC checks in middleware
- Feature gates in components
- API route protection
- Database RLS policies

### Data Protection
- Server-side business logic only
- No sensitive data in client
- Encrypted connections (HTTPS)
- Secure environment variables

### Input Validation
- Zod schemas for all inputs
- Sanitization on user input
- SQL injection prevention (Prisma)
- XSS prevention (React escaping)

---

## 📊 Performance Architecture

### Caching Strategy
- **Static Pages**: ISR with revalidation
- **API Routes**: Redis caching with TTLs
- **Database**: Connection pooling
- **CDN**: Vercel Edge Network

### Optimization
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Lazy loading components
- Bundle size monitoring

### Monitoring
- Vercel Analytics
- Custom performance metrics
- Error tracking
- API response times

---

## 🚀 Deployment Architecture

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables
```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
REDIS_URL=
STRIPE_SECRET_KEY=
```

### Build Process
1. TypeScript compilation
2. Prisma generation
3. Next.js build
4. Static optimization
5. Edge function bundling

---

## 🔄 Data Flow Patterns

### Onboarding Flow
```
User Sign Up → Clerk
  ↓
Create Tenant → Database
  ↓
Onboarding Form → API
  ↓
Save Progress → Database
  ↓
Redirect to Dashboard
```

### Scoring Flow
```
User Request → API Route
  ↓
Validate Input → Zod
  ↓
Fetch Data → External APIs
  ↓
Calculate Scores → Server Logic
  ↓
Store Results → Database
  ↓
Return Response → Client
```

### Dashboard Flow
```
User Visit → Middleware
  ↓
Check Auth → Clerk
  ↓
Load Data → API Route
  ↓
Render Dashboard → Server Component
  ↓
Interactive Features → Client Component
```

---

## 📝 Development Guidelines

### Code Organization
1. **Server logic in `/lib`** - Never expose to client
2. **Components in `/components`** - Reusable UI
3. **Types in `/types`** - Shared TypeScript types
4. **API routes in `/app/api`** - RESTful endpoints

### Naming Conventions
- **Files**: kebab-case (`dashboard-page.tsx`)
- **Components**: PascalCase (`DashboardPage.tsx`)
- **Functions**: camelCase (`fetchData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### Error Handling
- Always use try/catch in async functions
- Return proper HTTP status codes
- Log errors for debugging
- Provide user-friendly messages

### Testing
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Type checking with TypeScript

---

## 🎯 Key Principles

1. **Server-Side First**: Business logic never in client
2. **Type Safety**: TypeScript everywhere
3. **Security**: Authentication + Authorization + Validation
4. **Performance**: Caching + Optimization + Monitoring
5. **Scalability**: Multi-tenant + Connection pooling + Edge caching
6. **Maintainability**: Clear structure + Documentation + Patterns

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🔄 Architecture Updates

**Version 11.6.25** (November 6, 2025)
- Initial architecture document
- Clerk authentication integration
- Multi-tenant structure defined
- API patterns established
- Security guidelines added

---

**This architecture must be followed for all new features and modifications.**

