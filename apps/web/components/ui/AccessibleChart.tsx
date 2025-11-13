'use client';

import React from 'react';
import { ResponsiveContainer } from 'recharts';

interface AccessibleChartProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  'aria-label'?: string;
  className?: string;
}

/**
 * AccessibleChart - Wraps charts with accessibility features
 * 
 * Features:
 * - ARIA labels and descriptions
 * - Keyboard navigation support
 * - Screen reader friendly
 * - Alt text for chart data
 */
export function AccessibleChart({
  children,
  title,
  description,
  'aria-label': ariaLabel,
  className = '',
}: AccessibleChartProps) {
  const chartId = `chart-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const label = ariaLabel || `${title} chart${description ? `: ${description}` : ''}`;

  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      aria-describedby={description ? `${chartId}-desc` : undefined}
      tabIndex={0}
    >
      {description && (
        <div id={`${chartId}-desc`} className="sr-only">
          {description}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
