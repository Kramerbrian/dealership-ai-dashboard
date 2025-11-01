'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Onboarding Step 1: URL Input
 * Collect dealership URL and validate it
 */
export default function OnboardingStep1Page() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateUrl = async (urlString: string) => {
    setIsValidating(true);
    setError('');
    setIsValid(false);

    try {
      // Basic URL validation
      let formattedUrl = urlString.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const urlObj = new URL(formattedUrl);
      
      // Check if domain is reachable
      const response = await fetch('/api/onboarding/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl }),
      });

      const result = await response.json();

      if (!result.valid) {
        setError(result.error || 'Invalid URL or domain unreachable');
        setIsValid(false);
      } else {
        setIsValid(true);
        setError('');
        // Store in sessionStorage for next steps
        sessionStorage.setItem('onboarding_url', formattedUrl);
      }
    } catch (err) {
      setError('Please enter a valid URL (e.g., www.yourdealership.com)');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isValidating) return;

    const urlToSave = url.startsWith('http') ? url : `https://${url}`;
    sessionStorage.setItem('onboarding_url', urlToSave);
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('onboard_step_1_completed', { url: urlToSave });
    }

    router.push('/onboard/step-2');
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setIsValid(false);
    setError('');
    
    // Auto-validate on blur or after typing stops
    if (value.length > 5) {
      const timer = setTimeout(() => {
        validateUrl(value);
      }, 1000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 1 
                  ? 'bg-purple-600 text-white' 
                  : step < 1 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-800 text-zinc-500'
              }`}>
                {step === 1 ? '1' : step}
              </div>
              {step < 4 && (
                <div className={`w-12 h-0.5 ${
                  step < 1 ? 'bg-purple-600' : 'bg-zinc-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            What's Your Dealership URL?
          </h1>
          <p className="text-zinc-400 text-lg">
            We'll analyze your AI visibility in 30 seconds
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onBlur={() => url && validateUrl(url)}
              placeholder="https://www.yourdealership.com"
              className="w-full pl-12 pr-4 py-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-lg"
              disabled={isValidating}
            />
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-cyan-400">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Validating URL...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {isValid && !error && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>URL validated! Ready to analyze.</span>
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={!isValid || isValidating}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Analyze My Trust Score
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Trust Indicators */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center mb-4">
            Trusted by 2,847+ dealerships
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-600">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>30-Second Scan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
