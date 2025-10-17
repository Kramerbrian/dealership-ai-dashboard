export interface User {
  id: string;
  email: string;
  name: string;
  dealership: string;
  city: string;
  state: string;
  phone: string;
  role: string;
  tier: 'free' | 'growth' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  isActive: boolean;
  preferences?: UserPreferences;
  subscription?: Subscription;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    defaultView: 'overview' | 'analytics' | 'competitors';
  };
}

export interface Subscription {
  id: string;
  plan: 'free' | 'growth' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export interface Dealership {
  id: string;
  name: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string;
  email: string;
  brands: string[];
  aiVisibilityScore: number;
  trustScore: number;
  citationScore: number;
  lastAuditAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditResult {
  id: string;
  dealershipId: string;
  overallScore: number;
  aiVisibilityScore: number;
  trustScore: number;
  citationScore: number;
  competitorScores: CompetitorScore[];
  recommendations: Recommendation[];
  createdAt: string;
}

export interface CompetitorScore {
  name: string;
  score: number;
  improvement: number;
  isBlurred: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  effort: 'low' | 'medium' | 'high';
  category: 'content' | 'technical' | 'citations' | 'trust';
}

export interface Activity {
  id: string;
  type: 'audit' | 'improvement' | 'citation' | 'competitor_beat';
  dealership: string;
  location: string;
  score?: number;
  improvement?: number;
  timeAgo: string;
  icon: React.ReactNode;
  color: string;
  message: string;
}