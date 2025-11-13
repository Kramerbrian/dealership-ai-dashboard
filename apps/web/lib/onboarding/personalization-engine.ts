/**
 * Onboarding Personalization Engine
 * Provides personalized messaging and coaching throughout the onboarding journey
 */

import { createClient } from '@supabase/supabase-js'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  estimatedTime: string
  isRequired: boolean
  isCompleted: boolean
  personalizedMessage?: string
  motivationalMessage?: string
  progressPercentage: number
}

export interface DealershipProfile {
  name: string
  domain: string
  location: {
    city: string
    state: string
    market: string
  }
  size: 'small' | 'medium' | 'large' | 'enterprise'
  brand: string
  competitors: string[]
  marketShare: number
  revenueAtRisk: number
  aiVisibility: number
}

export interface PersonalizedMessage {
  greeting: string
  motivation: string
  encouragement: string
  warning: string
  celebration: string
  nextStep: string
}

export class OnboardingPersonalizationEngine {
  private supabase: any
  private dealershipProfile: DealershipProfile | null = null

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  /**
   * Initialize dealership profile from domain
   */
  async initializeProfile(domain: string): Promise<DealershipProfile> {
    try {
      // Clean and normalize domain
      const cleanDomain = this.normalizeDomain(domain)
      
      // Get location data from Google Places API
      const locationData = await this.getLocationData(cleanDomain)
      
      // Get market analysis
      const marketData = await this.getMarketAnalysis(locationData)
      
      // Get competitor analysis
      const competitors = await this.getCompetitors(locationData)
      
      // Calculate initial metrics
      const metrics = await this.calculateInitialMetrics(cleanDomain)
      
      this.dealershipProfile = {
        name: locationData.businessName || this.extractBusinessName(cleanDomain),
        domain: cleanDomain,
        location: {
          city: locationData.city,
          state: locationData.state,
          market: marketData.marketName,
        },
        size: this.determineSize(metrics.revenueAtRisk),
        brand: this.extractBrand(cleanDomain),
        competitors,
        marketShare: marketData.marketShare,
        revenueAtRisk: metrics.revenueAtRisk,
        aiVisibility: metrics.aiVisibility,
      }

      return this.dealershipProfile
    } catch (error) {
      console.error('Error initializing profile:', error)
      // Return default profile
      return this.createDefaultProfile(domain)
    }
  }

  /**
   * Generate personalized messages based on current step and progress
   */
  generatePersonalizedMessages(step: OnboardingStep, progress: number): PersonalizedMessage {
    if (!this.dealershipProfile) {
      return this.getDefaultMessages()
    }

    const { location, competitors, revenueAtRisk, aiVisibility } = this.dealershipProfile
    const marketName = location.market || `${location.city}, ${location.state}`
    
    return {
      greeting: this.generateGreeting(),
      motivation: this.generateMotivation(step, progress),
      encouragement: this.generateEncouragement(step, progress, marketName),
      warning: this.generateWarning(competitors, revenueAtRisk),
      celebration: this.generateCelebration(step, progress),
      nextStep: this.generateNextStepMessage(step),
    }
  }

  /**
   * Generate step-specific motivational messages
   */
  generateStepMotivation(stepId: string, progress: number): string {
    const messages = {
      'domain-setup': [
        "You're just getting warmed up! This is where the magic begins.",
        "Every AI giant started with a single domain. Yours is next!",
        "Your competitors don't know what's coming. Let's show them.",
      ],
      'data-connection': [
        "You're connecting the dots that your competitors can't even see.",
        "This is where we separate the leaders from the followers.",
        "Your data is about to become your biggest competitive advantage.",
      ],
      'ai-optimization': [
        "You're about to dominate the AI landscape in your market.",
        "This is where we turn your dealership into an AI magnet.",
        "Your competitors are about to get a wake-up call.",
      ],
      'competitor-analysis': [
        "Knowledge is power, and you're about to have all of it.",
        "You're mapping out the battlefield while they're still sleeping.",
        "This intel will give you months of competitive advantage.",
      ],
      'go-live': [
        "You're ready to dominate the <market> market!",
        "The AI revolution starts now. You're leading it.",
        "Your competitors better hope they know about DealershipAI too!",
      ],
    }

    const stepMessages = messages[stepId as keyof typeof messages] || messages['domain-setup']
    const messageIndex = Math.floor(progress * stepMessages.length)
    return stepMessages[messageIndex] || stepMessages[0]
  }

