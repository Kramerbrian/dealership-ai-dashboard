/**
 * Mystery Shop Widget
 * AI probe results, visibility across platforms
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MysteryShopWidgetProps {
  data: {
    aiMentionRate: number; // percentage
    zeroClickCoverage: number; // percentage
    platformResults: Array<{
      platform: string;
      visible: boolean;
      visibility: number; // 0-100
      evidence: Array<{
        query: string;
        position: number;
        snippet: string;
        timestamp: string;
      }>;
    }>;
    lastProbe: string;
  };
}

export default function MysteryShopWidget({ data }: MysteryShopWidgetProps) {
  const platformIcons: Record<string, any> = {
    chatgpt: Brain,
    perplexity: Search,
    gemini: Eye,
    claude: MessageSquare,
    copilot: Brain,
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      chatgpt: 'blue',
      perplexity: 'purple',
      gemini: 'green',
      claude: 'orange',
      copilot: 'indigo',
    };
    return colors[platform] || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* AI Mention Rate */}
      <Card>
        <CardHeader>
          <CardTitle>AI Mention Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl font-bold text-gray-900">{data.aiMentionRate}%</div>
                <div className="text-2xl text-gray-400">mention rate</div>
              </div>
              <p className="text-sm text-gray-600">
                How often AI platforms mention your dealership
              </p>
            </div>
            <Brain className="w-16 h-16 text-blue-500" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.aiMentionRate}%` }}
              transition={{ duration: 1 }}
              className="h-3 rounded-full bg-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Zero-Click Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>Zero-Click Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl font-bold text-gray-900">{data.zeroClickCoverage}%</div>
                <div className="text-2xl text-gray-400">coverage</div>
              </div>
              <p className="text-sm text-gray-600">
                Featured snippets and AI overviews
              </p>
            </div>
            <Eye className="w-16 h-16 text-green-500" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.zeroClickCoverage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-3 rounded-full bg-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Results */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.platformResults.map((platform, idx) => {
              const Icon = platformIcons[platform.platform] || Brain;
              const color = getPlatformColor(platform.platform);
              
              return (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${color}-100`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{platform.platform}</p>
                        <p className="text-sm text-gray-600">Visibility: {platform.visibility}%</p>
                      </div>
                    </div>
                    {platform.visible ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  
                  {platform.evidence.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-700 uppercase">Recent Evidence</p>
                      {platform.evidence.slice(0, 2).map((evidence, eIdx) => (
                        <div key={eIdx} className="p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-900 mb-1">
                            "{evidence.query}"
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {evidence.snippet}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Position #{evidence.position} • {new Date(evidence.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {platform.evidence.length === 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <p className="text-xs text-yellow-800">No evidence found</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Last Probe Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Last AI Probe</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(data.lastProbe).toLocaleDateString()} at {new Date(data.lastProbe).toLocaleTimeString()}
              </p>
            </div>
            <Search className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

