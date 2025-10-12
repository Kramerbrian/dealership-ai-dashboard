import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface FileUploadResult {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  createdAt: string;
}

export interface DocumentAnalysis {
  id: string;
  fileId: string;
  fileName: string;
  analysis: {
    summary: string;
    keyInsights: string[];
    recommendations: string[];
    categories: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    metadata: {
      wordCount: number;
      pageCount?: number;
      language: string;
      topics: string[];
      entities: string[];
    };
  };
  createdAt: string;
}

export class AnthropicFileUploader {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }
  }

  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.anthropic.com/v1/files', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'files-api-2025-04-14',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'ready',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        id: '',
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
        createdAt: new Date().toISOString(),
      };
    }
  }

  async analyzeDocument(fileId: string, fileName: string): Promise<DocumentAnalysis> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this document and provide:
1. A comprehensive summary
2. Key insights relevant to automotive dealership operations
3. Actionable recommendations
4. Document categories and topics
5. Overall sentiment analysis
6. Confidence score for the analysis
7. Metadata including word count, language, and key entities

Focus on insights that could help improve:
- Customer experience
- Sales processes
- Marketing strategies
- Operational efficiency
- Competitive positioning

Document: ${fileName}`
              },
              {
                type: 'file',
                source: {
                  type: 'file',
                  file_id: fileId
                }
              }
            ]
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format');
      }

      // Parse the AI response to extract structured data
      const analysis = this.parseAnalysisResponse(content.text);

      return {
        id: `analysis_${Date.now()}`,
        fileId,
        fileName,
        analysis,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Document analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAnalysisResponse(text: string): DocumentAnalysis['analysis'] {
    // This is a simplified parser - in production, you'd want more robust parsing
    const lines = text.split('\n');
    
    let summary = '';
    let keyInsights: string[] = [];
    let recommendations: string[] = [];
    let categories: string[] = [];
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.8;
    let wordCount = 0;
    let language = 'en';
    let topics: string[] = [];
    let entities: string[] = [];

    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('summary')) {
        currentSection = 'summary';
        continue;
      } else if (trimmed.toLowerCase().includes('insights') || trimmed.toLowerCase().includes('key insights')) {
        currentSection = 'insights';
        continue;
      } else if (trimmed.toLowerCase().includes('recommendations')) {
        currentSection = 'recommendations';
        continue;
      } else if (trimmed.toLowerCase().includes('categories') || trimmed.toLowerCase().includes('topics')) {
        currentSection = 'categories';
        continue;
      } else if (trimmed.toLowerCase().includes('sentiment')) {
        currentSection = 'sentiment';
        continue;
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const item = trimmed.substring(1).trim();
        if (currentSection === 'insights') {
          keyInsights.push(item);
        } else if (currentSection === 'recommendations') {
          recommendations.push(item);
        } else if (currentSection === 'categories') {
          categories.push(item);
        }
      } else if (trimmed && currentSection === 'summary') {
        summary += trimmed + ' ';
      } else if (trimmed && currentSection === 'sentiment') {
        if (trimmed.toLowerCase().includes('positive')) {
          sentiment = 'positive';
        } else if (trimmed.toLowerCase().includes('negative')) {
          sentiment = 'negative';
        }
        const confidenceMatch = trimmed.match(/(\d+(?:\.\d+)?)%/);
        if (confidenceMatch) {
          confidence = parseFloat(confidenceMatch[1]) / 100;
        }
      }
    }

    // Extract word count from the text
    wordCount = text.split(/\s+/).length;

    // Simple topic extraction (in production, use more sophisticated NLP)
    const commonTopics = ['customer', 'sales', 'marketing', 'service', 'inventory', 'finance', 'technology', 'automotive'];
    topics = commonTopics.filter(topic => text.toLowerCase().includes(topic));

    return {
      summary: summary.trim() || 'No summary available',
      keyInsights: keyInsights.length > 0 ? keyInsights : ['No specific insights identified'],
      recommendations: recommendations.length > 0 ? recommendations : ['No specific recommendations identified'],
      categories: categories.length > 0 ? categories : ['General'],
      sentiment,
      confidence,
      metadata: {
        wordCount,
        language,
        topics,
        entities: entities.length > 0 ? entities : ['No entities identified']
      }
    };
  }

  async getFileStatus(fileId: string): Promise<FileUploadResult> {
    try {
      const response = await fetch(`https://api.anthropic.com/v1/files/${fileId}`, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get file status');
      }

      const result = await response.json();
      
      return {
        id: result.id,
        name: result.name,
        size: result.size,
        type: result.type,
        status: 'ready',
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error('Get file status error:', error);
      return {
        id: fileId,
        name: 'Unknown',
        size: 0,
        type: 'unknown',
        status: 'error',
        error: error instanceof Error ? error.message : 'Status check failed',
        createdAt: new Date().toISOString(),
      };
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.anthropic.com/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }
}

// Singleton instance
export const anthropicFileUploader = new AnthropicFileUploader();
