'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';

/**
 * Advanced CTA Optimizations Component
 * 
 * Features:
 * - Micro-interactions with haptic feedback
 * - Real-time social proof
 * - Urgency indicators
 * - Conversion psychology elements
 * - Progressive disclosure
 */

interface AdvancedCTAProps {
  variant?: 'hero' | 'pricing' | 'final' | 'mobile';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  showSocialProof?: boolean;
  showUrgency?: boolean;
  showPulse?: boolean;
}

export function AdvancedCTA({
  variant = 'hero',
  onClick,
  children,
  className = '',
  showSocialProof = true,
  showUrgency = false,
  showPulse = false,
}: AdvancedCTAProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [recentUsers, setRecentUsers] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Simulate recent user activity
  useEffect(() => {
    if (showSocialProof) {
      const interval = setInterval(() => {
        setRecentUsers(prev => {
          const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          return Math.max(847, Math.min(900, prev + change));
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showSocialProof]);

  // Haptic feedback on click (if supported)
  const handleClick = () => {
    setIsClicked(true);
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Trigger ripple effect
    if (buttonRef.current) {
      const ripple = document.createElement('div');
      ripple.className = 'absolute inset-0 rounded-2xl bg-white/20 animate-ping';
      buttonRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    
    setTimeout(() => setIsClicked(false), 300);
    onClick?.();
  };

  const baseClasses = `relative overflow-hidden transition-all duration-300 ${
    variant === 'hero' || variant === 'final'
      ? 'bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800 shadow-2xl ring-2 ring-blue-500/20'
      : variant === 'pricing'
      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-2xl ring-2 ring-emerald-500/30'
      : 'bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800 shadow-2xl ring-2 ring-blue-500/30'
  }`;

  const sizeClasses = {
    hero: 'px-8 py-4 text-lg font-semibold rounded-2xl',
    pricing: 'px-6 py-3 text-base font-semibold rounded-xl',
    final: 'px-8 py-4 text-lg font-semibold rounded-xl',
    mobile: 'px-6 py-3 text-sm font-semibold rounded-xl',
  };

  return (
    <div className="relative">
      {/* Social Proof Badge */}
      {showSocialProof && variant === 'hero' && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-green-200 rounded-full shadow-lg text-xs font-medium text-gray-700 animate-fade-in">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Users className="w-3 h-3 text-green-600" />
            <span>{recentUsers}+ analyzing now</span>
          </div>
        </div>
      )}

      {/* Urgency Indicator */}
      {showUrgency && (
        <div className="absolute -right-2 -top-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg z-10">
          HOT
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${baseClasses}
          ${sizeClasses[variant]}
          ${className}
          ${isClicked ? 'scale-95' : 'transform hover:scale-105'}
          ${showPulse ? 'animate-pulse-slow' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          flex items-center justify-center gap-2
          group
        `}
      >
        {/* Shimmer effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow" />
        )}

        {/* Sparkle icon animation */}
        {variant === 'hero' && (
          <Sparkles className={`w-5 h-5 transition-transform ${isHovered ? 'rotate-12 scale-110' : ''}`} />
        )}

        {/* Content */}
        <span className="relative z-10">{children}</span>

        {/* Loading state indicator */}
        {isClicked && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-purple-800 animate-shimmer" />
        )}
      </button>

      {/* Micro-interaction feedback */}
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl bg-white/10 animate-pulse-slow pointer-events-none" />
      )}
    </div>
  );
}

/**
 * Urgency Timer Component
 * Creates FOMO through time-based urgency
 */
export function UrgencyTimer({ expiresInMinutes = 30 }: { expiresInMinutes?: number }) {
  const [timeLeft, setTimeLeft] = useState(expiresInMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (timeLeft === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
      <Clock className="w-4 h-4 text-red-600" />
      <span className="text-sm font-semibold text-red-700">
        Limited time: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

/**
 * Social Proof Counter
 * Shows real-time activity to create FOMO
 */
export function SocialProofCounter() {
  const [count, setCount] = useState(847);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <TrendingUp className="w-4 h-4 text-green-500" />
      <span>
        <span className="font-semibold text-gray-900">{count}+</span> dealerships analyzed today
      </span>
    </div>
  );
}

/**
 * Risk Reversal Badge
 * Reduces friction by addressing concerns
 */
export function RiskReversalBadge() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
      <CheckCircle className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium text-green-800">
        No credit card • Cancel anytime • 14-day money-back guarantee
      </span>
    </div>
  );
}

/**
 * Conversion Funnel Tracker
 * Tracks user progression through the funnel
 */
export function useConversionFunnel() {
  const [funnelStage, setFunnelStage] = useState<'awareness' | 'interest' | 'consideration' | 'action'>('awareness');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 75) setFunnelStage('action');
      else if (scrollPercent > 50) setFunnelStage('consideration');
      else if (scrollPercent > 25) setFunnelStage('interest');
      else setFunnelStage('awareness');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return funnelStage;
}

