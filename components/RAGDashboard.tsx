'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface RAGStats {
  totalEvents: number;
  totalChunks: number;
  sources: Record<string, number>;
  dateRange: { start: string; end: string };
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    id: string;
    text: string;
    source: string;
    timestamp: string;
  }>;
  confidence: number;
  recommendations: string[];
}

interface SentimentSummary {
  positive: number;
  negative: number;
  neutral: number;
  trends: string[];
}

export function RAGDashboard() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<RAGResponse | null>(null);

  // React Query hooks for data fetching
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['rag', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/ai/rag?action=get_stats');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load stats');
      return data.data as RAGStats;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });

  const { data: sentiment, refetch: refetchSentiment } = useQuery({
    queryKey: ['rag', 'sentiment'],
    queryFn: async () => {
      const res = await fetch('/api/ai/rag?action=get_sentiment');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load sentiment');
      return data.data as SentimentSummary;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });

  const queryClient = useQueryClient();

  // Mutation for ingesting data
  const ingestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/rag?action=test_ingest');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to ingest sample data');
      return data.stats as RAGStats;
    },
    onSuccess: (newStats) => {
      // Update cache
      queryClient.setQueryData(['rag', 'stats'], newStats);
      // Refetch sentiment
      refetchSentiment();
    },
  });

  // Mutation for querying
  const queryMutation = useMutation({
    mutationFn: async (queryText: string) => {
      const res = await fetch('/api/ai/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'query',
          question: queryText,
          k: 4,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to process query');
      return data.data as RAGResponse;
    },
    onSuccess: (data) => {
      setResponse(data);
    },
  });

  // Mutation for quick insights
  const insightsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/rag?action=test_insights');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to get insights');
      return data.data.pricingQuestions as RAGResponse;
    },
    onSuccess: (insight) => {
      setResponse(insight);
    },
  });

  const handleQuery = () => {
    if (!query.trim()) return;
    queryMutation.mutate(query.trim());
  };

  const getQuickInsights = () => {
    insightsMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI-Powered Customer Insights</h2>
          <p className="text-gray-400">Analyze social media posts and customer feedback with RAG</p>
        </div>
        <button
          onClick={() => ingestMutation.mutate()}
          disabled={ingestMutation.isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowPathIcon className={`w-4 h-4 ${ingestMutation.isPending ? 'animate-spin' : ''}`} />
          Load Sample Data
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
                <div className="text-sm text-gray-400">Total Events</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalChunks}</div>
                <div className="text-sm text-gray-400">Text Chunks</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{Object.keys(stats.sources).length}</div>
                <div className="text-sm text-gray-400">Sources</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <LightBulbIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {sentiment ? sentiment.positive + sentiment.negative + sentiment.neutral : 0}
                </div>
                <div className="text-sm text-gray-400">Analyzed</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sentiment Overview */}
      {sentiment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{sentiment.positive}</div>
              <div className="text-sm text-gray-400">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{sentiment.negative}</div>
              <div className="text-sm text-gray-400">Negative</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{sentiment.neutral}</div>
              <div className="text-sm text-gray-400">Neutral</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Query Interface */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Ask Questions About Customer Feedback</h3>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are customers saying about our pricing?"
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
          />
          <button
            onClick={handleQuery}
            disabled={queryMutation.isPending || !query.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
          >
            Ask
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setQuery('What are customers asking about pricing?')}
            className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            Pricing Questions
          </button>
          <button
            onClick={() => setQuery('What service issues are customers mentioning?')}
            className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            Service Issues
          </button>
          <button
            onClick={() => setQuery('What are the main customer complaints?')}
            className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            Complaints
          </button>
          <button
            onClick={getQuickInsights}
            disabled={insightsMutation.isPending}
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-white transition-colors"
          >
            Quick Insights
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          <span className="text-red-300">
            {queryMutation.error?.message || insightsMutation.error?.message || ingestMutation.error?.message}
          </span>
        </motion.div>
      )}

      {/* Response Display */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">AI Response</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-400">
                  Confidence: {Math.round(response.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <div className="text-gray-300 whitespace-pre-line">{response.answer}</div>
            </div>

            {response.recommendations.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-white mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {response.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.sources.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-white mb-3">Sources</h4>
                <div className="space-y-2">
                  {response.sources.map((source, index) => (
                    <div key={index} className="bg-gray-800/50 rounded p-3 border border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-blue-400 uppercase">{source.source}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(source.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{source.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/50 rounded-lg p-6 border border-gray-800 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-gray-300">Processing your request...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
