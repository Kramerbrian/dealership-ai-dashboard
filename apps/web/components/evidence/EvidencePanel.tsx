'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Download,
  Shield,
  Clock,
  Code,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { designTokens, getConfidenceColor } from '@/lib/design-tokens';

interface Evidence {
  id: string;
  type: 'url' | 'code' | 'screenshot' | 'api-response' | 'validation';
  title: string;
  description?: string;
  timestamp: number;
  validated: boolean;
  validationScore?: number; // 0-1
  source: string; // Which agent collected this
  missionId: string;
  data: {
    url?: string;
    code?: string;
    imageUrl?: string;
    apiResponse?: string;
    validationDetails?: {
      checks: Array<{
        name: string;
        passed: boolean;
        message: string;
      }>;
    };
  };
  metadata?: {
    platform?: string;
    location?: string;
    userAgent?: string;
  };
}

interface EvidencePanelProps {
  missionId: string;
  missionTitle: string;
  evidence: Evidence[];
  isOpen: boolean;
  onClose: () => void;
  onDownloadReport?: () => void;
}

/**
 * EvidencePanel - Display and validate mission evidence
 *
 * Features:
 * - Timestamped evidence trail
 * - Trust Kernel validation
 * - Copy/download evidence
 * - Grouped by type
 * - Expandable details
 * - Export as PDF report
 *
 * Visual Design:
 * - Slide-in panel from right
 * - Color-coded by validation status
 * - Trust Kernel badge for validated items
 * - Timeline view with timestamps
 */
export function EvidencePanel({
  missionId,
  missionTitle,
  evidence,
  isOpen,
  onClose,
  onDownloadReport,
}: EvidencePanelProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In production, show toast notification
    console.log('Copied to clipboard');
  };

  // Group evidence by type
  const groupedEvidence = evidence.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, Evidence[]>);

  // Evidence type metadata
  const typeConfig = {
    url: {
      icon: <LinkIcon className="w-4 h-4" />,
      label: 'URLs',
      color: 'text-blue-400',
    },
    code: {
      icon: <Code className="w-4 h-4" />,
      label: 'Code',
      color: 'text-purple-400',
    },
    screenshot: {
      icon: <ImageIcon className="w-4 h-4" />,
      label: 'Screenshots',
      color: 'text-cyan-400',
    },
    'api-response': {
      icon: <FileText className="w-4 h-4" />,
      label: 'API Responses',
      color: 'text-green-400',
    },
    validation: {
      icon: <Shield className="w-4 h-4" />,
      label: 'Validations',
      color: 'text-emerald-400',
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-gradient-to-br from-[#0a0a0a] via-[#0d1117] to-[#1e293b] border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white">Evidence Trail</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <p className="text-sm text-white/60">{missionTitle}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-xs text-white/60">
                  {evidence.length} items collected
                </div>
                <div className="text-xs text-white/60">
                  {evidence.filter((e) => e.validated).length} validated
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-3 border-b border-white/10 bg-black/10 flex gap-2">
              {onDownloadReport && (
                <button
                  onClick={onDownloadReport}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              )}
            </div>

            {/* Evidence List */}
            <div className="flex-1 overflow-auto px-6 py-4">
              {Object.entries(groupedEvidence).map(([type, items]) => {
                const config = typeConfig[type as keyof typeof typeConfig];
                if (!config) return null;

                return (
                  <div key={type} className="mb-8">
                    <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <span className={config.color}>{config.icon}</span>
                      {config.label} ({items.length})
                    </h3>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <EvidenceItem
                          key={item.id}
                          evidence={item}
                          isExpanded={expandedIds.has(item.id)}
                          onToggleExpand={() => toggleExpand(item.id)}
                          onCopy={copyToClipboard}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {evidence.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Shield className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60 text-center">
                    No evidence collected yet.
                  </p>
                </div>
              )}
            </div>

            {/* Trust Kernel Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-black/20 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>Trust Kernel Active - All evidence cryptographically signed</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * EvidenceItem - Individual evidence card
 */
function EvidenceItem({
  evidence,
  isExpanded,
  onToggleExpand,
  onCopy,
}: {
  evidence: Evidence;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: (text: string) => void;
}) {
  const validationColor = evidence.validated
    ? getConfidenceColor(evidence.validationScore || 1)
    : designTokens.colors.cognitive.lowConfidence;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className={`
        bg-white/5 border rounded-lg overflow-hidden transition-all
        ${
          evidence.validated
            ? 'border-emerald-500/30'
            : 'border-white/10'
        }
      `}
    >
      {/* Header */}
      <div
        onClick={onToggleExpand}
        className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {evidence.validated && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              {!evidence.validated && (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <h4 className="text-sm font-medium text-white">{evidence.title}</h4>
            </div>
            {evidence.description && (
              <p className="text-xs text-white/60">{evidence.description}</p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Clock className="w-3 h-3" />
            {formatTimestamp(evidence.timestamp)}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="px-4 py-3 bg-black/20">
              {/* URL Evidence */}
              {evidence.data.url && (
                <div className="mb-3">
                  <div className="text-xs text-white/60 mb-1">URL</div>
                  <div className="flex items-center gap-2">
                    <a
                      href={evidence.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 flex-1 truncate"
                    >
                      {evidence.data.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <button
                      onClick={() => onCopy(evidence.data.url!)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-white/60" />
                    </button>
                  </div>
                </div>
              )}

              {/* Code Evidence */}
              {evidence.data.code && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-white/60">Code</div>
                    <button
                      onClick={() => onCopy(evidence.data.code!)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-black/40 rounded p-3 text-xs text-white/80 overflow-x-auto">
                    <code>{evidence.data.code}</code>
                  </pre>
                </div>
              )}

              {/* Validation Details */}
              {evidence.data.validationDetails && (
                <div>
                  <div className="text-xs text-white/60 mb-2">Validation Checks</div>
                  <div className="space-y-2">
                    {evidence.data.validationDetails.checks.map((check, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs"
                      >
                        {check.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="text-white/80 font-medium">{check.name}</div>
                          <div className="text-white/60">{check.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {evidence.metadata && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs text-white/40 space-y-1">
                    {evidence.metadata.platform && (
                      <div>Platform: {evidence.metadata.platform}</div>
                    )}
                    {evidence.metadata.location && (
                      <div>Location: {evidence.metadata.location}</div>
                    )}
                    <div>Source: {evidence.source}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
