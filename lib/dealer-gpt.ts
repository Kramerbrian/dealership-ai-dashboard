// DealerGPT integration with anomaly explanations and playbooks
export interface AnomalyContext {
  metric: string;
  value: number;
  expectedValue: number;
  timestamp: Date;
  tenantId: string;
  anomalyScore: number;
  method: string;
}

export interface PlaybookAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: 'technical' | 'content' | 'marketing' | 'operational';
  steps: string[];
  expectedOutcome: string;
  timeToComplete: string;
  cost: string;
}

export interface GPTResponse {
  explanation: string;
  rootCause: string;
  playbookActions: PlaybookAction[];
  confidence: number;
  followUpQuestions: string[];
  relatedMetrics: string[];
}

export class DealerGPT {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // Analyze anomaly and generate explanation with playbook
  async analyzeAnomaly(context: AnomalyContext): Promise<GPTResponse> {
    const prompt = this.buildAnomalyPrompt(context);
    
    try {
      const response = await this.callGPT(prompt);
      return this.parseGPTResponse(response);
    } catch (error) {
      console.error('DealerGPT analysis failed:', error);
      return this.getFallbackResponse(context);
    }
  }

  // Build prompt for anomaly analysis
  private buildAnomalyPrompt(context: AnomalyContext): string {
    return `
You are DealerGPT, an AI assistant specialized in automotive dealership analytics and optimization.

ANOMALY CONTEXT:
- Metric: ${context.metric}
- Current Value: ${context.value}
- Expected Value: ${context.expectedValue}
- Anomaly Score: ${context.anomalyScore}
- Detection Method: ${context.method}
- Timestamp: ${context.timestamp.toISOString()}

TASK:
Analyze this anomaly and provide:
1. A clear explanation of what's happening
2. The most likely root cause
3. Specific, actionable playbook steps
4. Expected outcomes and timeline
5. Follow-up questions to investigate further

Focus on automotive dealership context and provide practical, implementable solutions.

RESPONSE FORMAT (JSON):
{
  "explanation": "Clear explanation of the anomaly",
  "rootCause": "Most likely root cause",
  "playbookActions": [
    {
      "id": "action_1",
      "title": "Action Title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "impact": "low|medium|high",
      "category": "technical|content|marketing|operational",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expectedOutcome": "What to expect",
      "timeToComplete": "X hours/days",
      "cost": "Free|$X"
    }
  ],
  "confidence": 0.85,
  "followUpQuestions": ["Question 1", "Question 2"],
  "relatedMetrics": ["metric1", "metric2"]
}
`;
  }

