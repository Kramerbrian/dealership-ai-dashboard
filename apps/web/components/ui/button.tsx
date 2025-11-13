import React from 'react';

/**
 * A very simple Button component used as a replacement for the missing `@/components/ui/button`.
 * You can replace this with your own design system or import the real component from your monorepo.
 */
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => {
  return (
    <button
      className={`px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-1 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
