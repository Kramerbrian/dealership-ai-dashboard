"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Zap, Shield, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

interface PulseMetric {
  id: number;
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  confidence: 'High' | 'Medium' | 'Low';
  cause: string;
}

export default function DealershipAIPulseV1() {
  const [metrics, setMetrics] = useState<PulseMetric[]>([]);
  const [digest, setDigest] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPulseData();
  }, []);

  async function fetchPulseData() {
    setLoading(true);
    setError(null);

    try {
      // Fetch aggregated pulse data from dedicated API
      const res = await fetch('/api/pulse?domain=germainnissan.com', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch pulse data');
      }

      const data = await res.json();

      if (data.success) {
        setMetrics(data.metrics);
        setDigest(data.digest);
      } else {
        throw new Error(data.error || 'Invalid response');
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch pulse data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
      
      // Fallback to demo data
      setMetrics([
        {
          id: 1,
          title: 'AI Visibility Index',
          value: 87,
          change: +6,
          trend: 'up',
          confidence: 'High',
          cause: 'Improved schema coverage',
        },
        {
          id: 2,
          title: 'Revenue at Risk',
          value: 43000,
          change: -8,
          trend: 'down',
          confidence: 'High',
          cause: 'Increased AIV mentions across ChatGPT and Gemini',
        },
        {
          id: 3,
          title: 'UGC Health',
          value: 91,
          change: +2,
          trend: 'up',
          confidence: 'Medium',
          cause: 'Faster review responses',
        },
        {
          id: 4,
          title: 'Zero-Click Inclusion',
          value: 64,
          change: +5,
          trend: 'up',
          confidence: 'Medium',
          cause: 'AI Overviews alignment improved',
        },
      ]);
      setDigest('System scan complete — AIV +6%, 2 schema fixes auto-queued, UGC improving steadily.');
    }
  }

  const icons = [BarChart3, Zap, Shield, TrendingUp, AlertTriangle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">DealershipAI Pulse Dashboard v1</h1>
        <p className="text-slate-400 text-sm">Clarity • Trust • Effortless UX • Intuitive UI • Hyper-Innovative</p>
      </header>

      {/* Daily Digest Banner */}
      <motion.div
        className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading daily digest…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : (
          digest
        )}
      </motion.div>

      {/* Metric Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, i) => {
          const Icon = icons[i % icons.length];

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{m.title}</div>
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-bold">
                      {m.title === 'Revenue at Risk' 
                        ? `$${m.value.toLocaleString()}` 
                        : `${m.value}%`}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        m.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {m.change > 0 ? '+' : ''}
                      {m.title === 'Revenue at Risk' 
                        ? `$${Math.abs(m.change).toLocaleString()}` 
                        : `${m.change}%`}
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm mt-3">{m.cause}</div>
                  <div className="flex justify-between mt-4 text-xs text-slate-500">
                    <span>Confidence: {m.confidence}</span>
                    <span>Updated {loading ? '...' : `${Math.floor(Math.random() * 9) + 1} min ago`}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="mt-10 text-center">
        <Button 
          onClick={fetchPulseData}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Running AI Audit...
            </>
          ) : (
            'Run AI Audit'
          )}
        </Button>
        <p className="text-slate-500 text-sm mt-3">
          Next scan scheduled for 02:00 AM • Feature flags ready for live mode
        </p>
      </div>

      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(to right, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}

