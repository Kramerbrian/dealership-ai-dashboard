'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface UrgencyBannerProps {
  dismissible?: boolean;
  variant?: 'limited-time' | 'spots-left' | 'launch-special';
}

export function UrgencyBanner({ dismissible = true, variant = 'limited-time' }: UrgencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('urgency_banner_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);

      // Show again after 24 hours
      if (hoursSinceDismissed < 24) {
        setIsVisible(false);
        return;
      }
    }

    // Countdown timer
    const calculateEndDate = () => {
      // End of current week (Sunday at midnight)
      const now = new Date();
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      return endOfWeek;
    };

    const endDate = calculateEndDate();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('urgency_banner_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  const variants = {
    'limited-time': {
      icon: <Sparkles className="w-5 h-5" />,
      text: 'Limited Time Offer',
      description: 'Get 2 months free on annual plans',
      cta: 'Claim Offer',
      gradient: 'from-purple-600 to-blue-600'
    },
    'spots-left': {
      icon: <TrendingUp className="w-5 h-5" />,
      text: 'Only 12 Spots Left',
      description: 'Join this month to get priority onboarding',
      cta: 'Reserve Your Spot',
      gradient: 'from-orange-600 to-red-600'
    },
    'launch-special': {
      icon: <Clock className="w-5 h-5" />,
      text: 'Launch Special',
      description: 'Early adopter pricing - 40% off first year',
      cta: 'Get Started',
      gradient: 'from-green-600 to-emerald-600'
    }
  };

  const config = variants[variant];

  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-gradient-to-r ${config.gradient} text-white py-3 px-4 z-50 shadow-lg animate-slide-down`}
      role="banner"
      aria-label="Special offer banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Content */}
        <div className="flex items-center gap-4 flex-1">
          {/* Icon */}
          <div className="hidden sm:flex w-10 h-10 bg-white/20 rounded-full items-center justify-center flex-shrink-0">
            {config.icon}
          </div>

          {/* Text */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">{config.text}:</span>
              <span className="text-sm sm:text-base">{config.description}</span>
            </div>

            {/* Countdown */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono font-semibold">
                {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/sign-up"
          className="px-4 sm:px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap text-sm sm:text-base"
        >
          {config.cta} →
        </Link>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-2"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mobile Countdown */}
      <div className="md:hidden mt-2 flex items-center justify-center gap-2 text-sm">
        <Clock className="w-4 h-4" />
        <span className="font-mono font-semibold">
          Ends in: {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

// Sticky Bottom Banner Variant
export function StickyBottomBanner({ onClose }: { onClose?: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 10 seconds of page view
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('bottom_banner_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('bottom_banner_dismissed', 'true');
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 z-40 shadow-2xl animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg">Ready to dominate AI search?</p>
            <p className="text-sm text-white/90">Start your free 14-day trial today</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
          >
            Start Free Trial
          </Link>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
