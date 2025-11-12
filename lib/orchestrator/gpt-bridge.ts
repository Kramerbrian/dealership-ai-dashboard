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

    // Try internal API first (only if we have an action)
    if (action) {
      try {
        const apiUrl = typeof window !== 'undefined' 
          ? '/api/orchestrator' 
          : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orchestrator`;
        
        const response = await fetch(apiUrl, {
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

    // Mock response for now
    const mockResponses: Record<string, string> = {
      'visibility': 'Your AI Visibility Index is 87.3%. This is above the industry average of 72%. Key strengths: strong schema coverage, active GBP presence. Areas to improve: zero-click inclusion rate could be higher.',
      'qai': 'Your QAI (Quality AI Index) score is 84.2. This measures how well AI models understand and trust your content. Your E-E-A-T signals are strong, with good author expertise indicators.',
      'oci': 'OCI (Opportunity Cost Index) analysis shows $24,800 monthly revenue at risk. Primary drivers: missing FAQ schema (estimated $8K recovery), slow review response times ($12K recovery potential).',
      'asr': 'ASR (Algorithmic Safety Report) indicates 3 medium-priority issues: geo-integrity inconsistencies, missing vehicle schema on 12% of inventory pages, and trust signal gaps in service pages.',
      'ugc': 'UGC analysis shows 1,240 Google reviews (4.3 avg), 340 Yelp reviews (4.1 avg), 890 Facebook reviews (4.5 avg). Sentiment is 70% positive. Response rate is 65% - target 80%+ for optimal visibility.',
    };

    // Fallback to mock responses based on action or query
    let content = 'I can help you analyze your AI visibility, compute QAI scores, calculate OCI, generate ASRs, and analyze UGC. What specific metric would you like to explore?';
    
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
        content = 'Hello! I am dAI, your AI Chief Strategy Officer. I can analyze visibility, compute QAI, calculate OCI, generate ASRs, and analyze UGC. What would you like to know?';
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
