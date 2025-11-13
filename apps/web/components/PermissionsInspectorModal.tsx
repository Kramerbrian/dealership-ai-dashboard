/**
 * Permissions Inspector Modal
 *
 * Shows why a button/feature is disabled and what's needed to enable it.
 * Surfaces RBAC rules, plan limits, and missing requirements transparently.
 *
 * Usage:
 * <PermissionsInspectorModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   feature="auto-fix-execution"
 *   context={{ userId, dealershipId, plan }}
 * />
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Lock, AlertCircle, CheckCircle, ChevronRight, Info } from 'lucide-react';

interface PermissionCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  reason?: string;
  remedy?: string;
  docs?: string;
}

interface PermissionsInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  context?: {
    userId?: string;
    dealershipId?: string;
    plan?: 'free' | 'professional' | 'enterprise';
    role?: 'viewer' | 'editor' | 'admin' | 'owner';
  };
}

export default function PermissionsInspectorModal({
  isOpen,
  onClose,
  feature,
  context = {}
}: PermissionsInspectorProps) {
  const [checks, setChecks] = useState<PermissionCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchPermissions() {
      setLoading(true);
      try {
        const response = await fetch('/api/permissions/inspect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature, context })
        });

        const data = await response.json();
        setChecks(data.checks || []);
      } catch (error) {
        console.error('[Permissions Inspector] Failed to fetch:', error);
        setChecks([
          {
            id: 'error',
            name: 'Error Loading Permissions',
            description: 'Failed to fetch permission checks',
            status: 'fail',
            reason: error instanceof Error ? error.message : 'Unknown error'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [isOpen, feature, context]);

  if (!isOpen) return null;

  const allPassed = checks.every(c => c.status === 'pass');
  const failedChecks = checks.filter(c => c.status === 'fail');
  const warningChecks = checks.filter(c => c.status === 'warning');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${allPassed ? 'bg-green-100' : 'bg-red-100'}`}>
              {allPassed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Permissions Inspector</h2>
              <p className="text-sm text-gray-600">Feature: <code className="font-mono">{feature}</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Status Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">
                {checks.filter(c => c.status === 'pass').length} Passed
              </span>
            </div>
            {failedChecks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">{failedChecks.length} Failed</span>
              </div>
            )}
            {warningChecks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">{warningChecks.length} Warnings</span>
              </div>
            )}
          </div>

          {!allPassed && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <strong>Access Denied:</strong> {failedChecks.length} permission
                  {failedChecks.length === 1 ? '' : 's'} must be granted to use this feature.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Permission Checks List */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {checks.map((check, index) => (
                <div
                  key={check.id}
                  className={`border rounded-lg p-4 transition-all ${
                    check.status === 'pass'
                      ? 'border-green-200 bg-green-50'
                      : check.status === 'warning'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {check.status === 'pass' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : check.status === 'warning' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{check.name}</h3>
                        {check.status === 'fail' && (
                          <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-medium rounded">
                            Required
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{check.description}</p>

                      {/* Reason */}
                      {check.reason && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-600 mb-1">Reason:</div>
                          <div className="text-sm text-gray-800">{check.reason}</div>
                        </div>
                      )}

                      {/* Remedy */}
                      {check.remedy && check.status === 'fail' && (
                        <div className="mb-2 p-3 bg-white border border-gray-200 rounded">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-blue-900 mb-1">
                                How to Fix:
                              </div>
                              <div className="text-sm text-gray-800">{check.remedy}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Documentation Link */}
                      {check.docs && (
                        <a
                          href={check.docs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Documentation
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Context: {context.plan || 'unknown'} plan • {context.role || 'unknown'} role
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Permission Inspector Button
 * Use this to add a "Why is this disabled?" button next to any disabled feature
 */
interface InspectorButtonProps {
  feature: string;
  disabled?: boolean;
  context?: any;
  className?: string;
}

export function PermissionInspectorButton({
  feature,
  disabled = false,
  context,
  className = ''
}: InspectorButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (!disabled) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors ${className}`}
        title="Why is this disabled?"
      >
        <Lock className="w-3 h-3" />
        <span>Why?</span>
      </button>

      <PermissionsInspectorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={feature}
        context={context}
      />
    </>
  );
}
