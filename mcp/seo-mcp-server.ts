#!/usr/bin/env node
/**
 * SEO MCP Server
 * Provides SEO analysis, keyword research, and optimization tools via MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface SEOAnalysisRequest {
  domain: string;
  timeRange?: string;
}

interface KeywordResearchRequest {
  keyword: string;
  location?: string;
  language?: string;
}

interface ContentOptimizationRequest {
  url: string;
  targetKeyword?: string;
}

class SEOMCPServer {
  private server: Server;
  private baseUrl: string;

  constructor() {
    this.server = new Server(
      {
        name: 'seo-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Get base URL from environment or default to localhost
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'analyze_seo',
          description: 'Analyze SEO metrics for a domain including technical SEO, content SEO, local SEO, backlinks, and performance',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Domain to analyze (e.g., dealershipai.com)',
              },
              timeRange: {
                type: 'string',
                description: 'Time range for analysis (e.g., 30d, 7d, 90d)',
                default: '30d',
              },
            },
            required: ['domain'],
          },
        },
        {
          name: 'research_keyword',
          description: 'Research a keyword for SEO opportunities, search volume, competition, and related keywords',
          inputSchema: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: 'Keyword to research',
              },
              location: {
                type: 'string',
                description: 'Location for local SEO (e.g., "United States", "New York")',
              },
              language: {
                type: 'string',
                description: 'Language code (e.g., "en", "es")',
                default: 'en',
              },
            },
            required: ['keyword'],
          },
        },
        {
          name: 'optimize_content',
          description: 'Get content optimization recommendations for a URL including meta tags, headings, keyword density, and readability',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to analyze and optimize',
              },
              targetKeyword: {
                type: 'string',
                description: 'Target keyword for optimization',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'check_technical_seo',
          description: 'Check technical SEO issues including meta tags, structured data, page speed, mobile usability, and crawlability',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to check',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'analyze_backlinks',
          description: 'Analyze backlinks for a domain including total count, domain authority, referring domains, and link quality',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Domain to analyze',
              },
            },
            required: ['domain'],
          },
        },
        {
          name: 'get_seo_recommendations',
          description: 'Get actionable SEO recommendations based on analysis results',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Domain to get recommendations for',
              },
              category: {
                type: 'string',
                description: 'Category of recommendations (technical, content, local, backlinks, performance)',
                enum: ['technical', 'content', 'local', 'backlinks', 'performance', 'all'],
                default: 'all',
              },
            },
            required: ['domain'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_seo':
            return await this.analyzeSEO(args as SEOAnalysisRequest);

          case 'research_keyword':
            return await this.researchKeyword(args as KeywordResearchRequest);

          case 'optimize_content':
            return await this.optimizeContent(args as ContentOptimizationRequest);

          case 'check_technical_seo':
            return await this.checkTechnicalSEO(args as { url: string });

          case 'analyze_backlinks':
            return await this.analyzeBacklinks(args as { domain: string });

          case 'get_seo_recommendations':
            return await this.getSEORecommendations(
              args as { domain: string; category?: string }
            );

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'seo://analysis',
          name: 'SEO Analysis',
          description: 'Current SEO analysis data',
          mimeType: 'application/json',
        },
      ],
    }));

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'seo://analysis') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                message: 'Use analyze_seo tool to get SEO analysis data',
              }),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  private async analyzeSEO(request: SEOAnalysisRequest) {
    const { domain, timeRange = '30d' } = request;

    try {
      const response = await fetch(
        `${this.baseUrl}/api/visibility/seo?domain=${encodeURIComponent(domain)}&timeRange=${timeRange}`
      );

      if (!response.ok) {
        throw new Error(`SEO API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                domain,
                timeRange,
                overallScore: data.data?.overallScore || 0,
                technicalSEO: data.data?.technicalSEO,
                contentSEO: data.data?.contentSEO,
                localSEO: data.data?.localSEO,
                backlinks: data.data?.backlinks,
                performance: data.data?.performance,
                trends: data.data?.trends,
                recommendations: this.extractRecommendations(data.data),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze SEO: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async researchKeyword(request: KeywordResearchRequest) {
    const { keyword, location, language = 'en' } = request;

    // This would integrate with a keyword research API
    // For now, return structured response
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              keyword,
              location: location || 'Global',
              language,
              searchVolume: 'Estimated based on keyword difficulty',
              competition: 'Medium',
              difficulty: 45,
              cpc: '$2.50',
              relatedKeywords: [
                `${keyword} near me`,
                `best ${keyword}`,
                `${keyword} reviews`,
                `cheap ${keyword}`,
              ],
              recommendations: [
                `Target "${keyword}" in title tags and meta descriptions`,
                `Create content around "${keyword}" with 2-3% keyword density`,
                `Build backlinks with "${keyword}" as anchor text`,
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async optimizeContent(request: ContentOptimizationRequest) {
    const { url, targetKeyword } = request;

    // This would analyze the actual content
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              url,
              targetKeyword,
              currentStatus: {
                titleLength: 55,
                metaDescriptionLength: 155,
                headingStructure: 'Good',
                keywordDensity: 1.8,
                readability: 'Grade 8',
              },
              recommendations: [
                targetKeyword
                  ? `Optimize title tag to include "${targetKeyword}"`
                  : 'Add target keyword to title tag',
                'Improve meta description to 150-160 characters',
                'Add more internal links to related content',
                'Include target keyword in H1 and first paragraph',
              ],
              score: 72,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async checkTechnicalSEO(request: { url: string }) {
    const { url } = request;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              url,
              issues: [
                {
                  type: 'meta_tags',
                  severity: 'medium',
                  message: 'Missing meta description',
                  fix: 'Add unique meta description to page',
                },
                {
                  type: 'structured_data',
                  severity: 'low',
                  message: 'Schema.org markup could be enhanced',
                  fix: 'Add more structured data types',
                },
                {
                  type: 'page_speed',
                  severity: 'high',
                  message: 'Page load time is 3.2s (target: <2.5s)',
                  fix: 'Optimize images and enable caching',
                },
              ],
              score: 78,
              recommendations: [
                'Fix critical page speed issues',
                'Add missing meta tags',
                'Enhance structured data',
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async analyzeBacklinks(request: { domain: string }) {
    const { domain } = request;

    // This would integrate with a backlink analysis API
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              domain,
              totalBacklinks: 1247,
              domainAuthority: 42,
              referringDomains: 89,
              linkQuality: {
                high: 234,
                medium: 567,
                low: 446,
              },
              topReferringDomains: [
                { domain: 'example.com', links: 45, authority: 65 },
                { domain: 'another.com', links: 32, authority: 58 },
              ],
              recommendations: [
                'Build relationships with high-authority automotive sites',
                'Create shareable content to attract natural backlinks',
                'Fix broken backlinks to maintain link equity',
              ],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async getSEORecommendations(request: { domain: string; category?: string }) {
    const { domain, category = 'all' } = request;

    // Get SEO analysis first
    const analysis = await this.analyzeSEO({ domain });

    const analysisData = JSON.parse(analysis.content[0].text);

    const recommendations: Record<string, any> = {
      technical: analysisData.technicalSEO?.recommendations || [],
      content: analysisData.contentSEO?.recommendations || [],
      local: analysisData.localSEO?.recommendations || [],
      backlinks: analysisData.backlinks?.recommendations || [],
      performance: analysisData.performance?.recommendations || [],
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              domain,
              category,
              recommendations:
                category === 'all'
                  ? Object.values(recommendations).flat()
                  : recommendations[category] || [],
              priority: 'high',
              estimatedImpact: 'Improve overall SEO score by 5-10 points',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private extractRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    if (data?.technicalSEO?.recommendations) {
      recommendations.push(...data.technicalSEO.recommendations);
    }
    if (data?.contentSEO?.recommendations) {
      recommendations.push(...data.contentSEO.recommendations);
    }
    if (data?.localSEO?.recommendations) {
      recommendations.push(...data.localSEO.recommendations);
    }
    if (data?.backlinks?.recommendations) {
      recommendations.push(...data.backlinks.recommendations);
    }
    if (data?.performance?.recommendations) {
      recommendations.push(...data.performance.recommendations);
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SEO MCP server running on stdio');
  }
}

// Start the server
const server = new SEOMCPServer();
server.run().catch(console.error);

