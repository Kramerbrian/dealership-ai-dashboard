/**
 * DealershipAI Personalization Tokens System
 * Resolves user/dealer context for personalized experiences
 */

export interface IdentityTokens {
  dealer_id: string;
  group_id?: string;
  brand?: string;
  oem?: string;
  dma?: string;
  geo_tier?: 'rural' | 'suburban' | 'metro';
}

export interface RoleTokens {
  role: 'gm' | 'marketing' | 'service' | 'it' | 'guest';
}

export interface IntentTokens {
  visit_intent: 'scan' | 'compare' | 'fix' | 'buy';
  funnel_stage: 'anon' | 'trial' | 'paid';
}

export interface MaturityTokens {
  trust_maturity: 'seed' | 'grow' | 'scale';
}

export interface StackTokens {
  cms?: string;
  website_provider?: string;
  crm?: string;
  review_platforms?: string[];
}

export interface BehaviorTokens {
  last_scan_age_days: number;
  fixes_applied_30d: number;
  share_count: number;
  referrals: number;
  widget_depth: number;
}

export interface PreferenceTokens {
  theme: 'light' | 'dark' | 'brand';
  motion_reduced: boolean;
  language: 'en' | 'es';
  humor_level: 'low' | 'med' | 'high';
}

export interface RiskTokens {
  rar_bucket: 'low' | 'med' | 'high';
  volatility_index: number;
  eeat_conflict_count: number;
}

export interface CohortTokens {
  peer_cluster_id: string;
  bench_percentile: number; // 0-100
}

export interface PersonalizationTokens {
  identity: IdentityTokens;
  role: RoleTokens;
  intent: IntentTokens;
  maturity: MaturityTokens;
  stack?: StackTokens;
  behavior: BehaviorTokens;
  preferences: PreferenceTokens;
  risk: RiskTokens;
  cohort: CohortTokens;
}

export interface TokenResolutionConfig {
  order: ('query' | 'jwt' | 'profile' | 'heuristic')[];
  ttl: {
    identity_days: number;
    behavior_hours: number;
    session_hours: number;
  };
  fallback_profile: Partial<PersonalizationTokens>;
}

export const DEFAULT_RESOLUTION_CONFIG: TokenResolutionConfig = {
  order: ['query', 'jwt', 'profile', 'heuristic'],
  ttl: {
    identity_days: 90,
    behavior_hours: 24,
    session_hours: 2,
  },
  fallback_profile: {
    role: { role: 'guest' },
    identity: { geo_tier: 'metro' },
    preferences: {
      theme: 'light',
      motion_reduced: false,
      language: 'en',
      humor_level: 'low',
    },
  },
};

/**
 * Resolve personalization tokens from various sources
 */
export class TokenResolver {
  private config: TokenResolutionConfig;
  private cache: Map<string, { tokens: PersonalizationTokens; expires: number }> = new Map();

  constructor(config: TokenResolutionConfig = DEFAULT_RESOLUTION_CONFIG) {
    this.config = config;
  }

  async resolve(
    context: {
      query?: Record<string, string>;
      jwt?: Record<string, any>;
      userId?: string;
      dealerId?: string;
      sessionId?: string;
    }
  ): Promise<PersonalizationTokens> {
    const cacheKey = this.getCacheKey(context);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
      return cached.tokens;
    }

    const tokens: Partial<PersonalizationTokens> = {
      ...this.config.fallback_profile,
    };

    // Resolve in order of precedence
    for (const source of this.config.order) {
      switch (source) {
        case 'query':
          this.resolveFromQuery(context.query || {}, tokens);
          break;
        case 'jwt':
          this.resolveFromJWT(context.jwt || {}, tokens);
          break;
        case 'profile':
          await this.resolveFromProfile(context.userId, context.dealerId, tokens);
          break;
        case 'heuristic':
          this.resolveFromHeuristic(context, tokens);
          break;
      }
    }

    // Fill in any missing required fields
    const resolved = this.fillDefaults(tokens as PersonalizationTokens);

    // Cache the result
    this.cache.set(cacheKey, {
      tokens: resolved,
      expires: Date.now() + this.config.ttl.session_hours * 60 * 60 * 1000,
    });

