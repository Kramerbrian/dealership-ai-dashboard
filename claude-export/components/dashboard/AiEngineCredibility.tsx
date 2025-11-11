'use client';

import { useState, useEffect } from 'react';
import { Bot, Zap, Brain, Search, Sparkles } from 'lucide-react';

interface Engine {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  score: number;
  description: string;
  color: string;
}

export function AiEngineCredibility() {
  const [currentEngine, setCurrentEngine] = useState(0);

  const engines: Engine[] = [
    {
      name: "ChatGPT",
      icon: Bot,
      score: 78.9,
      description: "OpenAI's flagship model",
      color: "text-green-600"
    },
    {
      name: "Gemini",
      icon: Brain,
      score: 85.1,
      description: "Google's advanced AI",
      color: "text-blue-600"
    },
    {
      name: "Perplexity",
      icon: Search,
      score: 74.3,
      description: "Search-focused AI",
      color: "text-purple-600"
    },
    {
      name: "Copilot",
      icon: Zap,
      score: 82.1,
      description: "Microsoft's AI assistant",
      color: "text-orange-600"
    },
    {
      name: "Claude",
      icon: Sparkles,
      score: 79.5,
      description: "Anthropic's AI model",
      color: "text-indigo-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEngine((prev) => (prev + 1) % engines.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [engines.length]);

  const current = engines[currentEngine];

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Engine Coverage</h3>
        <div className="flex space-x-1">
          {engines.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentEngine ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <current.icon className={`w-12 h-12 ${current.color}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-xl font-bold">{current.name}</h4>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold">{current.score}</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm">{current.description}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">✓</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>How we score:</span>
          <button className="text-blue-400 hover:text-blue-300 underline">
            View methodology
          </button>
        </div>
      </div>
    </div>
  );
}
