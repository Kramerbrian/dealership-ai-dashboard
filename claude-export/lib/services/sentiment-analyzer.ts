/**
 * Advanced Sentiment Analysis and Trust Signals Service
 * 
 * Analyzes sentiment across reviews, social media, and content to provide
 * comprehensive trust and authority signals for the enhanced dAI algorithm.
 * 
 * @version 1.0.0
 * @author DealershipAI Team
 */

import { SentimentMetrics } from '../scoring/enhanced-dai-engine';

export interface ReviewData {
  id: string;
  source: 'google' | 'yelp' | 'facebook' | 'dealerrater' | 'cars_com' | 'autotrader';
  rating: number;
  text: string;
  author: string;
  date: Date;
  verified: boolean;
  helpful: number;
  response?: {
    text: string;
    date: Date;
    author: string;
  };
}

export interface SocialMention {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok';
  content: string;
  author: string;
  date: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  reach: number;
}

export interface TrustSignal {
  type: 'certification' | 'award' | 'partnership' | 'endorsement' | 'accreditation';
  name: string;
  issuer: string;
  date: Date;
  expiration?: Date;
  verification: boolean;
  authority: number; // 0-100
}

export interface AuthorityIndicator {
  type: 'expert_bio' | 'staff_credentials' | 'industry_experience' | 'certifications' | 'awards';
  description: string;
  authority: number; // 0-100
  verification: boolean;
  source: string;
}

export class SentimentAnalyzer {
  private reviews: ReviewData[] = [];
  private socialMentions: SocialMention[] = [];
  private trustSignals: TrustSignal[] = [];
  private authorityIndicators: AuthorityIndicator[] = [];
  
  /**
   * Add review data for analysis
   */
  addReview(review: ReviewData): void {
    this.reviews.push(review);
  }
  
  /**
   * Add social media mention
   */
  addSocialMention(mention: SocialMention): void {
    this.socialMentions.push(mention);
  }
  
  /**
   * Add trust signal
   */
  addTrustSignal(signal: TrustSignal): void {
    this.trustSignals.push(signal);
  }
  
  /**
   * Add authority indicator
   */
  addAuthorityIndicator(indicator: AuthorityIndicator): void {
    this.authorityIndicators.push(indicator);
  }
  
  /**
   * Calculate comprehensive sentiment metrics
   */
  calculateSentimentMetrics(days: number = 30): SentimentMetrics {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    const recentReviews = this.reviews.filter(review => review.date >= cutoffDate);
    const recentSocialMentions = this.socialMentions.filter(mention => mention.date >= cutoffDate);
    
    return {
      netSentiment: this.calculateNetSentiment(recentReviews, recentSocialMentions),
      sentimentTrend: this.calculateSentimentTrend(days),
      reviewVelocity: this.calculateReviewVelocity(recentReviews),
      reviewQuality: this.calculateReviewQuality(recentReviews),
      socialMentions: recentSocialMentions.length,
      socialSentiment: this.calculateSocialSentiment(recentSocialMentions),
      brandMentions: this.calculateBrandMentions(recentSocialMentions),
      npsScore: this.calculateNPSScore(recentReviews),
      trustIndicators: this.calculateTrustIndicators(),
      authoritySignals: this.calculateAuthoritySignals(),
    };
  }
  
