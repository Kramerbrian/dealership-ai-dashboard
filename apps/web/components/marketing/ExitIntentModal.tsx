'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, TrendingUp, Zap } from 'lucide-react';

interface ExitIntentModalProps {
  onClose?: () => void;
  onSubmit?: (email: string) => void;
}

export function ExitIntentModal({ onClose, onSubmit }: ExitIntentModalProps = {}) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem('exit_intent_shown');
    if (shown) {
      setHasShown(true);
      return;
    }

    // Mouse leave detection for desktop
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !hasShown && !show) {
        setShow(true);
        setHasShown(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
      }
    };

    // Scroll depth trigger for mobile (alternative)
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
      }

      // Show if user scrolled 50%+ and is scrolling up rapidly (mobile exit intent proxy)
      if (scrollPercent > 50 && !hasShown && !show) {
        const scrollingUp = window.scrollY < (window as any).lastScrollY;
        if (scrollingUp) {
          setShow(true);
          setHasShown(true);
          sessionStorage.setItem('exit_intent_shown', 'true');
        }
      }
      (window as any).lastScrollY = window.scrollY;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasShown, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    // Track conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exit_intent_conversion', {
        event_category: 'engagement',
        event_label: 'exit_intent_email_capture'
      });
    }

    // Call parent handler if provided
    if (onSubmit) {
      await onSubmit(email);
    }

    setSubmitted(true);

    // Close after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setShow(false);
    if (onClose) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <div className="bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 border border-white/20 rounded-2xl p-8 max-w-md w-full relative shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
              <Zap className="w-8 h-8 text-white" />
            </div>

            {/* Headline */}
            <h2 id="exit-intent-title" className="text-3xl font-bold mb-3 text-center text-white">
              Wait! Don't Miss Out
            </h2>

            {/* Subheadline */}
            <p className="text-lg text-gray-300 mb-6 text-center leading-relaxed">
              Get your <span className="font-bold text-blue-400">free AI visibility audit</span> worth $500 before you go
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>See how your dealership ranks on ChatGPT & AI search</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Get personalized recommendations to improve visibility</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-300">
                <Zap className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>No credit card required • Results in 24 hours</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-white placeholder-gray-500"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02]"
              >
                Get My Free Audit →
              </button>
            </form>

            {/* Fine Print */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">You're All Set!</h3>
            <p className="text-gray-300 mb-2">
              Check your inbox for your free AI visibility audit.
            </p>
            <p className="text-sm text-gray-400">
              We'll send it within 24 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
