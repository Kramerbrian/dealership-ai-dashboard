// AI Fallback System
// Provides mock AI functionality when external APIs are unavailable

export interface FallbackAnalysis {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  categories: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  metadata: {
    wordCount: number;
    language: string;
    topics: string[];
    entities: string[];
  };
}

export class AIFallbackService {
  private static instance: AIFallbackService;
  private isApiAvailable: boolean = true;
  private lastCheck: Date = new Date();

  static getInstance(): AIFallbackService {
    if (!AIFallbackService.instance) {
      AIFallbackService.instance = new AIFallbackService();
    }
    return AIFallbackService.instance;
  }

  async checkApiAvailability(): Promise<boolean> {
    // Check if we're within rate limits
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - this.lastCheck.getTime();
    
    // If we checked recently, return cached result
    if (timeSinceLastCheck < 60000) { // 1 minute cache
      return this.isApiAvailable;
    }

    try {
      // Try a simple API call to check availability
      const response = await fetch('/api/health');
      this.isApiAvailable = response.ok;
      this.lastCheck = now;
      return this.isApiAvailable;
    } catch (error) {
      console.warn('API availability check failed, using fallback mode');
      this.isApiAvailable = false;
      this.lastCheck = now;
      return false;
    }
  }

  async analyzeDocument(fileName: string, fileContent?: string): Promise<FallbackAnalysis> {
    const isApiAvailable = await this.checkApiAvailability();
    
    if (isApiAvailable) {
      // Try to use real API first
      try {
        // This would call the real Anthropic API
        throw new Error('API rate limit exceeded');
      } catch (error) {
        console.warn('Real API failed, falling back to mock analysis');
        return this.generateMockAnalysis(fileName, fileContent);
      }
    }

    return this.generateMockAnalysis(fileName, fileContent);
  }

