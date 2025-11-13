'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function KPIModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}: KPIModalProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              relative bg-white rounded-apple-2xl shadow-apple-large
              ${getSizeClasses(size)} w-full
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-apple-md transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// KPI Detail Content Component
interface KPIDetailContentProps {
  metric: {
    name: string;
    value: string | number;
    description: string;
    formula?: string;
    factors?: string[];
    recommendations?: string[];
  };
}

export function KPIDetailContent({ metric }: KPIDetailContentProps) {
  return (
    <div className="space-y-6">
      {/* Metric Overview */}
      <div className="bg-gray-50 rounded-apple-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {metric.name}
          </h3>
          <span className="text-2xl font-bold text-blue-600">
            {metric.value}
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {metric.description}
        </p>
      </div>

      {/* Formula */}
      {metric.formula && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Calculation Formula
          </h4>
          <div className="bg-gray-100 rounded-apple-md p-3 font-mono text-sm">
            {metric.formula}
          </div>
        </div>
      )}

      {/* Key Factors */}
      {metric.factors && metric.factors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Key Factors
          </h4>
          <ul className="space-y-2">
            {metric.factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {factor}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {metric.recommendations && metric.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Recommendations
          </h4>
          <ul className="space-y-2">
            {metric.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  {recommendation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
