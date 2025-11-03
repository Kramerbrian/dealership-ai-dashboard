# Vercel Edge Runtime Limitations & Best Practices

## Overview

This document outlines critical limitations discovered during production deployment and provides best practices for avoiding Edge Runtime compatibility issues.

**Last Updated**: November 3, 2025
**Incident Reference**: [SITE_RESTORATION_STATUS.md](../SITE_RESTORATION_STATUS.md)

---

## Critical Incident Summary

**Date**: November 2-3, 2025
**Duration**: 4 hours total downtime
**Root Cause**: Sentry Edge Runtime initialization with experimental features incompatible with Vercel Edge Runtime

**Error**: `HTTP 500 - x-vercel-error: MIDDLEWARE_INVOCATION_FAILED`

---

## Edge Runtime Restrictions

### 1. Limited Node.js API Support

The Edge Runtime is **NOT** a full Node.js environment. It runs on V8 isolates with restricted APIs.

#### Incompatible Modules:
- ❌ `fs` (filesystem)
- ❌ `child_process`
- ❌ `crypto` (full Node.js crypto - use Web Crypto API instead)
- ❌ Most native Node.js modules
- ❌ Packages requiring Node.js runtime features

#### Compatible Alternatives:
- ✅ Web APIs (fetch, Response, Request)
- ✅ Web Crypto API
- ✅ Edge-compatible packages
- ✅ Lightweight SDKs designed for Edge

### 2. Sentry Limitations

**CRITICAL**: Sentry's experimental features are incompatible with Edge Runtime.

#### DO NOT USE:
```typescript
// ❌ NEVER use in Edge Runtime
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  _experiments: {
    enableLogs: true,  // This WILL crash Edge Runtime
  },
});
```

#### SAFE APPROACH:
```typescript
// ✅ Use in Node.js runtime only
// In instrumentation.ts:
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // NEVER load Edge config
  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   await import('./sentry.edge.config'); // DON'T DO THIS
  // }
}
```

### 3. Middleware Constraints

Middleware runs in Edge Runtime by default and has severe limitations.

#### Safe Middleware Pattern:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Keep middleware MINIMAL
  // No heavy SDKs, no Node.js APIs, no complex logic

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|static).*)',
  ],
};
```

### 4. OpenTelemetry in Edge

OpenTelemetry SDKs generally require Node.js runtime.

#### SAFE:
```typescript
// Only load in Node.js runtime
if (process.env.NEXT_RUNTIME === 'nodejs') {
  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  // ... initialization
}
```

#### UNSAFE:
```typescript
// ❌ Loading at top level will fail in Edge
import { NodeSDK } from '@opentelemetry/sdk-node';
```

---

## Best Practices

### 1. Instrumentation File

**File**: `instrumentation.ts`

```typescript
/**
 * SAFE instrumentation.ts pattern
 * Only loads in Node.js runtime
 */
export async function register() {
  // Check runtime environment
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Load Node.js-only instrumentation
    if (process.env.SENTRY_DSN) {
      await import('./sentry.server.config');
    }

    if (process.env.OTEL_ENDPOINT) {
      await import('./lib/otel-config');
    }
  }

  // DO NOT load Edge Runtime instrumentation
  // unless you're 100% certain it's Edge-compatible
}
```

### 2. Runtime Detection

Always check the runtime before loading heavy packages:

```typescript
// ✅ Safe pattern
if (process.env.NEXT_RUNTIME === 'nodejs') {
  // Node.js-specific code
}

if (process.env.NEXT_RUNTIME === 'edge') {
  // Edge-compatible code only
}

// Check at module level
const isEdge = process.env.NEXT_RUNTIME === 'edge';
```

### 3. Route Segment Configuration

```typescript
// In route handlers or pages:
export const runtime = 'nodejs';  // Explicitly use Node.js
// OR
export const runtime = 'edge';    // Explicitly use Edge

