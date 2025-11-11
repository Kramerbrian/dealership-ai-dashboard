'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';

interface PromoteWinnerPanelProps {
  tenantId: string;
  variantId: string;
  onPromote: (variantId: string) => void;
  onCancel: () => void;
}

interface PowerValidationResult {
  hasMinimumPower: boolean;
  power: number;
  requiredSampleSize: number;
  actualSampleSize: number;
  confidence: number;
  effectSize: number;
  recommendations: string[];
}

interface VariantMetrics {
  variantId: string;
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  revenue: number;
  confidence: number;
}

export default function PromoteWinnerPanel({ tenantId, variantId, onPromote, onCancel }: PromoteWinnerPanelProps) {
  const [powerValidation, setPowerValidation] = useState<PowerValidationResult | null>(null);
  const [variantMetrics, setVariantMetrics] = useState<VariantMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validatePower();
    fetchVariantMetrics();
  }, [tenantId, variantId]);

  const validatePower = async () => {
    try {
      const response = await fetch('/api/ab/power-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, variantId }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate power');
      }

      const result = await response.json();
      setPowerValidation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchVariantMetrics = async () => {
    try {
      const response = await fetch(`/api/ab/variant-metrics?tenantId=${tenantId}&variantId=${variantId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch variant metrics');
      }

      const metrics = await response.json();
      setVariantMetrics(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!powerValidation?.hasMinimumPower) {
      setError('Cannot promote: Minimum power requirement not met');
      return;
    }

    setPromoting(true);
    try {
      await onPromote(variantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                validatePower();
                fetchVariantMetrics();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Promote Winner</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {variantMetrics && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Variant Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Users className="h-4 w-4" />
                  Impressions
                </div>
                <div className="text-2xl font-semibold">
                  {variantMetrics.impressions.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  CTR
                </div>
                <div className="text-2xl font-semibold">
                  {(variantMetrics.ctr * 100).toFixed(2)}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <BarChart3 className="h-4 w-4" />
                  CVR
                </div>
                <div className="text-2xl font-semibold">
                  {(variantMetrics.cvr * 100).toFixed(2)}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <CheckCircle className="h-4 w-4" />
                  Confidence
                </div>
                <div className="text-2xl font-semibold">
                  {(variantMetrics.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {powerValidation && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Power Validation</h3>
            <div className={`rounded-lg p-4 ${
              powerValidation.hasMinimumPower 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {powerValidation.hasMinimumPower ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  powerValidation.hasMinimumPower ? 'text-green-800' : 'text-red-800'
                }`}>
                  {powerValidation.hasMinimumPower ? 'Ready to Promote' : 'Not Ready to Promote'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Statistical Power</div>
                  <div className="font-semibold">
                    {(powerValidation.power * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Effect Size</div>
                  <div className="font-semibold">
                    {(powerValidation.effectSize * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Sample Size</div>
                  <div className="font-semibold">
                    {powerValidation.actualSampleSize.toLocaleString()} / {powerValidation.requiredSampleSize.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Confidence</div>
                  <div className="font-semibold">
                    {(powerValidation.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {powerValidation.recommendations.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Recommendations:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {powerValidation.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            disabled={promoting}
          >
            Cancel
          </button>
          <button
            onClick={handlePromote}
            disabled={!powerValidation?.hasMinimumPower || promoting}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              powerValidation?.hasMinimumPower && !promoting
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {promoting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Promoting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Promote Winner
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
