# DealershipAI E2E Tests

Playwright tests for the landing page "Inevitable Experience" flow.

## Quick Start

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui

# Run specific test
npx playwright test landing-page.spec.ts
```

## Test Coverage

### Landing Page Flow Tests

1. **Boot Line** - Page initialization and branding
2. **Domain Prompt** - Input validation and interaction
3. **Deck Actions** - Analysis trigger and loading states
4. **Toast Events** - Success, error, and info notifications
5. **Results Display** - Analysis results and actionable elements
6. **Pulse Events** - Live activity indicators
7. **Full Flow** - End-to-end boot to results
8. **Toast Auto-Dismiss** - Notification lifecycle
9. **Mobile Responsiveness** - Mobile viewport testing
10. **Accessibility** - Keyboard navigation and screen reader support

## Configuration

Set `PLAYWRIGHT_TEST_BASE_URL` environment variable to test against different environments:

```bash
# Local development
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npm run test:e2e

# Preview deployment
PLAYWRIGHT_TEST_BASE_URL=https://preview-url.vercel.app npm run test:e2e

# Production
PLAYWRIGHT_TEST_BASE_URL=https://dealershipai.com npm run test:e2e
```

## Test Structure

Tests are organized by user flow:
- **Boot Line**: Initial page load and setup
- **Prompt**: Domain input and validation
- **Deck Actions**: Interactive elements and triggers
- **Toast/Pulse**: Event notifications and live updates

## CI/CD Integration

Tests run automatically on:
- Pull requests (via GitHub Actions)
- Pre-deployment (Vercel preview)
- Production deployments (smoke tests)

## Debugging

```bash
# Run with debug mode
DEBUG=pw:api npx playwright test

# Run with headed browser
npx playwright test --headed

# Generate trace viewer
npx playwright show-trace trace.zip
```

