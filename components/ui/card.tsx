import React from 'react';

/**
 * A very simple Card component used as a replacement for the missing `@/components/ui/card`.
 * You can enhance styling or extract from your main monorepo if desired.
 */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`rounded-lg border border-gray-700 bg-gray-800 ${className}`} {...props} />;
};

/**
 * A simple CardContent wrapper to allow padding control within cards.
 */
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={className} {...props} />;
};
