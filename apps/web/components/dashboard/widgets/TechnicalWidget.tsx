/**
 * Technical Widget
 * Schema health, Core Web Vitals, structured data coverage
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Zap, 
  Globe,
  FileCode,
  Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TechnicalWidgetProps {
  data: {
    schemaCoverage: number; // percentage
    schemaHealth: 'excellent' | 'good' | 'needs_work' | 'critical';
    coreWebVitals: {
      lcp: number; // Largest Contentful Paint (ms)
      fid: number; // First Input Delay (ms)
      cls: number; // Cumulative Layout Shift
    };
    structuredDataTypes: Array<{
      type: string;
      present: boolean;
      valid: boolean;
    }>;
    pageSpeedScore: number; // 0-100
    mobileFriendly: boolean;
  };
}

export default function TechnicalWidget({ data }: TechnicalWidgetProps) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs_work': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_work': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVitalStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs_improvement';
    return 'poor';
  };

  return (
    <div className="space-y-6">
      {/* Schema Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Schema Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl font-bold text-gray-900">{data.schemaCoverage}%</div>
                <div className="text-2xl text-gray-400">coverage</div>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getHealthBadge(data.schemaHealth)}`}>
                {data.schemaHealth.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <Database className="w-12 h-12 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* LCP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">LCP (Largest Contentful Paint)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{data.coreWebVitals.lcp}ms</span>
                  {getVitalStatus('lcp', data.coreWebVitals.lcp) === 'good' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {getVitalStatus('lcp', data.coreWebVitals.lcp) === 'needs_improvement' && (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  {getVitalStatus('lcp', data.coreWebVitals.lcp) === 'poor' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getVitalStatus('lcp', data.coreWebVitals.lcp) === 'good' ? 'bg-green-500' :
                    getVitalStatus('lcp', data.coreWebVitals.lcp) === 'needs_improvement' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (data.coreWebVitals.lcp / 4000) * 100)}%` }}
                />
              </div>
            </div>

            {/* FID */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">FID (First Input Delay)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{data.coreWebVitals.fid}ms</span>
                  {getVitalStatus('fid', data.coreWebVitals.fid) === 'good' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {getVitalStatus('fid', data.coreWebVitals.fid) === 'needs_improvement' && (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  {getVitalStatus('fid', data.coreWebVitals.fid) === 'poor' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getVitalStatus('fid', data.coreWebVitals.fid) === 'good' ? 'bg-green-500' :
                    getVitalStatus('fid', data.coreWebVitals.fid) === 'needs_improvement' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (data.coreWebVitals.fid / 300) * 100)}%` }}
                />
              </div>
            </div>

            {/* CLS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">CLS (Cumulative Layout Shift)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{data.coreWebVitals.cls.toFixed(3)}</span>
                  {getVitalStatus('cls', data.coreWebVitals.cls) === 'good' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {getVitalStatus('cls', data.coreWebVitals.cls) === 'needs_improvement' && (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  {getVitalStatus('cls', data.coreWebVitals.cls) === 'poor' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getVitalStatus('cls', data.coreWebVitals.cls) === 'good' ? 'bg-green-500' :
                    getVitalStatus('cls', data.coreWebVitals.cls) === 'needs_improvement' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (data.coreWebVitals.cls / 0.25) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Data Types */}
      <Card>
        <CardHeader>
          <CardTitle>Structured Data Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.structuredDataTypes.map((item, idx) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{item.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.present ? (
                    item.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Speed & Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Page Speed Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">{data.pageSpeedScore}</p>
                <p className="text-sm text-gray-600 mt-1">out of 100</p>
              </div>
              <Gauge className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mobile Friendly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {data.mobileFriendly ? 'Yes' : 'No'}
                </p>
                <p className="text-sm text-gray-600 mt-1">Mobile optimization</p>
              </div>
              {data.mobileFriendly ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

