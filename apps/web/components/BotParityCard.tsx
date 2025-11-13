'use client';
import { compareBots, getBotParityData } from '@/lib/botParity';
import { useState, useEffect } from 'react';

interface BotParityCardProps {
  domain?: string;
  className?: string;
}

export default function BotParityCard({ domain = 'naplesfordfl.com', className = '' }: BotParityCardProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const bots = await getBotParityData(domain);
        const parityReport = compareBots(bots);
        setReport(parityReport);
      } catch (error) {
        console.error('Failed to load bot parity data:', error);
        // Fallback to mock data
        const mockBots = [
          { bot: 'Googlebot', pages: 320, schemaPct: 92 },
          { bot: 'GPTBot', pages: 318, schemaPct: 84 },
          { bot: 'PerplexityBot', pages: 300, schemaPct: 86 },
          { bot: 'GeminiBot', pages: 312, schemaPct: 88 }
        ];
        setReport(compareBots(mockBots));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [domain]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white/70 p-4 shadow ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const getParityColor = (parity: number) => {
    if (parity >= 90) return 'text-green-600';
    if (parity >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white/70 p-4 shadow ${className}`}>
      <div className="font-semibold mb-1">Bot Parity Monitor</div>
      <div className={`text-2xl font-semibold ${getParityColor(report.parityPct)}`}>
        {report.parityPct}%
      </div>
      <div className="text-sm text-gray-500 mb-2">
        Weakest: {report.weakest}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full ${
            report.parityPct >= 90 ? 'bg-green-500' : 
            report.parityPct >= 80 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${report.parityPct}%` }}
        />
      </div>
      
      <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1">
        {report.notes.map((note: string, i: number) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
      
      {/* Action button */}
      <div className="mt-3">
        <button className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
