import React from 'react';

/**
 * A very simple Button component used as a replacement for the missing `@/components/ui/button`.
 * You can replace this with your own design system or import the real component from your monorepo.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ className = '', variant = 'default', size = 'default', children, ...props }) => {
  const variantClasses = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  };

  const sizeClasses = {
    default: 'px-3 py-1',
    sm: 'px-2 py-0.5 text-xs',
    lg: 'px-4 py-2'
  };

  return (
    <button
      className={`rounded-md text-sm flex items-center gap-1 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
