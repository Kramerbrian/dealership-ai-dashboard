# Performance Budget Monitor - Dependencies

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "web-vitals": "^4.2.4",
    "swr": "^2.2.5"
  }
}
```

## Installation

```bash
npm install web-vitals swr
```

Or with yarn:

```bash
yarn add web-vitals swr
```

Or with pnpm:

```bash
pnpm add web-vitals swr
```

---

## Package Details

### `web-vitals` (^4.2.4)

**Purpose**: Official Google library for measuring Core Web Vitals

**Features**:
- Tracks LCP, CLS, INP, FCP, TTFB
- Works with Real User Monitoring (RUM)
- Lightweight (~3KB gzipped)
- Battle-tested by Google Chrome team
- Automatic detection of page navigation types
- Support for soft navigations (SPA)

**Documentation**: https://github.com/GoogleChrome/web-vitals

**License**: Apache 2.0

---

### `swr` (^2.2.5)

**Purpose**: React Hooks for data fetching

**Features**:
- Automatic revalidation
- Built-in cache management
- Real-time updates
- Optimistic UI
- Suspense support
- TypeScript support
- Zero-config, but highly customizable

**Documentation**: https://swr.vercel.app

**License**: MIT

---

## Optional Dependencies (Production Enhancement)

For production deployments, consider adding:

### Performance Monitoring Services

```json
{
  "dependencies": {
    "@vercel/analytics": "^1.3.1",           // Vercel Analytics (free tier)
    "@sentry/nextjs": "^8.36.0",             // Error + Performance tracking
    "newrelic": "^12.7.1"                    // Enterprise APM (if needed)
  }
}
```

### Image Optimization (for playbook automation)

```json
{
  "dependencies": {
    "sharp": "^0.33.5",                      // Image processing (already in Next.js)
    "@cloudinary/url-gen": "^1.23.0"         // Cloudinary integration (optional)
  }
}
```

### Caching & Performance

```json
{
  "dependencies": {
    "ioredis": "^5.4.1",                     // Redis client for caching
    "@upstash/redis": "^1.34.3"              // Serverless Redis (Vercel compatible)
  }
}
```

---

## Installation Script

Create `scripts/install-performance.sh`:

```bash
#!/bin/bash

echo "🚀 Installing Performance Budget Monitor dependencies..."

# Core dependencies
npm install web-vitals swr

# Optional: Vercel Analytics (recommended)
read -p "Install Vercel Analytics? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm install @vercel/analytics
fi

# Optional: Sentry Performance
read -p "Install Sentry Performance tracking? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm install @sentry/nextjs
fi

# Optional: Redis for caching
read -p "Install Redis client for caching? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm install ioredis
fi

echo "✅ Installation complete!"
echo "📚 Next steps:"
echo "   1. Follow PERFORMANCE-BUDGET-INTEGRATION.md for setup"
echo "   2. Add Web Vitals tracking to app/layout.tsx"
echo "   3. Add components to your dashboard"
```

Make executable:

```bash
chmod +x scripts/install-performance.sh
./scripts/install-performance.sh
```

---

## Verifying Installation

After installation, verify with:

```bash
npm list web-vitals swr
```

Expected output:

```
your-project@1.0.0 /path/to/project
├── swr@2.2.5
└── web-vitals@4.2.4
```

---

## TypeScript Types

Both packages include TypeScript definitions out of the box. No need for `@types/*` packages.

### Type Imports

```typescript
// web-vitals types
import type { Metric, ReportCallback } from 'web-vitals';

// SWR types
import type { SWRConfiguration, SWRResponse } from 'swr';
```

---

## Next.js Compatibility

| Next.js Version | web-vitals | swr   | Status        |
| --------------- | ---------- | ----- | ------------- |
| 15.x            | 4.2.4      | 2.2.5 | ✅ Fully compatible |
| 14.x            | 4.2.4      | 2.2.5 | ✅ Fully compatible |
| 13.x            | 3.5.0+     | 2.0.0+ | ✅ Compatible |
| 12.x            | 3.0.0+     | 1.3.0+ | ⚠️  Use older versions |

---

## Bundle Size Impact

| Package     | Size (gzipped) | Impact  |
| ----------- | -------------- | ------- |
| web-vitals  | ~3 KB          | Minimal |
| swr         | ~5 KB          | Minimal |
| **Total**   | **~8 KB**      | **Minimal** |

Both libraries are highly optimized and won't significantly impact your bundle size.

---

## Environment Variables (Optional)

If using external monitoring services, add to `.env.local`:

```bash
# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_project_id

# Sentry (if using)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_auth_token

# Redis (if using)
REDIS_URL=redis://localhost:6379
# Or Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

---

## Development vs Production

### Development Mode

```bash
npm run dev
```

In development:
- Web Vitals are logged to console
- Mock data is served from API routes
- No external API calls
- Hot reload works seamlessly

### Production Mode

```bash
npm run build
npm start
```

In production:
- Real Web Vitals are collected from users
- Data can be sent to analytics services
- API routes should connect to real databases
- Caching is enabled for performance

---

## Troubleshooting

### Issue: "Cannot find module 'web-vitals'"

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "SWR hooks not working"

**Solution**: Ensure you're using SWR in client components only:

```tsx
'use client'; // Add this at the top

import useSWR from 'swr';
```

### Issue: Web Vitals not reporting

**Solution**: Check that `reportWebVitals()` is called on client side:

```tsx
'use client';

useEffect(() => {
  reportWebVitals();
}, []);
```

---

## Updating Dependencies

Keep dependencies up to date:

```bash
# Check for updates
npm outdated

# Update to latest compatible versions
npm update web-vitals swr

# Or update to latest (may include breaking changes)
npm install web-vitals@latest swr@latest
```

---

## Alternative: CDN Installation (Not Recommended)

For quick testing only, you can load from CDN:

```html
<script type="module">
  import { onLCP, onINP, onCLS } from 'https://unpkg.com/web-vitals@4.2.4/dist/web-vitals.js?module';

  onLCP(console.log);
  onINP(console.log);
  onCLS(console.log);
</script>
```

**Warning**: Not recommended for production. Use npm installation instead.

---

## Complete Package.json Example

```json
{
  "name": "dealership-ai-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "web-vitals": "^4.2.4",
    "swr": "^2.2.5",
    "@vercel/analytics": "^1.3.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.0.0"
  }
}
```

---

**Ready to install?** Run:

```bash
npm install web-vitals swr
```

Then follow the [PERFORMANCE-BUDGET-INTEGRATION.md](./PERFORMANCE-BUDGET-INTEGRATION.md) guide.
