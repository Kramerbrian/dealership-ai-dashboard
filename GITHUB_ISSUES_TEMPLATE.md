# 📋 GitHub Issues - Copy/Paste Templates
## Front-End Improvement Sprint

**Generated**: November 3, 2025
**Based on**: FRONTEND_IMPROVEMENT_ROADMAP.md

---

## 🚀 Sprint 1: Critical Fixes

### Issue #1: Image Optimization - Migrate to Next.js Image

**Priority**: 🔴 P0
**Labels**: `performance`, `enhancement`, `sprint-1`
**Effort**: 3-4 hours
**Assignee**: Frontend Dev

**Description**:
Migrate all `<img>` tags to Next.js Image component to improve performance and eliminate Cumulative Layout Shift (CLS).

**Current State**:
- Multiple components using regular `<img>` tags
- No width/height specified
- Poor loading performance
- Layout shift during image load

**Acceptance Criteria**:
- [ ] All `<img>` tags converted to Next.js Image
- [ ] Width/height specified for all images
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Lighthouse image score > 90
- [ ] Priority images use `priority` prop
- [ ] Loading states implemented

**Files to Update**:
```
components/landing/SimplifiedLandingPage.tsx
components/landing/EnhancedLandingPage.tsx
components/landing/ProfileSection.tsx
components/dashboard/TabbedDashboard.tsx
components/dashboard/DTRI-MAXIMUS-Intelligence-Command.tsx
```

**Implementation Example**:
```typescript
// Before
<img src="/logo.png" alt="DealershipAI" />

// After
import Image from 'next/image';
<Image
  src="/logo.png"
  alt="DealershipAI"
  width={200}
  height={60}
  priority={isAboveFold}
/>
```

**Testing**:
```bash
# Find all img tags
grep -r "<img" components/ app/ --include="*.tsx"

# Run Lighthouse
npm run build && npm run start
# Open DevTools > Lighthouse > Run audit
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 3.1)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 1.1)

---

### Issue #2: Accessibility Fixes - ARIA Labels & Keyboard Navigation

**Priority**: 🔴 P0
**Labels**: `accessibility`, `compliance`, `sprint-1`
**Effort**: 4-6 hours
**Assignee**: Frontend Dev

**Description**:
Fix accessibility issues to achieve WCAG AA compliance. Add ARIA labels, implement keyboard navigation, and ensure screen reader support.

**Current State**:
- Missing ARIA labels on icon buttons
- No focus trap in modals
- Poor keyboard navigation
- No skip links
- Dynamic content not announced

**Acceptance Criteria**:
- [ ] All interactive elements have proper ARIA labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus trap implemented for modals
- [ ] Skip links added
- [ ] aria-live regions for dynamic content
- [ ] axe DevTools shows 0 critical issues
- [ ] Screen reader announces all actions

**Implementation Checklist**:

**1. Icon Buttons**:
```typescript
<button aria-label="Close modal" onClick={onClose}>
  <X className="w-5 h-5" />
</button>
```

**2. Form Labels**:
```typescript
<label htmlFor="email">Email Address</label>
<input id="email" type="email" aria-required="true" />
```

**3. Skip Links**:
```typescript
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">
```

**4. Focus Trap**:
```typescript
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <Modal>{/* Content */}</Modal>
</FocusTrap>
```

**5. Live Regions**:
```typescript
<div aria-live="polite" aria-atomic="true">
  {loadingMessage}
</div>
```

**Testing**:
```bash
# Install axe DevTools Chrome extension
# Run accessibility audit
# Test with keyboard only (no mouse)
# Test with VoiceOver (Mac) or NVDA (Windows)
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 4)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 1.2)

---

### Issue #3: Bundle Size Optimization

**Priority**: 🟡 P1
**Labels**: `performance`, `optimization`, `sprint-1`
**Effort**: 2-3 hours
**Assignee**: Frontend Dev

**Description**:
Reduce bundle size by optimizing imports, adding dynamic imports, and removing unused dependencies.

**Current State**:
- Large initial bundle size
- Improper lodash imports
- Heavy components loaded upfront
- Unused dependencies

