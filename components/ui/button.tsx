import React from 'react';

/**
 * A very simple Button component used as a replacement for the missing `@/components/ui/button`.
 * You can replace this with your own design system or import the real component from your monorepo.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ className = '', variant = 'default', children, ...props }) => {
  const variantClasses = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  };

  return (
    <button
      className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
