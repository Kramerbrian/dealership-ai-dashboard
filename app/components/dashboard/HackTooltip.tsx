'use client';

import React from 'react';
import { Calculator, Lightbulb } from 'lucide-react';

interface HackTooltipProps {
  name: string;
  formula: string;
  insights: string;
}

export const HackTooltip: React.FC<HackTooltipProps> = ({
  name,
  formula,
  insights
}) => {
  return (
    <div className="absolute right-0 top-8 w-80 z-50 
      animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Arrow */}
      <div className="absolute -top-1 right-2 w-2 h-2 rotate-45 
        bg-gray-800 border-l border-t border-gray-700" />
      
      {/* Tooltip Content */}
      <div className="relative bg-gray-800 rounded-lg border border-gray-700 
        shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 
          border-b border-gray-700">
          <h4 className="text-sm font-semibold text-white">
            {name}
          </h4>
        </div>

        {/* Body */}
        <div className="p-3 space-y-3">
          {/* Formula Section */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Calculator className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-gray-400">
                How it's calculated
              </span>
            </div>
            <div className="p-2 rounded bg-gray-900/50 border border-gray-700">
              <code className="text-xs text-white font-mono break-words">
                {formula}
              </code>
            </div>
          </div>

          {/* Insights Section */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-gray-400">
                Why it matters
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {insights}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 bg-gray-900/50 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Click metric card for detailed analysis
          </p>
        </div>
      </div>
    </div>
  );
};