**Acceptance Criteria**:
- [ ] Bundle size reduced by 15-20%
- [ ] First Load JS < 300KB
- [ ] No unused dependencies
- [ ] Dynamic imports for heavy components
- [ ] Tree-shakeable imports throughout

**Tasks**:

**1. Analyze Current Bundle**:
```bash
ANALYZE=true npm run build
# Check .next/analyze/client.html
```

**2. Optimize Lodash Imports**:
```typescript
// Before
import _ from 'lodash';
const debounced = _.debounce(fn, 300);

// After
import debounce from 'lodash/debounce';
const debounced = debounce(fn, 300);
```

**3. Add Dynamic Imports**:
```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
```

**4. Remove Unused Dependencies**:
```bash
npm prune
npx depcheck
```

**Components to Optimize**:
- Charts (recharts)
- 3D visualizations (three.js)
- Rich text editors
- Below-the-fold sections

**Testing**:
```bash
npm run build
# Compare "First Load JS" before and after
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 3.3)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 1.3)

---

### Issue #4: SEO Meta Tags - Complete Metadata

**Priority**: 🟡 P1
**Labels**: `seo`, `enhancement`, `sprint-1`
**Effort**: 2-3 hours
**Assignee**: Frontend Dev

**Description**:
Add complete metadata to all pages including Open Graph and Twitter Card tags.

**Current State**:
- Inconsistent metadata across pages
- Missing Open Graph tags
- No Twitter Card tags
- Missing OG images

**Acceptance Criteria**:
- [ ] All pages have complete metadata
- [ ] Open Graph tags validate
- [ ] Twitter cards validate
- [ ] OG images created (1200x630)
- [ ] Twitter images created (1200x600)

**Pages to Update**:
```
app/dashboard/page.tsx
app/onboarding/page.tsx
app/intelligence/page.tsx
app/signup/page.tsx
app/landing/page.tsx
```

**Template**:
```typescript
export const metadata: Metadata = {
  title: 'Dashboard | DealershipAI',
  description: 'Monitor your AI visibility across ChatGPT, Gemini, and Google AI Overviews.',
  keywords: ['dealership', 'AI visibility', 'analytics'],
  openGraph: {
    title: 'Dashboard | DealershipAI',
    description: 'Monitor your AI visibility',
    images: ['/og-dashboard.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | DealershipAI',
    description: 'Monitor your AI visibility',
    images: ['/twitter-dashboard.png'],
  },
};
```

**Testing**:
```bash
# Validate Open Graph
# https://www.opengraph.xyz/

# Validate Twitter Cards
# https://cards-dev.twitter.com/validator
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 7.1)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 1.4)

---

### Issue #5: Component Organization - Feature-Based Structure

**Priority**: 🟡 P1
**Labels**: `refactor`, `organization`, `sprint-1`
**Effort**: 4-6 hours
**Assignee**: Frontend Dev

**Description**:
Reorganize 160+ components from flat structure to feature-based organization for better maintainability.

**Current State**:
```
components/
├── Component1.tsx
├── Component2.tsx
├── ... (160+ files in one directory)
```

**Target State**:
```
components/
├── features/
│   ├── dashboard/
│   ├── landing/
│   └── onboarding/
├── shared/
│   ├── ui/
│   ├── layouts/
│   └── hooks/
└── lib/
```

**Acceptance Criteria**:
- [ ] Clear feature-based organization
- [ ] No broken imports
- [ ] All pages still work
- [ ] Easier to find components
- [ ] Organization documented in README

**Migration Steps**:
1. Create new directory structure
2. Move components to appropriate directories
3. Update all import paths
4. Test all pages
5. Update documentation

**Testing**:
```bash
# Ensure no broken imports
npm run build

# Test all pages load
npm run dev
# Visit each page manually
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 1.1)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 1.5)

---

## 🎯 Sprint 2: Quality & Performance

### Issue #6: Test Coverage - Unit & Integration Tests

**Priority**: 🟡 P1
**Labels**: `testing`, `quality`, `sprint-2`
**Effort**: 8-10 hours
**Assignee**: Frontend Dev + QA

**Description**:
Increase test coverage from ~10% to 50%+ by adding unit and integration tests.

**Current State**:
- ~10% test coverage
- Limited test files
- No test infrastructure

**Acceptance Criteria**:
- [ ] Test coverage > 50%
- [ ] All critical components tested
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] CI/CD runs tests automatically
- [ ] No failing tests

**Setup**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest @testing-library/user-event
```

