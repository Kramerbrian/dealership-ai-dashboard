/**
 * MetricInfo Component
 * Displays metric labels with descriptions in a consistent format
 * Used across dashboard for KPI explanations
 */

import React from 'react';

interface MetricInfoProps {
  label: string;
  children: React.ReactNode;
}

export const MetricInfo = ({ label, children }: MetricInfoProps) => (
  <div className="text-xs text-text-secondary">
    <span className="font-medium">{label}</span> {children}
  </div>
);

/**
 * Usage Examples:
 *
 * <MetricInfo label="ATI™">
 *   precision, consistency, recency, authenticity, alignment.
 * </MetricInfo>
 *
 * <MetricInfo label="AIV">
 *   SERP+Answer fusion with temporal decay.
 * </MetricInfo>
 *
 * <MetricInfo label="CRS">
 *   Bayesian fusion of AIV ↔ ATI signals.
 * </MetricInfo>
 */
