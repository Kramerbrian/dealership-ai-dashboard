/**
 * Image Optimization Utilities
 * 
 * Helper functions for optimized Next.js Image component usage
 */

import Image from 'next/image';

/**
 * Image optimization presets for common use cases
 */
export const IMAGE_PRESETS = {
  hero: {
    width: 1200,
    height: 600,
    priority: true,
    quality: 90,
  },
  card: {
    width: 400,
    height: 300,
    quality: 85,
  },
  thumbnail: {
    width: 200,
    height: 200,
    quality: 80,
  },
  avatar: {
    width: 64,
    height: 64,
    quality: 85,
  },
  icon: {
    width: 40,
    height: 40,
    quality: 75,
  },
} as const;

/**
 * Optimized Image component with presets
 */
export function OptimizedImage({
  src,
  alt,
  preset = 'card',
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  preset?: keyof typeof IMAGE_PRESETS;
  className?: string;
  [key: string]: any;
}) {
  const presetConfig = IMAGE_PRESETS[preset];
  
  return (
    <Image
      src={src}
      alt={alt}
      width={presetConfig.width}
      height={presetConfig.height}
      quality={presetConfig.quality}
      className={className}
      loading={preset === 'hero' ? undefined : 'lazy'}
      {...(preset === 'hero' && { priority: true })}
      {...props}
    />
  );
}

