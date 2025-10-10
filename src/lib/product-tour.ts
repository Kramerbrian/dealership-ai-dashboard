/**
 * Guided Product Tour System
 * 
 * Interactive onboarding and feature discovery system:
 * - Step-by-step guided tours
 * - Feature highlighting
 * - Interactive tooltips
 * - Progress tracking
 * - Customizable tour flows
 */

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector or element ID
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'focus' | 'none';
  highlight?: boolean;
  skipable?: boolean;
  required?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  skipButtonText?: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  category: 'onboarding' | 'feature' | 'advanced' | 'custom';
  steps: TourStep[];
  estimatedDuration: number; // minutes
  prerequisites?: string[];
  targetAudience: 'new_user' | 'existing_user' | 'admin' | 'all';
  isActive: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface TourProgress {
  tourId: string;
  userId: string;
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  startedAt: string;
  completedAt?: string;
  totalTime: number; // seconds
  isCompleted: boolean;
}

export interface TourAnalytics {
  tourId: string;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  averageTime: number;
  dropOffPoints: Record<number, number>;
  userFeedback: {
    rating: number;
    comments: string[];
  };
}

export class ProductTourManager {
  private tours: Map<string, Tour> = new Map();
  private currentTour: Tour | null = null;
  private currentStepIndex: number = 0;
  private progress: TourProgress | null = null;
  private isActive: boolean = false;

  constructor() {
    this.initializeDefaultTours();
  }

  /**
   * Initialize default tours
   */
  private initializeDefaultTours(): void {
    const defaultTours = this.getDefaultTours();
    defaultTours.forEach(tour => {
      this.tours.set(tour.id, tour);
    });
  }

