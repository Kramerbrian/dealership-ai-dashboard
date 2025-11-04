'use client';

import { useState, useEffect } from 'react';
import { Mail, Download, CheckCircle, X } from 'lucide-react';
import { ga } from '@/lib/ga';
import { showToast } from './Toast';

interface ProgressiveProfilingProps {
  domain: string;
  onEmailCaptured?: (email: string) => void;
  onDismiss?: () => void;
}

/**
 * Progressive Profiling Component
 * Collects email after showing value (higher conversion)
 */
export function ProgressiveProfiling({ domain, onEmailCaptured, onDismiss }: ProgressiveProfilingProps) {
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Show email capture after results are viewed for 3 seconds
    const timer = setTimeout(() => {
      setShowEmailCapture(true);
      ga('progressive_profiling_shown', { domain });
    }, 3000);

    return () => clearTimeout(timer);
  }, [domain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setSubmitting(true);
    ga('email_capture_attempt', { domain, source: 'progressive_profiling' });

    try {
      // Save email to backend
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          domain,
          source: 'progressive_profiling',
          context: 'post_results'
        })
      });

      if (response.ok) {
        setSubmitted(true);
        ga('email_captured', { domain, source: 'progressive_profiling' });
        
        if (onEmailCaptured) {
          onEmailCaptured(email);
        }

        // Hide after 3 seconds
        setTimeout(() => {
          setShowEmailCapture(false);
          if (onDismiss) onDismiss();
        }, 3000);
      } else {
        showToast('Failed to save email. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Failed to save email:', error);
      showToast('Failed to save email. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!showEmailCapture) return null;

  if (submitted) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-scale-in">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Report Saved!</h3>
          </div>
          <p className="text-sm text-green-700">
            We'll email your full AI visibility report to <strong>{email}</strong> shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-scale-in">
      <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={() => {
            setShowEmailCapture(false);
            if (onDismiss) onDismiss();
            ga('email_capture_dismissed', { domain });
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Save Your Report
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get your full AI visibility analysis delivered to your inbox as a PDF
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                >
                  {submitting ? 'Saving...' : 'Get Report'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                ✓ No spam, unsubscribe anytime • PDF report with full analysis
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

