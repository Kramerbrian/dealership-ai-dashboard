// E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) Scoring
// DealershipAI - Invisible weighting layer for Performance Score

export interface EEATFactors {
  experience: number    // 0-1: Review volume, testimonial recency, service transparency
  expertise: number     // 0-1: Educational content, staff bios, explainer videos
  authoritativeness: number // 0-1: Backlinks, citations, consistent brand presence
  trustworthiness: number   // 0-1: Review sentiment, response rate, offer accuracy
}

export interface EEATInputs {
  // Experience factors
  reviewVolume: number
  testimonialRecency: number // days since last testimonial
  serviceTransparency: number // 0-1: how transparent service processes are
  
  // Expertise factors
  educationalContent: number // count of FAQs, guides, videos
  staffBios: number // count of staff with detailed bios
  explainerVideos: number // count of educational videos
  
  // Authoritativeness factors
  backlinkCount: number
  citationCount: number // mentions in industry publications
  brandConsistency: number // 0-1: NAP consistency across platforms
  
  // Trustworthiness factors
  reviewSentiment: number // 0-1: average sentiment score
  responseRate: number // 0-1: percentage of reviews responded to
  offerAccuracy: number // 0-1: from Offer Match Score
}

/**
 * Calculate E-E-A-T factors from input data
 */
export function calculateEEATFactors(inputs: EEATInputs): EEATFactors {
  // Experience (0-1)
  const experience = Math.min(1, (
    Math.min(inputs.reviewVolume / 100, 1) * 0.4 + // Review volume (max at 100 reviews)
    Math.max(0, 1 - inputs.testimonialRecency / 90) * 0.3 + // Recency (decays over 90 days)
    inputs.serviceTransparency * 0.3 // Service transparency
  ))

  // Expertise (0-1)
  const expertise = Math.min(1, (
    Math.min(inputs.educationalContent / 20, 1) * 0.4 + // Educational content (max at 20 pieces)
    Math.min(inputs.staffBios / 10, 1) * 0.3 + // Staff bios (max at 10 bios)
    Math.min(inputs.explainerVideos / 5, 1) * 0.3 // Explainer videos (max at 5 videos)
  ))

  // Authoritativeness (0-1)
  const authoritativeness = Math.min(1, (
    Math.min(inputs.backlinkCount / 50, 1) * 0.4 + // Backlinks (max at 50)
    Math.min(inputs.citationCount / 10, 1) * 0.3 + // Citations (max at 10)
    inputs.brandConsistency * 0.3 // Brand consistency
  ))

  // Trustworthiness (0-1)
  const trustworthiness = (
    inputs.reviewSentiment * 0.4 + // Review sentiment
    inputs.responseRate * 0.3 + // Response rate
    inputs.offerAccuracy * 0.3 // Offer accuracy
  )

  return {
    experience,
    expertise,
    authoritativeness,
    trustworthiness
  }
}

/**
 * Calculate overall E-E-A-T trust weight (0-1)
 * This is the invisible multiplier for the Performance Score
 */
export function calculateTrustWeight(factors: EEATFactors): number {
  // Weighted average with emphasis on trustworthiness and authoritativeness
  const weights = {
    experience: 0.2,
    expertise: 0.2,
    authoritativeness: 0.3,
    trustworthiness: 0.3
  }

  const weightedScore = (
    factors.experience * weights.experience +
    factors.expertise * weights.expertise +
    factors.authoritativeness * weights.authoritativeness +
    factors.trustworthiness * weights.trustworthiness
  )

  // Apply a slight boost for high-performing dealerships
  // This creates a compounding effect for good E-E-A-T
  if (weightedScore > 0.8) {
    return Math.min(1, weightedScore * 1.1)
  }

  return weightedScore
}

/**
 * Get E-E-A-T recommendations based on current factors
 */
export function getEEATRecommendations(factors: EEATFactors): string[] {
  const recommendations: string[] = []

  if (factors.experience < 0.6) {
    recommendations.push('Increase review volume by encouraging customer feedback')
    recommendations.push('Add recent customer testimonials to your website')
  }

  if (factors.expertise < 0.6) {
    recommendations.push('Create educational content like buying guides and FAQs')
    recommendations.push('Add detailed staff bios highlighting certifications')
  }

  if (factors.authoritativeness < 0.6) {
    recommendations.push('Build backlinks through local partnerships and sponsorships')
    recommendations.push('Ensure consistent NAP (Name, Address, Phone) across all platforms')
  }

  if (factors.trustworthiness < 0.6) {
    recommendations.push('Improve review response rate and sentiment')
    recommendations.push('Ensure online offers match in-store pricing')
  }

  return recommendations
}

/**
 * Calculate Performance Score with E-E-A-T weighting
 */
export function calculatePerformanceScore(
  baseScore: number,
  eeatFactors: EEATFactors
): number {
  const trustWeight = calculateTrustWeight(eeatFactors)
  
  // Apply E-E-A-T as a multiplier (0.8 to 1.2 range)
  const eeatMultiplier = 0.8 + (trustWeight * 0.4)
  
  return Math.min(100, Math.max(0, baseScore * eeatMultiplier))
}
