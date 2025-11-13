'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Search, MessageSquare, Zap } from 'lucide-react';

const PlatformTracking: React.FC = () => {
  const platforms = [
    {
      name: 'ChatGPT',
      icon: <Bot className="w-5 h-5" />,
      score: 87,
      trend: 'up',
      color: 'from-green-500 to-emerald-500',
      description: 'OpenAI GPT models'
    },
    {
      name: 'Perplexity',
      icon: <Search className="w-5 h-5" />,
      score: 92,
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
      description: 'AI search engine'
    },
    {
      name: 'Gemini',
      icon: <Zap className="w-5 h-5" />,
      score: 78,
      trend: 'down',
      color: 'from-purple-500 to-pink-500',
      description: 'Google AI models'
    },
    {
      name: 'Claude',
      icon: <MessageSquare className="w-5 h-5" />,
      score: 85,
      trend: 'stable',
      color: 'from-amber-500 to-orange-500',
      description: 'Anthropic AI assistant'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">AI Platform Tracking</h2>
        <p className="text-slate-600">Visibility across major AI platforms</p>
      </div>

      <div className="space-y-4">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${platform.color} text-white`}>
                {platform.icon}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{platform.name}</h3>
                <p className="text-sm text-slate-600">{platform.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{platform.score}%</div>
              <div className="text-xs text-slate-500 capitalize">{platform.trend}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlatformTracking;
