### CTA Fix Recommendations for `https://www.dealershipai.com/`

- **Issue: Clerk backdrop intercepts clicks**
  - Symptom: Clicks on `SignUpButton` CTAs time out because a `div.cl-modalBackdrop` from a prior/initial Clerk portal intercepts pointer events.
  - Recommendation:
    - Ensure Clerk modal is not mounted by default. Render the portal only upon interaction.
    - When opening a Clerk modal, add a close on route change and ensure backdrop is removed on unmount.
    - Defer Clerk initialization until after hydration using lazy loading.
    - Add `pointer-events-none` to hidden/inactive Clerk portal container; toggle to `auto` only when modal is open.

- **Issue: Top Nav "Sign In" button not opening modal**
  - Symptom: No modal or redirect detected on click.
  - Recommendation:
    - Replace raw button with Clerk `SignInButton` or ensure `onClick` calls Clerk's `openSignIn()` with correct publishable key.
    - Verify `data-clerk-js-script` finishes loading before binding click handlers (await Clerk loaded event).

- **Issue: Hero "Scan Now" disabled until URL input**
  - Symptom: Button remains disabled; ensure enablement logic toggles after valid input.
  - Recommendation:
    - Validate input with permissive URL regex and enable button as user types; avoid requiring full network validation before enabling.

- **Hardening**
  - Gate all CTA clicks behind a single `startSignupFlow()` that safely ensures Clerk is ready, closes any existing portal, then opens sign-in/up.
  - Add E2E tests with Playwright for CTA flows (selectors used in `scripts/cta_audit.py`).

This file summarizes live audit findings and practical fixes for CTA reliability.
