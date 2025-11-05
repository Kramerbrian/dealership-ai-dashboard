/**
 * CTA Performance Optimizer
 * 
 * Implements advanced performance optimizations for CTAs:
 * - Intersection Observer for lazy tracking
 * - RequestAnimationFrame for smooth animations
 * - Debouncing for scroll events
 * - Prefetching for likely next actions
 */

interface CTAElement extends HTMLElement {
  dataset: DOMStringMap & {
    ctaId?: string;
    ctaVariant?: string;
  };
}

/**
 * Lazy load CTA tracking when element enters viewport
 */
export function initLazyCTATracking() {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as CTAElement;
          const ctaId = element.dataset.ctaId;
          const variant = element.dataset.ctaVariant || 'default';

          if (ctaId && typeof window !== 'undefined') {
            // Import and track impression
            import('../analytics/cta-tracking').then(({ ctaTracker }) => {
              ctaTracker.trackImpression(ctaId, variant);
            });
          }

          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: '50px', // Start tracking 50px before element is visible
      threshold: 0.1,
    }
  );

  // Observe all CTAs
  document.querySelectorAll('[data-cta-id]').forEach((el) => {
    observer.observe(el);
  });

  return observer;
}

/**
 * Prefetch likely next actions
 */
export function prefetchNextActions() {
  if (typeof window === 'undefined') return;

  // Prefetch onboarding page for free tier
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = '/onboarding?tier=free';
  document.head.appendChild(link);

  // Prefetch signup page
  const signupLink = document.createElement('link');
  signupLink.rel = 'prefetch';
  signupLink.href = '/signup';
  document.head.appendChild(signupLink);
}

/**
 * Debounce scroll events for performance
 */
export function debounceScrollTracking(
  callback: () => void,
  delay: number = 100
): () => void {
  let timeoutId: NodeJS.Timeout;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
}

/**
 * Track scroll depth with RAF for smooth performance
 */
export function trackScrollDepthSmooth(
  callback: (depth: number) => void
): () => void {
  let ticking = false;
  let lastDepth = 0;

  const update = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const depth = (scrollTop / docHeight) * 100;

    if (Math.abs(depth - lastDepth) > 1) {
      callback(depth);
      lastDepth = depth;
    }

    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });

  return () => {
    window.removeEventListener('scroll', requestTick);
  };
}

/**
 * Optimize button click performance
 */
export function optimizeButtonClick(element: HTMLElement) {
  // Add touch-action for better mobile performance
  element.style.touchAction = 'manipulation';

  // Use passive event listeners where possible
  element.addEventListener('click', (e) => {
    // Prevent double-clicks
    if (element.hasAttribute('data-clicked')) {
      e.preventDefault();
      return;
    }

    element.setAttribute('data-clicked', 'true');
    setTimeout(() => {
      element.removeAttribute('data-clicked');
    }, 500);
  });
}

/**
 * Initialize all performance optimizations
 */
export function initCTAPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Lazy tracking
  initLazyCTATracking();

  // Prefetch likely actions
  prefetchNextActions();

  // Optimize all CTAs
  document.querySelectorAll('button[data-cta-id], a[data-cta-id]').forEach((el) => {
    optimizeButtonClick(el as HTMLElement);
  });

  // Track scroll depth smoothly
  trackScrollDepthSmooth((depth) => {
    // Update all visible CTAs with scroll depth
    document.querySelectorAll('[data-cta-id]').forEach((el) => {
      const element = el as CTAElement;
      if (element.dataset.ctaId) {
        import('../analytics/cta-tracking').then(({ ctaTracker }) => {
          ctaTracker.trackScrollDepth(
            element.dataset.ctaId!,
            element.dataset.ctaVariant || 'default',
            depth
          );
        });
      }
    });
  });
}

