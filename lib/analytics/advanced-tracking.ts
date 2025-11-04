'use client';

interface ScrollDepth {
  depth: number;
  timestamp: number;
}

interface HeatmapClick {
  x: number;
  y: number;
  element: string;
  timestamp: number;
}

interface FunnelStep {
  step: string;
  timestamp: number;
  data?: Record<string, any>;
}

class AdvancedAnalytics {
  private scrollDepths: ScrollDepth[] = [];
  private heatmapClicks: HeatmapClick[] = [];
  private funnelSteps: FunnelStep[] = [];
  private maxScroll = 0;
  private sessionStart = Date.now();

  init() {
    // Only initialize on client side
    if (typeof window === 'undefined') return;
    
    this.trackScrollDepth();
    this.trackHeatmap();
    this.trackFunnel();
    this.trackPageView();
  }

  private trackScrollDepth() {
    let ticking = false;
    const depths = [25, 50, 75, 90, 100];
    const trackedDepths = new Set<number>();

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = Math.round((scrollTop / docHeight) * 100);

          if (scrollPercent > this.maxScroll) {
            this.maxScroll = scrollPercent;

            // Track milestone depths
            depths.forEach(depth => {
              if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                trackedDepths.add(depth);
                this.recordScrollDepth(depth);
                
                // Send to analytics
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'scroll_depth', {
                    depth: `${depth}%`,
                    max_scroll: scrollPercent
                  });
                }
              }
            });
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private recordScrollDepth(depth: number) {
    this.scrollDepths.push({
      depth,
      timestamp: Date.now()
    });
  }

  private trackHeatmap() {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.tagName + (target.className ? '.' + target.className.split(' ')[0] : '');
      
      const click: HeatmapClick = {
        x: e.clientX,
        y: e.clientY,
        element: element.substring(0, 50), // Limit length
        timestamp: Date.now()
      };

      this.heatmapClicks.push(click);

      // Send to analytics (throttled)
      if (this.heatmapClicks.length % 10 === 0) {
        this.sendHeatmapData();
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
  }

  private sendHeatmapData() {
    // In production, send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'heatmap_click', {
        total_clicks: this.heatmapClicks.length,
        session_duration: Date.now() - this.sessionStart
      });
    }
  }

  private trackFunnel() {
    // Track key conversion steps
    const steps = [
      'landing_view',
      'hero_interaction',
      'form_start',
      'form_submit',
      'results_view',
      'pricing_view',
      'cta_click'
    ];

    // Track when user reaches each section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const stepName = entry.target.getAttribute('data-funnel-step');
            if (stepName && steps.includes(stepName)) {
              this.recordFunnelStep(stepName);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe sections with data-funnel-step attribute
    setTimeout(() => {
      document.querySelectorAll('[data-funnel-step]').forEach(el => {
        observer.observe(el);
      });
    }, 1000);
  }

  recordFunnelStep(step: string, data?: Record<string, any>) {
    this.funnelSteps.push({
      step,
      timestamp: Date.now(),
      data
    });

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'funnel_step', {
        step_name: step,
        step_number: this.funnelSteps.length,
        ...data
      });
    }
  }

  private trackPageView() {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        timestamp: Date.now()
      });
    }
  }

  getScrollData() {
    return {
      maxScroll: this.maxScroll,
      depths: this.scrollDepths,
      averageDepth: this.scrollDepths.length > 0
        ? this.scrollDepths.reduce((sum, d) => sum + d.depth, 0) / this.scrollDepths.length
        : 0
    };
  }

  getHeatmapData() {
    return {
      clicks: this.heatmapClicks,
      totalClicks: this.heatmapClicks.length,
      clickRate: this.heatmapClicks.length / (Date.now() - this.sessionStart) * 1000 // clicks per second
    };
  }

  getFunnelData() {
    return {
      steps: this.funnelSteps,
      completionRate: this.funnelSteps.length > 0
        ? (this.funnelSteps.filter(s => s.step === 'cta_click').length / this.funnelSteps.length) * 100
        : 0
    };
  }

  getSessionSummary() {
    return {
      duration: Date.now() - this.sessionStart,
      maxScroll: this.maxScroll,
      totalClicks: this.heatmapClicks.length,
      funnelSteps: this.funnelSteps.length,
      completionRate: this.getFunnelData().completionRate
    };
  }
}

export const advancedAnalytics = new AdvancedAnalytics();

