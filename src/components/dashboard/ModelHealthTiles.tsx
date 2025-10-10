'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, Shield, BarChart3 } from 'lucide-react';

interface ModelHealthData {
  latest_r2: number;
  latest_rmse: number;
  accuracy_trend: number;
  roi_trend: number;
  governance_status: 'active' | 'frozen' | 'review';
  last_training_date: string;
  days_since_training: number;
}

interface GovernanceViolation {
  rule_name: string;
  violation_type: string;
  current_value: number;
  threshold_value: number;
  action_required: string;
  severity: 'critical' | 'high' | 'medium';
}

export default function ModelHealthTiles() {
  const [modelHealth, setModelHealth] = useState<ModelHealthData | null>(null);
  const [violations, setViolations] = useState<GovernanceViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelHealth();
  }, []);

  const fetchModelHealth = async () => {
    try {
      const response = await fetch('/api/model-health/summary');
      const data = await response.json();
      
      if (data.success) {
        setModelHealth(data.model_health);
        setViolations(data.violations || []);
      }
    } catch (error) {
      console.error('Error fetching model health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'frozen': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!modelHealth) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Model Health Data</h3>
        <p className="text-gray-600 dark:text-gray-400">Run the HyperAIV optimizer to generate model health metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Health Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Model Accuracy R² */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Model Accuracy R²</h3>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {(modelHealth.latest_r2 * 100).toFixed(1)}%
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTrendIcon(modelHealth.accuracy_trend)}
            <span className={getTrendColor(modelHealth.accuracy_trend)}>
              {modelHealth.accuracy_trend > 0 ? '+' : ''}{modelHealth.accuracy_trend.toFixed(1)}% MoM
            </span>
          </div>
        </div>

        {/* RMSE Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">RMSE Trend</h3>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {modelHealth.latest_rmse.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Lower is better
          </div>
        </div>

        {/* ROI Efficiency */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">ROI Efficiency</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {modelHealth.roi_trend > 0 ? '+' : ''}{modelHealth.roi_trend.toFixed(1)}%
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
            {getTrendIcon(modelHealth.roi_trend)}
            <span className={getTrendColor(modelHealth.roi_trend)}>
              Month-over-month
            </span>
          </div>
        </div>

        {/* Governance Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Governance Status</h3>
            {modelHealth.governance_status === 'active' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(modelHealth.governance_status)}`}>
              {modelHealth.governance_status.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last training: {modelHealth.days_since_training} days ago
          </div>
        </div>
      </div>

      {/* Governance Violations Alert */}
      {violations.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Governance Violations Detected</h3>
          </div>
          <div className="space-y-3">
            {violations.map((violation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{violation.rule_name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current: {violation.current_value.toFixed(3)} | 
                    Threshold: {violation.threshold_value.toFixed(3)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    violation.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    violation.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {violation.severity.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {violation.action_required.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Health Summary */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Health Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {modelHealth.latest_r2 >= 0.8 ? 'Excellent' : 
               modelHealth.latest_r2 >= 0.7 ? 'Good' : 'Needs Attention'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {modelHealth.days_since_training}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Days Since Training</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {violations.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Violations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
