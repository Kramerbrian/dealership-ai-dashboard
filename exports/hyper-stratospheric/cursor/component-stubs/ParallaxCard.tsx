'use client';

/**
 * ParallaxCard - Vision Pro-style depth perception
 * Micro head-tracking parallax for enhanced depth perception
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { TOKENS } from '@/styles/design-tokens';

interface ParallaxCardProps {
  children: React.ReactNode;
  depth?: number; // Parallax depth multiplier (0-1)
  className?: string;
}

export function ParallaxCard({ children, depth = 0.1, className = '' }: ParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovered) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * depth;
      const deltaY = (e.clientY - centerY) * depth;

      x.set(deltaX);
      y.set(deltaY);
    };

    if (isHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered, depth, x, y]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        x: springX,
        y: springY,
        rotateX: useSpring(y, { stiffness: 200, damping: 20 }),
        rotateY: useSpring(x, { stiffness: 200, damping: 20 }),
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="rounded-2xl border backdrop-blur-md"
        style={{
          background: TOKENS.color.surface.panel,
          borderColor: TOKENS.color.surface.border,
          boxShadow: TOKENS.shadow.soft,
          transform: 'translateZ(0)'
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

