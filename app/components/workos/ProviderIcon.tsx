/**
 * WorkOS Provider Icon Component
 * Displays provider icons from WorkOS CDN with dark mode support
 */

'use client';

import React from 'react';
import Image from 'next/image';

export interface ProviderIconProps {
  slug: string;
  name?: string;
  className?: string;
  grayscale?: boolean;
  size?: number;
}

/**
 * Get provider icon URLs from WorkOS CDN
 */
function getProviderIconUrls(slug: string): { light: string; dark: string } {
  return {
    light: `https://cdn.workos.com/provider-icons/light/${slug}.svg`,
    dark: `https://cdn.workos.com/provider-icons/dark/${slug}.svg`,
  };
}

/**
 * Provider Icon Component
 * Displays WorkOS provider icons with automatic dark mode support
 */
export function ProviderIcon({
  slug,
  name,
  className = '',
  grayscale = false,
  size = 24,
}: ProviderIconProps) {
  const { light, dark } = getProviderIconUrls(slug);

  // Use Next.js Image for better optimization
  // Note: For dynamic src switching, we'll use a client-side state
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <Image
      src={isDark ? dark : light}
      alt={name || `${slug} icon`}
      width={size}
      height={size}
      className={`${grayscale ? 'grayscale' : ''} ${className}`}
      style={grayscale ? { filter: 'grayscale(100%)' } : undefined}
      unoptimized // External CDN images - WorkOS handles optimization
    />
  );
}

/**
 * Provider Icon Button Component
 * Clickable provider icon for OAuth flows
 */
export interface ProviderIconButtonProps extends ProviderIconProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function ProviderIconButton({
  slug,
  name,
  onClick,
  disabled = false,
  className = '',
  size = 24,
}: ProviderIconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-2 ${className}`}
      aria-label={`Sign in with ${name || slug}`}
    >
      <ProviderIcon slug={slug} name={name} size={size} />
    </button>
  );
}

