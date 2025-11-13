'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TextRotatorProps {
  texts: string[];
  interval?: number;
  className?: string;
  animationDuration?: number;
  showDot?: boolean;
}

export default function TextRotator({
  texts,
  interval = 3000,
  className = '',
  animationDuration = 600,
  showDot = true
}: TextRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState(texts[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const startRotation = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsAnimating(true);
        
        // Wait for fade out animation to complete
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % texts.length);
          setDisplayText(texts[(currentIndex + 1) % texts.length]);
          setIsAnimating(false);
        }, animationDuration / 2);
      }, interval);
    };

    startRotation();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, texts, interval, animationDuration]);

  // Calculate dynamic width based on text content
  const getTextWidth = (text: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = 'inherit';
      return context.measureText(text).width;
    }
    return 120; // fallback width
  };

  const currentText = texts[currentIndex];
  const nextText = texts[(currentIndex + 1) % texts.length];
  const maxWidth = Math.max(
    getTextWidth(currentText),
    getTextWidth(nextText)
  ) + 20; // Add padding

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={{ 
        minWidth: `${maxWidth}px`,
        height: '1.2em'
      }}
    >
      {/* Current text */}
      <span
        className={`absolute inset-0 transition-all duration-${animationDuration} ease-in-out ${
          isAnimating 
            ? 'opacity-0 transform translate-y-2' 
            : 'opacity-100 transform translate-y-0'
        }`}
        style={{
          animationDuration: `${animationDuration}ms`
        }}
      >
        {displayText}
      </span>

      {/* Next text */}
      <span
        className={`absolute inset-0 transition-all duration-${animationDuration} ease-in-out ${
          isAnimating 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform -translate-y-2'
        }`}
        style={{
          animationDuration: `${animationDuration}ms`
        }}
      >
        {nextText}
      </span>

      {/* Dot indicator */}
      {showDot && (
        <span 
          className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-sm opacity-60"
          style={{
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          •
        </span>
      )}
    </div>
  );
}

// Enhanced version with better animations
export function EnhancedTextRotator({
  texts,
  interval = 3000,
  className = '',
  showDot = true
}: Omit<TextRotatorProps, 'animationDuration'>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const rotateText = () => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300); // Half of animation duration
    };

    // Start rotation immediately
    intervalRef.current = setInterval(rotateText, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [texts, interval]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`inline-block transition-all duration-600 ease-in-out ${
          isVisible 
            ? 'opacity-100 transform translate-y-0 scale-100' 
            : 'opacity-0 transform translate-y-4 scale-95'
        }`}
        style={className.includes('bg-clip-text') ? { 
          backgroundImage: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: '#3b82f6' // Fallback color for better visibility
        } : {}}
      >
        {texts[currentIndex]}
      </span>
      
      {showDot && (
        <span 
          className="ml-2 text-sm opacity-60 animate-pulse"
        >
          •
        </span>
      )}
    </div>
  );
}

// Simple version for basic use cases
export function SimpleTextRotator({
  texts,
  interval = 3000,
  className = ''
}: Omit<TextRotatorProps, 'animationDuration' | 'showDot'>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [texts.length, interval]);

  return (
    <span className={`transition-opacity duration-300 ${className}`}>
      {texts[currentIndex]}
    </span>
  );
}