**Test Example**:
```typescript
// components/__tests__/AhaResults.test.tsx
import { render, screen } from '@testing-library/react';
import { AhaResults } from '../AhaResults';

describe('AhaResults', () => {
  it('displays dealer score correctly', () => {
    const mockData = { score: 64, /* ... */ };
    render(<AhaResults data={mockData} onSignup={() => {}} />);
    expect(screen.getByText('64/100')).toBeInTheDocument();
  });
});
```

**Test Priorities**:
1. Critical components (landing, dashboard)
2. Utility functions
3. API routes (integration tests)
4. E2E flows (Playwright)

**Testing**:
```bash
npm test
npm test -- --coverage
npx playwright test
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 8.1)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 2.1)

---

### Issue #7: Component Refactoring - Break Down Large Files

**Priority**: 🟢 P2
**Labels**: `refactor`, `maintainability`, `sprint-2`
**Effort**: 6-8 hours
**Assignee**: Frontend Dev

**Description**:
Break down large components (1000+ lines) into smaller, testable, maintainable modules.

**Target Components**:
- `SimplifiedLandingPage.tsx` (1000+ lines) → 4 sections
- `TabbedDashboard.tsx` (large) → Tab components
- `DealershipAIDashboardLA.tsx` (600+ lines) → Metric cards

**Acceptance Criteria**:
- [ ] No component > 300 lines
- [ ] Logic extracted to custom hooks
- [ ] Easier to test individual sections
- [ ] Improved readability
- [ ] Better code reuse

**Pattern**:
```typescript
// Before: SimplifiedLandingPage.tsx (1000 lines)
export function SimplifiedLandingPage() {
  // All logic and UI in one massive file
}

// After: Modular structure
export function SimplifiedLandingPage() {
  return (
    <>
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingFAQ />
    </>
  );
}
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 13.2)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 2.2)

---

### Issue #8: Performance Monitoring - Lighthouse CI

**Priority**: 🟢 P2
**Labels**: `performance`, `monitoring`, `sprint-2`
**Effort**: 3-4 hours
**Assignee**: DevOps + Frontend

**Description**:
Set up automated performance monitoring with Lighthouse CI and performance budgets.

**Acceptance Criteria**:
- [ ] Lighthouse runs on every PR
- [ ] Performance budgets enforced
- [ ] Real user monitoring (RUM) set up
- [ ] Performance dashboard created
- [ ] Alerts for regressions

**Implementation**:
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
```

**Performance Budgets**:
```json
{
  "budgets": [{
    "path": "/*",
    "timings": [{
      "metric": "first-contentful-paint",
      "budget": 2000
    }]
  }]
}
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 12)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 2.3)

---

### Issue #9: Code Splitting - Dynamic Imports

**Priority**: 🟢 P2
**Labels**: `performance`, `optimization`, `sprint-2`
**Effort**: 2-3 hours
**Assignee**: Frontend Dev

**Description**:
Implement dynamic imports for heavy components to reduce initial bundle size.

**Acceptance Criteria**:
- [ ] Initial bundle reduced by 20%
- [ ] Time to Interactive < 3.8s
- [ ] Proper loading states
- [ ] No performance regressions

**Components to Optimize**:
- Charts (recharts)
- 3D visualizations (three.js)
- Rich text editors
- Image galleries
- Below-the-fold content

**Implementation**:
```typescript
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(() => import('./AnalyticsChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 3.2)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 2.4)

---

### Issue #10: Client/Server Optimization - Proper SSR Usage

**Priority**: 🟢 P2
**Labels**: `performance`, `optimization`, `sprint-2`
**Effort**: 6-8 hours
**Assignee**: Frontend Dev

**Description**:
Optimize client/server component split to reduce client bundle and improve performance.

**Acceptance Criteria**:
- [ ] Minimal 'use client' directives
- [ ] Data fetching on server
- [ ] Smaller client bundle
- [ ] Faster hydration
- [ ] No performance regressions

**Pattern**:
```typescript
// Server Component (default)
export default async function DashboardPage() {
  const data = await fetchDashboardData();
  return <DashboardClient data={data} />;
}