    return resolved;
  }

  private resolveFromQuery(
    query: Record<string, string>,
    tokens: Partial<PersonalizationTokens>
  ): void {
    if (query.dealer_id) {
      tokens.identity = { ...tokens.identity, dealer_id: query.dealer_id };
    }
    if (query.role) {
      tokens.role = { role: query.role as RoleTokens['role'] };
    }
    if (query.intent) {
      tokens.intent = { ...tokens.intent, visit_intent: query.intent as IntentTokens['visit_intent'] };
    }
    if (query.geo_tier) {
      tokens.identity = { ...tokens.identity, geo_tier: query.geo_tier as IdentityTokens['geo_tier'] };
    }
  }

  private resolveFromJWT(
    jwt: Record<string, any>,
    tokens: Partial<PersonalizationTokens>
  ): void {
    if (jwt.dealer_id) {
      tokens.identity = { ...tokens.identity, dealer_id: jwt.dealer_id };
    }
    if (jwt.role) {
      tokens.role = { role: jwt.role };
    }
    if (jwt.group_id) {
      tokens.identity = { ...tokens.identity, group_id: jwt.group_id };
    }
    if (jwt.brand) {
      tokens.identity = { ...tokens.identity, brand: jwt.brand };
    }
  }

  private async resolveFromProfile(
    userId: string | undefined,
    dealerId: string | undefined,
    tokens: Partial<PersonalizationTokens>
  ): Promise<void> {
    if (!userId && !dealerId) {
      return;
    }

    // TODO: Fetch from database
    // For now, use defaults
    if (dealerId) {
      tokens.identity = { ...tokens.identity, dealer_id: dealerId };
    }
  }

  private resolveFromHeuristic(
    context: { userId?: string; dealerId?: string; sessionId?: string },
    tokens: Partial<PersonalizationTokens>
  ): void {
    // Heuristic: If no role specified, infer from behavior
    if (!tokens.role) {
      tokens.role = { role: 'guest' };
    }

    // Heuristic: Infer maturity from behavior
    if (!tokens.maturity) {
      const behavior = tokens.behavior;
      if (behavior) {
        if (behavior.fixes_applied_30d > 10 && behavior.share_count > 5) {
          tokens.maturity = { trust_maturity: 'scale' };
        } else if (behavior.fixes_applied_30d > 0 || behavior.share_count > 0) {
          tokens.maturity = { trust_maturity: 'grow' };
        } else {
          tokens.maturity = { trust_maturity: 'seed' };
        }
      } else {
        tokens.maturity = { trust_maturity: 'seed' };
      }
    }

    // Heuristic: Infer funnel stage
    if (!tokens.intent) {
      tokens.intent = { visit_intent: 'scan', funnel_stage: 'anon' };
    }
  }

  private fillDefaults(tokens: Partial<PersonalizationTokens>): PersonalizationTokens {
    return {
      identity: tokens.identity || { dealer_id: 'unknown', geo_tier: 'metro' },
      role: tokens.role || { role: 'guest' },
      intent: tokens.intent || { visit_intent: 'scan', funnel_stage: 'anon' },
      maturity: tokens.maturity || { trust_maturity: 'seed' },
      stack: tokens.stack,
      behavior: tokens.behavior || {
        last_scan_age_days: 999,
        fixes_applied_30d: 0,
        share_count: 0,
        referrals: 0,
        widget_depth: 0,
      },
      preferences: tokens.preferences || {
        theme: 'light',
        motion_reduced: false,
        language: 'en',
        humor_level: 'low',
      },
      risk: tokens.risk || {
        rar_bucket: 'med',
        volatility_index: 1.0,
        eeat_conflict_count: 0,
      },
      cohort: tokens.cohort || {
        peer_cluster_id: 'default',
        bench_percentile: 50,
      },
    };
  }

  private getCacheKey(context: {
    userId?: string;
    dealerId?: string;
    sessionId?: string;
  }): string {
    return `${context.userId || 'anon'}:${context.dealerId || 'none'}:${context.sessionId || 'none'}`;
  }
}

export const tokenResolver = new TokenResolver();