// Default is 'nodejs' for most routes
```

### 4. Conditional Imports

Use dynamic imports for Node.js-only packages:

```typescript
// ✅ Safe
async function handleRequest() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { someNodeModule } = await import('some-node-module');
    return someNodeModule.process();
  }

  // Edge-compatible fallback
  return Response.json({ message: 'Edge runtime' });
}

// ❌ Unsafe
import { someNodeModule } from 'some-node-module';  // May crash Edge
```

---

## Testing Edge Compatibility

### Local Testing

```bash
# Test Edge Runtime locally
NEXT_RUNTIME=edge npm run build
npm run start
```

### Deployment Testing

1. Deploy to preview branch first
2. Check Vercel build logs for Edge Runtime errors
3. Test all routes before promoting to production

### Debugging

If you encounter `MIDDLEWARE_INVOCATION_FAILED`:

1. **Disable instrumentation immediately**:
   ```bash
   mv instrumentation.ts instrumentation.ts.disabled
   ```

2. **Disable middleware**:
   ```bash
   mv middleware.ts middleware.ts.backup
   ```

3. **Check Sentry config**:
   ```bash
   # Look for experimental features
   grep -r "_experiments" .
   ```

4. **Deploy and test**

---

## Package Compatibility Matrix

| Package | Edge Compatible | Notes |
|---------|-----------------|-------|
| `@sentry/nextjs` | ⚠️ Partial | Server config OK, Edge config with experimental features FAILS |
| `@opentelemetry/sdk-node` | ❌ No | Node.js only |
| `@workos-inc/node` | ❌ No | Use in API routes (Node.js runtime) |
| `iron-session` | ❌ No | Node.js only |
| `@clerk/nextjs` | ✅ Yes | Edge-compatible |
| `next` core | ✅ Yes | Framework supports both |
| `react` | ✅ Yes | Edge-compatible |

---

## Emergency Rollback Procedure

If production is down with `MIDDLEWARE_INVOCATION_FAILED`:

### 1. Immediate Actions (< 5 minutes)

```bash
# Find last working deployment
vercel ls --scope YOUR_SCOPE

# Promote known working deployment
vercel promote WORKING_DEPLOYMENT_URL --scope YOUR_SCOPE --yes
```

### 2. Code-Level Fixes (5-15 minutes)

```bash
# Disable instrumentation
mv instrumentation.ts instrumentation.ts.disabled

# Disable middleware
mv middleware.ts middleware.ts.backup

# Disable Sentry Edge
mv sentry.edge.config.ts sentry.edge.config.ts.disabled

# Commit and deploy
git add -A
git commit -m "fix: disable Edge Runtime conflicts"
git push origin main
```

### 3. Verification (2-5 minutes)

```bash
# Wait for deployment
sleep 60

# Test production
curl -I https://YOUR_DOMAIN.com

# Should return HTTP 200, not 500
```

---

## Future Considerations

### When Edge Runtime Makes Sense:

- ✅ Simple request/response logic
- ✅ Lightweight auth checks
- ✅ Geographic routing
- ✅ A/B testing
- ✅ Rate limiting (with Edge-compatible stores)

### When to Use Node.js Runtime:

- ✅ Complex observability (Sentry, OpenTelemetry)
- ✅ Database connections
- ✅ File system operations
- ✅ Heavy SDKs (WorkOS, Stripe, etc.)
- ✅ Cryptographic operations
- ✅ Image processing

---

## Additional Resources

- [Vercel Edge Runtime Documentation](https://vercel.com/docs/functions/edge-functions/edge-runtime)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Sentry Edge Compatibility](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#edge-runtime)

---

## Changelog

- **2025-11-03**: Initial document created after 4-hour production outage
- Root cause: Sentry Edge Runtime with experimental logging feature
- Resolution: Disabled all Edge Runtime instrumentation

---

**REMEMBER**: When in doubt, use Node.js runtime. Edge Runtime is powerful but has strict limitations that can take down your entire site if violated.