// Client Component
'use client';
export function DashboardClient({ data }) {
  const [state, setState] = useState();
  return <InteractiveContent />;
}
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 2.1)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 2.5)

---

## 🔄 Sprint 3: Polish & Documentation

### Issue #11: Dependency Updates & Security Audit

**Priority**: 🔵 P3
**Labels**: `maintenance`, `security`, `sprint-3`
**Effort**: 1-2 hours
**Assignee**: Frontend Dev

**Description**:
Update dependencies and fix security vulnerabilities.

**Acceptance Criteria**:
- [ ] All dependencies up-to-date
- [ ] No critical vulnerabilities
- [ ] App still functions correctly

**Commands**:
```bash
npm outdated
npm update
npm audit
npm audit fix
npm prune
npx depcheck
npm run build && npm test
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 9.1)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 3.1)

---

### Issue #12: Component Documentation

**Priority**: 🔵 P3
**Labels**: `documentation`, `developer-experience`, `sprint-3`
**Effort**: 4-6 hours
**Assignee**: Frontend Dev

**Description**:
Create comprehensive documentation for all major components.

**Acceptance Criteria**:
- [ ] All major components documented
- [ ] README updated
- [ ] Testing guide created
- [ ] Contributing guide created

**Template**:
```typescript
/**
 * AhaResults Component
 *
 * @param data - Dealer data including score
 * @param onSignup - Callback when user clicks CTA
 *
 * @example
 * <AhaResults data={{...}} onSignup={() => {}} />
 */
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 3.2)

---

### Issue #13: Keyboard Navigation Enhancement

**Priority**: 🟢 P2
**Labels**: `accessibility`, `ux`, `sprint-3`
**Effort**: 3-4 hours
**Assignee**: Frontend Dev

**Description**:
Implement comprehensive keyboard navigation and shortcuts.

**Acceptance Criteria**:
- [ ] All modals trap focus
- [ ] Keyboard shortcuts work
- [ ] Logical tab order
- [ ] Shortcuts documented

**Implementation**:
```typescript
// Focus trap
import FocusTrap from 'focus-trap-react';

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') openSearch();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 4.2)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 3.3)

---

### Issue #14: Color Contrast & Screen Reader Support

**Priority**: 🟢 P2
**Labels**: `accessibility`, `compliance`, `sprint-3`
**Effort**: 2-3 hours
**Assignee**: Frontend Dev

**Description**:
Fix color contrast issues and enhance screen reader support for WCAG AA compliance.

**Acceptance Criteria**:
- [ ] WCAG AA compliant
- [ ] All contrast ratios > 4.5:1
- [ ] Screen reader announces updates
- [ ] Alternative text for visuals

**Implementation**:
```typescript
// aria-live regions
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Alternative text for charts
<div role="img" aria-label="Bar chart showing 64/100 score">
  <BarChart data={data} />
</div>
```

**Testing**:
```bash
# Install axe DevTools
# Run contrast audit
# Test with screen reader
```

**Related**:
- Audit Report: COMPREHENSIVE_AUDIT_REPORT.md (Section 4.3, 4.4)
- Roadmap: FRONTEND_IMPROVEMENT_ROADMAP.md (Task 3.4)

---

## 📊 Issue Management

### Labels to Create
```
performance
accessibility
testing
refactor
documentation
security
enhancement
optimization
maintenance
ux
compliance
sprint-1
sprint-2
sprint-3
P0
P1
P2
P3
```

### Milestones to Create
- Sprint 1: Critical Fixes (Week 1)
- Sprint 2: Quality & Performance (Week 2)
- Sprint 3: Polish & Documentation (Week 3)

### Project Board Columns
1. 📋 Backlog
2. 🚀 Sprint 1
3. 🎯 Sprint 2
4. 🔄 Sprint 3
5. 👀 In Review
6. ✅ Done

---

**Template Version**: 1.0
**Last Updated**: November 3, 2025
**Total Issues**: 14