  /**
   * Calculate net sentiment score (-100 to +100)
   */
  private calculateNetSentiment(reviews: ReviewData[], socialMentions: SocialMention[]): number {
    let totalSentiment = 0;
    let totalWeight = 0;
    
    // Analyze review sentiment
    reviews.forEach(review => {
      const sentiment = this.analyzeTextSentiment(review.text);
      const weight = this.getReviewWeight(review);
      totalSentiment += sentiment * weight;
      totalWeight += weight;
    });
    
    // Analyze social media sentiment
    socialMentions.forEach(mention => {
      const sentiment = this.analyzeTextSentiment(mention.content);
      const weight = this.getSocialWeight(mention);
      totalSentiment += sentiment * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round((totalSentiment / totalWeight) * 100) : 0;
  }
  
  /**
   * Calculate sentiment trend over time
   */
  private calculateSentimentTrend(days: number): number {
    const halfDays = Math.floor(days / 2);
    const firstHalf = this.reviews.filter(review => {
      const daysAgo = (Date.now() - review.date.getTime()) / (24 * 60 * 60 * 1000);
      return daysAgo > halfDays && daysAgo <= days;
    });
    
    const secondHalf = this.reviews.filter(review => {
      const daysAgo = (Date.now() - review.date.getTime()) / (24 * 60 * 60 * 1000);
      return daysAgo <= halfDays;
    });
    
    const firstHalfSentiment = this.calculateAverageSentiment(firstHalf);
    const secondHalfSentiment = this.calculateAverageSentiment(secondHalf);
    
    return Math.round(secondHalfSentiment - firstHalfSentiment);
  }
  
  /**
   * Calculate review velocity (reviews per day)
   */
  private calculateReviewVelocity(reviews: ReviewData[]): number {
    if (reviews.length === 0) return 0;
    
    const oldestReview = Math.min(...reviews.map(r => r.date.getTime()));
    const newestReview = Math.max(...reviews.map(r => r.date.getTime()));
    const daysSpan = (newestReview - oldestReview) / (24 * 60 * 60 * 1000);
    
    return daysSpan > 0 ? Math.round((reviews.length / daysSpan) * 100) / 100 : 0;
  }
  
  /**
   * Calculate review quality score
   */
  private calculateReviewQuality(reviews: ReviewData[]): number {
    if (reviews.length === 0) return 0;
    
    let totalQuality = 0;
    
    reviews.forEach(review => {
      let quality = 0;
      
      // Text length factor
      const textLength = review.text.length;
      if (textLength > 100) quality += 20;
      else if (textLength > 50) quality += 15;
      else if (textLength > 20) quality += 10;
      
      // Rating factor
      quality += review.rating * 10;
      
      // Verification factor
      if (review.verified) quality += 15;
      
      // Helpfulness factor
      if (review.helpful > 0) quality += Math.min(10, review.helpful);
      
      // Response factor
      if (review.response) quality += 10;
      
      totalQuality += Math.min(100, quality);
    });
    
    return Math.round(totalQuality / reviews.length);
  }
  
  /**
   * Calculate social media sentiment
   */
  private calculateSocialSentiment(socialMentions: SocialMention[]): number {
    if (socialMentions.length === 0) return 0;
    
    let totalSentiment = 0;
    let totalWeight = 0;
    
    socialMentions.forEach(mention => {
      const sentiment = this.analyzeTextSentiment(mention.content);
      const weight = this.getSocialWeight(mention);
      totalSentiment += sentiment * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round((totalSentiment / totalWeight) * 100) : 0;
  }
  
  /**
   * Calculate brand mentions
   */
  private calculateBrandMentions(socialMentions: SocialMention[]): number {
    return socialMentions.length;
  }
  
  /**
   * Calculate Net Promoter Score
   */
  private calculateNPSScore(reviews: ReviewData[]): number {
    if (reviews.length === 0) return 0;
    
    const promoters = reviews.filter(r => r.rating >= 4).length;
    const detractors = reviews.filter(r => r.rating <= 2).length;
    const total = reviews.length;
    
    return Math.round(((promoters - detractors) / total) * 100);
  }
  
  /**
   * Calculate trust indicators score
   */
  private calculateTrustIndicators(): number {
    if (this.trustSignals.length === 0) return 0;
    
    const verifiedSignals = this.trustSignals.filter(signal => signal.verification);
    const averageAuthority = verifiedSignals.reduce((sum, signal) => sum + signal.authority, 0) / verifiedSignals.length;
    
    return Math.round(averageAuthority);
  }
  
  /**
   * Calculate authority signals score
   */
  private calculateAuthoritySignals(): number {
    if (this.authorityIndicators.length === 0) return 0;
    
    const verifiedIndicators = this.authorityIndicators.filter(indicator => indicator.verification);
    const averageAuthority = verifiedIndicators.reduce((sum, indicator) => sum + indicator.authority, 0) / verifiedIndicators.length;
    
    return Math.round(averageAuthority);
  }
  
  /**
   * Analyze text sentiment using simple keyword analysis
   * In production, this would use advanced NLP models
   */
  private analyzeTextSentiment(text: string): number {
    const positiveWords = [
      'excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'outstanding',
      'perfect', 'love', 'best', 'awesome', 'superb', 'brilliant', 'exceptional',
      'professional', 'helpful', 'friendly', 'knowledgeable', 'reliable'
    ];
    
    const negativeWords = [
      'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'disappointing',
      'frustrating', 'unprofessional', 'rude', 'slow', 'expensive', 'cheap',
      'broken', 'damaged', 'unreliable', 'incompetent', 'useless'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    // Normalize to -1 to 1 range
    const wordCount = words.length;
    return wordCount > 0 ? Math.max(-1, Math.min(1, score / wordCount)) : 0;
  }
  
  /**
   * Get review weight based on various factors
   */
  private getReviewWeight(review: ReviewData): number {
    let weight = 1;
    
    // Verified reviews get higher weight
    if (review.verified) weight *= 1.5;
    
    // Recent reviews get higher weight
    const daysOld = (Date.now() - review.date.getTime()) / (24 * 60 * 60 * 1000);
    if (daysOld < 30) weight *= 1.2;
    if (daysOld < 7) weight *= 1.5;
    
    // Reviews with responses get higher weight
    if (review.response) weight *= 1.3;
    
    // Helpful reviews get higher weight
    if (review.helpful > 0) weight *= (1 + review.helpful * 0.1);
    
    return weight;
  }
  
  /**
   * Get social media weight based on engagement
   */
  private getSocialWeight(mention: SocialMention): number {
    let weight = 1;
    
    // Higher engagement = higher weight
    const totalEngagement = mention.engagement.likes + mention.engagement.shares + mention.engagement.comments;
    if (totalEngagement > 100) weight *= 2;
    else if (totalEngagement > 50) weight *= 1.5;
    else if (totalEngagement > 10) weight *= 1.2;
    
    // Higher reach = higher weight
    if (mention.reach > 10000) weight *= 1.5;
    else if (mention.reach > 1000) weight *= 1.2;
    
    return weight;
  }
  
  /**
   * Calculate average sentiment for a set of reviews
   */
  private calculateAverageSentiment(reviews: ReviewData[]): number {
    if (reviews.length === 0) return 0;
    
    let totalSentiment = 0;
    reviews.forEach(review => {
      totalSentiment += this.analyzeTextSentiment(review.text);
    });
    
    return totalSentiment / reviews.length;
  }
  
  /**
   * Generate sentiment-based recommendations
   */
  generateSentimentRecommendations(metrics: SentimentMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.netSentiment < -20) {
      recommendations.push('Address negative sentiment immediately through improved customer service and follow-up');
    }
    
    if (metrics.sentimentTrend < -10) {
      recommendations.push('Sentiment is declining - investigate recent issues and implement corrective measures');
    }
    
    if (metrics.reviewVelocity < 1) {
      recommendations.push('Low review velocity - implement systematic review request process');
    }
    
    if (metrics.reviewQuality < 60) {
      recommendations.push('Improve review quality by encouraging detailed, helpful reviews from satisfied customers');
    }
    
    if (metrics.npsScore < 0) {
      recommendations.push('Negative NPS score - focus on customer satisfaction and loyalty programs');
    }
    
    if (metrics.trustIndicators < 50) {
      recommendations.push('Build trust signals through certifications, awards, and industry partnerships');
    }
    
    if (metrics.authoritySignals < 60) {
      recommendations.push('Strengthen authority signals with expert bios, staff credentials, and industry experience');
    }
    
    return recommendations;
  }
  
  /**
   * Simulate sentiment data for demo purposes
   */
  simulateSentimentData(domain: string): void {
    // Simulate reviews
    const reviewSources = ['google', 'yelp', 'facebook', 'dealerrater', 'cars_com'];
    const reviewTexts = [
      'Excellent service and great selection of vehicles!',
      'Very professional staff and smooth transaction.',
      'Outstanding customer service and competitive pricing.',
      'Great experience from start to finish.',
      'Highly recommend this dealership to anyone looking for a car.',
      'Poor communication and slow service.',
      'Overpriced compared to other dealers.',
      'Not satisfied with the vehicle condition.',
    ];
    
    for (let i = 0; i < 20; i++) {
      const review: ReviewData = {
        id: `review_${i}`,
        source: reviewSources[Math.floor(Math.random() * reviewSources.length)] as any,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
        author: `Customer ${i + 1}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        verified: Math.random() > 0.3,
        helpful: Math.floor(Math.random() * 10),
      };
      
      this.addReview(review);
    }
    
    // Simulate social mentions
    const platforms = ['twitter', 'facebook', 'instagram', 'linkedin'];
    for (let i = 0; i < 15; i++) {
      const mention: SocialMention = {
        id: `social_${i}`,
        platform: platforms[Math.floor(Math.random() * platforms.length)] as any,
        content: `Just had an amazing experience at ${domain}!`,
        author: `User${i}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        engagement: {
          likes: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 20),
          comments: Math.floor(Math.random() * 15),
        },
        sentiment: Math.random() > 0.2 ? 'positive' : 'neutral',
        reach: Math.floor(Math.random() * 5000) + 100,
      };
      
      this.addSocialMention(mention);
    }
    
    // Simulate trust signals
    const trustTypes = ['certification', 'award', 'partnership', 'endorsement', 'accreditation'];
    for (let i = 0; i < 8; i++) {
      const signal: TrustSignal = {
        type: trustTypes[Math.floor(Math.random() * trustTypes.length)] as any,
        name: `Trust Signal ${i + 1}`,
        issuer: `Issuing Organization ${i + 1}`,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        verification: Math.random() > 0.2,
        authority: Math.floor(Math.random() * 40) + 60,
      };
      
      this.addTrustSignal(signal);
    }
  }
}

export default SentimentAnalyzer;
