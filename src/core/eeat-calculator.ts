/**
 * E-E-A-T Calculator for DealershipAI
 * Experience, Expertise, Authoritativeness, Trustworthiness scoring
 */

export interface EEATSignals {
  years_in_business: number;
  customer_reviews: number;
  staff_bios_present: boolean;
  photo_count: number;
  manufacturer_certifications: boolean;
  service_awards: number;
  technical_content_pages: number;
  staff_credentials: boolean;
  domain_authority: number;
  quality_backlinks: number;
  media_mentions: number;
  industry_partnerships: boolean;
  review_authenticity_score: number;
  bbb_rating: number;
  ssl_security: boolean;
  transparent_pricing: boolean;
  complaint_resolution_rate: number;
}

export interface EEATScore {
  experience: number;
  expertise: number;
  authoritativeness: number;
  trustworthiness: number;
  overall: number;
}

export interface ActionItem {
  category: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  effort: string;
  cost: string;
}

export class EEATCalculator {
  async calculateEEAT(signals: EEATSignals): Promise<EEATScore> {
    // Experience (0-100)
    const experience = Math.round(
      Math.min((signals.years_in_business / 30) * 35, 35) +
      Math.min((signals.customer_reviews / 500) * 30, 30) +
      (signals.staff_bios_present ? 20 : 0) +
      Math.min((signals.photo_count / 100) * 15, 15)
    );
    
    // Expertise (0-100)
    const expertise = Math.round(
      (signals.manufacturer_certifications ? 40 : 0) +
      Math.min((signals.service_awards / 5) * 25, 25) +
      Math.min((signals.technical_content_pages / 20) * 20, 20) +
      (signals.staff_credentials ? 15 : 0)
    );
    
    // Authoritativeness (0-100)
    const authoritativeness = Math.round(
      Math.min((signals.domain_authority / 100) * 35, 35) +
      Math.min((signals.quality_backlinks / 50) * 30, 30) +
      Math.min((signals.media_mentions / 10) * 20, 20) +
      (signals.industry_partnerships ? 15 : 0)
    );
    
    // Trustworthiness (0-100)
    const trustworthiness = Math.round(
      Math.min(signals.review_authenticity_score * 30, 30) +
      Math.min((signals.bbb_rating / 5) * 25, 25) +
      (signals.ssl_security ? 15 : 0) +
      (signals.transparent_pricing ? 15 : 0) +
      Math.min(signals.complaint_resolution_rate * 15, 15)
    );
    
    const overall = Math.round((experience + expertise + authoritativeness + trustworthiness) / 4);
    
    return {
      experience: Math.min(experience, 100),
      expertise: Math.min(expertise, 100),
      authoritativeness: Math.min(authoritativeness, 100),
      trustworthiness: Math.min(trustworthiness, 100),
      overall: Math.min(overall, 100)
    };
  }
  
  async generateActionItems(eeat: EEATScore): Promise<ActionItem[]> {
    const actions: ActionItem[] = [];
    
    if (eeat.experience < 70) {
      actions.push({
        category: 'Experience',
        priority: 'high',
        action: 'Add customer testimonials with photos',
        impact: '+15 points',
        effort: '2 hours',
        cost: '$0'
      });
    }
    
    if (eeat.expertise < 70) {
      actions.push({
        category: 'Expertise',
        priority: 'high',
        action: 'Publish educational blog content',
        impact: '+12 points',
        effort: '4 hours/week',
        cost: '$200/month'
      });
    }
    
    if (eeat.authoritativeness < 70) {
      actions.push({
        category: 'Authoritativeness',
        priority: 'medium',
        action: 'Build local media relationships',
        impact: '+18 points',
        effort: '6 hours',
        cost: '$500'
      });
    }
    
    if (eeat.trustworthiness < 80) {
      actions.push({
        category: 'Trustworthiness',
        priority: 'high',
        action: 'Respond to all reviews within 24hrs',
        impact: '+10 points',
        effort: '30 min/day',
        cost: '$0'
      });
    }
    
    return actions;
  }
  
  getEEATGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  }
  
  getEEATColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
}

export const eeatCalculator = new EEATCalculator();