  /**
   * Generate market-specific competitive messaging
   */
  generateCompetitiveMessage(marketName: string, competitors: string[]): string {
    const competitorNames = competitors.slice(0, 2).join(' and ')
    const messages = [
      `You're about to dominate the ${marketName} market. ${competitorNames} won't know what hit them.`,
      `The ${marketName} market is yours for the taking. Time to show ${competitorNames} how it's done.`,
      `While ${competitorNames} are still figuring out AI, you're about to own the ${marketName} market.`,
      `Your competitors in ${marketName} are about to get a masterclass in AI dominance.`,
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  /**
   * Generate urgency-based messaging
   */
  generateUrgencyMessage(revenueAtRisk: number, aiVisibility: number): string {
    if (revenueAtRisk > 50000) {
      return `You're losing $${(revenueAtRisk / 1000).toFixed(0)}K every month to AI invisibility. Let's fix that right now.`
    } else if (aiVisibility < 30) {
      return `With only ${aiVisibility}% AI visibility, you're missing out on massive opportunities. Time to change that.`
    } else {
      return `You're already ahead of most dealers, but we can make you unstoppable.`
    }
  }

  /**
   * Generate progress-based encouragement
   */
  generateProgressEncouragement(progress: number, stepName: string): string {
    if (progress < 0.25) {
      return `You're just getting started, but already making moves that will pay off for years.`
    } else if (progress < 0.5) {
      return `You're building momentum! Each step is getting you closer to market domination.`
    } else if (progress < 0.75) {
      return `You're in the zone! Your competitors are about to realize they're way behind.`
    } else if (progress < 1) {
      return `You're almost there! The finish line is in sight and victory is inevitable.`
    } else {
      return `You did it! You're now equipped to dominate the AI landscape. Game on!`
    }
  }

  // Private helper methods

  private normalizeDomain(domain: string): string {
    // Remove protocol and www if present
    let cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '')
    
    // Add www. prefix for consistency
    if (!cleanDomain.startsWith('www.')) {
      cleanDomain = `www.${cleanDomain}`
    }
    
    return cleanDomain
  }

  private async getLocationData(domain: string): Promise<any> {
    try {
      // In a real implementation, this would call Google Places API
      // For now, return mock data
      return {
        businessName: this.extractBusinessName(domain),
        city: 'Fort Myers',
        state: 'FL',
        address: '123 Main St, Fort Myers, FL 33901',
        phone: '(239) 555-0123',
        website: `https://${domain}`,
      }
    } catch (error) {
      console.error('Error getting location data:', error)
      return {
        businessName: this.extractBusinessName(domain),
        city: 'Unknown',
        state: 'Unknown',
      }
    }
  }

  private async getMarketAnalysis(locationData: any): Promise<any> {
    // Mock market analysis
    return {
      marketName: `${locationData.city} Automotive Market`,
      marketShare: Math.floor(Math.random() * 20) + 5,
      totalDealers: Math.floor(Math.random() * 50) + 20,
      averageRevenue: Math.floor(Math.random() * 2000000) + 500000,
    }
  }

  private async getCompetitors(locationData: any): Promise<string[]> {
    // Mock competitor data
    const competitors = [
      `${locationData.city} Toyota`,
      `${locationData.city} Honda`,
      `${locationData.city} Ford`,
      `${locationData.city} Chevrolet`,
      `${locationData.city} Nissan`,
    ]
    
    return competitors.slice(0, Math.floor(Math.random() * 3) + 2)
  }

  private async calculateInitialMetrics(domain: string): Promise<any> {
    // Mock metrics calculation
    return {
      revenueAtRisk: Math.floor(Math.random() * 100000) + 20000,
      aiVisibility: Math.floor(Math.random() * 40) + 20,
      monthlyLeads: Math.floor(Math.random() * 200) + 50,
      conversionRate: Math.random() * 0.1 + 0.05,
    }
  }

  private extractBusinessName(domain: string): string {
    const cleanDomain = domain.replace(/^www\./, '').replace(/\.com$/, '')
    return cleanDomain.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
  }

  private extractBrand(domain: string): string {
    const cleanDomain = domain.replace(/^www\./, '').replace(/\.com$/, '')
    const brandMap: Record<string, string> = {
      'toyota': 'Toyota',
      'honda': 'Honda',
      'ford': 'Ford',
      'chevrolet': 'Chevrolet',
      'nissan': 'Nissan',
      'bmw': 'BMW',
      'mercedes': 'Mercedes-Benz',
      'audi': 'Audi',
      'lexus': 'Lexus',
      'acura': 'Acura',
    }
    
    const brand = Object.keys(brandMap).find(key => 
      cleanDomain.toLowerCase().includes(key)
    )
    
    return brand ? brandMap[brand] : 'Multi-Brand'
  }

  private determineSize(revenueAtRisk: number): 'small' | 'medium' | 'large' | 'enterprise' {
    if (revenueAtRisk < 30000) return 'small'
    if (revenueAtRisk < 75000) return 'medium'
    if (revenueAtRisk < 150000) return 'large'
    return 'enterprise'
  }

  private createDefaultProfile(domain: string): DealershipProfile {
    return {
      name: this.extractBusinessName(domain),
      domain: this.normalizeDomain(domain),
      location: {
        city: 'Unknown',
        state: 'Unknown',
        market: 'Local Market',
      },
      size: 'medium',
      brand: this.extractBrand(domain),
      competitors: [],
      marketShare: 0,
      revenueAtRisk: 0,
      aiVisibility: 0,
    }
  }

  private generateGreeting(): string {
    const greetings = [
      "Welcome to the future of automotive retail!",
      "You're about to revolutionize your dealership!",
      "Let's turn your dealership into an AI powerhouse!",
      "Time to dominate the digital landscape!",
    ]
    
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  private generateMotivation(step: OnboardingStep, progress: number): string {
    return this.generateStepMotivation(step.id, progress)
  }

  private generateEncouragement(step: OnboardingStep, progress: number, marketName: string): string {
    const baseEncouragement = this.generateProgressEncouragement(progress, step.title)
    const competitiveMessage = this.generateCompetitiveMessage(marketName, this.dealershipProfile?.competitors || [])
    
    return `${baseEncouragement} ${competitiveMessage}`
  }

  private generateWarning(competitors: string[], revenueAtRisk: number): string {
    if (revenueAtRisk > 50000) {
      return `Every day you wait, you're losing potential customers to your competitors. Let's fix this now.`
    }
    
    if (competitors.length > 0) {
      return `Your competitors are already working on their AI strategy. Don't let them get ahead.`
    }
    
    return `The automotive industry is changing fast. Stay ahead of the curve.`
  }

  private generateCelebration(step: OnboardingStep, progress: number): string {
    if (progress >= 1) {
      return `🎉 Congratulations! You're now ready to dominate the AI landscape!`
    }
    
    const celebrations = [
      "🎯 Excellent work! You're building something amazing.",
      "🚀 You're on fire! Keep this momentum going.",
      "💪 Outstanding progress! Your competitors won't know what hit them.",
      "🔥 You're crushing it! The finish line is in sight.",
    ]
    
    return celebrations[Math.floor(Math.random() * celebrations.length)]
  }

  private generateNextStepMessage(step: OnboardingStep): string {
    const nextSteps: Record<string, string> = {
      'domain-setup': "Next up: Let's connect your data sources for maximum insights.",
      'data-connection': "Now let's optimize your AI visibility across all platforms.",
      'ai-optimization': "Time to analyze your competitors and find opportunities.",
      'competitor-analysis': "Almost there! Let's go live and start dominating.",
      'go-live': "You're all set! Time to start seeing results.",
    }
    
    return nextSteps[step.id] || "Let's keep moving forward!"
  }

  private getDefaultMessages(): PersonalizedMessage {
    return {
      greeting: "Welcome to DealershipAI!",
      motivation: "Let's get started on your AI journey.",
      encouragement: "You're doing great! Keep going.",
      warning: "Don't miss out on this opportunity.",
      celebration: "Great job!",
      nextStep: "Let's continue!",
    }
  }
}

export const personalizationEngine = new OnboardingPersonalizationEngine()
