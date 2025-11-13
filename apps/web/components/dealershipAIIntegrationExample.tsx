/**
 * DealershipAI Integration Example
 * Christopher Nolan and Matrix references for sophisticated interactions
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Zap, 
  Brain, 
  Target,
  Clock,
  TrendingUp,
  Eye,
  Shield,
  Sparkles
} from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  responseRate: number;
  suggestedResponse: string;
  status: 'low' | 'medium' | 'high';
}

const platforms: Platform[] = [
  {
    id: 'google',
    name: 'Google Reviews',
    responseRate: 23,
    suggestedResponse: "Thank you for your feedback! We're committed to providing exceptional service and would love to discuss your experience further. Please reach out to us directly.",
    status: 'low'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    responseRate: 45,
    suggestedResponse: "We appreciate you taking the time to share your thoughts. Our team is always working to improve, and your feedback helps us grow. Let's connect!",
    status: 'medium'
  },
  {
    id: 'yelp',
    name: 'Yelp',
    responseRate: 67,
    suggestedResponse: "Thank you for your review! We're thrilled to hear about your positive experience. We look forward to serving you again soon.",
    status: 'high'
  }
];

export default function DealershipAIIntegrationExample() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRespond = (platform: string, text: string) => {
    alert(`🚀 Response sent to ${platform}!\n\n${text}\n\nHold on tight, we're entering bullet time…`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low': return <Target className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Response Engine</h3>
            <p className="text-sm text-gray-600">Nolan-inspired reputation management</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">System Status</span>
          </div>
          <p className="text-sm text-blue-800">
            Our reputation engines are humming. But remember: even a dream within a dream needs a reality check.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Platform Response Analysis</h4>
        <p className="text-slate-400 text-sm mb-4">
          Below are witty responses suggested for platforms with low response rates. Engage responsibly—these are set to warp reality.
        </p>
        
        <div className="space-y-4">
          {platforms.map((platform) => (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlatform === platform.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlatform(platform.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{platform.name}</div>
                    <div className="text-sm text-gray-600">
                      Response Rate: {platform.responseRate}%
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(platform.status)}`}>
                  {getStatusIcon(platform.status)}
                  {platform.status.toUpperCase()}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="text-sm text-gray-700 font-medium mb-1">Suggested Response:</div>
                <div className="text-sm text-gray-600">{platform.suggestedResponse}</div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRespond(platform.name, platform.suggestedResponse);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <Send className="w-4 h-4" />
                Enter Bullet Time
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-900">AI Insights</span>
        </div>
        <p className="text-sm text-green-800">
          Your reputation management is operating in bullet time—faster than Neo dodging bullets while maintaining the elegance of a Christopher Nolan plot twist. The Matrix has nothing on your response strategy.
        </p>
      </div>
    </div>
  );
}
