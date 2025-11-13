/**
 * Token Resolver for Personalization
 * Resolves user, dealer, and context-specific tokens for dynamic content
 */

export interface TokenContext {
  query?: Record<string, any>;
  jwt?: Record<string, any>;
  userId?: string;
  dealerId?: string;
  tenantId?: string;
}

export interface ResolvedTokens {
  identity: {
    user_id?: string;
    dealer_id?: string;
    tenant_id?: string;
    geo_tier?: string;
    group_id?: string;
  };
  preferences: {
    theme?: string;
    language?: string;
    timezone?: string;
  };
  metrics: {
    trust_score?: number;
    engagement_score?: number;
  };
}

class TokenResolver {
  /**
   * Resolve tokens from multiple context sources
   */
  async resolve(context: TokenContext): Promise<ResolvedTokens> {
    const tokens: ResolvedTokens = {
      identity: {},
      preferences: {},
      metrics: {},
    };

    // Resolve identity tokens
    if (context.userId) {
      tokens.identity.user_id = context.userId;
    }

    if (context.dealerId) {
      tokens.identity.dealer_id = context.dealerId;
    }

    if (context.tenantId) {
      tokens.identity.tenant_id = context.tenantId;
    }

    // Extract from query parameters
    if (context.query) {
      tokens.identity.dealer_id = context.query.dealer_id || tokens.identity.dealer_id;
      tokens.identity.geo_tier = context.query.geo_tier;
    }

    // Extract from JWT
    if (context.jwt) {
      tokens.identity.dealer_id = context.jwt.dealer_id || tokens.identity.dealer_id;
      tokens.identity.group_id = context.jwt.group_id;
      tokens.identity.tenant_id = context.jwt.tenant_id || tokens.identity.tenant_id;
    }

    // Set default preferences
    tokens.preferences = {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
    };

    // Fetch metrics if dealer_id is available
    if (tokens.identity.dealer_id) {
      // In production, this would query the database
      tokens.metrics = {
        trust_score: 0.82,
        engagement_score: 0.75,
      };
    }

    return tokens;
  }

  /**
   * Validate token access permissions
   */
  canAccess(tokens: ResolvedTokens, resource: string): boolean {
    // Basic access control - expand as needed
    if (resource === 'admin' && !tokens.identity.tenant_id) {
      return false;
    }

    return true;
  }
}

export const tokenResolver = new TokenResolver();

/**
 * Helper to extract dealer_id from various sources
 */
export function extractDealerId(
  req: Request,
  context: TokenContext
): string | undefined {
  // Try from URL params
  const url = new URL(req.url);
  const dealerIdParam = url.searchParams.get('dealer_id');
  if (dealerIdParam) return dealerIdParam;

  // Try from context
  if (context.dealerId) return context.dealerId;
  if (context.query?.dealer_id) return context.query.dealer_id;
  if (context.jwt?.dealer_id) return context.jwt.dealer_id;

  return undefined;
}
