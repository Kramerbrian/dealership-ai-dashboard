// HRP (Human Readability & Perception) Calculation
// Measures content quality and user experience

import { HRPInput } from './types'

export function calculateHRP(input: HRPInput): number {
  const weights = {
    readabilityScore: 0.30,
    contentLength: 0.15,
    headingStructure: 0.20,
    imageOptimization: 0.15,
    userExperience: 0.20
  }

  // Calculate weighted score
  const score = 
    (input.readabilityScore * weights.readabilityScore) +
    (input.contentLength * weights.contentLength) +
    (input.headingStructure * weights.headingStructure) +
    (input.imageOptimization * weights.imageOptimization) +
    (input.userExperience * weights.userExperience)

  // Apply content quality adjustments
  const contentAdjustment = getContentAdjustment(input)
  const finalScore = Math.min(100, Math.max(0, score + contentAdjustment))

  return Math.round(finalScore)
}

function getContentAdjustment(input: HRPInput): number {
  let adjustment = 0

  // Content length bonus/penalty
  if (input.contentLength > 1000) {
    adjustment += 3 // Good content length
  } else if (input.contentLength < 300) {
    adjustment -= 5 // Too short
  }

  // Readability bonus
  if (input.readabilityScore > 80) {
    adjustment += 2
  } else if (input.readabilityScore < 40) {
    adjustment -= 3
  }

  // Heading structure bonus
  if (input.headingStructure > 70) {
    adjustment += 2
  }

  return adjustment
}

export async function fetchHRPData(domain: string): Promise<HRPInput> {
  // Mock implementation - in production, integrate with:
  // - Content analysis APIs
  // - Readability scoring services
  // - Image optimization analysis
  // - UX testing tools

  return {
    domain,
    readabilityScore: Math.floor(Math.random() * 30) + 60, // 60-90
    contentLength: Math.floor(Math.random() * 800) + 500, // 500-1300 words
    headingStructure: Math.floor(Math.random() * 25) + 65, // 65-90
    imageOptimization: Math.floor(Math.random() * 20) + 50, // 50-70
    userExperience: Math.floor(Math.random() * 35) + 55 // 55-90
  }
}