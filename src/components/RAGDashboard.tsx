'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  Database,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

interface RAGQuery {
  id: string;
  query: string;
  response: string;
  sources: string[];
  timestamp: Date;
  confidence: number;
}

interface RAGMetrics {
  total_queries: number;
  average_confidence: number;
  top_sources: Array<{ source: string; count: number }>;
  recent_queries: RAGQuery[];
}

export function RAGDashboard() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<RAGMetrics | null>(null);
  const [recentQueries, setRecentQueries] = useState<RAGQuery[]>([]);

  useEffect(() => {
    fetchRAGMetrics();
  }, []);

  const fetchRAGMetrics = async () => {
    try {
      // Mock data for now
      const mockMetrics: RAGMetrics = {
        total_queries: 1247,
        average_confidence: 0.87,
        top_sources: [
          { source: 'DealershipAI Knowledge Base', count: 456 },
          { source: 'SEO Best Practices', count: 234 },
          { source: 'Automotive Industry Data', count: 189 },
          { source: 'Local Market Analysis', count: 123 },
        ],
        recent_queries: [
          {
            id: '1',
            query: 'What are the best practices for automotive SEO?',
            response: 'Automotive SEO best practices include optimizing for local search, implementing structured data, and creating high-quality content about vehicles and services.',
            sources: ['SEO Best Practices', 'Automotive Industry Data'],
            timestamp: new Date(),
            confidence: 0.92,
          },
        ],
      };

      setMetrics(mockMetrics);
      setRecentQueries(mockMetrics.recent_queries);
    } catch (error) {
      console.error('Error fetching RAG metrics:', error);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Mock RAG query
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse = `Based on your query "${query}", here's what I found in the DealershipAI knowledge base:

1. **SEO Optimization**: Focus on local search optimization and structured data implementation
2. **Content Strategy**: Create comprehensive vehicle guides and service information
3. **AI Visibility**: Optimize for featured snippets and AI assistant citations

Sources: DealershipAI Knowledge Base, SEO Best Practices, Automotive Industry Data`;

      setResponse(mockResponse);
      
      // Add to recent queries
      const newQuery: RAGQuery = {
        id: Date.now().toString(),
        query,
        response: mockResponse,
        sources: ['DealershipAI Knowledge Base', 'SEO Best Practices'],
        timestamp: new Date(),
        confidence: 0.89,
      };
      
      setRecentQueries(prev => [newQuery, ...prev.slice(0, 9)]);
      setQuery('');
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RAG Dashboard</h1>
          <p className="text-muted-foreground">
            Ask questions about dealership optimization and get AI-powered insights
          </p>
        </div>
      </div>

      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Ask a Question</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about SEO, AI visibility, compliance, or optimization strategies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              className="flex-1"
            />
            <Button onClick={handleQuery} disabled={isLoading || !query.trim()}>
              {isLoading ? 'Searching...' : 'Ask'}
            </Button>
          </div>
          
          {response && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Response:</h3>
              <p className="text-sm whitespace-pre-line">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_queries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All-time queries processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.average_confidence * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Response accuracy score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Sources</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.top_sources.length}</div>
              <p className="text-xs text-muted-foreground">
                Active knowledge bases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentQueries.length}</div>
              <p className="text-xs text-muted-foreground">
                Queries in last session
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Sources */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Top Knowledge Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.top_sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{source.source}</span>
                  </div>
                  <Badge variant="outline">{source.count} queries</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentQueries.map((query) => (
              <div key={query.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{query.query}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {Math.round(query.confidence * 100)}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {query.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {query.response}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Sources:</span>
                  {query.sources.map((source, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