  /**
   * Get default tour configurations
   */
  private getDefaultTours(): Tour[] {
    return [
      {
        id: 'onboarding-welcome',
        name: 'Welcome to DealershipAI',
        description: 'Get started with your AI-powered dealership analytics platform',
        category: 'onboarding',
        targetAudience: 'new_user',
        estimatedDuration: 5,
        isActive: true,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        steps: [
          {
            id: 'welcome-step-1',
            title: 'Welcome to DealershipAI!',
            content: 'Welcome to the most advanced AI-powered dealership analytics platform. Let\'s take a quick tour to show you the key features.',
            target: 'body',
            position: 'center',
            action: 'none',
            highlight: false,
            skipable: true,
            nextButtonText: 'Start Tour',
            skipButtonText: 'Skip Tour',
          },
          {
            id: 'dashboard-overview',
            title: 'Dashboard Overview',
            content: 'This is your main dashboard where you can see all your key metrics at a glance. Revenue at risk, AI visibility scores, and monthly leads are displayed here.',
            target: '[data-tour="dashboard-overview"]',
            position: 'bottom',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
          {
            id: 'ai-visibility-metrics',
            title: 'AI Visibility Metrics',
            content: 'Your AI visibility score shows how well your dealership appears in AI search results across platforms like ChatGPT, Claude, and Perplexity.',
            target: '[data-tour="ai-visibility"]',
            position: 'right',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
          {
            id: 'revenue-at-risk',
            title: 'Revenue at Risk',
            content: 'This metric shows the estimated monthly revenue you might be losing due to poor AI visibility. Higher scores mean more opportunities.',
            target: '[data-tour="revenue-at-risk"]',
            position: 'left',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
          {
            id: 'navigation-menu',
            title: 'Navigation Menu',
            content: 'Use this navigation menu to access different sections of the platform. Each section provides specific insights and tools.',
            target: '[data-tour="navigation"]',
            position: 'right',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
          {
            id: 'tour-complete',
            title: 'Tour Complete!',
            content: 'Congratulations! You\'ve completed the welcome tour. You can now explore the platform or take additional feature tours.',
            target: 'body',
            position: 'center',
            action: 'none',
            highlight: false,
            skipable: false,
            nextButtonText: 'Start Exploring',
          },
        ],
      },
      {
        id: 'feature-ai-insights',
        name: 'AI Insights Deep Dive',
        description: 'Learn how to use AI insights to improve your dealership performance',
        category: 'feature',
        targetAudience: 'existing_user',
        estimatedDuration: 8,
        isActive: true,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        steps: [
          {
            id: 'ai-insights-intro',
            title: 'AI Insights Overview',
            content: 'AI Insights provide predictive analytics and recommendations to help you optimize your dealership performance.',
            target: '[data-tour="ai-insights"]',
            position: 'bottom',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
          },
          {
            id: 'predictive-analytics',
            title: 'Predictive Analytics',
            content: 'View revenue forecasts, market trends, and customer behavior predictions to make data-driven decisions.',
            target: '[data-tour="predictive-analytics"]',
            position: 'right',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
          {
            id: 'recommendations',
            title: 'AI Recommendations',
            content: 'Get personalized recommendations for improving your AI visibility and increasing revenue.',
            target: '[data-tour="recommendations"]',
            position: 'left',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
        ],
      },
      {
        id: 'feature-whatif-simulator',
        name: 'What-If Simulator',
        description: 'Learn how to use the scenario planning simulator',
        category: 'feature',
        targetAudience: 'existing_user',
        estimatedDuration: 6,
        isActive: true,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        steps: [
          {
            id: 'simulator-intro',
            title: 'What-If Simulator',
            content: 'The What-If Simulator lets you test different scenarios and see their potential impact on your business.',
            target: '[data-tour="whatif-simulator"]',
            position: 'bottom',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
          },
          {
            id: 'create-scenario',
            title: 'Create Scenario',
            content: 'Click here to create a new scenario. You can simulate revenue changes, market conditions, and strategic decisions.',
            target: '[data-tour="create-scenario"]',
            position: 'right',
            action: 'click',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
          {
            id: 'scenario-templates',
            title: 'Scenario Templates',
            content: 'Use pre-built templates for common scenarios like revenue growth, market expansion, or digital transformation.',
            target: '[data-tour="scenario-templates"]',
            position: 'left',
            action: 'hover',
            highlight: true,
            skipable: true,
            nextButtonText: 'Next',
            prevButtonText: 'Previous',
          },
        ],
      },
    ];
  }

  /**
   * Start a tour
   */
  async startTour(tourId: string, userId: string): Promise<boolean> {
    const tour = this.tours.get(tourId);
    if (!tour || !tour.isActive) {
      return false;
    }

    this.currentTour = tour;
    this.currentStepIndex = 0;
    this.isActive = true;

    // Initialize progress tracking
    this.progress = {
      tourId,
      userId,
      currentStep: 0,
      completedSteps: [],
      skippedSteps: [],
      startedAt: new Date().toISOString(),
      totalTime: 0,
      isCompleted: false,
    };

    // Show first step
    await this.showStep(0);

    return true;
  }

  /**
   * Show a specific step
   */
  private async showStep(stepIndex: number): Promise<void> {
    if (!this.currentTour || stepIndex >= this.currentTour.steps.length) {
      return;
    }

    const step = this.currentTour.steps[stepIndex];
    this.currentStepIndex = stepIndex;

    if (this.progress) {
      this.progress.currentStep = stepIndex;
    }

    // Create and show tour overlay
    await this.createTourOverlay(step);
  }

  /**
   * Create tour overlay
   */
  private async createTourOverlay(step: TourStep): Promise<void> {
    // Remove existing overlay
    this.removeTourOverlay();

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'tour-overlay';
    overlay.className = 'tour-overlay';

    // Create highlight element
    const highlight = document.createElement('div');
    highlight.id = 'tour-highlight';
    highlight.className = 'tour-highlight';

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'tour-tooltip';
    tooltip.className = 'tour-tooltip';
    tooltip.innerHTML = this.createTooltipContent(step);

    // Add to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(highlight);
    document.body.appendChild(tooltip);

    // Position elements
    this.positionElements(step);

    // Add event listeners
    this.addEventListeners(step);
  }

  /**
   * Create tooltip content
   */
  private createTooltipContent(step: TourStep): string {
    const isFirstStep = this.currentStepIndex === 0;
    const isLastStep = this.currentStepIndex === (this.currentTour?.steps.length || 0) - 1;

    return `
      <div class="tour-tooltip-content">
        <div class="tour-tooltip-header">
          <h3>${step.title}</h3>
          ${step.skipable && !isLastStep ? '<button class="tour-skip-btn">Skip</button>' : ''}
        </div>
        <div class="tour-tooltip-body">
          <p>${step.content}</p>
        </div>
        <div class="tour-tooltip-footer">
          <div class="tour-progress">
            Step ${this.currentStepIndex + 1} of ${this.currentTour?.steps.length || 0}
          </div>
          <div class="tour-buttons">
            ${!isFirstStep ? `<button class="tour-prev-btn">${step.prevButtonText || 'Previous'}</button>` : ''}
            <button class="tour-next-btn">${step.nextButtonText || (isLastStep ? 'Complete' : 'Next')}</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Position tour elements
   */
  private positionElements(step: TourStep): void {
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const overlay = document.getElementById('tour-overlay');
    const highlight = document.getElementById('tour-highlight');
    const tooltip = document.getElementById('tour-tooltip');

    if (!overlay || !highlight || !tooltip) return;

    // Position overlay to cover entire screen
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      pointer-events: none;
    `;

    // Position highlight around target element
    if (step.highlight) {
      highlight.style.cssText = `
        position: fixed;
        top: ${targetRect.top - 4}px;
        left: ${targetRect.left - 4}px;
        width: ${targetRect.width + 8}px;
        height: ${targetRect.height + 8}px;
        border: 2px solid #3b82f6;
        border-radius: 8px;
        background: transparent;
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      `;
    }

    // Position tooltip
    this.positionTooltip(tooltip, targetRect, step.position);
  }

  /**
   * Position tooltip relative to target
   */
  private positionTooltip(tooltip: HTMLElement, targetRect: DOMRect, position: string): void {
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 16;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - margin;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - margin;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + margin;
        break;
      case 'center':
        top = (window.innerHeight - tooltipRect.height) / 2;
        left = (window.innerWidth - tooltipRect.width) / 2;
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

    tooltip.style.cssText = `
      position: fixed;
      top: ${top}px;
      left: ${left}px;
      z-index: 10000;
      pointer-events: auto;
    `;
  }

  /**
   * Add event listeners
   */
  private addEventListeners(step: TourStep): void {
    // Next button
    const nextBtn = document.querySelector('.tour-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    // Previous button
    const prevBtn = document.querySelector('.tour-prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousStep());
    }

    // Skip button
    const skipBtn = document.querySelector('.tour-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.skipTour());
    }

    // Target element interaction
    if (step.action && step.action !== 'none') {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.addEventListener(step.action, () => this.nextStep(), { once: true });
      }
    }
  }

  /**
   * Go to next step
   */
  async nextStep(): Promise<void> {
    if (!this.currentTour || !this.progress) return;

    // Mark current step as completed
    this.progress.completedSteps.push(this.currentStepIndex);

    // Check if tour is complete
    if (this.currentStepIndex >= this.currentTour.steps.length - 1) {
      await this.completeTour();
      return;
    }

    // Show next step
    await this.showStep(this.currentStepIndex + 1);
  }

  /**
   * Go to previous step
   */
  async previousStep(): Promise<void> {
    if (this.currentStepIndex > 0) {
      await this.showStep(this.currentStepIndex - 1);
    }
  }

  /**
   * Skip current tour
   */
  async skipTour(): Promise<void> {
    if (this.progress) {
      this.progress.skippedSteps.push(this.currentStepIndex);
      this.progress.completedAt = new Date().toISOString();
      this.progress.isCompleted = false;
    }

    this.endTour();
  }

  /**
   * Complete tour
   */
  async completeTour(): Promise<void> {
    if (this.progress) {
      this.progress.completedAt = new Date().toISOString();
      this.progress.isCompleted = true;
      this.progress.totalTime = Math.floor(
        (new Date().getTime() - new Date(this.progress.startedAt).getTime()) / 1000
      );
    }

    this.endTour();
  }

  /**
   * End current tour
   */
  private endTour(): void {
    this.removeTourOverlay();
    this.isActive = false;
    this.currentTour = null;
    this.currentStepIndex = 0;
  }

  /**
   * Remove tour overlay
   */
  private removeTourOverlay(): void {
    const overlay = document.getElementById('tour-overlay');
    const highlight = document.getElementById('tour-highlight');
    const tooltip = document.getElementById('tour-tooltip');

    if (overlay) overlay.remove();
    if (highlight) highlight.remove();
    if (tooltip) tooltip.remove();
  }

  /**
   * Get available tours
   */
  getAvailableTours(userType: string = 'all'): Tour[] {
    return Array.from(this.tours.values()).filter(tour => 
      tour.isActive && (tour.targetAudience === 'all' || tour.targetAudience === userType)
    );
  }

  /**
   * Get tour by ID
   */
  getTour(tourId: string): Tour | undefined {
    return this.tours.get(tourId);
  }

  /**
   * Check if tour is currently active
   */
  isTourActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current tour progress
   */
  getCurrentProgress(): TourProgress | null {
    return this.progress;
  }

  /**
   * Create custom tour
   */
  createCustomTour(tour: Omit<Tour, 'id' | 'created_at' | 'updated_at'>): Tour {
    const newTour: Tour = {
      ...tour,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.tours.set(newTour.id, newTour);
    return newTour;
  }

  /**
   * Update tour
   */
  updateTour(tourId: string, updates: Partial<Tour>): boolean {
    const tour = this.tours.get(tourId);
    if (!tour) return false;

    const updatedTour = {
      ...tour,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.tours.set(tourId, updatedTour);
    return true;
  }

  /**
   * Delete tour
   */
  deleteTour(tourId: string): boolean {
    return this.tours.delete(tourId);
  }
}

// Export singleton instance
export const productTourManager = new ProductTourManager();
