/**
 * AI Visibility Calibration Engine
 * Handles multi-platform AI testing with geographic pooling
 */

import { CALIBRATION_PROMPTS, AI_PLATFORMS, type AIPlatform, type CalibrationResult, type VisibilityScore, generateQuery, calculateVisibilityScore } from './prompts'

export interface CalibrationConfig {
  city: string
  state: string
  dealerDomains: string[]
  platforms: AIPlatform[]
  maxConcurrency: number
  cacheHours: number
}

export interface CalibrationJob {
  id: string
  config: CalibrationConfig
  status: 'pending' | 'running' | 'completed' | 'failed'
  results: CalibrationResult[]
  scores: VisibilityScore[]
  startedAt: Date
  completedAt?: Date
  error?: string
}

export class AICalibrator {
  private jobs: Map<string, CalibrationJob> = new Map()
  private rateLimits: Map<AIPlatform, number> = new Map()

  constructor() {
    // Initialize rate limits (requests per minute)
    this.rateLimits.set('chatgpt', 60)
    this.rateLimits.set('claude', 50)
    this.rateLimits.set('perplexity', 40)
    this.rateLimits.set('gemini', 60)
  }

  /**
   * Start calibration for a city with geographic pooling
   */
  async startCalibration(config: CalibrationConfig): Promise<string> {
    const jobId = `cal_${config.city}_${Date.now()}`
    
    const job: CalibrationJob = {
      id: jobId,
      config,
      status: 'pending',
      results: [],
      scores: [],
      startedAt: new Date()
    }

    this.jobs.set(jobId, job)

    // Start calibration in background
    this.runCalibration(jobId).catch(error => {
      const job = this.jobs.get(jobId)
      if (job) {
        job.status = 'failed'
        job.error = error.message
        job.completedAt = new Date()
      }
    })

    return jobId
  }

  /**
   * Get calibration job status
   */
  getJobStatus(jobId: string): CalibrationJob | null {
    return this.jobs.get(jobId) || null
  }

  /**
   * Run the actual calibration process
   */
  private async runCalibration(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) throw new Error('Job not found')

    job.status = 'running'
    const results: CalibrationResult[] = []

    try {
      // Process prompts in batches to respect rate limits
      const batches = this.createBatches(CALIBRATION_PROMPTS, job.config.maxConcurrency)
      
      for (const batch of batches) {
        const batchPromises = batch.map(prompt => 
          this.testPromptAcrossPlatforms(prompt, job.config)
        )
        
        const batchResults = await Promise.allSettled(batchPromises)
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(...result.value)
          } else {
            console.error('Prompt test failed:', result.reason)
          }
        }

        // Rate limiting delay between batches
        await this.delay(1000)
      }

      // Calculate visibility scores for each dealer
      const scores = job.config.dealerDomains.map(domain => 
        calculateVisibilityScore(results, domain)
      )

      job.results = results
      job.scores = scores
      job.status = 'completed'
      job.completedAt = new Date()

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
      throw error
    }
  }

  /**
   * Test a single prompt across all configured platforms
   */
  private async testPromptAcrossPlatforms(
    prompt: typeof CALIBRATION_PROMPTS[0],
    config: CalibrationConfig
  ): Promise<CalibrationResult[]> {
    const results: CalibrationResult[] = []
    const query = generateQuery(prompt.template, config.city, config.state)

    for (const platform of config.platforms) {
      try {
        const response = await this.queryAI(platform, query)
        const dealersFound = this.extractDealersFromResponse(response, config.dealerDomains)

        results.push({
          promptId: prompt.id,
          platform,
          query,
          city: config.city,
          state: config.state,
          response,
          dealersFound,
          timestamp: new Date(),
          confidence: this.calculateResponseConfidence(response, dealersFound)
        })

        // Platform-specific rate limiting
        await this.delay(this.getRateLimitDelay(platform))

      } catch (error) {
        console.error(`Failed to query ${platform} for prompt ${prompt.id}:`, error)
        // Continue with other platforms even if one fails
      }
    }

    return results
  }

  /**
   * Query AI platform (mock implementation - replace with real API calls)
   */
  private async queryAI(platform: AIPlatform, query: string): Promise<string> {
    // Mock implementation - replace with actual API calls
    const mockResponses = {
      chatgpt: `Based on my knowledge, here are some car dealerships in the area: Terry Reid's Auto Park, Naples Honda, and Johnston Hyundai.`,
      claude: `I can recommend several dealerships including Terry Reid's Auto Park and Naples Honda for your car needs.`,
      perplexity: `Top dealerships in the area include Terry Reid's Auto Park (4.8 stars), Naples Honda (4.6 stars), and Johnston Hyundai (4.5 stars).`,
      gemini: `For car dealerships, I suggest Terry Reid's Auto Park, Naples Honda, and Johnston Hyundai as reliable options.`
    }

    // Simulate API delay
    await this.delay(500 + Math.random() * 1000)
    
    return mockResponses[platform] || 'No response available'
  }

  /**
   * Extract dealer domains from AI response
   */
  private extractDealersFromResponse(response: string, dealerDomains: string[]): string[] {
    const found: string[] = []
    const lowerResponse = response.toLowerCase()

    for (const domain of dealerDomains) {
      const domainName = domain.replace('.com', '').replace('www.', '')
      const variations = [
        domainName,
        domainName.replace(/'/g, ''),
        domainName.replace(/\s+/g, ''),
        domainName.replace(/\s+/g, '-')
      ]

      for (const variation of variations) {
        if (lowerResponse.includes(variation.toLowerCase())) {
          found.push(domain)
          break
        }
      }
    }

    return found
  }

  /**
   * Calculate confidence in AI response
   */
  private calculateResponseConfidence(response: string, dealersFound: string[]): number {
    let confidence = 0.5 // Base confidence

    // Higher confidence for longer, more detailed responses
    if (response.length > 200) confidence += 0.2
    if (response.length > 500) confidence += 0.1

    // Higher confidence when dealers are found
    if (dealersFound.length > 0) confidence += 0.2
    if (dealersFound.length > 1) confidence += 0.1

    // Lower confidence for generic responses
    if (response.includes('I cannot') || response.includes('I don\'t know')) {
      confidence -= 0.3
    }

    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Create batches for rate limiting
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Get rate limit delay for platform
   */
  private getRateLimitDelay(platform: AIPlatform): number {
    const requestsPerMinute = this.rateLimits.get(platform) || 60
    return (60 * 1000) / requestsPerMinute // Convert to milliseconds
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get calibration cost estimate
   */
  getCostEstimate(config: CalibrationConfig): number {
    const promptsPerCity = CALIBRATION_PROMPTS.length
    const platforms = config.platforms.length
    const totalQueries = promptsPerCity * platforms
    const costPerQuery = 0.10 // $0.10 per query
    return totalQueries * costPerQuery
  }

  /**
   * Get cost per dealer with geographic pooling
   */
  getCostPerDealer(config: CalibrationConfig): number {
    const totalCost = this.getCostEstimate(config)
    return totalCost / config.dealerDomains.length
  }
}