  // Call GPT API
  private async callGPT(prompt: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are DealerGPT, an expert in automotive dealership analytics and optimization. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Parse GPT response
  private parseGPTResponse(response: string): GPTResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        explanation: parsed.explanation || 'No explanation provided',
        rootCause: parsed.rootCause || 'Unknown',
        playbookActions: parsed.playbookActions || [],
        confidence: parsed.confidence || 0.5,
        followUpQuestions: parsed.followUpQuestions || [],
        relatedMetrics: parsed.relatedMetrics || []
      };
    } catch (error) {
      console.error('Failed to parse GPT response:', error);
      return this.getFallbackResponse({
        metric: 'unknown',
        value: 0,
        expectedValue: 0,
        timestamp: new Date(),
        tenantId: 'unknown',
        anomalyScore: 0,
        method: 'unknown'
      });
    }
  }

  // Fallback response when GPT fails
  private getFallbackResponse(context: AnomalyContext): GPTResponse {
    return {
      explanation: `Anomaly detected in ${context.metric} with score ${context.anomalyScore.toFixed(2)}. Current value ${context.value} differs from expected ${context.expectedValue}.`,
      rootCause: 'Requires manual investigation',
      playbookActions: [
        {
          id: 'investigate_1',
          title: 'Investigate Data Quality',
          description: 'Check if the anomaly is due to data quality issues',
          priority: 'high',
          effort: 'medium',
          impact: 'high',
          category: 'technical',
          steps: [
            'Verify data source accuracy',
            'Check for system errors or outages',
            'Validate data collection processes'
          ],
          expectedOutcome: 'Identify if anomaly is real or data issue',
          timeToComplete: '2-4 hours',
          cost: 'Free'
        },
        {
          id: 'investigate_2',
          title: 'Review External Factors',
          description: 'Check for external factors that might explain the anomaly',
          priority: 'medium',
          effort: 'low',
          impact: 'medium',
          category: 'operational',
          steps: [
            'Check for seasonal patterns',
            'Review recent marketing campaigns',
            'Look for competitor activity'
          ],
          expectedOutcome: 'Identify external factors contributing to anomaly',
          timeToComplete: '1-2 hours',
          cost: 'Free'
        }
      ],
      confidence: 0.3,
      followUpQuestions: [
        'What external factors might have influenced this metric?',
        'Are there any recent changes to data collection or processing?',
        'Has there been any unusual activity in related metrics?'
      ],
      relatedMetrics: ['traffic', 'conversions', 'revenue']
    };
  }

  // Generate playbook for specific metric
  async generatePlaybook(metric: string, currentValue: number, targetValue: number): Promise<PlaybookAction[]> {
    const prompt = `
Generate a playbook for improving ${metric} from ${currentValue} to ${targetValue} in an automotive dealership context.

Provide 3-5 specific, actionable steps with:
- Clear titles and descriptions
- Priority levels (high/medium/low)
- Effort estimates (low/medium/high)
- Expected impact (low/medium/high)
- Category (technical/content/marketing/operational)
- Step-by-step instructions
- Expected outcomes
- Time to complete
- Cost estimates

Focus on practical, implementable solutions for car dealerships.
`;

    try {
      const response = await this.callGPT(prompt);
      const parsed = JSON.parse(response);
      return parsed.playbookActions || [];
    } catch (error) {
      console.error('Playbook generation failed:', error);
      return this.getDefaultPlaybook(metric);
    }
  }

  // Default playbook when GPT fails
  private getDefaultPlaybook(metric: string): PlaybookAction[] {
    const playbooks: { [key: string]: PlaybookAction[] } = {
      'aiv': [
        {
          id: 'improve_aiv_1',
          title: 'Optimize Content for AI Search',
          description: 'Improve content to be more discoverable by AI search engines',
          priority: 'high',
          effort: 'medium',
          impact: 'high',
          category: 'content',
          steps: [
            'Audit existing content for AI-friendly structure',
            'Add FAQ sections with common customer questions',
            'Include specific product details and specifications',
            'Use natural language that matches customer queries'
          ],
          expectedOutcome: 'Increased AI search visibility',
          timeToComplete: '1-2 weeks',
          cost: '$500-1000'
        }
      ],
      'ati': [
        {
          id: 'improve_ati_1',
          title: 'Build Trust Signals',
          description: 'Enhance trustworthiness indicators for AI systems',
          priority: 'high',
          effort: 'high',
          impact: 'high',
          category: 'marketing',
          steps: [
            'Collect and respond to customer reviews',
            'Display certifications and awards prominently',
            'Add customer testimonials with photos',
            'Ensure accurate business information across all platforms'
          ],
          expectedOutcome: 'Improved trust score with AI systems',
          timeToComplete: '2-4 weeks',
          cost: '$1000-2000'
        }
      ],
      'crs': [
        {
          id: 'improve_crs_1',
          title: 'Enhance Content Reliability',
          description: 'Improve content accuracy and freshness',
          priority: 'medium',
          effort: 'medium',
          impact: 'medium',
          category: 'content',
          steps: [
            'Regular content audits and updates',
            'Implement content versioning system',
            'Add fact-checking processes',
            'Ensure consistent information across channels'
          ],
          expectedOutcome: 'More reliable and accurate content',
          timeToComplete: '2-3 weeks',
          cost: '$300-800'
        }
      ]
    };

    return playbooks[metric] || [
      {
        id: 'generic_improvement',
        title: 'General Metric Improvement',
        description: 'Generic steps to improve the metric',
        priority: 'medium',
        effort: 'medium',
        impact: 'medium',
        category: 'operational',
        steps: [
          'Analyze current performance',
          'Identify improvement opportunities',
          'Implement changes gradually',
          'Monitor and adjust as needed'
        ],
        expectedOutcome: 'Improved metric performance',
        timeToComplete: '1-2 weeks',
        cost: 'Variable'
      }
    ];
  }

  // Get explanation for metric trends
  async explainTrend(metric: string, trend: 'increasing' | 'decreasing' | 'stable', period: string): Promise<string> {
    const prompt = `
Explain why ${metric} is ${trend} over the ${period} period in an automotive dealership context.

Provide a clear, concise explanation focusing on:
- Most likely causes
- Industry context
- Potential implications
- Recommended actions

Keep it under 200 words and make it actionable for dealership management.
`;

    try {
      const response = await this.callGPT(prompt);
      return response;
    } catch (error) {
      console.error('Trend explanation failed:', error);
      return `The ${trend} trend in ${metric} over the ${period} period requires further investigation. This could be due to various factors including market conditions, competitive activity, or internal changes. We recommend analyzing related metrics and external factors to identify the root cause.`;
    }
  }
}

// Export singleton instance
export const dealerGPT = new DealerGPT(
  process.env.OPENAI_API_KEY || '',
  process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
);
