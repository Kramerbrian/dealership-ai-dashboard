/**
 * Propagation Widget
 * Shows propagation status across platforms
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Globe,
  Brain,
  Search,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PropagationWidgetProps {
  status: {
    dealer_id: string;
    change_type: string;
    change_timestamp: string;
    checks: Array<{
      target: string;
      timestamp: string;
      propagated: boolean;
      latency_hours?: number;
      error?: string;
    }>;
    all_propagated: boolean;
    max_latency_hours: number;
    threshold_hours: number;
    alert_triggered: boolean;
  };
}

export default function PropagationWidget({ status }: PropagationWidgetProps) {
  const platformIcons: Record<string, any> = {
    google: Globe,
    gemini: Brain,
    perplexity: Search,
    chatgpt: Brain,
    site_cache: Globe,
  };

  const getPlatformLabel = (target: string) => {
    const labels: Record<string, string> = {
      google: 'Google Search',
      gemini: 'Google Gemini',
      perplexity: 'Perplexity',
      chatgpt: 'ChatGPT',
      site_cache: 'Site Cache',
    };
    return labels[target] || target;
  };

  const formatLatency = (hours?: number) => {
    if (!hours) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className={status.alert_triggered ? 'border-2 border-red-200 bg-red-50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Propagation Status</CardTitle>
            {status.all_propagated ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">All Propagated</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">In Progress</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Change Type</p>
              <p className="font-semibold text-gray-900">{status.change_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Change Timestamp</p>
              <p className="font-semibold text-gray-900">
                {new Date(status.change_timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Max Latency</p>
              <p className={`text-2xl font-bold ${
                status.max_latency_hours > status.threshold_hours ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatLatency(status.max_latency_hours)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Threshold: {formatLatency(status.threshold_hours)}
              </p>
            </div>
            {status.alert_triggered && (
              <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-800">
                    Propagation exceeds threshold
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.checks.map((check, idx) => {
              const Icon = platformIcons[check.target] || Globe;
              
              return (
                <motion.div
                  key={check.target}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    check.propagated 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getPlatformLabel(check.target)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Checked: {new Date(check.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {check.propagated ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Propagated</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock className="w-5 h-5" />
                          <span className="font-semibold">Pending</span>
                        </div>
                      )}
                      {check.latency_hours !== undefined && (
                        <p className="text-xs text-gray-600 mt-1">
                          {formatLatency(check.latency_hours)}
                        </p>
                      )}
                      {check.error && (
                        <p className="text-xs text-red-600 mt-1">{check.error}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

