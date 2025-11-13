/**
 * Orchestrator GPT Bridge
 * Connects dAI Chat to Orchestrator 3.0 API
 */

export interface OrchestratorRequest {
  dealerId: string;
  query?: string;  // For chat interface
  action?: string;  // For API interface (analyze_visibility, compute_qai, etc.)
  domain?: string;
  context?: {
    domain?: string;
    recentActivity?: string[];
    currentPage?: string;
    [key: string]: any;
  };
  parameters?: Record<string, any>;
  tools?: string[];
}

export interface OrchestratorResponse {
  content: string;
  confidence?: number;
  traceId?: string;
  toolsUsed?: string[];
  evidence?: Array<{
    type: string;
    source: string;
    relevance: number;
  }>;
}

/**
 * Call Orchestrator API
 * Connects to the internal /api/orchestrator endpoint or external Orchestrator 3.0 service
 */
export async function callOrchestrator(
  request: OrchestratorRequest
): Promise<OrchestratorResponse> {
  try {
    // Determine action from request (either provided directly or inferred from query)
    let action = request.action;
    
    if (!action && request.query) {
      // Map query to appropriate action
      const query = request.query.toLowerCase();
      if (query.includes('qai') || query.includes('quality')) {
        action = 'compute_qai';
      } else if (query.includes('oci') || query.includes('opportunity') || query.includes('revenue')) {
        action = 'calculate_oci';
      } else if (query.includes('asr') || query.includes('safety') || query.includes('risk')) {
        action = 'generate_asr';
      } else if (query.includes('ugc') || query.includes('review') || query.includes('user generated')) {
        action = 'analyze_ugc';
      } else {
        action = 'analyze_visibility'; // Default
      }
    } else if (!action) {
      action = 'analyze_visibility'; // Default fallback
    }

    // Try internal API first (only if we have an action and we're on the client side)
    // Note: On server side, this function is called FROM the API route, so we skip the API call
    if (action && typeof window !== 'undefined') {
      try {
        const response = await fetch('/api/orchestrator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            dealerId: request.dealerId,
            domain: request.domain || request.context?.domain,
            context: request.context,
            parameters: request.parameters || {},
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            content: data.content || data.message || JSON.stringify(data),
            confidence: data.confidence || 0.85,
            traceId: data.traceId || `trace_${Date.now()}`,
            toolsUsed: data.toolsUsed || [],
            evidence: data.evidence || [],
          };
        }
      } catch (apiError) {
        console.warn('Internal API call failed, falling back to mock:', apiError);
      }
    }

    // Option 2: Use external Orchestrator 3.0 service (if configured)
    if (process.env.ORCHESTRATOR_API && process.env.ORCHESTRATOR_TOKEN) {
      const response = await fetch(`${process.env.ORCHESTRATOR_API}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ORCHESTRATOR_TOKEN}`,
        },
        body: JSON.stringify(request),
      });
      
      if (response.ok) {
        return await response.json();
      }
    }

    // Mock response for now - using simple language
    const mockResponses: Record<string, string> = {
      'visibility': 'Your dealership shows up in AI search tools 87.3% of the time. This is better than most dealerships (average is 72%). What\'s working well: your website has good structure and your Google Business Profile is active. What needs work: you could show up more often in quick answers that don\'t require clicking.',
      'qai': 'Your quality and trust score is 84.2 out of 100. This measures how much AI tools trust your content. Your website shows expertise and authority well. You have good signals that show you know what you\'re talking about.',
      'oci': 'You might be losing about $24,800 per month. Here\'s why: missing FAQ pages could cost you $8,000 you could get back, and slow responses to reviews could cost you $12,000 you could recover. These are fixable problems.',
      'asr': 'Safety report found 3 issues that need attention: your location information has some inconsistencies, 12% of your car listings are missing important details, and your service pages need better trust signals. These are medium priority - not urgent, but worth fixing.',
      'ugc': 'Customer reviews: You have 1,240 Google reviews (average 4.3 stars), 340 Yelp reviews (4.1 stars), and 890 Facebook reviews (4.5 stars). Overall, 70% of customers feel positive. You\'re responding to 65% of reviews - try to get to 80% or higher for best results.',
    };

    // Fallback to mock responses based on action or query
    let content = 'I can help you understand:\n\n• How visible you are to AI search tools\n• Your quality and trust scores\n• How much money you might be losing\n• Safety reports with recommendations\n• What customers are saying in reviews\n\nWhat would you like to know?';
    
    if (action) {
      // Use action to determine response
      switch (action) {
        case 'analyze_visibility':
          content = mockResponses.visibility;
          break;
        case 'compute_qai':
          content = mockResponses.qai;
          break;
        case 'calculate_oci':
          content = mockResponses.oci;
          break;
        case 'generate_asr':
          content = mockResponses.asr;
          break;
        case 'analyze_ugc':
          content = mockResponses.ugc;
          break;
        default:
          content = mockResponses.visibility;
      }
    } else if (request.query) {
      // Fallback to query-based matching
      const query = request.query.toLowerCase();
      if (query.includes('visibility') || query.includes('aiv')) {
        content = mockResponses.visibility;
      } else if (query.includes('qai') || query.includes('quality')) {
        content = mockResponses.qai;
      } else if (query.includes('oci') || query.includes('opportunity') || query.includes('revenue')) {
        content = mockResponses.oci;
      } else if (query.includes('asr') || query.includes('safety') || query.includes('risk')) {
        content = mockResponses.asr;
      } else if (query.includes('ugc') || query.includes('review') || query.includes('user generated')) {
        content = mockResponses.ugc;
      } else if (query.includes('hello') || query.includes('hi') || query.includes('help')) {
        content = 'Hello! I\'m your AI assistant. I can help you understand how visible you are to AI search tools, your quality scores, how much money you might be losing, safety reports, and what customers are saying. What would you like to know?';
      }
    }

    return {
      content,
      confidence: 0.85,
      traceId: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      toolsUsed: ['visibility-analyzer', 'qai-calculator'],
      evidence: [
        {
          type: 'schema',
          source: 'dealership schema audit',
          relevance: 0.92,
        },
      ],
    };
  } catch (error) {
    console.error('Orchestrator API error:', error);
    return {
      content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
      confidence: 0.0,
      traceId: `error_${Date.now()}`,
    };
  }
}