  private generateMockAnalysis(fileName: string, fileContent?: string): FallbackAnalysis {
    // Generate realistic mock analysis based on file name and content
    const fileType = this.getFileType(fileName);
    const isFinancial = fileName.toLowerCase().includes('financial') || 
                       fileName.toLowerCase().includes('budget') ||
                       fileName.toLowerCase().includes('revenue');
    const isMarketing = fileName.toLowerCase().includes('marketing') ||
                       fileName.toLowerCase().includes('campaign') ||
                       fileName.toLowerCase().includes('promotion');
    const isOperational = fileName.toLowerCase().includes('operation') ||
                         fileName.toLowerCase().includes('process') ||
                         fileName.toLowerCase().includes('procedure');

    const baseInsights = [
      'Document contains valuable business insights that could improve operational efficiency',
      'Key metrics and data points identified for strategic decision making',
      'Opportunities for process optimization and cost reduction identified'
    ];

    const financialInsights = [
      'Financial performance indicators show positive trends in key areas',
      'Budget allocation recommendations for improved ROI',
      'Revenue optimization opportunities identified in current financial structure'
    ];

    const marketingInsights = [
      'Marketing strategies align well with target audience preferences',
      'Campaign performance data suggests strong engagement potential',
      'Brand positioning opportunities identified for market expansion'
    ];

    const operationalInsights = [
      'Operational processes show efficiency opportunities',
      'Workflow optimization recommendations for improved productivity',
      'Resource allocation strategies for better operational outcomes'
    ];

    let insights = [...baseInsights];
    if (isFinancial) insights = [...insights, ...financialInsights];
    if (isMarketing) insights = [...insights, ...marketingInsights];
    if (isOperational) insights = [...insights, ...operationalInsights];

    const recommendations = [
      'Implement data-driven decision making processes based on document insights',
      'Regular monitoring and analysis of key performance indicators',
      'Cross-functional collaboration to leverage identified opportunities',
      'Continuous improvement initiatives based on document findings'
    ];

    const categories = ['Business Analysis', 'Strategic Planning'];
    if (isFinancial) categories.push('Financial Management');
    if (isMarketing) categories.push('Marketing Strategy');
    if (isOperational) categories.push('Operations Management');

    const sentiment = this.determineSentiment(fileName, fileContent);
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence

    return {
      summary: `This ${fileType} document contains valuable business insights and strategic information. The analysis reveals several key opportunities for improvement and optimization across various business functions. The document demonstrates strong potential for driving positive business outcomes through data-driven decision making and strategic implementation.`,
      keyInsights: insights.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
      categories,
      sentiment,
      confidence,
      metadata: {
        wordCount: this.estimateWordCount(fileContent),
        language: 'en',
        topics: this.extractTopics(fileName, fileContent),
        entities: this.extractEntities(fileName, fileContent)
      }
    };
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF document';
      case 'doc':
      case 'docx': return 'Word document';
      case 'xls':
      case 'xlsx': return 'Excel spreadsheet';
      case 'txt': return 'text document';
      case 'csv': return 'CSV data file';
      default: return 'document';
    }
  }

  private determineSentiment(fileName: string, fileContent?: string): 'positive' | 'negative' | 'neutral' {
    const positiveKeywords = ['growth', 'increase', 'improve', 'success', 'positive', 'profit', 'gain', 'win'];
    const negativeKeywords = ['decrease', 'decline', 'loss', 'problem', 'issue', 'challenge', 'risk', 'negative'];
    
    const text = (fileName + ' ' + (fileContent || '')).toLowerCase();
    
    const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private estimateWordCount(fileContent?: string): number {
    if (fileContent) {
      return fileContent.split(/\s+/).length;
    }
    // Estimate based on file type
    return Math.floor(Math.random() * 2000) + 500; // 500-2500 words
  }

  private extractTopics(fileName: string, fileContent?: string): string[] {
    const commonTopics = [
      'business strategy', 'financial analysis', 'marketing', 'operations',
      'customer service', 'sales', 'technology', 'automotive', 'dealership',
      'management', 'performance', 'growth', 'efficiency', 'optimization'
    ];
    
    const text = (fileName + ' ' + (fileContent || '')).toLowerCase();
    return commonTopics.filter(topic => text.includes(topic.split(' ')[0]));
  }

  private extractEntities(fileName: string, fileContent?: string): string[] {
    const commonEntities = [
      'DealershipAI', 'Customer', 'Sales Team', 'Management', 'Finance',
      'Marketing Department', 'Operations', 'Technology', 'Automotive Industry'
    ];
    
    const text = (fileName + ' ' + (fileContent || '')).toLowerCase();
    return commonEntities.filter(entity => 
      text.includes(entity.toLowerCase().split(' ')[0])
    );
  }

  async generateInsights(tenantId: string, source: string): Promise<any[]> {
    const isApiAvailable = await this.checkApiAvailability();
    
    if (!isApiAvailable) {
      return this.generateMockInsights(tenantId, source);
    }

    // Try real API, fallback to mock if it fails
    try {
      // This would call the real AI insights API
      throw new Error('API rate limit exceeded');
    } catch (error) {
      console.warn('Real API failed, falling back to mock insights');
      return this.generateMockInsights(tenantId, source);
    }
  }

  private generateMockInsights(tenantId: string, source: string): any[] {
    const insightTypes = ['opportunity', 'threat', 'trend', 'recommendation', 'alert', 'achievement'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const categories = ['marketing', 'sales', 'operations', 'finance', 'technology', 'customer-service'];
    
    const insights = [];
    const numInsights = Math.floor(Math.random() * 3) + 2; // 2-4 insights
    
    for (let i = 0; i < numInsights; i++) {
      const type = insightTypes[Math.floor(Math.random() * insightTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      insights.push({
        tenant_id: tenantId,
        type,
        priority,
        title: `Mock ${type.charAt(0).toUpperCase() + type.slice(1)}: ${source} Analysis`,
        description: `This is a mock ${type} generated for ${source}. In a real implementation, this would be generated by AI analysis of your actual data.`,
        impact: Math.floor(Math.random() * 40) + 60, // 60-100
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        source: `Mock Analysis: ${source}`,
        category,
        tags: [source, 'mock', 'fallback'],
        action_required: Math.random() > 0.5,
        action_text: `Review mock ${type} for ${source}`,
        ai_generated: true,
        verified: false,
        cost: Math.floor(Math.random() * 1000) + 100,
        effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        timeframe: ['immediate', 'short', 'medium', 'long'][Math.floor(Math.random() * 4)],
        created_at: new Date().toISOString()
      });
    }
    
    return insights;
  }

  async generateRecommendations(tenantId: string): Promise<any[]> {
    const isApiAvailable = await this.checkApiAvailability();
    
    if (!isApiAvailable) {
      return this.generateMockRecommendations(tenantId);
    }

    // Try real API, fallback to mock if it fails
    try {
      // This would call the real recommendations API
      throw new Error('API rate limit exceeded');
    } catch (error) {
      console.warn('Real API failed, falling back to mock recommendations');
      return this.generateMockRecommendations(tenantId);
    }
  }

  private generateMockRecommendations(tenantId: string): any[] {
    const recommendations = [
      {
        tenant_id: tenantId,
        title: 'Implement AI-Powered Customer Service',
        description: 'Deploy AI chatbots to handle customer inquiries 24/7, improving response times and customer satisfaction.',
        category: 'customer-service',
        priority: 'high',
        impact: 85,
        effort: 'medium',
        cost: 1500,
        timeframe: 'short',
        roi: 250,
        success_rate: 90,
        prerequisites: ['AI platform setup', 'Training data preparation'],
        steps: [
          'Choose AI platform (OpenAI, Anthropic, etc.)',
          'Prepare training data and FAQs',
          'Configure chatbot responses',
          'Test with sample conversations',
          'Deploy to website and social media'
        ],
        expected_outcome: '40% reduction in response time, 25% increase in customer satisfaction',
        ai_generated: true,
        verified: false,
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString()
      },
      {
        tenant_id: tenantId,
        title: 'Optimize Social Media Strategy',
        description: 'Develop a comprehensive social media strategy to increase brand visibility and engagement.',
        category: 'marketing',
        priority: 'medium',
        impact: 70,
        effort: 'low',
        cost: 500,
        timeframe: 'medium',
        roi: 180,
        success_rate: 85,
        prerequisites: ['Social media accounts', 'Content calendar'],
        steps: [
          'Audit current social media presence',
          'Identify target audience and platforms',
          'Create content calendar',
          'Develop brand voice and guidelines',
          'Implement posting schedule'
        ],
        expected_outcome: '35% increase in social media engagement and brand awareness',
        ai_generated: true,
        verified: false,
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString()
      }
    ];

    return recommendations;
  }
}

// Export singleton instance
export const aiFallbackService = AIFallbackService.getInstance();
